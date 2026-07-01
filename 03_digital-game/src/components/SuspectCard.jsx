export default function SuspectCard({ suspect, eliminated, onToggle, onAccuse }) {
  return (
    <article className={`suspect-card ${eliminated ? 'is-eliminated' : ''}`}>
      <button className="suspect-toggle" type="button" onClick={() => onToggle(suspect.id)}>
        <span className="coord">{suspect.coord}</span>
        <span className="portrait" aria-hidden="true">?</span>
        <strong>{suspect.name}</strong>
        <span className="tags">{suspect.publicTags.join(' • ')}</span>
        {eliminated && <span className="crossout">ELIMINATED</span>}
      </button>
      <button className="accuse-small" type="button" onClick={() => onAccuse(suspect.id)}>
        accuse
      </button>
    </article>
  );
}
