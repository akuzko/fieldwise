import MultiValidatorExampleComponent from './forms/MultiValidatorExample';

export default function MultiValidatorExample() {
  return (
    <div className="page">
      <h1>Multiple Validators</h1>
      <p>
        Form with multiple validators applied to fields. You can combine
        built-in validation with custom validators for complex scenarios.
      </p>

      <MultiValidatorExampleComponent />

      <section className="example-notes">
        <h3>Use Cases</h3>
        <ul>
          <li>
            <strong>Schema + Async:</strong> Combine Zod validation with async
            checks (e.g., username availability)
          </li>
          <li>
            <strong>Business Rules:</strong> Add custom validation logic beyond
            schema constraints
          </li>
          <li>
            <strong>Cross-field Validation:</strong> Validate relationships
            between multiple fields
          </li>
          <li>
            <strong>Conditional Validation:</strong> Apply different rules based
            on form state
          </li>
        </ul>

        <h3>How It Works</h3>
        <p>
          Multiple validators are chained together and run sequentially. Each
          validator can:
        </p>
        <ul>
          <li>Read current form values</li>
          <li>Return validation errors or null</li>
          <li>Be synchronous or asynchronous</li>
          <li>Access errors from previous validators</li>
        </ul>
      </section>
    </div>
  );
}
