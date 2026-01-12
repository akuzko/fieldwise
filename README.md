# Fieldwise

[![npm version](https://img.shields.io/npm/v/fieldwise.svg)](https://www.npmjs.com/package/fieldwise)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/fieldwise)](https://bundlephobia.com/package/fieldwise)
[![codecov](https://codecov.io/gh/akuzko/fieldwise/branch/main/graph/badge.svg)](https://codecov.io/gh/akuzko/fieldwise)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Type-safe, reactive form management for React with fine-grained field subscriptions.**

Fieldwise is a lightweight, event-driven form library that provides precise control over component re-renders through field-level subscriptions. No more unnecessary re-renders from unrelated field changes.

## Features

- ✨ **Fine-grained reactivity** - Subscribe to specific fields, not entire form state
- 🎯 **Type-safe** - Full TypeScript support with type inference
- 🪶 **Lightweight** - Event-driven architecture with no state in React components
- 🔌 **Plugin system** - Extensible with custom validation and behavior
- ⚡ **Performance** - Automatic microtask batching for synchronous updates
- 🛡️ **Zod validation** - Built-in Zod schema validation

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
- Zod 3.x (optional, only if using validation)

## Quick Start

```typescript
import { fieldwise, validateZodSchema } from 'fieldwise';
import { z } from 'zod';

// Define your schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address')
});

// Infer Form values type
type UserFormValues = z.infer<typeof schema>;

// Define initial values
const emptyUser: UserFormValues = { name: '', email: '' };

// Create form hooks
const { useForm, useSlice } = fieldwise(emptyUser)
  .use(validateZodSchema(userSchema))
  .hooks();

// Export for use in components
export { useForm as useUserForm, useSlice as useUserSlice };
```

```typescript
// In your component
import { useUserForm } from './userForm';

function UserForm() {
  const { fields, emit, once, i } = useUserForm();

  const handleSubmit = (e) => {
    e.preventDefault();

    emit.later('validate'); // Defer validation to microtask

    once('validated', ({ values, errors }) => {
      if (errors) return; // Validation failed

      // Submit the form
      console.log('Submitting:', values);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <input {...i('name')} placeholder="Name" />
      {fields.name.error && <span>{fields.name.error}</span>}

      <input {...i('email')} type="email" placeholder="Email" />
      {fields.email.error && <span>{fields.email.error}</span>}

      <button type="submit">Submit</button>
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
once('validated', ({ values, errors }) => {
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
builder.use(validateZodSchema(schema)).use(myEventHandler); // Chain multiple plugins
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
- `changeSome` - Multiple fields changed: `emit('changeSome', { field1: value1, field2: value2 })`
- `touch` - Mark field as touched: `emit('touch', key)`
- `touchSome` - Mark multiple fields as touched: `emit('touchSome', [key1, key2])`
- `validate` - Validation requested: `emit('validate')`
- `validated` - Validation completed: `once('validated', ({ values, errors }) => {})`
- `reset` - Form reset: `emit('reset', snapshot?)`

## Validation

### Zod Schema Validation

```typescript
import { validateZodSchema } from 'fieldwise';
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
const { useForm } = fieldwise(emptyUser).use(validateZodSchema(schema)).hooks();
```

The validation plugin:

- Handles schema refinements with custom paths
- Returns errors as strings (can be integrated with i18n libraries if needed)
- Supports `z.coerce` for HTML input type coercion
- Error format: `{ field: 'error message' }` as `Record<keyof T, string | null>`

### Custom Validation Plugin

```typescript
const customValidation = (form) => {
  form.on('validate', async () => {
    const values = form.getValues();

    // Your validation logic
    const errors = await validateAsync(values);

    form.emit('validated', { values, errors });
  });
};

fieldwise(initialValues).use(customValidation).hooks();
```

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

### Async Validation

```typescript
const asyncValidation = (form) => {
  form.on('validate', async () => {
    const values = form.getValues();

    // Async check (e.g., username availability)
    const isAvailable = await checkUsernameAvailability(values.username);

    const errors = isAvailable
      ? null
      : { username: 'Username is already taken' };

    form.emit('validated', { values, errors });
  });
};
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

**Note**: Material-UI inputs require custom wrappers since their API differs from standard HTML inputs. You'll need to create wrapper components that adapt the `i()` helper props to Material-UI's expected props.

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

  once('validated', ({ values, errors }) => {
    // Runs after all synchronous updates complete
  });
};
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
  once('validated', ({ values, errors }) => {
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

  // Emit events
  form.on('validate', () => {
    const values = form.getValues();
    // Custom validation logic
    form.emit('validated', { values, errors: null });
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
