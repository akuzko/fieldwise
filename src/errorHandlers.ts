import type { Values, Form } from './Form';

export default function errorHandlers<T extends Values>(form: Form<T>) {
  form.on('errors', (newErrors) => {
    form.setErrors(newErrors);
  });
}
