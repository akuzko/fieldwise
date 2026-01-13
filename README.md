# Fieldwise

[![npm version](https://img.shields.io/npm/v/fieldwise.svg)](https://www.npmjs.com/package/fieldwise)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/fieldwise)](https://bundlephobia.com/package/fieldwise)
[![codecov](https://codecov.io/gh/akuzko/fieldwise/branch/main/graph/badge.svg)](https://codecov.io/gh/akuzko/fieldwise)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Type-safe, reactive form management for React with fine-grained field subscriptions.**

Fieldwise is a lightweight, event-driven form library that provides precise control over component re-renders through field-level subscriptions. No more unnecessary re-renders from unrelated field changes.

## Features

- **Fine-grained reactivity** - Subscribe to specific fields, not entire form state
- **Type-safe** - Full TypeScript support with type inference
- **Lightweight** - Event-driven architecture with no state in React components
- **Plugin system** - Extensible with custom validation and behavior
- **Performance** - Automatic microtask batching for synchronous updates
- **Zod validation** - Built-in Zod schema validation

## Installation

```bash
npm install fieldwise zod
# or
yarn add fieldwise zod
# or
pnpm add fieldwise zod
```

**Peer dependencies:**

- React 18+ or React 19+
- Zod 3.x, 4.x (optional, only if using validation)

## Quick Start

```typescript
import { fieldwise, zod } from 'fieldwise';
import { z } from 'zod';

// Define your schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address')
});

// Create form hooks
const { useForm, useSlice } = fieldwise({
  name: '',
  email: ''
})
  .use(zod(userSchema))
  .hooks();

// Export for use in components
export { useForm as useUserForm, useSlice as useUserSlice };
```

```typescript
// In your component
import { useUserForm } from './userForm';
import Input from 'components/Input';
// ^- Input is a simple custom wrapper that consumes 4 properties generated
// by `i` function call: `name`, `value`, `onChange(value: <InferredType>) => void`
// and `error`.

function UserForm() {
  const { emit, once, i, isValidating } = useUserForm();

  const handleSubmit = (e) => {
    e.preventDefault();

    emit.later('validate'); // Defer validation to microtask
    once('validated', (values, errors) => {
      if (errors) return emit('errors', errors); // Validation failed, assign input errors

      // Submit the form
      console.log('Submitting:', values);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input {...i('name')} placeholder="Name" />
      <Input {...i('email')} type="email" placeholder="Email" />

      <button type="submit" disabled={isValidating}>
        {isValidating ? 'Validating...' : 'Submit'}
      </button>
    </form>
  );
}
```

## Core Concepts

### Fine-Grained Subscriptions

Unlike traditional form libraries, Fieldwise allows you to subscribe to specific fields:

```typescript
// Subscribe to ALL fields (re-renders on any change)
const { fields } = useUserForm();

// Subscribe to SPECIFIC fields only (re-renders only when email changes)
const { fields } = useUserSlice(['email']);
```

### Event-Driven Architecture

Fieldwise uses an event system for all state changes:

```typescript
const { emit, once, fields } = useUserForm();

// Update a field
emit('change', 'name', 'John Doe');

// Trigger validation
emit.later('validate');

// Listen for validation results (one-time)
once('validated', (values, errors) => {
  // Handle result
});

// Reset form
emit('reset'); // to initial values
emit('reset', newValues); // to specific values
```

### Input Helper

The `i()` function generates all necessary props for controlled inputs:

```typescript
<input {...i('email')} />

// Expands to:
{
  name: 'email',
  value: fields.email.value,
  onChange: (value) => emit('change', 'email', value),
  error: fields.email.error
}
```

## API Reference

### `fieldwise(initialValues)`

Creates a form builder with the specified initial values.

```typescript
const builder = fieldwise({ name: '', email: '' });
```

### `.use(plugin)`

Applies a plugin to the form. Plugins can add validation, logging, or custom behavior.

```typescript
builder.use(zod(schema)).use(myEventHandler); // Chain multiple plugins
```

### `.hooks()`

Generates React hooks for the form.

```typescript
const { useForm, useSlice } = builder.hooks();
```

### `useForm()`

Hook that subscribes to all form fields.

**Returns:**

- `fields: FieldSet<T>` - Object containing all fields with `{ value, error, isTouched }`
- `emit: EmitFn` - Function to trigger events
- `once: OneTimeFn` - Function to listen to events once
- `isTouched: boolean` - Whether any field has been modified
- `isValidating: boolean` - Whether async validation is currently running
- `i: InputHelper` - Function to generate input props

### `useSlice(keys)`

Hook that subscribes to specific form fields.

```typescript
const { fields, emit, i } = useUserSlice(['email', 'name']);
// Only re-renders when email or name changes
```

### Events

Available events:

- `change` - Field value changed: `emit('change', key, value)`
- `changeMany` - Multiple fields changed: `emit('changeMany', { field1: value1, field2: value2 })`
- `touch` - Mark field as touched: `emit('touch', key)`
- `touchMany` - Mark multiple fields as touched: `emit('touchMany', [key1, key2])`
- `validate` - Validation requested: `emit('validate')`
- `validated` - Validation completed: `once('validated', (values, errors) => {})`
- `reset` - Form reset: `emit('reset', snapshot?)`

## Validation

### Zod Schema Validation

```typescript
import { zod } from 'fieldwise';
import { z } from 'zod';

const schema = z
  .object({
    email: z.email(),
    password: z.string().min(8, 'Must be at least 8 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  });
type UserValues = z.infer<typeof schema>;

const emptyUser: UserValues = { email: '', password: '', confirmPassword: '' };
const { useForm } = fieldwise(emptyUser).use(zod(schema)).hooks();
```

The validation plugin:

- Handles schema refinements with custom paths
- Returns errors as strings (can be integrated with i18n libraries if needed)
- Supports `z.coerce` for HTML input type coercion
- Error format: `{ field: 'error message' }` as `Record<keyof T, string | null>`

### Custom Validation Plugin

Create custom validators using `registerValidator`:

```typescript
const customValidation = (form) => {
  form.registerValidator(async (values, syncErrors) => {
    // syncErrors contains results from sync validators that ran before this
    // Use it to skip expensive async operations
    if (syncErrors && Object.keys(syncErrors).length > 0) {
      return null; // Skip if there are already errors
    }

    // Your async validation logic
    const errors = await validateAsync(values);
    return errors;
  });
};

fieldwise(initialValues).use(customValidation).hooks();
```

### Multiple Validators

Fieldwise supports multiple validators that run in sequence:

```typescript
const syncValidator = (form) => {
  form.registerValidator((values) => {
    // Sync validation (runs first)
    if (!values.email) return { email: 'Required' };
    return null;
  });
};

const asyncValidator = (form) => {
  form.registerValidator(async (values) => {
    // Async validation (only runs if sync validation passes)
    const available = await checkEmailAvailability(values.email);
    return available ? null : { email: 'Email already taken' };
  });
};

fieldwise(initialValues)
  .use(zod(schema)) // Validator 1: Zod schema (sync)
  .use(syncValidator) // Validator 2: Custom sync
  .use(asyncValidator) // Validator 3: Async (skipped if errors exist)
  .hooks();
```

**Validation flow:**

1. Validators are partitioned by arity (`validator.length < 2` = pure, `>= 2` = error-dependent)
2. All pure validators are called and results collected (mix of sync/async)
3. Sync errors from pure validators are merged
4. All error-dependent validators are called with merged errors
5. All async results (from both groups) are awaited in parallel
6. All results are merged and emitted via `validated` event

## Advanced Usage

### Conditional Fields

```typescript
function RegistrationForm() {
  const { fields, emit, i } = useForm();

  // Show/hide based on field value
  return (
    <form>
      <select {...i('accountType')}>
        <option value="personal">Personal</option>
        <option value="business">Business</option>
      </select>

      {fields.accountType.value === 'business' && (
        <input {...i('companyName')} placeholder="Company Name" />
      )}
    </form>
  );
}
```

### Debug Mode

Enable debug logging by setting `Form.debugMode`:

```typescript
import { Form } from 'fieldwise';

// Log all events
Form.debugMode = true;

// Log only specific events
Form.debugMode = { only: ['reset', 'validate', 'validated'] };
```

Debug plugin is attached automatically when debug mode is enabled.

### Material-UI Integration

**Note**: Material-UI inputs require custom wrappers since their API slightly
differs from fieldwise input interface. You'll need to create wrapper components
that adapt the `i()` helper props to Material-UI's expected props.

```typescript
import TextField from '@mui/material/TextField';

const TextFieldWrapper = ({ name, value, onChange, error }) => (
  <TextField
    name={name}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    label={name}
    helperText={error}
    error={!!error}
  />
);

function MyForm() {
  const { i } = useMyForm();

  return <TextFieldWrapper {...i('email')} />;
}
```

## Performance Optimization

### Prevent Unnecessary Re-renders

```typescript
// ❌ Bad: Re-renders on ANY field change
const { fields } = useUserForm();

// ✅ Good: Only re-renders when email or password changes
const { fields } = useUserSlice(['email', 'password']);
```

### Microtask Batching

Fieldwise automatically batches synchronous updates:

```typescript
emit('change', 'name', 'John');
emit('change', 'email', 'john@example.com');
// Both updates trigger only ONE re-render
```

### Validation Deferral

Use `emit.later()` to defer validation to the microtask queue:

```typescript
const handleSubmit = () => {
  emit.later('validate'); // Defers to microtask

  once('validated', (values, errors) => {
    // Runs after all synchronous updates complete
  });
};
```

### isValidating State

The `isValidating` flag helps provide feedback during async validation:

```typescript
const { isValidating, emit, once, i } = useForm();

const handleSubmit = () => {
  emit.later('validate');
  once('validated', (values, errors) => {
    if (!errors) submitForm(values);
  });
};

return (
  <form>
    <Input {...i('email')} />
    <button disabled={isValidating}>
      {isValidating ? 'Validating...' : 'Submit'}
    </button>
  </form>
);
```

## TypeScript Support

Fieldwise is written in TypeScript and provides full type inference:

```typescript
type User = {
  name: string;
  email: string;
  age: number;
};

const { useForm } = fieldwise<User>({
  name: '',
  email: '',
  age: 0
}).hooks();

const { fields, emit, i } = useForm();

// ✅ Type-safe
emit('change', 'name', 'John');
fields.name.value; // string

// ❌ Type errors
emit('change', 'invalid', 'value'); // Error: 'invalid' is not a valid key
emit('change', 'age', 'not a number'); // Error: expected number
```

## Migration Guide

### From Formik

```typescript
// Formik
const formik = useFormik({
  initialValues: { email: '' },
  validationSchema: schema,
  onSubmit: (values) => { ... }
});

// Fieldwise
const { fields, emit, once, i } = useForm();
const handleSubmit = () => {
  emit.later('validate');
  once('validated', (values, errors) => {
    if (!errors) onSubmit(values);
  });
};
```

### From React Hook Form

```typescript
// React Hook Form
const {
  register,
  handleSubmit,
  formState: { errors }
} = useForm();

// Fieldwise
const { i, emit, once, fields } = useForm();
// Errors available at fields.fieldName.error
```

## Plugin Development

Create custom plugins to extend Fieldwise:

```typescript
const myPlugin = (form) => {
  // Listen to events
  form.on('change', (key, value) => {
    console.log(`${key} changed to ${value}`);
  });

  // Add custom validation
  form.registerValidator((values) => {
    // Custom validation logic
    return null; // or errors object
  });
};

fieldwise(initialValues).use(myPlugin).hooks();
```

## Contributing

Contributions are welcome! Please follow these guidelines:

- Maintain zero React state in Form class
- Keep plugins composable and single-responsibility
- Add tests for new features
- Document all public API changes

## License

MIT

## Credits

Extracted from a production application managing 15+ complex forms with dynamic validation, conditional fields, and multi-step flows.
