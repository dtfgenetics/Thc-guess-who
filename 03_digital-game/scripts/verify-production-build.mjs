import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const distRoot = resolve(process.cwd(), 'dist');
const files = collectFiles(distRoot).filter((path) => /\.(?:html|js|css|map)$/i.test(path));
assert(files.length > 0, 'production build output is missing');
const html = readFileSync(resolve(distRoot, 'index.html'), 'utf8');
assert(html.includes('/games/who-took-it/assets/app.js'), 'production HTML must load the prefixed app bundle');
assert(html.includes('/games/who-took-it/assets/app.css'), 'production HTML must load the prefixed stylesheet');
assert(!html.includes('/src/main.jsx'), 'production HTML must not point to the source entry');
assert(files.some((path) => path.endsWith('/assets/app.js')), 'bundled JavaScript is missing');
assert(files.some((path) => path.endsWith('/assets/app.css')), 'bundled CSS is missing');


const bundleText = files.map((path) => readFileSync(path, 'utf8')).join('\n');
assert(!bundleText.includes('Reveal Mystery'), 'production bundle exposes the mystery reveal control');
assert(!bundleText.includes('Playtest / Host Tools'), 'production bundle exposes playtest host tools');
assert(!bundleText.includes('data-best-lead-question') || bundleText.includes('DETECTIVE ASSIST'), 'best-lead UI bundle integrity check failed');

console.log(`Who Took It? production privacy check passed across ${files.length} build files.`);

function collectFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
}
