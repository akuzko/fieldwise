import BasicExample from '../examples/BasicExample';
import ValidationExample from '../examples/ValidationExample';
import SliceExample from '../examples/SliceExample';

export default function Examples() {
  return (
    <div className="page">
      <h1>Examples</h1>
      <p>Interactive examples demonstrating Fieldwise features.</p>

      <section className="example-section">
        <h2>Basic Form</h2>
        <p>
          Simple form with field binding using the <code>i()</code> helper.
        </p>
        <BasicExample />
      </section>

      <section className="example-section">
        <h2>Form Validation</h2>
        <p>Form with Zod schema validation and error display.</p>
        <ValidationExample />
      </section>

      <section className="example-section">
        <h2>Fine-grained Subscriptions</h2>
        <p>
          Using <code>useSlice()</code> to subscribe to specific fields only.
        </p>
        <SliceExample />
      </section>
    </div>
  );
}
