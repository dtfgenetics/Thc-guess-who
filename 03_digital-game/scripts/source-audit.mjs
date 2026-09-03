import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const scannedRoots = ['src', 'index.html', 'package.json', 'vite.config.js'];
const blockedTerms = [
  'Harry Potter',
  'Hermione',
  'Gryffindor',
  'Slytherin',
  'Hogwarts',
  'One Piece',
  'Luffy',
  'Hasbro',
  'Indovina Chi',
  'Qui-est-ce',
  'GPLv3'
];

const failures = [];

for (const target of scannedRoots) {
  scan(join(root, target));
}

if (failures.length > 0) {
  console.error('Who Took It? source audit failed:');
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log('Who Took It? source audit passed: no blocked third-party terms found in app source.');

function scan(path) {
  const stats = statSync(path);
  if (stats.isDirectory()) {
    for (const entry of readdirSync(path)) {
      scan(join(path, entry));
    }
    return;
  }

  if (!/\.(js|jsx|json|html|css)$/.test(path)) return;

  const content = readFileSync(path, 'utf8');
  for (const term of blockedTerms) {
    if (content.toLowerCase().includes(term.toLowerCase())) {
      failures.push(`${relative(root, path)} contains blocked reference: ${term}`);
    }
  }
}
