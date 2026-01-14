import { fieldwise, zod } from 'fieldwise';
import { z } from 'zod';
import { Input } from '~/components/Input';
import { CodeBlock } from '~/components/CodeBlock';

const schema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.email('Invalid email address')
});

// Simulate async username availability check
const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Simulate that "admin" and "test" are taken
  return username !== 'admin' && username !== 'test';
};

// Custom async validator plugin
const asyncUsernameValidator = (form: any) => {
  form.registerValidator(
    async (values: { username: string }, syncErrors?: any) => {
      // Skip expensive server check if sync validation already failed
      if (syncErrors?.username) return null;

      const available = await checkUsernameAvailability(values.username);

      if (!available) {
        return { username: 'Username is already taken' };
      }

      return null;
    }
  );
};

const { useForm } = fieldwise({
  username: '',
  email: ''
})
  .use(zod(schema)) // Sync validator (Zod schema)
  .use(asyncUsernameValidator) // Async validator (server check)
  .hooks();

export default function MultiValidatorExample() {
  const { fields, i, emit, once, isValidating } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    emit.later('validate');
    once('validated', (values, errors) => {
      if (errors) return emit('errors', errors);

      alert(`Form valid! Username: ${values.username}, Email: ${values.email}`);
    });
  };

  return (
    <div className="example">
      <h3>Multi-Validator Example</h3>
      <p>
        This example demonstrates multiple validators:
        <br />
        1. <strong>Sync validator</strong>: Zod schema validation
        <br />
        2. <strong>Async validator</strong>: Username availability check (with
        syncErrors check)
        <br />
        <br />
        Try usernames "admin" or "test" to see async validation in action.
        <br />
        <strong>Note:</strong> The async validator checks{' '}
        <code>syncErrors</code> and skips the server request if sync validation
        already failed!
      </p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="multi-username">Username</label>
          <Input
            {...i('username')}
            id="multi-username"
            placeholder="Username (try 'admin' or 'test')"
          />
          {fields.username.error && (
            <span className="error">{fields.username.error}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="multi-email">Email</label>
          <Input
            {...i('email')}
            id="multi-email"
            type="email"
            placeholder="Email"
          />
          {fields.email.error && (
            <span className="error">{fields.email.error}</span>
          )}
        </div>

        <button type="submit" disabled={isValidating}>
          {isValidating ? 'Validating...' : 'Submit'}
        </button>
      </form>

      {isValidating && (
        <div style={{ marginTop: '1rem', color: '#666' }}>
          ⏳ Checking username availability...
        </div>
      )}

      <CodeBlock
        title="Multiple Validators (Sync + Async)"
        code={`import { fieldwise, zod } from 'fieldwise';
import { z } from 'zod';

// Zod schema for synchronous validation
const schema = z.object({
  username: z.string()
    .min(3, 'Username must be at least 3 characters'),
  email: z.email('Invalid email address')
});

// Simulate async username availability check
const checkUsernameAvailability = async (
  username: string
): Promise<boolean> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  // Simulate that "admin" and "test" are taken
  return username !== 'admin' && username !== 'test';
};

// Custom async validator plugin
const asyncUsernameValidator = (form: any) => {
  form.registerValidator(
    async (values: { username: string }, syncErrors?: any) => {
      // Skip expensive server check if sync validation already failed
      if (syncErrors?.username) return null;

      const available = await checkUsernameAvailability(values.username);

      if (!available) {
        return { username: 'Username is already taken' };
      }

      return null;
    }
  );
};

// Create form with multiple validators
const { useForm } = fieldwise({
  username: '',
  email: ''
})
  .use(zod(schema))              // Sync validation
  .use(asyncUsernameValidator)   // Async validation
  .hooks();

function MultiValidatorExample() {
  const { i, emit, once } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    emit.later('validate');
    once('validated', (values, errors) => {
      if (errors) return emit('errors', errors);

      console.log('All validations passed:', values);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input {...i('username')} placeholder="Username" />
      <Input {...i('email')} placeholder="Email" />

      <button type="submit">Submit</button>
    </form>
  );
}`}
      />
    </div>
  );
}
