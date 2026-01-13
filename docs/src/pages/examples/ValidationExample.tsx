import ValidationExampleComponent from './forms/ValidationExample';

export default function ValidationExample() {
  return (
    <div className="page">
      <h1>Form Validation</h1>
      <p>
        Form with Zod schema validation and error display. Fieldwise integrates
        seamlessly with Zod for type-safe validation.
      </p>

      <ValidationExampleComponent />

      <section className="example-notes">
        <h3>Validation Flow</h3>
        <ol>
          <li>
            Define a Zod schema describing your form's structure and validation
            rules
          </li>
          <li>
            Apply the <code>validateZodSchema()</code> plugin to your form
          </li>
          <li>
            Trigger validation with <code>emit('validate')</code>
          </li>
          <li>
            Handle results in the <code>validated</code> event listener
          </li>
        </ol>

        <h3>Key Features</h3>
        <ul>
          <li>
            <strong>Type Safety:</strong> Validation schema and form values are
            type-checked
          </li>
          <li>
            <strong>Rich Validation:</strong> Leverage Zod's extensive
            validation capabilities
          </li>
          <li>
            <strong>Error Mapping:</strong> Validation errors are automatically
            mapped to fields
          </li>
          <li>
            <strong>Custom Messages:</strong> Define custom error messages for
            each validation rule
          </li>
        </ul>
      </section>
    </div>
  );
}
