import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = (path) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
const app = read('src/App.jsx');
const accusation = read('src/components/AccusationPanel.jsx');
const health = read('src/components/DataHealthPanel.jsx');
const styles = read('src/styles.css');

assert(app.includes('const accusationItemRef = useRef(null);'), 'quick accusation focus ref missing');
assert(app.includes("itemSelect.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth'"), 'quick accusation should scroll to the item selector');
assert(app.includes('itemSelect.focus({ preventScroll: true });'), 'quick accusation should focus the next required field');
assert(app.includes('aria-live="polite"'), 'round status should announce player/remaining changes');
assert(app.includes('const SHOW_PLAYTEST_TOOLS = import.meta.env.DEV;'), 'mystery reveal tools must be development-only');
assert(app.includes('{SHOW_PLAYTEST_TOOLS ? ('), 'debug mystery reveal must be gated from production rendering');
assert(accusation.includes('ref={itemSelectRef}'), 'missing item selector ref contract');
assert(health.includes('if (validation.valid) return null;'), 'successful developer health banner should stay out of normal play');
assert(health.includes('role="alert"'), 'invalid data should remain visible to players');
assert(styles.includes(':focus-visible'), 'visible keyboard focus is required');
assert(styles.includes('prefers-reduced-motion'), 'reduced motion support is required');

console.log('Who Took It? UI polish validation passed.');
