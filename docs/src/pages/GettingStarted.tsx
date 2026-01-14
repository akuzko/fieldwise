import { CodeBlock } from '~/components/CodeBlock';

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
        <CodeBlock
          defaultExpanded
          title="forms/user.ts"
          code={`import { fieldwise, zod } from 'fieldwise';
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

export { useForm as useUserForm, useSlice as useUserSlice };`}
        />
      </section>

      <section>
        <h2>Use in Components</h2>
        <CodeBlock
          defaultExpanded
          title="components/UserForm.tsx"
          code={`import { useUserForm } from './forms';

function UserForm() {
  const { emit, once, i, isValidating } = useUserForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    emit.later('validate');
    once('validated', (values, errors) => {
      if (errors) return emit('errors', errors);

      console.log('Form submitted:', values);
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Input {...i('name')} placeholder="Name" />
      <Input {...i('email')} placeholder="Email" />

      <button type="submit" disabled={isValidating}>
        {isValidating ? 'Validating...' : 'Submit'}
      </button>
    </form>
  );
}`}
        />
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
