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

export function scoreQuestionSplit(question, remainingSuspects, remainingItems) {
  if (!question) throw new Error('Question data is required.');
  const candidates = question.target === 'suspect' ? remainingSuspects : remainingItems;
  if (!Array.isArray(candidates)) throw new Error('Remaining candidate data is required.');

  let yesCount = 0;
  let noCount = 0;
  for (const candidate of candidates) {
    const yes = question.target === 'itemAny'
      ? question.traits.some((trait) => hasTrait(candidate, trait))
      : hasTrait(candidate, question.trait);
    if (yes) yesCount += 1;
    else noCount += 1;
  }

  const total = yesCount + noCount;
  const expectedEliminations = total > 0 ? (2 * yesCount * noCount) / total : 0;
  const balance = total > 0 ? Math.min(yesCount, noCount) / total : 0;

  return {
    question,
    target: question.target === 'suspect' ? 'suspect' : 'item',
    yesCount,
    noCount,
    total,
    balance,
    expectedEliminations
  };
}

export function getBestLead(questions, remainingSuspects, remainingItems, usedQuestionIds = new Set()) {
  if (!Array.isArray(questions)) throw new Error('Question list is required.');
  const used = usedQuestionIds instanceof Set ? usedQuestionIds : new Set(usedQuestionIds || []);

  const ranked = questions
    .filter((question) => !used.has(question.id))
    .map((question) => scoreQuestionSplit(question, remainingSuspects, remainingItems))
    .filter((entry) => entry.total > 1 && entry.expectedEliminations > 0)
    .sort((a, b) => (
      b.expectedEliminations - a.expectedEliminations
      || b.balance - a.balance
      || a.question.id.localeCompare(b.question.id)
    ));

  return ranked[0] || null;
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
