import suspects from './data/suspects.json';
import items from './data/items.json';
import questions from './data/questions.json';
import { getBestLead, getRemainingSuspects } from './engine/gameEngine.js';
import { loadSavedGame } from './engine/storage.js';

let syncQueued = false;

function playerKey(roundState) {
  return roundState?.mode === 'duel' ? roundState.activePlayer : 'shared';
}

function currentDeductionState() {
  const saved = loadSavedGame();
  const roundState = saved?.roundState;
  if (!roundState) return null;
  const key = playerKey(roundState);
  const eliminatedSuspects = roundState.eliminatedByPlayer?.[key] || [];
  const eliminatedItems = roundState.eliminatedItemsByPlayer?.[key] || [];
  const history = roundState.historyByPlayer?.[key] || [];

  return {
    remainingSuspects: getRemainingSuspects(suspects, eliminatedSuspects),
    remainingItems: items.filter((item) => !eliminatedItems.includes(item.id)),
    usedQuestionIds: new Set(history.map((entry) => entry.question?.id).filter(Boolean))
  };
}

function ensurePanel() {
  const deck = document.querySelector('.question-deck');
  const tabs = deck?.querySelector('.category-tabs');
  if (!deck || !tabs) return null;
  let panel = deck.querySelector('.best-lead-assist');
  if (panel) return panel;

  panel = document.createElement('section');
  panel.className = 'best-lead-assist';
  panel.setAttribute('aria-label', 'Detective assist');
  panel.setAttribute('role', 'status');
  panel.setAttribute('aria-live', 'polite');
  panel.setAttribute('aria-atomic', 'true');
  panel.innerHTML = `
    <div class="best-lead-copy">
      <span class="best-lead-kicker">DETECTIVE ASSIST · NO SPOILERS</span>
      <strong data-best-lead-title>Best lead</strong>
      <p data-best-lead-question>Cross off a few possibilities and the strongest split will appear here.</p>
      <small data-best-lead-math>Uses remaining-board information only.</small>
    </div>
    <button type="button" class="best-lead-action" data-best-lead-ask aria-keyshortcuts="L" disabled>Ask lead</button>`;
  tabs.before(panel);

  panel.querySelector('[data-best-lead-ask]').addEventListener('click', () => {
    const questionId = panel.dataset.questionId;
    const question = questions.find((candidate) => candidate.id === questionId);
    if (!question) return;
    askThroughExistingControls(question);
  });

  return panel;
}

function askThroughExistingControls(question) {
  const desiredTabText = question.category.replace(' / ', ' + ');
  const tab = [...document.querySelectorAll('.category-tabs button[role="tab"]')]
    .find((button) => button.textContent.trim() === desiredTabText);
  if (tab && tab.getAttribute('aria-selected') !== 'true') tab.click();

  let attempts = 0;
  const ask = () => {
    const target = [...document.querySelectorAll('.question-list button')]
      .find((button) => button.querySelector('strong')?.textContent === question.text);
    if (target && !target.disabled) {
      target.click();
      try { target.focus({ preventScroll: true }); }
      catch { target.focus(); }
      return;
    }
    attempts += 1;
    if (attempts < 4) window.setTimeout(ask, 25);
  };
  window.setTimeout(ask, 0);
}

function syncBestLead() {
  syncQueued = false;
  const panel = ensurePanel();
  if (!panel) return;

  if (document.querySelector('.resolution-backdrop')) {
    panel.hidden = true;
    return;
  }

  const deduction = currentDeductionState();
  if (!deduction) {
    panel.hidden = true;
    return;
  }

  const best = getBestLead(
    questions,
    deduction.remainingSuspects,
    deduction.remainingItems,
    deduction.usedQuestionIds
  );

  panel.hidden = false;
  const button = panel.querySelector('[data-best-lead-ask]');
  if (!best) {
    panel.dataset.questionId = '';
    panel.dataset.target = 'none';
    panel.querySelector('[data-best-lead-title]').textContent = 'No useful split left';
    panel.querySelector('[data-best-lead-question]').textContent = 'Your remaining board is too narrow for another informative yes/no split.';
    panel.querySelector('[data-best-lead-math]').textContent = 'Review the live clue and close the case when ready.';
    button.disabled = true;
    return;
  }

  panel.dataset.questionId = best.question.id;
  panel.dataset.target = best.target;
  panel.querySelector('[data-best-lead-title]').textContent = best.target === 'suspect' ? 'Best suspect lead' : 'Best item lead';
  panel.querySelector('[data-best-lead-question]').textContent = best.question.text;
  panel.querySelector('[data-best-lead-math]').textContent = `${best.yesCount} YES · ${best.noCount} NO · ~${best.expectedEliminations.toFixed(1)} expected eliminations · Press L to ask`;
  button.disabled = false;
}

function scheduleSync() {
  if (syncQueued) return;
  syncQueued = true;
  window.setTimeout(syncBestLead, 0);
}

const root = document.querySelector('#root');
if (root) {
  const observer = new MutationObserver((mutations) => {
    const meaningful = mutations.some((mutation) => !mutation.target.closest?.('.best-lead-assist'));
    if (meaningful) scheduleSync();
  });
  observer.observe(root, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['class', 'disabled', 'aria-selected', 'aria-pressed']
  });
}

document.addEventListener('keydown', (event) => {
  if (event.altKey || event.ctrlKey || event.metaKey) return;
  if (event.key.toLowerCase() !== 'l') return;
  const target = event.target;
  if (target instanceof Element && target.closest('input,textarea,select,[contenteditable="true"]')) return;
  const button = document.querySelector('.best-lead-assist [data-best-lead-ask]');
  if (!button || button.disabled || button.closest('[hidden]')) return;
  event.preventDefault();
  button.click();
});

window.addEventListener('pageshow', scheduleSync);
scheduleSync();
