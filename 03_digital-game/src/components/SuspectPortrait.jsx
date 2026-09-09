export default function SuspectPortrait({ suspect, art, runtimeBase }) {
  const approved = art?.status === 'approved';
  const src = approved && art?.asset ? `${runtimeBase}${art.asset}` : null;

  return (
    <span
      className={`suspect-portrait ${approved ? 'has-approved-art' : 'is-art-pending'}`}
      data-suspect-id={suspect.id}
      data-art-status={art?.status || 'missing'}
    >
      {approved ? (
        <img src={src} alt={`Portrait of ${suspect.name}`} loading="lazy" decoding="async" />
      ) : (
        <span className="suspect-portrait-pending" aria-label={`${suspect.name} portrait art pending`}>
          <strong>{suspect.coord}</strong>
          <span>PORTRAIT</span>
          <small>ART PENDING</small>
        </span>
      )}
    </span>
  );
}
