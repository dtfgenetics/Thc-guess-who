import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { traitForTag } from '../src/data/tagTraitMap.js';

const root = fileURLToPath(new URL('..', import.meta.url));
const allowedQuestionTargets = new Set(['suspect', 'item', 'itemAny']);

const suspects = readJson('src/data/suspects.json');
const items = readJson('src/data/items.json');
const questions = readJson('src/data/questions.json');

const errors = [];

if (suspects.length !== 25) errors.push(`Expected 25 suspects, found ${suspects.length}.`);
if (items.length !== 5) errors.push(`Expected 5 items, found ${items.length}.`);
if (questions.length < 20) errors.push(`Expected at least 20 questions, found ${questions.length}.`);

const suspectIds = new Set();
const itemIds = new Set();
const suspectTraitIds = new Set();
const itemTraitIds = new Set();

for (const suspect of suspects) {
  if (!suspect.id) errors.push(`Suspect missing id: ${suspect.name || 'unknown'}.`);
  if (suspectIds.has(suspect.id)) errors.push(`Duplicate suspect id: ${suspect.id}.`);
  suspectIds.add(suspect.id);

  if (!suspect.coord) errors.push(`${suspect.name} missing board coordinate.`);
  if (!suspect.name) errors.push(`${suspect.id} missing name.`);
  if (!Array.isArray(suspect.publicTags) || suspect.publicTags.length !== 3) {
    errors.push(`${suspect.name} must have exactly 3 public tags.`);
  } else {
    validateTags(`${suspect.name} publicTags`, suspect.publicTags, suspect.traits);
  }

  const trueTraits = Object.entries(suspect.traits || {}).filter(([, value]) => value === true);
  if (trueTraits.length < 3) errors.push(`${suspect.name} should have at least 3 true traits.`);
  trueTraits.forEach(([trait]) => suspectTraitIds.add(trait));
}

for (const item of items) {
  if (!item.id) errors.push(`Item missing id: ${item.name || 'unknown'}.`);
  if (itemIds.has(item.id)) errors.push(`Duplicate item id: ${item.id}.`);
  itemIds.add(item.id);

  if (!item.name) errors.push(`${item.id} missing name.`);
  if (!Array.isArray(item.tags) || item.tags.length < 5) {
    errors.push(`${item.name} should have at least 5 tags.`);
  } else {
    validateTags(`${item.name} tags`, item.tags, item.traits);
  }

  const trueTraits = Object.entries(item.traits || {}).filter(([, value]) => value === true);
  if (trueTraits.length < 4) errors.push(`${item.name} should have at least 4 true traits.`);
  trueTraits.forEach(([trait]) => itemTraitIds.add(trait));
}

const questionIds = new Set();
for (const question of questions) {
  if (!question.id || !question.text || !question.target) {
    errors.push(`Question missing required fields: ${JSON.stringify(question)}.`);
    continue;
  }

  if (questionIds.has(question.id)) errors.push(`Duplicate question id: ${question.id}.`);
  questionIds.add(question.id);

  if (!allowedQuestionTargets.has(question.target)) {
    errors.push(`${question.id} has unsupported target: ${question.target}.`);
  }

  if (question.target === 'suspect') {
    if (!question.trait) errors.push(`${question.id} missing trait.`);
    else if (!suspectTraitIds.has(question.trait)) errors.push(`${question.id} uses suspect trait with no matching suspect: ${question.trait}.`);
  }

  if (question.target === 'item') {
    if (!question.trait) errors.push(`${question.id} missing trait.`);
    else if (!itemTraitIds.has(question.trait)) errors.push(`${question.id} uses item trait with no matching item: ${question.trait}.`);
  }

  if (question.target === 'itemAny') {
    if (!Array.isArray(question.traits) || question.traits.length === 0) {
      errors.push(`${question.id} missing traits array.`);
    } else {
      for (const trait of question.traits) {
        if (!itemTraitIds.has(trait)) errors.push(`${question.id} uses itemAny trait with no matching item: ${trait}.`);
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

function validateTags(label, tags, traits) {
  for (const tag of tags) {
    const trait = traitForTag(tag);
    if (!trait) {
      errors.push(`${label} contains unmapped tag: ${tag}.`);
      continue;
    }
    if (traits?.[trait] !== true) {
      errors.push(`${label} tag "${tag}" must map to true trait "${trait}".`);
    }
  }
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(join(root, relativePath), 'utf8'));
}
