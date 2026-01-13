import SliceExampleComponent from './forms/SliceExample';

export default function SliceExample() {
  return (
    <div className="page">
      <h1>Fine-grained Subscriptions</h1>
      <p>
        Using <code>useSlice()</code> to subscribe to specific fields only. This
        prevents unnecessary re-renders when unrelated fields change.
      </p>

      <SliceExampleComponent />

      <section className="example-notes">
        <h3>Performance Benefits</h3>
        <ul>
          <li>
            <strong>Selective Subscriptions:</strong> Components only re-render
            when subscribed fields change
          </li>
          <li>
            <strong>Optimized Updates:</strong> Reduce rendering overhead in
            large forms
          </li>
          <li>
            <strong>Field Isolation:</strong> Different parts of your UI can
            subscribe to different fields
          </li>
        </ul>

        <h3>When to Use</h3>
        <p>
          Use <code>useSlice()</code> instead of <code>useForm()</code> when:
        </p>
        <ul>
          <li>You have a large form with many fields</li>
          <li>Your component only needs to display or edit specific fields</li>
          <li>You want to optimize rendering performance</li>
        </ul>
      </section>
    </div>
  );
}
