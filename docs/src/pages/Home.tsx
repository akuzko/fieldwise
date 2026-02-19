export default function Home() {
  return (
    <div className="page">
      <h1>Fieldwise</h1>
      <p className="lead">
        Type-safe, reactive form management for React with fine-grained field
        subscriptions.
      </p>

      <div className="features">
        <div className="feature">
          <h3>✨ Fine-grained reactivity</h3>
          <p>Subscribe to specific fields, not entire form state</p>
        </div>
        <div className="feature">
          <h3>🎯 Type-safe</h3>
          <p>Full TypeScript support with type inference</p>
        </div>
        <div className="feature">
          <h3>🪶 Lightweight</h3>
          <p>Event-driven architecture with no state in React components</p>
        </div>
        <div className="feature">
          <h3>🔌 Plugin system</h3>
          <p>Extensible with custom validation and behavior</p>
        </div>
        <div className="feature">
          <h3>⚡ Performance</h3>
          <p>Fine-grained subscriptions prevent unnecessary re-renders</p>
        </div>
        <div className="feature">
          <h3>🛡️ Zod validation</h3>
          <p>Built-in Zod schema validation</p>
        </div>
      </div>

      <div className="cta">
        <pre>
          <code>npm install fieldwise zod</code>
        </pre>
      </div>
    </div>
  );
}
