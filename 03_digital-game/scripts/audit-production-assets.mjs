import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const gameRoot = path.resolve(here, '..');
const repoRoot = path.resolve(gameRoot, '..');
const readJson = (absolutePath) => JSON.parse(readFileSync(absolutePath, 'utf8'));
const exists = (...parts) => existsSync(path.join(...parts));

const production = readJson(path.join(repoRoot, 'assets/production-manifest.json'));
const suspects = readJson(path.join(gameRoot, 'src/data/suspect-art.json'));
const items = readJson(path.join(gameRoot, 'src/data/item-art.json'));
const ui = readJson(path.join(gameRoot, 'src/data/ui-art.json'));
const environment = readJson(path.join(gameRoot, 'src/data/environment-art.json'));

assert.equal(production.schemaVersion, 2, 'production manifest schemaVersion must be 2');
assert.equal(production.gameId, 'who-took-it', 'production manifest gameId mismatch');
assert.equal(production.blockingVisualAssetsMissing, 0, 'blocking visual asset count must be zero before shipping');

const blocking = production.assets.filter((entry) => ['P0', 'P1'].includes(entry.priority));
for (const entry of blocking) {
  assert.equal(entry.status, 'complete', `${entry.id} is a blocking ${entry.priority} asset group and must be complete`);
  assert.equal(entry.completed, entry.quantity, `${entry.id} completed count must equal quantity`);
}

assert.equal(suspects.status, 'production-art-approved', 'suspect registry must be approved');
assert.equal(suspects.entries.length, 25, 'suspect registry must contain 25 portraits');
assert(suspects.entries.every((entry) => entry.status === 'approved'), 'every suspect portrait must be approved');

const suspectRuntimeDir = path.join(gameRoot, 'public/assets/suspects');
const suspectRuntimeFiles = readdirSync(suspectRuntimeDir).filter((file) => /^suspect_\d{3}\.webp$/.test(file));
assert.equal(suspectRuntimeFiles.length, 25, 'runtime suspects folder must contain 25 canonical WebP portraits');
for (const entry of suspects.entries) {
  assert(exists(gameRoot, 'public', suspects.runtimeBase, entry.asset), `missing suspect runtime asset: ${entry.asset}`);
}

const suspectSourceDir = path.join(repoRoot, 'assets/characters/suspects/source');
const suspectWebDir = path.join(repoRoot, 'assets/characters/suspects/web');
assert.equal(readdirSync(suspectSourceDir).filter((file) => file.endsWith('.png')).length, 25, 'legacy suspect source authority must contain 25 PNG masters');
assert.equal(readdirSync(suspectWebDir).filter((file) => file.endsWith('.webp')).length, 25, 'legacy suspect web authority must contain 25 WebP exports');

assert.equal(items.status, 'production-art-approved', 'item registry must be approved');
assert.equal(items.entries.length, 5, 'item registry must contain five canonical items');
for (const entry of items.entries) {
  assert.equal(entry.status, 'approved', `${entry.itemId} must be approved`);
  assert(exists(gameRoot, 'public', items.runtimeBase, entry.asset), `missing item runtime asset: ${entry.asset}`);
}

assert.equal(ui.schemaVersion, 2, 'UI art registry schemaVersion must be 2');
assert.equal(ui.entries.filter((entry) => entry.status === 'approved').length, 20, 'UI registry must contain 20 approved runtime assets');
for (const entry of ui.entries) {
  assert(exists(gameRoot, 'public', ui.runtimeBase, entry.asset), `missing UI runtime asset: ${entry.asset}`);
}

assert.equal(environment.status, 'production-art-approved', 'environment registry must be approved');
assert.equal(environment.entries.length, 1, 'environment registry must contain one global case room');
for (const entry of environment.entries) {
  assert.equal(entry.status, 'approved', `${entry.id} must be approved`);
  assert(exists(gameRoot, 'public', environment.runtimeBase, entry.asset), `missing environment runtime asset: ${entry.asset}`);
}

const reviewEntries = production.assets.filter((entry) => entry.status === 'review');
assert(reviewEntries.every((entry) => entry.optional === true && entry.priority === 'P2'), 'review assets must be explicitly optional P2 work');

const summary = {
  ok: true,
  blockingVisualAssetsMissing: 0,
  runtime: {
    suspects: suspects.entries.length,
    items: items.entries.length,
    ui: ui.entries.length,
    environments: environment.entries.length,
    totalManifestBackedVisualAssets: suspects.entries.length + items.entries.length + ui.entries.length + environment.entries.length
  },
  cssDomStateSystems: production.assets.find((entry) => entry.id === 'interactive-state-vfx')?.quantity || 0,
  optionalReviewAssets: reviewEntries.map((entry) => entry.id)
};

console.log(JSON.stringify(summary, null, 2));
