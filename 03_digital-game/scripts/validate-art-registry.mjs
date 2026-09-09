import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const suspects = JSON.parse(fs.readFileSync(path.join(root, 'src/data/suspects.json'), 'utf8'));
const registry = JSON.parse(fs.readFileSync(path.join(root, 'src/data/suspect-art.json'), 'utf8'));

const errors = [];
const allowedStatuses = new Set(['pending', 'approved']);
const expectedIds = suspects.map((suspect) => suspect.id);
const entries = Array.isArray(registry.entries) ? registry.entries : [];

if (registry.schemaVersion !== 1) errors.push('suspect-art schemaVersion must be 1');
if (registry.runtimeBase !== 'assets/suspects/') errors.push('runtimeBase must be assets/suspects/');
if (registry.masterFormat !== '1024x1536 PNG / 640x960 WebP') errors.push('masterFormat must preserve the approved portrait source/runtime contract');
if (entries.length !== suspects.length) errors.push(`portrait registry must contain ${suspects.length} entries; found ${entries.length}`);

const seenIds = new Set();
const seenAssets = new Set();
for (const entry of entries) {
  if (!entry || typeof entry !== 'object') {
    errors.push('every portrait registry entry must be an object');
    continue;
  }
  if (seenIds.has(entry.suspectId)) errors.push(`duplicate suspectId in portrait registry: ${entry.suspectId}`);
  seenIds.add(entry.suspectId);
  if (seenAssets.has(entry.asset)) errors.push(`duplicate portrait asset path: ${entry.asset}`);
  seenAssets.add(entry.asset);
  if (!allowedStatuses.has(entry.status)) errors.push(`${entry.suspectId}: status must be pending or approved`);

  const suspect = suspects.find((candidate) => candidate.id === entry.suspectId);
  if (!suspect) {
    errors.push(`unknown suspectId in portrait registry: ${entry.suspectId}`);
    continue;
  }
  if (entry.name !== suspect.name) errors.push(`${entry.suspectId}: registry name does not match suspects.json`);
  const expectedAsset = `${entry.suspectId}.webp`;
  if (entry.asset !== expectedAsset) errors.push(`${entry.suspectId}: expected asset ${expectedAsset}, found ${entry.asset}`);
  if (JSON.stringify(entry.cues) !== JSON.stringify(suspect.publicTags)) {
    errors.push(`${entry.suspectId}: art cues must exactly match publicTags in suspects.json`);
  }

  if (entry.status === 'approved') {
    const approvedPath = path.join(root, 'public', registry.runtimeBase, entry.asset);
    if (!fs.existsSync(approvedPath)) errors.push(`${entry.suspectId}: approved portrait is missing at ${approvedPath}`);
  }
}

for (const id of expectedIds) {
  if (!seenIds.has(id)) errors.push(`portrait registry missing canonical suspect ${id}`);
}

const approvedCount = entries.filter((entry) => entry.status === 'approved').length;
const pendingCount = entries.filter((entry) => entry.status === 'pending').length;
if (approvedCount === entries.length && registry.status !== 'production-art-approved') {
  errors.push('registry status must be production-art-approved when all portraits are approved');
}
if (approvedCount < entries.length && registry.status !== 'production-art-pending') {
  errors.push('registry status must remain production-art-pending until all 25 portraits are approved');
}

if (errors.length) {
  console.error('Who Took It? suspect-art registry validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  suspects: suspects.length,
  registryEntries: entries.length,
  approved: approvedCount,
  pending: pendingCount,
  runtimeBase: registry.runtimeBase,
  conceptSheetRequired: registry.conceptSheetRequired
}, null, 2));
