import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const distRoot = resolve(process.cwd(), 'dist');
const files = collectFiles(distRoot).filter((path) => /\.(?:html|js|css)$/i.test(path));
assert(files.length > 0, 'production build output is missing');

const bundleText = files.map((path) => readFileSync(path, 'utf8')).join('\n');
assert(!bundleText.includes('Reveal Mystery'), 'production bundle exposes the mystery reveal control');
assert(!bundleText.includes('Playtest / Host Tools'), 'production bundle exposes playtest host tools');

console.log(`Who Took It? production privacy check passed across ${files.length} build files.`);

function collectFiles(directory) {
  return readdirSync(directory).flatMap((name) => {
    const path = resolve(directory, name);
    return statSync(path).isDirectory() ? collectFiles(path) : [path];
  });
}
