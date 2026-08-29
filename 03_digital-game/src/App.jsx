import { useMemo, useRef, useState } from 'react';

import suspects from './data/suspects.json';
import items from './data/items.json';
import questions from './data/questions.json';

import DataHealthPanel from './components/DataHealthPanel.jsx';
import DebugPanel from './components/DebugPanel.jsx';
import PlaytestExport from './components/PlaytestExport.jsx';

import {
  answerQuestion,
  createMystery,
  getQuestionAnswerLabel,
  getRemainingSuspects,
  makeAccusation,
  toggleEliminated
} from './engine/gameEngine.js';
import { validateGameData } from './engine/validateData.js';

const PLAYER_IDS = ['Player 1', 'Player 2'];
const QUESTION_CATEGORIES = [...new Set(questions.map((question) => question.category))];
const validation = validateGameData({ suspects, items, questions });
const SHOW_PLAYTEST_TOOLS = import.meta.env.DEV;

const LANE_META = {
  Bag: { short: 'BAG', icon: '▰' },
  Dabs: { short: 'DABS', icon: '◆' },
  Lighter: { short: 'LIT', icon: '✦' },
  'Chocolate Bar': { short: 'CHOCO', icon: '▥' },
  Gummies: { short: 'GUM', icon: '●' }
};

function createRoundState(mode) {
  if (mode === 'duel') {
    return {
      mode,
      activePlayer: PLAYER_IDS[0],
      mysteries: {
        [PLAYER_IDS[0]]: createMystery(suspects, items),
        [PLAYER_IDS[1]]: createMystery(suspects, items)
      },
      eliminatedByPlayer: {
        [PLAYER_IDS[0]]: [],
        [PLAYER_IDS[1]]: []
      },
      eliminatedItemsByPlayer: {
        [PLAYER_IDS[0]]: [],
        [PLAYER_IDS[1]]: []
      },
      historyByPlayer: {
        [PLAYER_IDS[0]]: [],
        [PLAYER_IDS[1]]: []
      }
    };
  }

  return {
    mode,
    activePlayer: mode === 'shared' ? 'Group' : 'Solo Player',
    mysteries: {
      shared: createMystery(suspects, items)
    },
    eliminatedByPlayer: {
      shared: []
    },
    eliminatedItemsByPlayer: {
      shared: []
    },
    historyByPlayer: {
      shared: []
    }
  };
}

function getStateKey(roundState) {
  return roundState.mode === 'duel' ? roundState.activePlayer : 'shared';
}

function getTargetMystery(roundState) {
  if (roundState.mode !== 'duel') {
    return roundState.mysteries.shared;
  }

  return roundState.activePlayer === PLAYER_IDS[0]
    ? roundState.mysteries[PLAYER_IDS[1]]
    : roundState.mysteries[PLAYER_IDS[0]];
}

function initials(name) {
  return name
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

function avatarStyle(suspect) {
  const number = Number.parseInt(suspect.id.replace(/\D/g, ''), 10) || 1;
  return {
    '--avatar-hue': `${(number * 47) % 360}`,
    '--avatar-tilt': `${((number % 7) - 3) * 1.4}deg`
  };
}

function itemMeta(item) {
  return LANE_META[item.name] || { short: item.name.slice(0, 5).toUpperCase(), icon: '◇' };
}

export default function App() {
  const [mode, setMode] = useState('solo');
  const [roundState, setRoundState] = useState(() => createRoundState('solo'));
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [questionCategory, setQuestionCategory] = useState(QUESTION_CATEGORIES[0]);
  const [latestClue, setLatestClue] = useState(null);
  const [accusationOpen, setAccusationOpen] = useState(false);
  const accusationItemRef = useRef(null);

  const stateKey = getStateKey(roundState);
  const targetMystery = getTargetMystery(roundState);
  const eliminatedIds = roundState.eliminatedByPlayer[stateKey] || [];
  const eliminatedItemIds = roundState.eliminatedItemsByPlayer[stateKey] || [];
  const questionHistory = roundState.historyByPlayer[stateKey] || [];
  const remainingSuspects = useMemo(() => getRemainingSuspects(suspects, eliminatedIds), [eliminatedIds]);
  const remainingItems = useMemo(
    () => items.filter((item) => !eliminatedItemIds.includes(item.id)),
    [eliminatedItemIds]
  );
  const usedQuestionIds = useMemo(
    () => new Set(questionHistory.map((entry) => entry.question.id)),
    [questionHistory]
  );
  const visibleQuestions = useMemo(
    () => questions.filter((question) => question.category === questionCategory),
    [questionCategory]
  );
  const selectedSuspect = suspects.find((suspect) => suspect.id === selectedSuspectId);
  const selectedItem = items.find((item) => item.id === selectedItemId);

  function startNewGame(nextMode = mode) {
    setMode(nextMode);
    setRoundState(createRoundState(nextMode));
    setSelectedSuspectId('');
    setSelectedItemId('');
    setResult(null);
    setRevealed(false);
    setLatestClue(null);
    setAccusationOpen(false);
  }

  function handleModeChange(nextMode) {
    if (nextMode === mode) return;
    startNewGame(nextMode);
  }

  function updatePlayerSlice(sliceName, value) {
    setRoundState((current) => {
      const key = getStateKey(current);
      return {
        ...current,
        [sliceName]: {
          ...current[sliceName],
          [key]: value
        }
      };
    });
  }

  function handleAskQuestion(question) {
    if (result || usedQuestionIds.has(question.id)) return;
    const answer = answerQuestion(targetMystery, question);
    const entry = {
      question,
      answer,
      answerLabel: getQuestionAnswerLabel(answer),
      player: roundState.activePlayer
    };

    setLatestClue(entry);
    updatePlayerSlice('historyByPlayer', [...questionHistory, entry]);
  }

  function handleToggleSuspect(suspectId) {
    if (result) return;
    updatePlayerSlice('eliminatedByPlayer', toggleEliminated(eliminatedIds, suspectId));
  }

  function handleToggleItem(itemId) {
    if (result) return;
    updatePlayerSlice('eliminatedItemsByPlayer', toggleEliminated(eliminatedItemIds, itemId));
  }

  function handleQuickAccuse(suspectId) {
    if (result) return;
    setSelectedSuspectId(suspectId);
    setAccusationOpen(true);
    window.requestAnimationFrame(() => {
      const itemSelect = accusationItemRef.current;
      if (!itemSelect) return;
      const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      itemSelect.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
      itemSelect.focus({ preventScroll: true });
    });
  }

  function handleAccuse() {
    if (!selectedSuspectId || !selectedItemId) return;
    setResult(makeAccusation(targetMystery, selectedSuspectId, selectedItemId));
    setAccusationOpen(false);
  }

  function nextDuelTurn() {
    if (roundState.mode !== 'duel' || result) return;
    setRoundState((current) => ({
      ...current,
      activePlayer: current.activePlayer === PLAYER_IDS[0] ? PLAYER_IDS[1] : PLAYER_IDS[0]
    }));
    setSelectedSuspectId('');
    setSelectedItemId('');
    setLatestClue(null);
    setAccusationOpen(false);
    setRevealed(false);
  }

  return (
    <main className="case-app">
      <DataHealthPanel validation={validation} />

      <header className="case-header">
        <div className="case-nav">
          <a className="dtf-lockup" href="/games/" aria-label="Back to DTF Game Hub">
            <span className="dtf-mark">DTF</span>
            <span><strong>Game Lab</strong><small>Dream the Future</small></span>
          </a>
          <div className="case-nav-actions">
            <span className="case-number">CASE #420</span>
            <button type="button" className="ghost-button" onClick={() => startNewGame()}>New case</button>
          </div>
        </div>

        <div className="case-hero">
          <div className="hero-copy">
            <p className="kicker">A DTF cannabis mystery game</p>
            <h1>WHO <em>TOOK</em> IT?</h1>
            <p className="case-brief">The stash is short. The room is suspicious. Nobody remembers anything. Ask clean yes/no clues, cross off bad leads, and name the suspect <strong>and</strong> the missing item before the case goes cold.</p>
          </div>
          <div className="hero-stamp" aria-hidden="true">
            <span>OPEN</span>
            <strong>CASE</strong>
            <small>25 suspects · 5 missing items</small>
          </div>
        </div>

        <section className="mode-bar" aria-label="Game mode">
          <div className="mode-copy">
            <span className="mode-label">PLAY MODE</span>
            <strong>{mode === 'solo' ? 'Solo investigation' : mode === 'shared' ? 'Group investigation' : 'Pass-the-device duel'}</strong>
          </div>
          <div className="mode-pills" role="group" aria-label="Choose mode">
            {[
              ['solo', 'Solo'],
              ['shared', 'Group'],
              ['duel', 'Duel']
            ].map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={mode === value ? 'is-active' : ''}
                aria-pressed={mode === value}
                onClick={() => handleModeChange(value)}
              >
                {label}
              </button>
            ))}
          </div>
        </section>
      </header>

      <section className="case-hud" aria-live="polite">
        <div className="hud-block active-investigator">
          <span>INVESTIGATOR</span>
          <strong>{roundState.activePlayer}</strong>
        </div>
        <div className="hud-block">
          <span>SUSPECTS LEFT</span>
          <strong>{remainingSuspects.length}<small>/25</small></strong>
        </div>
        <div className="hud-block">
          <span>ITEMS LEFT</span>
          <strong>{remainingItems.length}<small>/5</small></strong>
        </div>
        <div className="hud-block">
          <span>CLUES ASKED</span>
          <strong>{questionHistory.length}</strong>
        </div>
        {roundState.mode === 'duel' ? (
          <button type="button" className="pass-button" onClick={nextDuelTurn}>
            End turn <span>→ Pass device</span>
          </button>
        ) : null}
      </section>

      <div className="case-workspace">
        <section className="case-board" aria-labelledby="suspect-board-title">
          <div className="section-title-row">
            <div>
              <p className="section-index">01 · SUSPECT BOARD</p>
              <h2 id="suspect-board-title">Cross off bad leads.</h2>
            </div>
            <p>Tap a dossier to eliminate or restore it. Hit <strong>Accuse</strong> when a suspect feels right.</p>
          </div>

          <div className="suspect-grid">
            {suspects.map((suspect) => {
              const eliminated = eliminatedIds.includes(suspect.id);
              const lane = LANE_META[suspect.primaryLane] || { short: suspect.primaryLane, icon: '◇' };
              return (
                <article
                  key={suspect.id}
                  className={`suspect-card ${eliminated ? 'is-eliminated' : ''}`}
                  style={avatarStyle(suspect)}
                >
                  <button
                    type="button"
                    className="suspect-main"
                    aria-pressed={eliminated}
                    onClick={() => handleToggleSuspect(suspect.id)}
                  >
                    <span className="dossier-topline">
                      <span className="coord">{suspect.coord}</span>
                      <span className="lane-badge"><b>{lane.icon}</b>{lane.short}</span>
                    </span>
                    <span className="suspect-avatar" aria-hidden="true">
                      <span className="avatar-orbit" />
                      <span className="avatar-head" />
                      <span className="avatar-body" />
                      <b>{initials(suspect.name)}</b>
                    </span>
                    <span className="suspect-name">{suspect.name}</span>
                    <span className="suspect-quote">“{suspect.quote}”</span>
                    <span className="tag-row">
                      {suspect.publicTags.map((tag) => <i key={tag}>{tag}</i>)}
                    </span>
                    {eliminated ? <span className="eliminated-mark" aria-hidden="true">×</span> : null}
                  </button>
                  <button type="button" className="accuse-chip" onClick={() => handleQuickAccuse(suspect.id)}>
                    Accuse
                  </button>
                </article>
              );
            })}
          </div>
        </section>

        <aside className="detective-rail" aria-label="Detective tools">
          <section className={`clue-reveal ${latestClue ? (latestClue.answer ? 'is-yes' : 'is-no') : ''}`}>
            <div className="rail-heading">
              <span>LIVE CLUE</span>
              <small>{latestClue ? `Clue ${questionHistory.length}` : 'Waiting for a question'}</small>
            </div>
            {latestClue ? (
              <>
                <strong className="clue-answer">{latestClue.answerLabel.toUpperCase()}</strong>
                <p>{latestClue.question.text}</p>
                <span className="clue-category">{latestClue.question.category}</span>
              </>
            ) : (
              <div className="clue-empty">
                <span aria-hidden="true">?</span>
                <p>Pick a clue below. The case only answers YES or NO.</p>
              </div>
            )}
          </section>

          <section className="question-deck" aria-labelledby="clue-deck-title">
            <div className="rail-heading">
              <div>
                <span>02 · CLUE DECK</span>
                <h2 id="clue-deck-title">Interrogate the case.</h2>
              </div>
              <small>{questionHistory.length}/{questions.length} used</small>
            </div>

            <div className="category-tabs" role="tablist" aria-label="Clue categories">
              {QUESTION_CATEGORIES.map((category) => (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={questionCategory === category}
                  className={questionCategory === category ? 'is-active' : ''}
                  onClick={() => setQuestionCategory(category)}
                >
                  {category.replace(' / ', ' + ')}
                </button>
              ))}
            </div>

            <div className="question-list">
              {visibleQuestions.map((question) => {
                const used = usedQuestionIds.has(question.id);
                return (
                  <button
                    key={question.id}
                    type="button"
                    disabled={used || Boolean(result)}
                    className={used ? 'is-used' : ''}
                    onClick={() => handleAskQuestion(question)}
                  >
                    <span>{question.target === 'suspect' ? 'SUSPECT' : 'ITEM'}</span>
                    <strong>{question.text}</strong>
                    <b>{used ? 'ASKED' : 'ASK →'}</b>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="evidence-locker" aria-labelledby="evidence-title">
            <div className="rail-heading">
              <div>
                <span>03 · EVIDENCE LOCKER</span>
                <h2 id="evidence-title">What disappeared?</h2>
              </div>
              <small>Tap to rule out</small>
            </div>
            <div className="item-grid">
              {items.map((item) => {
                const eliminated = eliminatedItemIds.includes(item.id);
                const meta = itemMeta(item);
                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`evidence-card ${eliminated ? 'is-eliminated' : ''}`}
                    aria-pressed={eliminated}
                    onClick={() => handleToggleItem(item.id)}
                  >
                    <span className="evidence-icon" aria-hidden="true">{meta.icon}</span>
                    <span><strong>{item.name}</strong><small>{item.flavorLine}</small></span>
                    <b>{eliminated ? 'RULED OUT' : 'POSSIBLE'}</b>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="history-panel" aria-labelledby="history-title">
            <div className="rail-heading">
              <div>
                <span>CASE NOTES</span>
                <h2 id="history-title">Clue history</h2>
              </div>
              <small>{questionHistory.length} recorded</small>
            </div>
            {questionHistory.length ? (
              <ol>
                {[...questionHistory].reverse().slice(0, 8).map((entry) => (
                  <li key={`${entry.question.id}-${entry.player}`}>
                    <span className={entry.answer ? 'yes' : 'no'}>{entry.answerLabel}</span>
                    <p>{entry.question.text}</p>
                  </li>
                ))}
              </ol>
            ) : <p className="empty-note">Your first clue will appear here.</p>}
          </section>
        </aside>
      </div>

      <section className="accusation-dock" aria-label="Final accusation">
        <div>
          <p className="section-index">04 · CLOSE THE CASE</p>
          <h2>Think you know who took what?</h2>
          <p>Lock in one suspect and one missing item. A wrong accusation ends this case.</p>
        </div>
        <button type="button" className="accusation-launch" onClick={() => setAccusationOpen(true)}>
          Build accusation <span>→</span>
        </button>
      </section>

      {accusationOpen ? (
        <div className="drawer-backdrop" role="presentation" onMouseDown={() => setAccusationOpen(false)}>
          <section
            className="accusation-drawer"
            role="dialog"
            aria-modal="true"
            aria-labelledby="accusation-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="drawer-close" type="button" aria-label="Close accusation" onClick={() => setAccusationOpen(false)}>×</button>
            <p className="section-index">FINAL ACCUSATION</p>
            <h2 id="accusation-title">Put your reputation on it.</h2>
            <p className="drawer-intro">Choose the culprit and the missing item. Once submitted, the case is over.</p>

            <div className="accusation-preview">
              <div className="preview-card suspect-preview">
                <span>SUSPECT</span>
                <strong>{selectedSuspect?.name || 'Choose a suspect'}</strong>
                <small>{selectedSuspect ? selectedSuspect.publicTags.join(' · ') : '25 questionable alibis'}</small>
              </div>
              <div className="accusation-plus">+</div>
              <div className="preview-card item-preview">
                <span>MISSING ITEM</span>
                <strong>{selectedItem?.name || 'Choose an item'}</strong>
                <small>{selectedItem?.flavorLine || '5 possible missing items'}</small>
              </div>
            </div>

            <label>
              Suspect
              <select value={selectedSuspectId} onChange={(event) => setSelectedSuspectId(event.target.value)}>
                <option value="">Select suspect…</option>
                {remainingSuspects.map((suspect) => <option key={suspect.id} value={suspect.id}>{suspect.name}</option>)}
              </select>
            </label>

            <label>
              Missing item
              <select ref={accusationItemRef} value={selectedItemId} onChange={(event) => setSelectedItemId(event.target.value)}>
                <option value="">Select item…</option>
                {remainingItems.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </label>

            <button
              type="button"
              className="lock-accusation"
              disabled={!selectedSuspectId || !selectedItemId}
              onClick={handleAccuse}
            >
              LOCK ACCUSATION
            </button>
          </section>
        </div>
      ) : null}

      {result ? (
        <div className="resolution-backdrop">
          <section className={`case-resolution ${result.win ? 'is-win' : 'is-loss'}`} role="dialog" aria-modal="true" aria-labelledby="resolution-title">
            <p className="resolution-kicker">CASE RESOLVED</p>
            <div className="resolution-seal" aria-hidden="true">{result.win ? '✓' : '×'}</div>
            <h2 id="resolution-title">{result.win ? 'You caught the culprit.' : 'The case went cold.'}</h2>
            <p className="resolution-copy">
              {result.win
                ? `${targetMystery.suspect.name} took the ${targetMystery.item.name}. Nice work, detective.`
                : `The actual culprit was ${targetMystery.suspect.name}, and the missing item was the ${targetMystery.item.name}.`}
            </p>
            <blockquote>“{targetMystery.suspect.quote}”</blockquote>
            <div className="resolution-facts">
              <div><span>Your suspect</span><strong className={result.suspectCorrect ? 'correct' : 'wrong'}>{selectedSuspect?.name}</strong></div>
              <div><span>Your item</span><strong className={result.itemCorrect ? 'correct' : 'wrong'}>{selectedItem?.name}</strong></div>
              <div><span>Clues used</span><strong>{questionHistory.length}</strong></div>
            </div>
            <button type="button" className="new-case-button" onClick={() => startNewGame()}>Open another case</button>
          </section>
        </div>
      ) : null}

      {SHOW_PLAYTEST_TOOLS ? (
        <section className="developer-tools">
          <PlaytestExport
            mode={roundState.mode}
            activePlayer={roundState.activePlayer}
            history={questionHistory}
            result={result}
            remainingCount={remainingSuspects.length}
          />
          <DebugPanel
            mystery={targetMystery}
            mode={roundState.mode}
            activePlayer={roundState.activePlayer}
            remainingCount={remainingSuspects.length}
            revealed={revealed}
            onToggleReveal={() => setRevealed((value) => !value)}
          />
        </section>
      ) : null}

      <footer className="game-footer">
        <strong>Who Took It?</strong>
        <span>DTF Genetics · Dream the Future</span>
        <span>Adult party game · 21+ · Entertainment only</span>
      </footer>
    </main>
  );
}
