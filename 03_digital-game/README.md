# Digital Game

Playable browser/mobile prototype for **Who Took It?**.

This version is a clean implementation built from our own data and rules. It uses open GitHub projects only as mechanics references; no licensed character data, Hasbro branding, One Piece assets, Harry Potter assets, or GPL code has been copied into this app.

## Current Features

- Vite + React app shell
- 25-suspect 5x5 board
- 5 missing items
- preset question bank
- binary yes/no answer engine
- manual suspect elimination
- manual item elimination
- final accusation flow
- result screen
- single-player mode
- shared mystery / host mode
- local 2-player duel mode
- local save/resume through browser storage
- crash-safe error boundary with clear-save recovery
- host/playtest reveal tools gated to development builds
- data validation panel
- playtest summary copy tool with manual fallback
- source/IP audit script
- production mystery privacy verification
- CI build artifact upload

## Run Locally

```bash
cd 03_digital-game
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Validate and Build

```bash
npm run validate
npm run smoke
npm audit
npm run build
node scripts/verify-production-build.mjs
```

## Deployment Base Path

The Vite config defaults production builds to:

```text
/games/who-took-it/
```

Override it when needed:

```bash
VITE_BASE_PATH=/custom/path/ npm run build
```

## Core Rule

The first playable version must use preset questions only. Every question maps to binary trait data and answers **yes** or **no**.

Do not add free-form typed questions until the rules engine is fully tested.

## Main Data Files

```text
src/data/suspects.json
src/data/items.json
src/data/questions.json
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
scripts/verify-production-build.mjs
```

## Next Features

1. Add generated final suspect portraits.
2. Add final item icons.
3. Run browser click-through testing.
4. Add hosted group mode with room codes.
5. Add online multiplayer only after local modes are stable.
6. Wire deployment into the main DTF Seeds games hub.
