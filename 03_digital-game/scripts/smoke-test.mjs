import { readFileSync } from 'node:fs';

import {
  answerQuestion,
  createMystery,
  getBestLead,
  getRemainingSuspects,
  makeAccusation,
  scoreQuestionSplit,
  toggleEliminated
} from '../src/engine/gameEngine.js';
import { clearSavedGame, isValidSavedSession, loadSavedGame, saveGame } from '../src/engine/storage.js';

const suspects = readJson('src/data/suspects.json');
const items = readJson('src/data/items.json');
const questions = readJson('src/data/questions.json');
const failures = [];

for (let index = 0; index < 100; index += 1) {
  const mystery = createMystery(suspects, items);
  if (!mystery.suspect?.id || !mystery.item?.id) {
    failures.push('createMystery returned incomplete data.');
  }
}

for (const suspect of suspects) {
  for (const item of items) {
    const mystery = { suspect, item };

    for (const question of questions) {
      try {
        const answer = answerQuestion(mystery, question);
        if (typeof answer !== 'boolean') {
          failures.push(`${question.id} did not return a boolean answer.`);
        }
      } catch (error) {
        failures.push(`${question.id} threw an error: ${error.message}`);
      }
    }

    const win = makeAccusation(mystery, suspect.id, item.id);
    if (!win.win || !win.suspectCorrect || !win.itemCorrect) {
      failures.push(`Correct accusation failed for ${suspect.id}/${item.id}.`);
    }

    const otherSuspect = suspects.find((candidate) => candidate.id !== suspect.id);
    const wrong = makeAccusation(mystery, otherSuspect.id, item.id);
    if (wrong.win || wrong.suspectCorrect || !wrong.itemCorrect) {
      failures.push(`Wrong accusation failed for ${suspect.id}/${item.id}.`);
    }
  }
}

let eliminated = [];
eliminated = toggleEliminated(eliminated, 'suspect_001');
if (!eliminated.includes('suspect_001')) failures.push('toggleEliminated failed to add suspect.');
eliminated = toggleEliminated(eliminated, 'suspect_001');
if (eliminated.includes('suspect_001')) failures.push('toggleEliminated failed to remove suspect.');

const remaining = getRemainingSuspects(suspects, ['suspect_001']);
if (remaining.length !== 24) failures.push(`Expected 24 remaining suspects, found ${remaining.length}.`);

for (const question of questions) {
  const split = scoreQuestionSplit(question, suspects, items);
  if (split.yesCount + split.noCount !== split.total) failures.push(`${question.id} split counts do not sum to total.`);
  const expectedTotal = question.target === 'suspect' ? suspects.length : items.length;
  if (split.total !== expectedTotal) failures.push(`${question.id} ranked the wrong candidate pool.`);
  if (split.expectedEliminations < 0 || split.expectedEliminations > split.total / 2) {
    failures.push(`${question.id} produced an impossible information-gain score.`);
  }
}

const bestLead = getBestLead(questions, suspects, items, new Set());
if (!bestLead?.question?.id) failures.push('getBestLead must return an unused informative question.');
if (!(bestLead.expectedEliminations > 0)) failures.push('best lead must eliminate possibilities on average.');

const allUsed = new Set(questions.map((question) => question.id));
if (getBestLead(questions, suspects, items, allUsed) !== null) failures.push('best lead must be null when every question is used.');

const usedBest = new Set(bestLead?.question?.id ? [bestLead.question.id] : []);
const nextLead = getBestLead(questions, suspects, items, usedBest);
if (nextLead?.question?.id === bestLead?.question?.id) failures.push('best lead must exclude already used questions.');

const singleSuspectLead = getBestLead(questions, [suspects[0]], items, new Set());
if (singleSuspectLead?.target === 'suspect') failures.push('best lead should not recommend a suspect split when only one suspect remains.');

const validSoloSession = {
  schemaVersion: 1,
  mode: 'solo',
  roundState: {
    mode: 'solo',
    activePlayer: 'Solo Player',
    mysteries: { shared: { suspect: suspects[0], item: items[0] } },
    eliminatedByPlayer: { shared: [] },
    eliminatedItemsByPlayer: { shared: [] },
    historyByPlayer: { shared: [] }
  }
};

const validSharedSession = {
  ...validSoloSession,
  mode: 'shared',
  roundState: {
    ...validSoloSession.roundState,
    mode: 'shared',
    activePlayer: 'Group'
  }
};

const validDuelSession = {
  schemaVersion: 1,
  mode: 'duel',
  roundState: {
    mode: 'duel',
    activePlayer: 'Player 1',
    mysteries: {
      'Player 1': { suspect: suspects[0], item: items[0] },
      'Player 2': { suspect: suspects[1], item: items[1] }
    },
    eliminatedByPlayer: { 'Player 1': [], 'Player 2': [] },
    eliminatedItemsByPlayer: { 'Player 1': [], 'Player 2': [] },
    historyByPlayer: { 'Player 1': [], 'Player 2': [] }
  }
};

if (!isValidSavedSession(validSoloSession)) failures.push('Valid solo saved session was rejected.');
if (!isValidSavedSession(validSharedSession)) failures.push('Valid shared saved session was rejected.');
if (!isValidSavedSession(validDuelSession)) failures.push('Valid duel saved session was rejected.');
if (isValidSavedSession({ ...validSoloSession, schemaVersion: 99 })) failures.push('Invalid schema version was accepted.');
if (isValidSavedSession({ ...validSoloSession, roundState: { mode: 'solo' } })) failures.push('Malformed round state was accepted.');
if (isValidSavedSession({ ...validSoloSession, mode: 'duel' })) failures.push('Mode mismatch was accepted.');
if (isValidSavedSession({ ...validSoloSession, roundState: { ...validSoloSession.roundState, activePlayer: 'Group' } })) {
  failures.push('Solo session accepted a shared/group active player.');
}
if (isValidSavedSession({ ...validSharedSession, roundState: { ...validSharedSession.roundState, activePlayer: 'Solo Player' } })) {
  failures.push('Shared session accepted a solo active player.');
}
if (isValidSavedSession({ ...validDuelSession, roundState: { ...validDuelSession.roundState, activePlayer: 'Player 3' } })) {
  failures.push('Invalid duel active player was accepted.');
}

try {
  saveGame({ mode: 'solo', roundState: { mode: 'solo' } });
  clearSavedGame();
  const saved = loadSavedGame();
  if (saved !== null) failures.push('storage helpers should be inert in non-browser smoke tests.');
} catch (error) {
  failures.push(`storage helpers should not throw without browser storage: ${error.message}`);
}

if (failures.length > 0) {
  console.error('Who Took It? smoke test failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Who Took It? smoke test passed: ${suspects.length} suspects x ${items.length} items x ${questions.length} questions + best-lead and storage validation.`);

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8'));
}
