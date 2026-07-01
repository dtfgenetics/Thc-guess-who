export default function PlaytestExport({ mode, activePlayer, history, result, remainingCount }) {
  function copySummary() {
    const lines = [
      'Who Took It? Playtest Summary',
      `Mode: ${mode}`,
      `Active player: ${activePlayer}`,
      `Remaining suspects: ${remainingCount}`,
      `Questions asked: ${history.length}`,
      `Result: ${result ? (result.win ? 'Win' : 'Loss') : 'In progress'}`,
      '',
      'Question History:',
      ...history.map((entry, index) => `${index + 1}. ${entry.question.text} — ${entry.answerLabel}`)
    ];

    navigator.clipboard?.writeText(lines.join('\n'));
  }

  return (
    <section className="playtest-export">
      <h2>Playtest Export</h2>
      <p>Copy a quick round summary for the playtest folder.</p>
      <button type="button" onClick={copySummary}>Copy Summary</button>
    </section>
  );
}
