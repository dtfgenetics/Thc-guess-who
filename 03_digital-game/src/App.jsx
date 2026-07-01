import { useMemo, useState } from 'react';

import suspects from './data/suspects.json';
import items from './data/items.json';
import questions from './data/questions.json';

import Board from './components/Board.jsx';
import QuestionPanel from './components/QuestionPanel.jsx';
import AccusationPanel from './components/AccusationPanel.jsx';
import ResultPanel from './components/ResultPanel.jsx';
import ModeSelector from './components/ModeSelector.jsx';
import DebugPanel from './components/DebugPanel.jsx';
import ItemTracker from './components/ItemTracker.jsx';

import {
  answerQuestion,
  createMystery,
  getQuestionAnswerLabel,
  getRemainingSuspects,
  makeAccusation,
  toggleEliminated
} from './engine/gameEngine.js';

const PLAYER_IDS = ['Player 1', 'Player 2'];

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

export default function App() {
  const [mode, setMode] = useState('solo');
  const [roundState, setRoundState] = useState(() => createRoundState('solo'));
  const [selectedSuspectId, setSelectedSuspectId] = useState('');
  const [selectedItemId, setSelectedItemId] = useState('');
  const [result, setResult] = useState(null);
  const [revealed, setRevealed] = useState(false);

  const stateKey = getStateKey(roundState);
  const targetMystery = getTargetMystery(roundState);
  const eliminatedIds = roundState.eliminatedByPlayer[stateKey] || [];
  const eliminatedItemIds = roundState.eliminatedItemsByPlayer[stateKey] || [];
  const questionHistory = roundState.historyByPlayer[stateKey] || [];
  const remainingSuspects = useMemo(() => getRemainingSuspects(suspects, eliminatedIds), [eliminatedIds]);

  function startNewGame(nextMode = mode) {
    setMode(nextMode);
    setRoundState(createRoundState(nextMode));
    setSelectedSuspectId('');
    setSelectedItemId('');
    setResult(null);
    setRevealed(false);
  }

  function handleModeChange(nextMode) {
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
    if (result) return;
    const answer = answerQuestion(targetMystery, question);
    const entry = {
      question,
      answer,
      answerLabel: getQuestionAnswerLabel(answer),
      player: roundState.activePlayer
    };

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
    setSelectedSuspectId(suspectId);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  }

  function handleAccuse() {
    if (!selectedSuspectId || !selectedItemId) return;
    setResult(makeAccusation(targetMystery, selectedSuspectId, selectedItemId));
  }

  function nextDuelTurn() {
    if (roundState.mode !== 'duel' || result) return;
    setRoundState((current) => ({
      ...current,
      activePlayer: current.activePlayer === PLAYER_IDS[0] ? PLAYER_IDS[1] : PLAYER_IDS[0]
    }));
    setSelectedSuspectId('');
    setSelectedItemId('');
    setRevealed(false);
  }

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">THC — Teaching Healthy Cultivation</p>
        <h1>Who Took It?</h1>
        <p>Ask yes/no questions, cross off suspects, and solve who took the missing item.</p>
      </header>

      <ModeSelector mode={mode} onModeChange={handleModeChange} onNewGame={() => startNewGame()} />

      <section className="round-status">
        <div>
          <strong>Active:</strong> {roundState.activePlayer}
        </div>
        <div>
          <strong>Target:</strong> {roundState.mode === 'duel' ? 'Opponent mystery' : 'Shared mystery'}
        </div>
        <div>
          <strong>Remaining suspects:</strong> {remainingSuspects.length}
        </div>
        {roundState.mode === 'duel' && (
          <button type="button" onClick={nextDuelTurn}>End Turn / Pass Device</button>
        )}
      </section>

      <div className="game-layout">
        <Board
          suspects={suspects}
          eliminatedIds={eliminatedIds}
          onToggleSuspect={handleToggleSuspect}
          onQuickAccuse={handleQuickAccuse}
        />

        <aside className="right-rail">
          <QuestionPanel questions={questions} onAskQuestion={handleAskQuestion} questionHistory={questionHistory} />
          <ItemTracker items={items} eliminatedItemIds={eliminatedItemIds} onToggleItem={handleToggleItem} />
          <AccusationPanel
            suspects={suspects}
            items={items}
            selectedSuspectId={selectedSuspectId}
            selectedItemId={selectedItemId}
            onSelectSuspect={setSelectedSuspectId}
            onSelectItem={setSelectedItemId}
            onAccuse={handleAccuse}
          />
          <ResultPanel result={result} mystery={targetMystery} onNewGame={() => startNewGame()} />
          <DebugPanel
            mystery={targetMystery}
            mode={roundState.mode}
            activePlayer={roundState.activePlayer}
            remainingCount={remainingSuspects.length}
            revealed={revealed}
            onToggleReveal={() => setRevealed((value) => !value)}
          />
        </aside>
      </div>

      <footer className="footer-note">
        Adult party game. 21+ only. For entertainment purposes. No free-form questions yet: preset questions protect fair yes/no logic.
      </footer>
    </main>
  );
}
