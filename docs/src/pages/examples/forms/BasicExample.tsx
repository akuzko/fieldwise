import { fieldwise } from 'fieldwise';
import { Input } from '~/components/Input';

const { useForm } = fieldwise({ name: '', email: '' }).hooks();

export default function BasicExample() {
  const { fields, i, emit } = useForm();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(
      `Submitted:\nName: ${fields.name.value}\nEmail: ${fields.email.value}`
    );
  };

  const handleReset = () => {
    emit('reset');
  };

  return (
    <div className="example">
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="basic-name">Name</label>
          <Input {...i('name')} id="basic-name" placeholder="Enter your name" />
        </div>

        <div className="form-group">
          <label htmlFor="basic-email">Email</label>
          <Input
            {...i('email')}
            id="basic-email"
            placeholder="Enter your email"
          />
        </div>

        <div className="button-group">
          <button type="submit">Submit</button>
          <button type="button" onClick={handleReset}>
            Reset
          </button>
        </div>
      </form>

      <div className="preview">
        <h4>Current Values:</h4>
        <pre>
          {JSON.stringify(
            { name: fields.name.value, email: fields.email.value },
            null,
            2
          )}
        </pre>
      </div>
    </div>
  );
}
