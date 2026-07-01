export default function DebugPanel({ mystery, mode, activePlayer, remainingCount, revealed, onToggleReveal }) {
  return (
    <details className="debug-panel">
      <summary>Playtest / Host Tools</summary>
      <p>Use this during testing only. Do not reveal the mystery to normal players.</p>
      <dl>
        <dt>Mode</dt>
        <dd>{mode}</dd>
        <dt>Active player</dt>
        <dd>{activePlayer}</dd>
        <dt>Remaining suspects</dt>
        <dd>{remainingCount}</dd>
      </dl>
      <button type="button" onClick={onToggleReveal}>{revealed ? 'Hide Mystery' : 'Reveal Mystery'}</button>
      {revealed && (
        <div className="debug-answer">
          <strong>{mystery.suspect.name}</strong> took the <strong>{mystery.item.name}</strong>.
        </div>
      )}
    </details>
  );
}
