import { useMemo } from 'react';
import { getBestLead } from '../engine/gameEngine.js';

export default function BestLeadAssist({ questions, remainingSuspects, remainingItems, usedQuestionIds, onAskQuestion, disabled }) {
  const best = useMemo(
    () => getBestLead(questions, remainingSuspects, remainingItems, usedQuestionIds),
    [questions, remainingSuspects, remainingItems, usedQuestionIds]
  );

  if (!best) {
    return (
      <section className="best-lead-assist" data-target="none" aria-label="Detective assist" role="status" aria-live="polite">
        <div className="best-lead-copy">
          <span className="best-lead-kicker">DETECTIVE ASSIST · NO SPOILERS</span>
          <strong>No useful split left</strong>
          <p>Your remaining board is too narrow for another informative yes/no split.</p>
          <small>Review the live clue and close the case when ready.</small>
        </div>
        <button type="button" className="best-lead-action" disabled>Ask lead</button>
      </section>
    );
  }

  return (
    <section className="best-lead-assist" data-target={best.target} aria-label="Detective assist" role="status" aria-live="polite" aria-atomic="true">
      <div className="best-lead-copy">
        <span className="best-lead-kicker">DETECTIVE ASSIST · NO SPOILERS</span>
        <strong>{best.target === 'suspect' ? 'Best suspect lead' : 'Best item lead'}</strong>
        <p>{best.question.text}</p>
        <small>{best.yesCount} YES · {best.noCount} NO · ~{best.expectedEliminations.toFixed(1)} expected eliminations</small>
      </div>
      <button type="button" className="best-lead-action" disabled={disabled} onClick={() => onAskQuestion(best.question)}>
        Ask lead
      </button>
    </section>
  );
}
