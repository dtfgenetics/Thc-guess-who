import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));

const main = read('src/main.jsx');
const enhancer = read('src/components/UiArtEnhancer.jsx');
const uiArtCss = read('src/ui-art.css');
const extraCss = read('src/extra.css');
const uiArt = JSON.parse(read('src/data/ui-art.json'));

const expectedIds = [
  'suspectCardNormal',
  'suspectCardActive',
  'suspectCardEliminated',
  'mysteryCardHidden',
  'evidenceFrameNormal',
  'evidenceFrameActive',
  'modalFrame',
  'questionChipDisabled',
  'questionChipActive',
  'bannerEmpty',
  'primaryButtonNormal',
  'primaryButtonHover',
  'primaryButtonPressed',
  'primaryButtonDisabled',
  'clueSealYes',
  'clueSealNo',
  'hudStatPanel',
  'modePillActive',
  'resolutionFrameWin',
  'resolutionFrameLoss'
];

const approved = uiArt.entries.filter((entry) => entry.status === 'approved');
assert.equal(uiArt.schemaVersion, 2, 'UI art manifest schema version must be 2');
assert.equal(uiArt.runtimeBase, 'assets/ui/', 'UI runtime base must remain under public assets/ui');
assert.deepEqual(approved.map((entry) => entry.id).sort(), [...expectedIds].sort(), 'UI art manifest must contain the complete approved v2 pack');

for (const entry of approved) {
  assert(/\.(webp|svg)$/.test(entry.asset), `${entry.id} runtime asset must be WebP or SVG`);
  assert(exists(`public/${uiArt.runtimeBase}${entry.asset}`), `missing runtime UI asset: ${entry.asset}`);
}

assert(main.includes("import UiArtEnhancer from './components/UiArtEnhancer.jsx';"), 'UiArtEnhancer import missing');
assert(main.includes('<UiArtEnhancer />'), 'UiArtEnhancer must render in the React tree');
assert(main.includes("import './ui-art.css';"), 'manifest-backed UI art CSS must be imported');
assert(main.indexOf("import './extra.css';") < main.indexOf("import './ui-art.css';"), 'ui-art.css must load after extra.css so manifest defaults override temporary paths');

assert(enhancer.includes("entry.status === 'approved'"), 'UI enhancer must ignore unapproved assets');
assert(enhancer.includes('import.meta.env.BASE_URL'), 'UI enhancer must honor deployment base path');
assert(enhancer.includes('const preload = new Image();'), 'UI enhancer must preload art before applying it');
assert(enhancer.includes('preload.onload'), 'UI enhancer must only apply successfully loaded art');
assert(enhancer.includes('preload.onerror'), 'UI enhancer must handle failed assets');
assert(enhancer.includes('__WHO_TOOK_IT_UI_ART__'), 'UI enhancer must expose a deterministic diagnostic marker');
assert(!enhancer.includes('.mysteries'), 'UI art enhancement must never inspect hidden mystery state');

for (const id of expectedIds) {
  assert(enhancer.includes(`${id}:`), `UI enhancer is missing CSS-variable mapping for ${id}`);
}

const expectedVariables = [
  '--wti-ui-base',
  '--wti-ui-active',
  '--wti-ui-eliminated',
  '--wti-mystery-hidden',
  '--wti-evidence-frame',
  '--wti-evidence-active',
  '--wti-modal-frame',
  '--wti-question-disabled',
  '--wti-question-active',
  '--wti-banner',
  '--wti-primary-button-normal',
  '--wti-primary-button-hover',
  '--wti-primary-button-pressed',
  '--wti-primary-button-disabled',
  '--wti-clue-seal-yes',
  '--wti-clue-seal-no',
  '--wti-hud-stat-panel',
  '--wti-mode-pill-active',
  '--wti-resolution-frame-win',
  '--wti-resolution-frame-loss'
];

for (const variable of expectedVariables) {
  assert(uiArtCss.includes(`${variable}: none;`), `${variable} must default to none until approved art preloads`);
}

assert(uiArtCss.includes('var(--wti-mystery-hidden, none)'), 'hidden mystery asset must have a visible runtime use');
assert(uiArtCss.includes('var(--wti-primary-button-normal, none)'), 'primary button normal asset must have a visible runtime use');
assert(uiArtCss.includes('var(--wti-clue-seal-yes, none)'), 'yes clue seal must have a visible runtime use');
assert(uiArtCss.includes('var(--wti-clue-seal-no, none)'), 'no clue seal must have a visible runtime use');
assert(uiArtCss.includes('var(--wti-hud-stat-panel, none)'), 'HUD panel must have a visible runtime use');
assert(uiArtCss.includes('var(--wti-mode-pill-active, none)'), 'active mode pill must have a visible runtime use');
assert(uiArtCss.includes('var(--wti-resolution-frame-win, none)'), 'win resolution frame must have a visible runtime use');
assert(uiArtCss.includes('var(--wti-resolution-frame-loss, none)'), 'loss resolution frame must have a visible runtime use');
assert(!uiArtCss.includes('../assets/ui/'), 'manifest-backed UI CSS must not contain direct relative asset URLs');
assert(extraCss.includes('var(--wti-ui-base)'), 'suspect cards must remain wired to UI art CSS variables');
assert(extraCss.includes('var(--wti-evidence-frame)'), 'evidence cards must remain wired to UI art CSS variables');
assert(extraCss.includes('var(--wti-question-active)'), 'question buttons must remain wired to UI art CSS variables');
assert(extraCss.includes('var(--wti-modal-frame)'), 'modal surfaces must remain wired to UI art CSS variables');
assert(extraCss.includes('var(--wti-banner)'), 'section banners must remain wired to UI art CSS variables');

console.log(`Who Took It? UI art validation passed (${approved.length} approved runtime assets).`);
