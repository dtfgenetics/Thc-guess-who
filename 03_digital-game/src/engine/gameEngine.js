export function createMystery(suspects, items) {
  return {
    suspect: pickRandom(suspects),
    item: pickRandom(items)
  };
}

export function answerQuestion(mystery, question) {
  if (!mystery?.suspect || !mystery?.item || !question) {
    throw new Error('Missing mystery or question data.');
  }

  if (question.target === 'suspect') {
    return hasTrait(mystery.suspect, question.trait);
  }

  if (question.target === 'item') {
    return hasTrait(mystery.item, question.trait);
  }

  if (question.target === 'itemAny') {
    return question.traits.some((trait) => hasTrait(mystery.item, trait));
  }

  throw new Error(`Unsupported question target: ${question.target}`);
}

export function makeAccusation(mystery, suspectId, itemId) {
  const suspectCorrect = mystery.suspect.id === suspectId;
  const itemCorrect = mystery.item.id === itemId;

  return {
    suspectCorrect,
    itemCorrect,
    win: suspectCorrect && itemCorrect
  };
}

export function toggleEliminated(eliminatedIds, suspectId) {
  if (eliminatedIds.includes(suspectId)) {
    return eliminatedIds.filter((id) => id !== suspectId);
  }

  return [...eliminatedIds, suspectId];
}

export function getRemainingSuspects(suspects, eliminatedIds) {
  return suspects.filter((suspect) => !eliminatedIds.includes(suspect.id));
}

export function getQuestionAnswerLabel(answer) {
  return answer ? 'Yes' : 'No';
}

function hasTrait(entity, trait) {
  return entity?.traits?.[trait] === true;
}

function pickRandom(list) {
  if (!Array.isArray(list) || list.length === 0) {
    throw new Error('Cannot choose from an empty list.');
  }

  return list[Math.floor(Math.random() * list.length)];
}
