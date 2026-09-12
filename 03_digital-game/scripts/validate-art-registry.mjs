import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const repoRoot = path.resolve(root, '..');
const suspects = JSON.parse(fs.readFileSync(path.join(root, 'src/data/suspects.json'), 'utf8'));
const items = JSON.parse(fs.readFileSync(path.join(root, 'src/data/items.json'), 'utf8'));
const suspectRegistry = JSON.parse(fs.readFileSync(path.join(root, 'src/data/suspect-art.json'), 'utf8'));
const itemRegistry = JSON.parse(fs.readFileSync(path.join(root, 'src/data/item-art.json'), 'utf8'));
const productionManifest = JSON.parse(fs.readFileSync(path.join(repoRoot, 'assets/production-manifest.json'), 'utf8'));

const errors = [];
const allowedStatuses = new Set(['pending', 'approved']);

function validateRegistry({
  kind,
  canonical,
  registry,
  idKey,
  runtimeBase,
  masterFormat,
  expectedAsset,
  canonicalCues,
  approvedLabel
}) {
  const entries = Array.isArray(registry.entries) ? registry.entries : [];
  const expectedIds = canonical.map((entry) => entry.id);

  if (registry.schemaVersion !== 1) errors.push(`${kind}-art schemaVersion must be 1`);
  if (registry.runtimeBase !== runtimeBase) errors.push(`${kind}-art runtimeBase must be ${runtimeBase}`);
  if (registry.masterFormat !== masterFormat) errors.push(`${kind}-art masterFormat must be ${masterFormat}`);
  if (entries.length !== canonical.length) errors.push(`${kind} art registry must contain ${canonical.length} entries; found ${entries.length}`);

  const seenIds = new Set();
  const seenAssets = new Set();
  for (const entry of entries) {
    if (!entry || typeof entry !== 'object') {
      errors.push(`every ${kind} art registry entry must be an object`);
      continue;
    }

    const canonicalId = entry[idKey];
    if (seenIds.has(canonicalId)) errors.push(`duplicate ${idKey} in ${kind} art registry: ${canonicalId}`);
    seenIds.add(canonicalId);
    if (seenAssets.has(entry.asset)) errors.push(`duplicate ${kind} art path: ${entry.asset}`);
    seenAssets.add(entry.asset);
    if (!allowedStatuses.has(entry.status)) errors.push(`${canonicalId}: status must be pending or approved`);

    const source = canonical.find((candidate) => candidate.id === canonicalId);
    if (!source) {
      errors.push(`unknown ${idKey} in ${kind} art registry: ${canonicalId}`);
      continue;
    }
    if (entry.name !== source.name) errors.push(`${canonicalId}: registry name does not match canonical data`);

    const asset = expectedAsset(source);
    if (entry.asset !== asset) errors.push(`${canonicalId}: expected asset ${asset}, found ${entry.asset}`);
    if (JSON.stringify(entry.cues) !== JSON.stringify(canonicalCues(source))) {
      errors.push(`${canonicalId}: art cues must exactly match canonical visible tags`);
    }

    if (entry.status === 'approved') {
      const approvedPath = path.join(root, 'public', registry.runtimeBase, entry.asset);
      if (!fs.existsSync(approvedPath)) errors.push(`${canonicalId}: approved ${kind} art is missing at ${approvedPath}`);
    }
  }

  for (const id of expectedIds) {
    if (!seenIds.has(id)) errors.push(`${kind} art registry missing canonical id ${id}`);
  }

  const approvedCount = entries.filter((entry) => entry.status === 'approved').length;
  const pendingCount = entries.filter((entry) => entry.status === 'pending').length;
  if (approvedCount === entries.length && registry.status !== 'production-art-approved') {
    errors.push(`${kind} registry status must be production-art-approved when all ${approvedLabel} are approved`);
  }
  if (approvedCount < entries.length && registry.status !== 'production-art-pending') {
    errors.push(`${kind} registry status must remain production-art-pending until all ${approvedLabel} are approved`);
  }

  return { entries: entries.length, approved: approvedCount, pending: pendingCount };
}

const suspectSummary = validateRegistry({
  kind: 'suspect',
  canonical: suspects,
  registry: suspectRegistry,
  idKey: 'suspectId',
  runtimeBase: 'assets/suspects/',
  masterFormat: '1024x1536 PNG / 640x960 WebP',
  expectedAsset: (suspect) => `${suspect.id}.webp`,
  canonicalCues: (suspect) => suspect.publicTags,
  approvedLabel: '25 portraits'
});

const itemSummary = validateRegistry({
  kind: 'item',
  canonical: items,
  registry: itemRegistry,
  idKey: 'itemId',
  runtimeBase: 'assets/items/',
  masterFormat: '1024x1024 PNG / WebP',
  expectedAsset: (item) => `${item.id}.webp`,
  canonicalCues: (item) => item.tags,
  approvedLabel: '5 evidence masters'
});

const itemManifest = productionManifest.assets?.find((asset) => asset.id === 'item-evidence-masters');
if (!itemManifest) {
  errors.push('production manifest must define item-evidence-masters');
} else {
  const canonicalIds = items.map((item) => item.id);
  if (itemManifest.quantity !== canonicalIds.length) {
    errors.push(`production manifest must request exactly ${canonicalIds.length} item evidence masters`);
  }
  if (JSON.stringify(itemManifest.canonicalIds) !== JSON.stringify(canonicalIds)) {
    errors.push('production manifest canonical item IDs must exactly match items.json order');
  }
}

if (errors.length) {
  console.error('Who Took It? art registry validation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(JSON.stringify({
  ok: true,
  suspects: suspectSummary,
  items: itemSummary,
  suspectRuntimeBase: suspectRegistry.runtimeBase,
  itemRuntimeBase: itemRegistry.runtimeBase,
  canonicalItemCount: items.length
}, null, 2));
