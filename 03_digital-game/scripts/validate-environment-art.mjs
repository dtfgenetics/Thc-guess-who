import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));

const main = read('src/main.jsx');
const enhancer = read('src/components/EnvironmentArtEnhancer.jsx');
const css = read('src/environment-art.css');
const manifest = JSON.parse(read('src/data/environment-art.json'));

assert.equal(manifest.schemaVersion, 1, 'environment art schema version must remain 1');
assert.equal(manifest.status, 'production-art-approved', 'environment art must be approved');
assert.equal(manifest.runtimeBase, 'assets/environment/', 'environment runtime base must remain under public assets/environment');
assert.equal(manifest.entries.length, 1, 'Who Took It currently requires exactly one global case-room environment');

const [entry] = manifest.entries;
assert.equal(entry.id, 'caseRoom', 'environment id must remain caseRoom');
assert.equal(entry.status, 'approved', 'caseRoom must be approved');
assert(/\.(svg|webp)$/.test(entry.asset), 'caseRoom runtime asset must be SVG or WebP');
assert(exists(`public/${manifest.runtimeBase}${entry.asset}`), `missing environment runtime asset: ${entry.asset}`);

assert(main.includes("import EnvironmentArtEnhancer from './components/EnvironmentArtEnhancer.jsx';"), 'EnvironmentArtEnhancer import missing');
assert(main.includes('<EnvironmentArtEnhancer />'), 'EnvironmentArtEnhancer must render in the React tree');
assert(main.includes("import './environment-art.css';"), 'environment art CSS must be imported');
assert(enhancer.includes("entry.status === 'approved'"), 'environment enhancer must ignore unapproved assets');
assert(enhancer.includes('import.meta.env.BASE_URL'), 'environment enhancer must honor deployment base path');
assert(enhancer.includes('__WHO_TOOK_IT_ENVIRONMENT_ART__'), 'environment enhancer must expose a diagnostic marker');
assert(css.includes('--wti-environment-case-room: none;'), 'environment art must fail closed until the asset preloads');
assert(css.includes('var(--wti-environment-case-room, none)'), 'case room asset must have a visible runtime use');
assert(css.includes('prefers-reduced-motion: reduce'), 'environment transitions must honor reduced motion');

console.log('Who Took It? environment art validation passed (1 approved runtime environment).');
