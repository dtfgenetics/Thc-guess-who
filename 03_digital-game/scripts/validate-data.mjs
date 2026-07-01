import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const suspects = readJson('src/data/suspects.json');
const items = readJson('src/data/items.json');
const questions = readJson('src/data/questions.json');

const errors = [];

if (suspects.length !== 25) errors.push(`Expected 25 suspects, found ${suspects.length}.`);
if (items.length !== 5) errors.push(`Expected 5 items, found ${items.length}.`);
if (questions.length < 20) errors.push(`Expected at least 20 questions, found ${questions.length}.`);

const suspectIds = new Set();
const itemIds = new Set();
const traitIds = new Set();

for (const suspect of suspects) {
  if (!suspect.id) errors.push(`Suspect missing id: ${suspect.name || 'unknown'}.`);
  if (suspectIds.has(suspect.id)) errors.push(`Duplicate suspect id: ${suspect.id}.`);
  suspectIds.add(suspect.id);

  if (!suspect.coord) errors.push(`${suspect.name} missing board coordinate.`);
  if (!suspect.name) errors.push(`${suspect.id} missing name.`);
  if (!Array.isArray(suspect.publicTags) || suspect.publicTags.length !== 3) {
    errors.push(`${suspect.name} must have exactly 3 public tags.`);
  }

  const trueTraits = Object.entries(suspect.traits || {}).filter(([, value]) => value === true);
  if (trueTraits.length < 3) errors.push(`${suspect.name} should have at least 3 true traits.`);
  trueTraits.forEach(([trait]) => traitIds.add(trait));
}

for (const item of items) {
  if (!item.id) errors.push(`Item missing id: ${item.name || 'unknown'}.`);
  if (itemIds.has(item.id)) errors.push(`Duplicate item id: ${item.id}.`);
  itemIds.add(item.id);

  if (!item.name) errors.push(`${item.id} missing name.`);
  if (!Array.isArray(item.tags) || item.tags.length < 5) errors.push(`${item.name} should have at least 5 tags.`);

  const trueTraits = Object.entries(item.traits || {}).filter(([, value]) => value === true);
  if (trueTraits.length < 4) errors.push(`${item.name} should have at least 4 true traits.`);
  trueTraits.forEach(([trait]) => traitIds.add(trait));
}

for (const question of questions) {
  if (!question.id || !question.text || !question.target) {
    errors.push(`Question missing required fields: ${JSON.stringify(question)}.`);
    continue;
  }

  if ((question.target === 'suspect' || question.target === 'item') && !question.trait) {
    errors.push(`${question.id} missing trait.`);
  }

  if ((question.target === 'suspect' || question.target === 'item') && question.trait && !traitIds.has(question.trait)) {
    errors.push(`${question.id} uses unused trait: ${question.trait}.`);
  }

  if (question.target === 'itemAny') {
    if (!Array.isArray(question.traits) || question.traits.length === 0) {
      errors.push(`${question.id} missing traits array.`);
    } else {
      for (const trait of question.traits) {
        if (!traitIds.has(trait)) errors.push(`${question.id} uses unused trait: ${trait}.`);
      }
    }
  }
}

if (errors.length) {
  console.error('Who Took It? data validation failed:');
  errors.forEach((error) => console.error(`- ${error}`));
  process.exit(1);
}

console.log('Who Took It? data validation passed.');

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), 'utf8'));
}
