export function validateGameData({ suspects, items, questions }) {
  const errors = [];

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
    }
    if (!suspect.traits || Object.values(suspect.traits).filter(Boolean).length < 3) {
      errors.push(`${suspect.name || suspect.id} should have at least 3 true traits.`);
    }
  });

  const itemIds = new Set();
  items.forEach((item) => {
    if (!item.id) errors.push(`Item missing id: ${item.name || 'unknown'}.`);
    if (itemIds.has(item.id)) errors.push(`Duplicate item id: ${item.id}.`);
    itemIds.add(item.id);

    if (!item.name) errors.push(`Item ${item.id} missing name.`);
    if (!Array.isArray(item.tags) || item.tags.length < 5) {
      errors.push(`${item.name || item.id} should have at least 5 item tags.`);
    }
    if (!item.traits || Object.values(item.traits).filter(Boolean).length < 4) {
      errors.push(`${item.name || item.id} should have at least 4 true traits.`);
    }
  });

  questions.forEach((question) => {
    if (!question.id || !question.text || !question.target) {
      errors.push(`Question missing required fields: ${JSON.stringify(question)}.`);
    }
    if ((question.target === 'suspect' || question.target === 'item') && !question.trait) {
      errors.push(`${question.id} missing trait.`);
    }
    if (question.target === 'itemAny' && (!Array.isArray(question.traits) || question.traits.length === 0)) {
      errors.push(`${question.id} missing traits array.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
