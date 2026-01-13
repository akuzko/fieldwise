import { CodeBlock } from '~/components/CodeBlock';

export default function InputComponent() {
  return (
    <div className="page">
      <h1>Input Component Wrapper</h1>
      <p>
        All examples in this documentation use a custom <code>Input</code>{' '}
        component wrapper instead of native HTML <code>&lt;input&gt;</code>{' '}
        elements. This is the recommended approach when using Fieldwise's{' '}
        <code>i()</code> helper.
      </p>

      <section className="example-notes">
        <h3>Why Use a Wrapper Component?</h3>
        <p>
          The <code>i()</code> helper returns an object with props that don't
          directly map to native HTML input attributes:
        </p>
        <ul>
          <li>
            <code>name</code> - Field identifier
          </li>
          <li>
            <code>value</code> - Current field value
          </li>
          <li>
            <code>onChange</code> - Expects the new value directly, not an event
          </li>
          <li>
            <code>error</code> - Validation error message (string | null)
          </li>
        </ul>
        <p>
          Native <code>&lt;input&gt;</code> elements expect{' '}
          <code>onChange</code> to receive an event object, not a value. A
          wrapper component bridges this gap.
        </p>

        <h3>Basic Input Wrapper</h3>
        <p>
          Here's a simple wrapper component that adapts the <code>i()</code>{' '}
          helper props for native inputs:
        </p>

        <CodeBlock
          title="Input.tsx"
          code={`import { InputHTMLAttributes } from 'react';

interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  name: string;
  value: string | number;
  onChange: (value: string) => void;
  error?: string | null;
}

export function Input({
  name,
  value,
  onChange,
  error,
  ...rest
}: InputProps) {
  return (
    <div className="input-wrapper">
      <input
        {...rest}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? \`\${name}-error\` : undefined}
      />
      {error && (
        <span className="error" id={name + '-error'}>
          {error}
        </span>
      )}
    </div>
  );
}`}
        />

        <h3>Usage with Fieldwise</h3>
        <p>
          With this wrapper component, you can cleanly use the <code>i()</code>{' '}
          helper:
        </p>

        <CodeBlock
          title="Form Component"
          code={`import { fieldwise } from 'fieldwise';
import { Input } from './Input';

const { useForm } = fieldwise({
  email: '',
  password: ''
}).hooks();

function LoginForm() {
  const { i, emit } = useForm();

  return (
    <form onSubmit={(e) => {
      e.preventDefault();
      emit('validate');
    }}>
      {/* Spread i() props directly */}
      <Input {...i('email')} type="email" placeholder="Email" />
      <Input {...i('password')} type="password" placeholder="Password" />
      <button type="submit">Login</button>
    </form>
  );
}`}
        />

        <h3>Alternative: Direct Usage</h3>
        <p>
          If you prefer not to use a wrapper component, you can manually adapt
          the props:
        </p>

        <CodeBlock
          title="Without Wrapper Component"
          code={`function DirectForm() {
  const { fields, emit } = useForm();

  return (
    <div>
      <input
        name="email"
        value={fields.email.value}
        onChange={(e) => emit('change', 'email', e.target.value)}
      />
      {fields.email.error && (
        <span className="error">{fields.email.error}</span>
      )}
    </div>
  );
}`}
        />
        <p>
          However, this approach is more verbose and loses the convenience of
          the <code>i()</code> helper.
        </p>

        <h3>UI Library Integration</h3>
        <p>
          For UI libraries like Material-UI, Ant Design, or Chakra UI, create
          wrapper components that adapt their input APIs:
        </p>

        <CodeBlock
          title="Material-UI Wrapper Example"
          code={`import { TextField } from '@mui/material';

interface MuiInputProps {
  name: string;
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  label?: string;
}

export function MuiInput({
  name,
  value,
  onChange,
  error,
  label
}: MuiInputProps) {
  return (
    <TextField
      name={name}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      label={label}
      error={!!error}
      helperText={error}
      fullWidth
    />
  );
}

// Usage
<MuiInput {...i('email')} label="Email Address" />`}
        />

        <h3>Key Takeaways</h3>
        <ul>
          <li>
            Always use a wrapper component when working with the{' '}
            <code>i()</code> helper
          </li>
          <li>
            The wrapper adapts the <code>onChange</code> callback to extract
            value from events
          </li>
          <li>
            The wrapper can handle error display consistently across your app
          </li>
          <li>
            Different UI libraries require different wrapper implementations
          </li>
        </ul>
      </section>
    </div>
  );
}
