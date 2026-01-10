# Fieldwise Development Guide

## Overview

Fieldwise is a **type-safe, reactive form management library for React** with fine-grained field subscriptions. It provides a lightweight, event-driven approach to form state management without storing state in React components.

## Core Architecture

### Event-Driven Form Class

The foundation is a custom `Form` class that manages state through an event system:

- **Subscriptions**: Components subscribe to specific fields, not entire form state
- **Events**: `change`, `changeSome`, `validate`, `validated`, `reset`
- **No React State**: All state lives in Form class, React only subscribes

### Fine-Grained Reactivity

```typescript
// Subscribe to specific fields only
form.subscribe(['name', 'email'], (values) => {
  // Only re-runs when name or email changes
});
```

### Event System Pattern

**EventMap uses array notation** for multi-argument events:

```typescript
type EventMap<T> = {
  change: [key: keyof T, value: T[keyof T]];
  changeSome: [partialValues: Partial<T>];
  validate: [];
  validated: [result: ValidationResult<T>];
  reset: [snapshot?: T];
};
```

**Handlers receive spread arguments directly**:

```typescript
// Emit with multiple args
form.emit('change', 'email', value);

// Handler receives same args
form.on('change', (key, value) => {
  console.log(`${key} changed to ${value}`);
});
```

**No transformation layer** - what you emit is what handlers receive.

## Public API

### Builder Pattern

```typescript
import { fieldwise, validateZodSchema } from 'fieldwise';
import { z } from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Required'),
  email: z.string().email('Invalid email')
});

type UserFormValues = z.infer<typeof schema>;

const emptyUser: UserFormValues = { name: '', email: '' };

const { useForm, useSlice } = fieldwise(emptyUser)
  .use(validateZodSchema(schema))
  .hooks();

export { useForm as useUserForm, useSlice as useUserSlice };
```

### React Hooks API

Both hooks return the same interface:

```typescript
const { emit, once, isTouched, i, fields } = useUserForm();

// emit: EmitFn - trigger events
// once: OneTimeFn - single-use event handler
// isTouched: boolean - any field modified
// i: InputHelper - bind inputs
// fields: FieldSet - { name: { value, error }, email: { value, error } }
```

### Hook Variants

**useForm()** - Subscribe to all fields:

```typescript
const { fields, emit, i } = useUserForm();
// Re-renders on ANY field change
```

**useSlice(keys)** - Subscribe to specific fields:

```typescript
const { fields, emit, i } = useUserSlice(['email']);
// Only re-renders when email changes
```

## Standard Usage Patterns

### Form Validation Flow

The canonical pattern for form submission with validation:

```typescript
const handleSubmit = () => {
  emit.later('validate');

  once('validated', ({ values, errors }) => {
    if (errors) return emit('errors', errors);

    // Proceed with submission
    saveUser(values);
  });
};
```

**Why `emit.later()`?** As seen in the example above, `emit.later()` is needed to ensure the `once('validated')` handler below subscribes before the `validated` event is emitted. This guarantees the handler is registered and ready to receive the validation result.

**Why `once()`?** Single-use handler that auto-unsubscribes after firing.

### Input Binding with `i()` Helper

The `i()` function generates props for controlled inputs:

```typescript
<input {...i('email')} />

// Expands to:
{
  name: 'email',
  value: fields.email.value,
  onChange: (value) => form.emit('change', 'email', value),
  error: fields.email.error
}
```

**Type-safe** - only accepts valid field keys.

### Field Access

```typescript
// Read current value
const currentName = fields.name.value;

// Check for errors
const emailError = fields.email.error; // string | null

// Check if field touched
if (isTouched) {
  // At least one field has been modified
}
```

### Manual Field Updates

```typescript
// Update single field
emit('change', 'name', 'New Name');

// Update multiple fields simultaneously
emit('changeSome', { name: 'New Name', email: 'new@email.com' });

// Reset form
emit('reset'); // to initial values
emit('reset', newValues); // to specific values

// Trigger validation
emit('validate');
```

## Plugin System

Plugins are functions that receive the Form instance and can:

- Listen to events
- Emit events
- Extend functionality

### validateZodSchema Plugin

**Primary validation plugin** using Zod schemas:

```typescript
import { validateZodSchema } from 'fieldwise';
import { z } from 'zod';

const schema = z
  .object({
    password: z.string().min(8),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  });

fieldwise(emptyForm).use(validateZodSchema(schema));
```

**Features**:

- Handles schema refinements with custom paths
- Returns errors as strings (can be integrated with i18n libraries if needed)
- Supports `z.coerce` for HTML input type coercion

**Implementation notes**:

- Listens to `validate` event
- Emits `validated` event with `{ values, errors }`
- Error format: `{ field: 'error' }` as `Record<keyof T, string | null>`

### logFormEvents Plugin

Debug plugin for development:

```typescript
import logFormEvents from 'fieldwise/logFormEvents';

fieldwise(emptyForm).use(logFormEvents).hooks();
```

Logs all form events to console with formatted output.

### Custom Plugins

```typescript
const myPlugin = (form) => {
  form.on('change', (key, value) => {
    // Custom logic on field change
  });

  form.on('validate', () => {
    // Custom validation logic
    form.emit('validated', { values: form.getValues(), errors: null });
  });
};
```

## TypeScript Patterns

### Generic Form Values

```typescript
type Values = Record<string, unknown>;

function fieldwise<T extends Values>(initialValues: T) {
  // T is inferred from initialValues
}
```

### FieldSet Mapped Type

```typescript
type FieldSet<T> = {
  [K in keyof T]: {
    value: T[K];
    error: string | null;
    isTouched: boolean;
  };
};
```

### Event Map with Array Notation

```typescript
type EventMap<T extends Values> = {
  change: [key: keyof T, value: T[keyof T]];
  changeSome: [partialValues: Partial<T>];
  validate: [];
  validated: [
    result: { values: T; errors: Record<keyof T, string | null> | null }
  ];
  reset: [snapshot?: T];
};

// Handler type inference
type EventHandler<T, E extends keyof EventMap<T>> = (
  ...args: EventMap<T>[E]
) => void;
```

### Subscription Return Type

```typescript
type FieldUnsubscribeFn = () => void;

subscribe(keys: string[], callback: Function): FieldUnsubscribeFn;
```

## File Structure

```
src/
  Form.ts              - Core Form class with event system & subscriptions
  fieldwise.ts         - React integration, hooks generation, builder pattern
  validateZodSchema.ts - Zod validation plugin
  changeHandlers.ts    - Helper utilities for field change operations
  errorHandlers.ts     - Error management and formatting utilities
  logFormEvents.ts     - Debug plugin for event logging
  index.ts            - Public API exports
```

### Form.ts (Core Class)

Exports:

- `Form` class - event system, subscriptions, state management
- `Values` type - base form values constraint
- `FieldSet<T>` type - mapped type for field metadata
- `EmitFn<T>` type - event emission function
- `FieldUnsubscribeFn` type - cleanup function

Key methods:

- `on(event, handler)` - subscribe to event
- `once(event, handler)` - one-time subscription
- `emit(event, ...args)` - trigger event
- `subscribe(keys, callback)` - subscribe to field changes
- `getValues()` - get current values
- `reset(snapshot?)` - reset to initial or provided values

### fieldwise.ts (React Integration)

Exports:

- `fieldwise<T>(initialValues)` - builder function
- React hooks generated by `.hooks()`

Pattern:

1. Create Form instance
2. Apply plugins via `.use(plugin)`
3. Generate hooks with `.hooks()`
4. Export hooks for use in components

### validateZodSchema.ts (Validation Plugin)

Exports:

- `validateZodSchema(schema)` - plugin factory

Dependencies:

- `zod` (peer dependency)

Behavior:

- Listens to `validate` event
- Runs `schema.safeParse(values)`
- Returns error messages as-is from Zod
- Emits `validated` with `{ values, errors }`

## Design Constraints & Requirements

### Peer Dependencies

```json
{
  "peerDependencies": {
    "react": "^18.0.0 || ^19.0.0",
    "zod": "^3.0.0"
  }
}
```

**React 18+** or later recommended.

**Zod 3.x** required for validateZodSchema plugin (optional if not using validation).

### Performance Considerations

- **No unnecessary re-renders**: Only subscribed fields trigger updates
- **Subscription cleanup**: Auto-cleanup on unmount via useEffect
- **Immutable updates**: New value references on change for React reconciliation

### Type Safety

- **Generic inference**: Form values type inferred from initialValues
- **Key constraints**: `i()` and `emit('change', key, ...)` only accept valid keys
- **Error types**: Errors typed as `Record<keyof T, string | null>`
- **Plugin typing**: Plugins receive correctly typed Form instance

## Common Integration Patterns

### With React Hook Form Alternative

Fieldwise can replace React Hook Form with similar patterns:

```typescript
// React Hook Form
const { register, handleSubmit } = useForm();

// Fieldwise
const { i, emit, once } = useUserForm();
const handleSubmit = () => {
  emit.later('validate');
  once('validated', ({ values, errors }) => {
    if (errors) return;
    onSubmit(values);
  });
};
```

### With Material-UI

**Note**: Material-UI inputs require custom wrappers since their API differs from standard HTML inputs. You'll need to create wrapper components that adapt the `i()` helper props to Material-UI's expected props (see Custom Input Components pattern below for reference).

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

<TextFieldWrapper {...i('email')} />;
```

### With Custom Input Components

```typescript
const CustomInput = ({ name, value, onChange, error }) => (
  <div>
    <input value={value} onChange={(e) => onChange(e.target.value)} />
    {error && <span>{error}</span>}
  </div>
);

<CustomInput {...i('email')} />;
```

### Async Validation

```typescript
const asyncValidation = (form) => {
  form.on('validate', async () => {
    const values = form.getValues();

    // Check username availability
    const available = await checkUsername(values.username);

    const errors = available ? null : { username: 'Username taken' };

    form.emit('validated', { values, errors });
  });
};
```

### Conditional Fields

```typescript
const { fields, emit } = useUserForm();

// Show/hide based on values
{
  fields.accountType.value === 'business' && <input {...i('companyName')} />;
}

// Reset dependent fields
useEffect(() => {
  if (fields.accountType.value !== 'business') {
    emit('change', 'companyName', '');
  }
}, [fields.accountType.value]);
```

## Testing Patterns

### Unit Testing Forms

```typescript
import { Form } from 'fieldwise';

describe('UserForm', () => {
  it('updates field value', () => {
    const form = new Form({ name: '', email: '' });

    form.emit('change', 'name', 'John');

    expect(form.getValues().name).toBe('John');
  });

  it('validates required fields', () => {
    const form = new Form({ name: '' });
    form.use(validateZodSchema(z.object({ name: z.string().min(1) })));

    let result;
    form.once('validated', (r) => {
      result = r;
    });
    form.emit('validate');

    expect(result.errors).toHaveProperty('name');
  });
});
```

### Integration Testing

```typescript
import { render, screen, fireEvent } from '@testing-library/react';

test('submits form with valid data', async () => {
  const onSubmit = jest.fn();
  render(<UserForm onSubmit={onSubmit} />);

  fireEvent.change(screen.getByLabelText('Name'), {
    target: { value: 'John' }
  });
  fireEvent.click(screen.getByText('Submit'));

  await waitFor(() => {
    expect(onSubmit).toHaveBeenCalledWith({ name: 'John' });
  });
});
```

## Migration from Other Libraries

### From Formik

```typescript
// Formik
const formik = useFormik({
  initialValues: { email: '' },
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
// Access errors via fields.email.error
```

## Troubleshooting

### Common Issues

**"Validation doesn't fire"**

- Use `emit.later('validate')` not `emit('validate')`
- Ensure plugin is applied before `.hooks()`

**"Too many re-renders"**

- Use `useSlice(['specificFields'])` instead of `useForm()`
- Check for emit() calls inside render

**"Type errors with i() helper"**

- Ensure generic type is correctly inferred
- Field key must be `keyof T`, not string

**"Errors not displaying"**

- Check `fields.fieldName.error` not just `fields.fieldName`
- Verify error messages are being set by validation plugin

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

## Contributing Guidelines

- Maintain zero React state in Form class
- Use function overloads for type narrowing when appropriate
- Keep plugins composable and single-responsibility
- Document all public API changes
- Add tests for new features
- Follow existing naming conventions (emit, once, i, fields)

## Version History

**v0.1.0** - Initial release

- Core Form class with event system
- React integration hooks
- Zod validation plugin
- Fine-grained subscriptions

---

This library was extracted from a production application where it successfully manages 15+ complex forms with dynamic validation, conditional fields, and multi-step flows.
