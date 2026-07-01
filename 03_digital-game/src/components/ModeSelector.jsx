export default function ModeSelector({ mode, onModeChange, onNewGame }) {
  return (
    <section className="mode-selector" aria-labelledby="mode-heading">
      <div>
        <h2 id="mode-heading">Game Mode</h2>
        <p>Start with preset questions. Typed questions come later after the binary engine is proven.</p>
      </div>
      <div className="mode-controls">
        <label>
          Mode
          <select value={mode} onChange={(event) => onModeChange(event.target.value)}>
            <option value="solo">Single Player</option>
            <option value="shared">Shared Mystery / Host Mode</option>
            <option value="duel">Local 2-Player Duel</option>
          </select>
        </label>
        <button type="button" onClick={onNewGame}>New Mystery</button>
      </div>
    </section>
  );
}
