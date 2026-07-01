export default function DataHealthPanel({ validation }) {
  if (validation.valid) {
    return <section className="data-health is-valid"><strong>Data check passed:</strong> suspects, items, and questions are loaded.</section>;
  }

  return (
    <section className="data-health is-invalid">
      <strong>Data check failed.</strong>
      <ul>
        {validation.errors.map((message) => <li key={message}>{message}</li>)}
      </ul>
    </section>
  );
}
