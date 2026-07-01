import { readFileSync } from 'node:fs';

import {
  answerQuestion,
  createMystery,
  getRemainingSuspects,
  makeAccusation,
  toggleEliminated
} from '../src/engine/gameEngine.js';

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

if (failures.length > 0) {
  console.error('Who Took It? smoke test failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log(`Who Took It? smoke test passed: ${suspects.length} suspects x ${items.length} items x ${questions.length} questions.`);

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8'));
}
