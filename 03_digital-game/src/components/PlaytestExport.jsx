import { useMemo, useState } from 'react';

export default function PlaytestExport({ mode, activePlayer, history, result, remainingCount }) {
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  const summary = useMemo(() => {
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

    return lines.join('\n');
  }, [activePlayer, history, mode, remainingCount, result]);

  async function copySummary() {
    setCopied(false);
    setCopyFailed(false);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API unavailable.');
      }

      await navigator.clipboard.writeText(summary);
      setCopied(true);
    } catch (error) {
      console.warn('Unable to copy playtest summary.', error);
      setCopyFailed(true);
    }
  }

  return (
    <section className="playtest-export">
      <h2>Playtest Export</h2>
      <p>Copy a quick round summary for the playtest folder.</p>
      <button type="button" onClick={copySummary}>Copy Summary</button>
      {copied ? <strong className="copy-status">Copied.</strong> : null}
      {copyFailed ? (
        <label className="copy-fallback">
          Copy manually
          <textarea readOnly value={summary} rows={8} />
        </label>
      ) : null}
    </section>
  );
}
