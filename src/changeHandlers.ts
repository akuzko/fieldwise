import type { Values, Form } from './Form';

export default function changeHandlers<T extends Values>(form: Form<T>) {
  form.on('change', (name, value) => {
    form.setValue(name, value);
  });

  form.on('changeMany', (newValues) => {
    form.setValues(newValues);
  });

  form.on('touch', (name) => {
    form.touch(name);
  });

  form.on('touchMany', (names) => {
    names.forEach((name) => {
      form.touch(name);
    });
  });

  form.on('reset', (values?) => {
    form.reset(values || form.initialValues);
  });
}
