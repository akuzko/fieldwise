import BasicExample from './forms/BasicExample';

export default function BasicFormExample() {
  return (
    <div className="page">
      <h1>Basic Form</h1>
      <p>
        Simple form with field binding using the <code>i()</code> helper. The{' '}
        <code>i()</code> function generates all necessary props for controlled
        inputs including <code>name</code>, <code>value</code>,{' '}
        <code>onChange</code>, and <code>error</code>.
      </p>

      <BasicExample />

      <section className="example-notes">
        <h3>Key Features</h3>
        <ul>
          <li>
            <strong>Input Helper:</strong> The <code>i()</code> function
            simplifies form field binding
          </li>
          <li>
            <strong>Type Safety:</strong> Field names are type-checked at
            compile time
          </li>
          <li>
            <strong>Automatic Updates:</strong> Form state updates trigger
            re-renders automatically
          </li>
        </ul>
      </section>
    </div>
  );
}
