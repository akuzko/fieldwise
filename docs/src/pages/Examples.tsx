import { Link } from 'react-router-dom';

export default function Examples() {
  return (
    <div className="page">
      <h1>Examples</h1>
      <p>
        Interactive examples demonstrating Fieldwise features. Select an example
        from the sidebar to see it in action.
      </p>

      <div className="examples-grid">
        <Link to="/examples/input-component" className="example-card">
          <h3>Input Component</h3>
          <p>
            Learn why and how to create a wrapper component for use with the{' '}
            <code>i()</code> helper.
          </p>
        </Link>

        <Link to="/examples/basic-form" className="example-card">
          <h3>Basic Form</h3>
          <p>
            Simple form with field binding using the <code>i()</code> helper.
          </p>
        </Link>

        <Link
          to="/examples/fine-grained-subscriptions"
          className="example-card"
        >
          <h3>Fine-grained Subscriptions</h3>
          <p>
            Using <code>useSlice()</code> to subscribe to specific fields only.
          </p>
        </Link>

        <Link to="/examples/validation" className="example-card">
          <h3>Form Validation</h3>
          <p>Form with Zod schema validation and error display.</p>
        </Link>

        <Link to="/examples/multiple-validators" className="example-card">
          <h3>Multiple Validators</h3>
          <p>Form with multiple validators applied to fields.</p>
        </Link>
      </div>
    </div>
  );
}
