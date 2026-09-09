# Digital Game

Playable browser/mobile prototype for **Who Took It?**.

This version is a clean implementation built from our own data and rules. It uses open GitHub projects only as mechanics references; no licensed character data, Hasbro branding, One Piece assets, Harry Potter assets, or GPL code has been copied into this app.

## Current Features

- Vite + React app shell
- 25-suspect 5x5 board
- 5 missing items
- preset question bank
- binary yes/no answer engine
- public tag to binary trait validation
- duplicate question and wrong-trait-pool validation
- manual suspect elimination
- manual item elimination
- final accusation flow
- result screen
- single-player mode
- shared mystery / host mode
- local 2-player duel mode with one hidden suspect+item mystery per player
- 21+ acknowledgement gate
- local save/resume through browser storage
- strict saved-session shape validation
- crash-safe error boundary with clear-save recovery
- host/playtest reveal tools gated to development builds
- spoiler-free best-lead assistant rendered inside React
- data validation panel
- playtest summary copy tool with manual fallback
- source/IP audit script
- production mystery privacy verification, including sourcemap scan when sourcemaps are enabled
- question balance report
- CI build artifact upload
- optional GitHub Pages preview workflow
- canonical 25-character portrait registry keyed to `suspect_001` through `suspect_025`
- deterministic portrait-registry validation so art cannot silently drift from suspect names/public tags
- approval-aware portrait runtime contract: only assets marked `approved` may ship as character portraits

## Character Art Contract

The visual production specification is `docs/WHO_TOOK_IT_VISUAL_PRODUCTION_SPEC.md`. Runtime art mapping is owned by `src/data/suspect-art.json`.

Every approved suspect portrait has one reserved runtime asset path:

```text
public/assets/suspects/suspect_001.webp
...
public/assets/suspects/suspect_025.webp
```

The browser resolves those under the active Vite base path, for example:

```text
/games/who-took-it/assets/suspects/suspect_001.webp
```

Changing a registry entry to `approved` requires the matching file to exist in `public/assets/suspects/`; `scripts/validate-art-registry.mjs` fails otherwise. This prevents placeholder/procedural avatars from being mistaken for approved final art.

## Run Locally

```bash
cd 03_digital-game
nvm use
npm ci
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Full Handoff Check

Run the full check before handing the project to another model, deploying, or adding new features:

```bash
npm run check
```

That command runs:

1. canonical game-data validation
2. 25-character art-registry coverage/approval validation
3. engine/storage/UI/source smoke checks
4. question balance report
5. dependency audit
6. production build
7. production mystery privacy verification

## Individual Checks

```bash
npm run validate
node scripts/validate-art-registry.mjs
npm run smoke
npm run balance
npm audit
npm run build
node scripts/verify-production-build.mjs
```

## Dependency Reproducibility

`package-lock.json` is committed, so use `npm ci` for clean installs and CI. Package versions are pinned exactly in `package.json` to reduce drift between local work, GitHub Actions, and deployment.

## Deployment Base Path

The Vite config defaults production builds to the intended DTF Seeds route:

```text
/games/who-took-it/
```

Override it when needed:

```bash
VITE_BASE_PATH=/custom/path/ npm run build
```

The GitHub Pages preview workflow builds with:

```text
/Thc-guess-who/
```

Do not deploy a build to the wrong path; the asset URLs will break.

## Production Sourcemaps

Sourcemaps are disabled by default so debug-only source strings are not shipped accidentally.

Enable only for a private staging/debug build:

```bash
VITE_ENABLE_SOURCEMAPS=true npm run build
```

If sourcemaps are enabled, `node scripts/verify-production-build.mjs` scans `.map` files as well.

## Core Rule

The first playable version uses preset questions only. Every question maps to binary trait data and answers **yes** or **no**.

Do not add free-form typed questions until the rules engine is fully tested.

## Main Data Files

```text
src/data/suspects.json
src/data/items.json
src/data/questions.json
src/data/suspect-art.json
src/data/tagTraitMap.js
```

## Main Engine Files

```text
src/engine/gameEngine.js
src/engine/storage.js
src/engine/validateData.js
```

## Script Files

```text
scripts/validate-data.mjs
scripts/validate-art-registry.mjs
scripts/smoke-test.mjs
scripts/validate-ui-polish.mjs
scripts/source-audit.mjs
scripts/balance-report.mjs
scripts/verify-production-build.mjs
```

## Next Production Work

1. Verify GitHub Actions runs after the current code pass.
2. Run manual browser QA from `../04_playtest/manual-browser-qa-v0.1.md`.
3. Produce and approve the final five item icons.
4. Verify all 25 approved suspect portraits visually match the locked roster.
5. Verify desktop/mobile board presentation and reduced-motion/focus behavior.
6. Publish the built artifact through the canonical DTF Seeds game route.
