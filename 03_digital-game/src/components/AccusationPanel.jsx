export default function AccusationPanel({ suspects, items, selectedSuspectId, selectedItemId, onSelectSuspect, onSelectItem, onAccuse }) {
  return (
    <section className="accusation-panel" aria-labelledby="accusation-heading">
      <div className="panel-heading">
        <h2 id="accusation-heading">Final Accusation</h2>
        <p>Wrong accusation loses the round.</p>
      </div>

      <label>
        Suspect
        <select value={selectedSuspectId} onChange={(event) => onSelectSuspect(event.target.value)}>
          <option value="">Choose a suspect...</option>
          {suspects.map((suspect) => (
            <option key={suspect.id} value={suspect.id}>{suspect.coord} — {suspect.name}</option>
          ))}
        </select>
      </label>

      <label>
        Missing Item
        <select value={selectedItemId} onChange={(event) => onSelectItem(event.target.value)}>
          <option value="">Choose an item...</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </select>
      </label>

      <button className="primary-action" type="button" disabled={!selectedSuspectId || !selectedItemId} onClick={onAccuse}>
        I think this is it
      </button>
    </section>
  );
}
