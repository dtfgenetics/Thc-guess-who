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
- local 2-player duel mode
- 21+ acknowledgement gate
- local save/resume through browser storage
- strict saved-session shape validation
- crash-safe error boundary with clear-save recovery
- host/playtest reveal tools gated to development builds
- spoiler-free best-lead assistant
- data validation panel
- playtest summary copy tool with manual fallback
- source/IP audit script
- production mystery privacy verification, including sourcemap scan when sourcemaps are enabled
- question balance report
- CI build artifact upload

## Run Locally

```bash
cd 03_digital-game
nvm use
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Full Handoff Check

Run the full check before handing the project to another model, deploying, or adding new features:

```bash
npm run check
```

That command runs:

1. data validation
2. engine/storage/UI/source smoke checks
3. question balance report
4. dependency audit
5. production build
6. production mystery privacy verification

## Individual Checks

```bash
npm run validate
npm run smoke
npm run balance
npm audit
npm run build
node scripts/verify-production-build.mjs
```

## Dependency Reproducibility

Package versions are pinned exactly in `package.json` because a `package-lock.json` has not been committed yet.

When a developer can run npm locally, generate and commit the lockfile:

```bash
npm install
```

After `package-lock.json` exists, CI can switch from `npm install` to `npm ci`.

## Deployment Base Path

The Vite config defaults production builds to:

```text
/games/who-took-it/
```

Override it when needed:

```bash
VITE_BASE_PATH=/custom/path/ npm run build
```

## Production Sourcemaps

Sourcemaps are disabled by default so debug-only source strings are not shipped accidentally.

Enable only for a private staging/debug build:

```bash
VITE_ENABLE_SOURCEMAPS=true npm run build
```

If sourcemaps are enabled, `node scripts/verify-production-build.mjs` scans `.map` files as well.

## Core Rule

The first playable version must use preset questions only. Every question maps to binary trait data and answers **yes** or **no**.

Do not add free-form typed questions until the rules engine is fully tested.

## Main Data Files

```text
src/data/suspects.json
src/data/items.json
src/data/questions.json
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
scripts/smoke-test.mjs
scripts/validate-ui-polish.mjs
scripts/source-audit.mjs
scripts/balance-report.mjs
scripts/verify-production-build.mjs
```

## Next Features

1. Add generated final suspect portraits.
2. Add final item icons.
3. Run browser click-through testing.
4. Add hosted group mode with room codes.
5. Add online multiplayer only after local modes are stable.
6. Wire deployment into the main DTF Seeds games hub.
