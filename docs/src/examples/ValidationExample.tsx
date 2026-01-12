import { fieldwise, validateZodSchema } from 'fieldwise';
import { z } from 'zod';
import { Input } from './components/Input';

const schema = z
  .object({
    username: z.string().min(3, 'Username must be at least 3 characters'),
    email: z.email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string()
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  });

const { useForm } = fieldwise({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})
  .use(validateZodSchema(schema))
  .hooks();

export default function ValidationExample() {
  const { fields, i, emit, once } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    emit.later('validate');
    once('validated', ({ values, errors }) => {
      if (errors) return emit('errors', errors);

      alert(`Form valid! Username: ${values.username}`);
    });
  };

  return (
    <div className="example">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="validation-username">Username</label>
          <Input
            {...i('username')}
            id="validation-username"
            placeholder="Username"
          />
          {fields.username.error && (
            <span className="error">{fields.username.error}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="validation-email">Email</label>
          <Input
            {...i('email')}
            id="validation-email"
            type="email"
            placeholder="Email"
          />
          {fields.email.error && (
            <span className="error">{fields.email.error}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="validation-password">Password</label>
          <Input
            {...i('password')}
            id="validation-password"
            type="password"
            placeholder="Password"
          />
          {fields.password.error && (
            <span className="error">{fields.password.error}</span>
          )}
        </div>

        <div className="form-group">
          <label htmlFor="validation-confirmPassword">Confirm Password</label>
          <Input
            {...i('confirmPassword')}
            id="validation-confirmPassword"
            type="password"
            placeholder="Confirm Password"
          />
          {fields.confirmPassword.error && (
            <span className="error">{fields.confirmPassword.error}</span>
          )}
        </div>

        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
