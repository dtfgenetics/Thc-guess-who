import { traitForTag } from '../data/tagTraitMap.js';

const ALLOWED_QUESTION_TARGETS = new Set(['suspect', 'item', 'itemAny']);

export function validateGameData({ suspects, items, questions }) {
  const errors = [];
  const suspectTraitIds = new Set();
  const itemTraitIds = new Set();

  if (!Array.isArray(suspects) || suspects.length !== 25) {
    errors.push(`Expected 25 suspects, found ${Array.isArray(suspects) ? suspects.length : 'invalid data'}.`);
  }

  if (!Array.isArray(items) || items.length !== 5) {
    errors.push(`Expected 5 items, found ${Array.isArray(items) ? items.length : 'invalid data'}.`);
  }

  const suspectIds = new Set();
  suspects.forEach((suspect) => {
    if (!suspect.id) errors.push(`Suspect missing id: ${suspect.name || 'unknown'}.`);
    if (suspectIds.has(suspect.id)) errors.push(`Duplicate suspect id: ${suspect.id}.`);
    suspectIds.add(suspect.id);

    if (!suspect.name) errors.push(`Suspect ${suspect.id} missing name.`);
    if (!Array.isArray(suspect.publicTags) || suspect.publicTags.length !== 3) {
      errors.push(`${suspect.name || suspect.id} must have exactly 3 public tags.`);
    } else {
      validateTags(`${suspect.name || suspect.id} publicTags`, suspect.publicTags, suspect.traits, errors);
    }

    const trueTraits = Object.entries(suspect.traits || {}).filter(([, value]) => value === true);
    if (trueTraits.length < 3) errors.push(`${suspect.name || suspect.id} should have at least 3 true traits.`);
    trueTraits.forEach(([trait]) => suspectTraitIds.add(trait));
  });

  const itemIds = new Set();
  items.forEach((item) => {
    if (!item.id) errors.push(`Item missing id: ${item.name || 'unknown'}.`);
    if (itemIds.has(item.id)) errors.push(`Duplicate item id: ${item.id}.`);
    itemIds.add(item.id);

    if (!item.name) errors.push(`Item ${item.id} missing name.`);
    if (!Array.isArray(item.tags) || item.tags.length < 5) {
      errors.push(`${item.name || item.id} should have at least 5 item tags.`);
    } else {
      validateTags(`${item.name || item.id} tags`, item.tags, item.traits, errors);
    }

    const trueTraits = Object.entries(item.traits || {}).filter(([, value]) => value === true);
    if (trueTraits.length < 4) errors.push(`${item.name || item.id} should have at least 4 true traits.`);
    trueTraits.forEach(([trait]) => itemTraitIds.add(trait));
  });

  const questionIds = new Set();
  questions.forEach((question) => {
    if (!question.id || !question.text || !question.target) {
      errors.push(`Question missing required fields: ${JSON.stringify(question)}.`);
      return;
    }

    if (questionIds.has(question.id)) errors.push(`Duplicate question id: ${question.id}.`);
    questionIds.add(question.id);

    if (!ALLOWED_QUESTION_TARGETS.has(question.target)) {
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
  });

  return {
    valid: errors.length === 0,
    errors
  };
}

function validateTags(label, tags, traits, errors) {
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
