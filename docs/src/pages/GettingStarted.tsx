export default function GettingStarted() {
  return (
    <div className="page">
      <h1>Getting Started</h1>

      <section>
        <h2>Installation</h2>
        <pre>
          <code>npm install fieldwise zod</code>
        </pre>
      </section>

      <section>
        <h2>Quick Start</h2>
        <p>
          Create your form hooks using the <code>fieldwise</code> builder:
        </p>
        <pre>
          <code>{`import { fieldwise, zod } from 'fieldwise';
import { z } from 'zod';

// Define your schema
const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address')
});

type UserFormValues = z.infer<typeof userSchema>;

const emptyUser: UserFormValues = { name: '', email: '' };

// Create form hooks
const { useForm, useSlice } = fieldwise(emptyUser)
  .use(zod(userSchema))
  .hooks();

export { useForm as useUserForm, useSlice as useUserSlice };`}</code>
        </pre>
      </section>

      <section>
        <h2>Use in Components</h2>
        <pre>
          <code>{`import { useUserForm } from './forms';

function UserForm() {
  const { fields, emit, once, i, isValidating } = useUserForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    emit.later('validate');
    once('validated', (values, errors) => {
      if (errors) return;
      console.log('Form submitted:', values);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <Input {...i('name')} placeholder="Name" />
        {fields.name.error && <span>{fields.name.error}</span>}
      </div>
      <div>
        <Input {...i('email')} placeholder="Email" />
        {fields.email.error && <span>{fields.email.error}</span>}
      </div>
      <button type="submit" disabled={isValidating}>
        {isValidating ? 'Validating...' : 'Submit'}
      </button>
    </form>
  );
}`}</code>
        </pre>
      </section>

      <section>
        <h2>Next Steps</h2>
        <p>
          Check out the <a href="/examples">Examples</a> page to see more
          advanced usage patterns.
        </p>
      </section>
    </div>
  );
}
