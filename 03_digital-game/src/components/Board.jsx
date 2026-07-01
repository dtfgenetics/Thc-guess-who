import SuspectCard from './SuspectCard.jsx';

export default function Board({ suspects, eliminatedIds, onToggleSuspect, onQuickAccuse }) {
  return (
    <section className="board-panel" aria-labelledby="board-heading">
      <div className="panel-heading">
        <h2 id="board-heading">Suspect Board</h2>
        <p>Tap a suspect to cross them off. Use accuse when you are ready.</p>
      </div>
      <div className="suspect-grid">
        {suspects.map((suspect) => (
          <SuspectCard
            key={suspect.id}
            suspect={suspect}
            eliminated={eliminatedIds.includes(suspect.id)}
            onToggle={onToggleSuspect}
            onAccuse={onQuickAccuse}
          />
        ))}
      </div>
    </section>
  );
}
