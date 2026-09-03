import { readFileSync } from 'node:fs';

const suspects = readJson('src/data/suspects.json');
const items = readJson('src/data/items.json');
const questions = readJson('src/data/questions.json');

const rows = questions.map((question) => {
  const pool = question.target === 'suspect' ? suspects : items;
  const yesCount = pool.filter((entity) => answersYes(entity, question)).length;
  const total = pool.length;
  const yesRate = Math.round((yesCount / total) * 100);

  return {
    id: question.id,
    target: question.target,
    category: question.category,
    question: question.text,
    yesCount,
    total,
    yesRate,
    risk: classifyRisk(question.target, yesCount, total)
  };
});

console.log('# Who Took It? Question Balance Report');
console.log('');
console.log('| Risk | Yes | Target | Question |');
console.log('|---|---:|---|---|');
for (const row of rows) {
  console.log(`| ${row.risk} | ${row.yesCount}/${row.total} | ${row.target} | ${row.question} |`);
}

const risky = rows.filter((row) => row.risk !== 'OK');
if (risky.length > 0) {
  console.log('');
  console.log('## Review Before Final Release');
  for (const row of risky) {
    console.log(`- ${row.id}: ${row.risk} (${row.yesCount}/${row.total}) — ${row.question}`);
  }
}

function answersYes(entity, question) {
  if (question.target === 'itemAny') {
    return question.traits.some((trait) => entity.traits?.[trait] === true);
  }

  return entity.traits?.[question.trait] === true;
}

function classifyRisk(target, yesCount, total) {
  if (target === 'suspect') {
    if (yesCount <= 1) return 'TOO NARROW';
    if (yesCount >= total - 1) return 'TOO BROAD';
    return 'OK';
  }

  if (yesCount === 0) return 'NO MATCH';
  return 'OK';
}

function readJson(relativePath) {
  return JSON.parse(readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8'));
}
