export default function DataHealthPanel({ validation }) {
  if (validation.valid) return null;

  return (
    <section className="data-health is-invalid" role="alert">
      <strong>Game data could not be loaded safely.</strong>
      <ul>
        {validation.errors.map((message) => <li key={message}>{message}</li>)}
      </ul>
    </section>
  );
}
