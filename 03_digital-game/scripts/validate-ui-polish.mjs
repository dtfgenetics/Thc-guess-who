import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const exists = (path) => existsSync(new URL(`../${path}`, import.meta.url));
const main = read('src/main.jsx');
const app = read('src/App.jsx');
const ageGate = read('src/components/AgeGate.jsx');
const bestLead = read('src/components/BestLeadAssist.jsx');
const evidenceArtEnhancer = read('src/components/EvidenceArtEnhancer.jsx');
const health = read('src/components/DataHealthPanel.jsx');
const errorBoundary = read('src/components/ErrorBoundary.jsx');
const styles = read('src/styles.css');
const extraStyles = read('src/extra.css');
const ageGateStyles = read('src/age-gate.css');
const storage = read('src/engine/storage.js');
const engine = read('src/engine/gameEngine.js');
const itemArt = JSON.parse(read('src/data/item-art.json'));

assert(!exists('src/age-gate.js'), 'DOM-mutating age-gate side-effect script should not exist');
assert(!exists('src/best-lead-ui.js'), 'DOM-mutating best-lead side-effect script should not exist');
assert(main.includes('<ErrorBoundary>') && main.includes('</ErrorBoundary>'), 'app must be wrapped in ErrorBoundary');
assert(main.includes('<AgeGate>') && main.includes('</AgeGate>'), 'app must be wrapped in the React AgeGate component');
assert(!main.includes("import './age-gate.js';"), 'age gate must not load through a DOM-mutating side-effect script');
assert(!main.includes("import './best-lead-ui.js';"), 'best-lead assistant must not load through a DOM-mutating side-effect script');

assert(app.includes("import BestLeadAssist from './components/BestLeadAssist.jsx';"), 'BestLeadAssist component must be imported by App');
assert(app.includes('<BestLeadAssist'), 'best-lead assistant must render inside the React tree');
assert(app.includes('const accusationItemRef = useRef(null);'), 'quick accusation focus ref missing');
assert(app.includes("itemSelect.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth'"), 'quick accusation should scroll to the item selector');
assert(app.includes('itemSelect.focus({ preventScroll: true });'), 'quick accusation should focus the next required field');
assert(app.includes('aria-live="polite"'), 'round status should announce player/remaining changes');
assert(app.includes('const SHOW_PLAYTEST_TOOLS = import.meta.env.DEV;'), 'mystery reveal tools must be development-only');
assert(app.includes('{SHOW_PLAYTEST_TOOLS ? ('), 'debug mystery reveal must be gated from production rendering');
assert(app.includes('loadSavedGame') && app.includes('saveGame'), 'local save/resume should stay wired into App');
assert(app.includes('useEffect(() => {') && app.includes('selectedSuspectId') && app.includes('selectedItemId'), 'game session persistence effect missing key fields');
assert(app.includes('remainingSuspects={remainingSuspects}') && app.includes('remainingItems={remainingItems}'), 'best-lead assistant must receive visible remaining possibilities');
assert(app.includes('usedQuestionIds={usedQuestionIds}'), 'best-lead assistant must receive already-used questions');
assert(app.includes('onAskQuestion={handleAskQuestion}'), 'best-lead assistant must ask through the same React handler as manual questions');

assert(main.includes("import EvidenceArtEnhancer from './components/EvidenceArtEnhancer.jsx';"), 'approved evidence art enhancer must be imported by the React entry point');
assert(main.includes('<EvidenceArtEnhancer />'), 'approved evidence art enhancer must render inside the React tree');
assert.equal(itemArt.entries.length, 5, 'evidence art runtime must remain aligned to the five canonical missing items');
assert(evidenceArtEnhancer.includes("entry.status === 'approved'"), 'evidence runtime must ignore unapproved art');
assert(evidenceArtEnhancer.includes('import.meta.env.BASE_URL'), 'evidence runtime must honor the deployment base path');
assert(evidenceArtEnhancer.includes('const preload = new Image();'), 'evidence runtime must preload art before hiding the fallback glyph');
assert(evidenceArtEnhancer.includes('preload.onload'), 'evidence runtime must apply art only after successful load');
assert(evidenceArtEnhancer.includes('preload.onerror'), 'evidence runtime must preserve the glyph fallback after image failure');
assert(evidenceArtEnhancer.includes('MutationObserver'), 'evidence runtime must recover after React evidence-lane rerenders');
assert(evidenceArtEnhancer.includes('__WHO_TOOK_IT_EVIDENCE_ART__'), 'evidence runtime must expose a stable diagnostic marker');
assert(!evidenceArtEnhancer.includes('.mysteries'), 'visual evidence enhancement must never inspect hidden mystery identities');
assert(extraStyles.includes('.evidence-icon.has-evidence-art'), 'approved evidence art must have a visible runtime treatment');
assert(extraStyles.includes('background-image: var(--evidence-art)'), 'approved evidence art must render through the validated runtime asset variable');
assert(extraStyles.includes('.evidence-card.is-eliminated .evidence-icon.has-evidence-art::before'), 'eliminated evidence art must keep a non-color-only ruled-out state');

assert(ageGate.includes('AGE_GATE_KEY'), 'age gate must persist 21+ acknowledgement with a stable key');
assert(ageGate.includes('role="dialog"') && ageGate.includes('aria-modal="true"'), 'age gate must render as an accessible dialog');
assert(ageGate.includes('document.body.classList.toggle'), 'age gate must lock body scroll while open');
assert(ageGate.includes('confirmButtonRef'), 'age gate must focus the confirmation action');
assert(ageGate.includes('Yes, I am 21+'), 'age gate must include explicit 21+ confirmation text');
assert(ageGate.includes('/games/'), 'age gate must include a safe leave link');
assert(ageGateStyles.includes('.age-gate') && ageGateStyles.includes('.age-gate-card'), 'age gate styling must stay present');
assert(ageGateStyles.includes(':focus-visible'), 'age gate controls need keyboard focus states');

assert(health.includes('if (validation.valid) return null;'), 'successful developer health banner should stay out of normal play');
assert(health.includes('role="alert"'), 'invalid data should remain visible to players');
assert(errorBoundary.includes('clearSavedGame') && errorBoundary.includes('window.location.reload()'), 'error boundary must let players clear corrupt saved sessions');
assert(styles.includes(':focus-visible'), 'visible keyboard focus is required');
assert(styles.includes('prefers-reduced-motion'), 'reduced motion support is required');
assert(extraStyles.includes('.error-screen'), 'error boundary must have visible fallback styling');
assert(storage.includes('SCHEMA_VERSION'), 'saved game schema version missing');
assert(storage.includes('isValidSavedSession'), 'saved game validation must be exported and tested');
assert(storage.includes('ACTIVE_PLAYER_BY_MODE'), 'saved game validation must enforce active player by mode');
assert(storage.includes('window.localStorage'), 'storage helper must use browser localStorage only behind guards');

assert(engine.includes('export function scoreQuestionSplit('), 'deduction engine must expose pure question split scoring');
assert(engine.includes('export function getBestLead('), 'deduction engine must expose best-lead ranking');
assert(engine.includes('(2 * yesCount * noCount) / total'), 'best-lead ranking must use candidate split information rather than hidden mystery state');
assert(bestLead.includes('getBestLead('), 'BestLeadAssist must use the pure ranking engine');
assert(!bestLead.includes('getTargetMystery'), 'BestLeadAssist must not read hidden mystery helpers');
assert(!bestLead.includes('.mysteries'), 'BestLeadAssist must not inspect hidden mystery identities');
assert(bestLead.includes('remainingSuspects') && bestLead.includes('remainingItems'), 'BestLeadAssist must rank from visible remaining possibilities');
assert(bestLead.includes('usedQuestionIds'), 'BestLeadAssist must exclude already asked questions');
assert(extraStyles.includes('.best-lead-assist'), 'best-lead assistant must have a visible case-file treatment');
assert(extraStyles.includes('.best-lead-action:focus-visible'), 'best-lead action must preserve strong keyboard focus');
assert(extraStyles.includes('@media (prefers-reduced-motion: reduce)'), 'best-lead layer must respect reduced motion');

console.log('Who Took It? UI polish validation passed.');
