export default function ResultPanel({ result, mystery, onNewGame }) {
  if (!result) return null;

  return (
    <section className={`result-panel ${result.win ? 'win' : 'lose'}`} role="status" aria-live="polite">
      <h2>{result.win ? 'Correct Accusation' : 'Wrong Accusation'}</h2>
      <p>
        The mystery was <strong>{mystery.suspect.name}</strong> took the <strong>{mystery.item.name}</strong>.
      </p>
      <ul>
        <li>Suspect: {result.suspectCorrect ? 'Correct' : 'Wrong'}</li>
        <li>Item: {result.itemCorrect ? 'Correct' : 'Wrong'}</li>
      </ul>
      <button className="primary-action" type="button" onClick={onNewGame}>Start New Game</button>
    </section>
  );
}
