# Who Took It? — Model / Developer Handoff v0.2

## Current Status

The digital game prototype is in `03_digital-game/` and has moved beyond a skeleton. It now has playable single-player, shared mystery, and local duel flows.

## Do Not Change

- Public title: **Who Took It?**
- Core mystery format: **[Suspect] took [Item]**
- Fixed items: Bag, Dabs, Lighter, Chocolate Bar, Gummies
- Public questions must stay preset yes/no questions.
- Do not add free-form typed questions yet.
- Do not copy Hasbro, Harry Potter, One Piece, GPL, or other third-party branded assets/code.

## Current Digital Features

- Vite + React app
- 25 suspects
- 5 missing items
- 29 preset questions
- binary yes/no answer engine
- manual suspect elimination
- manual item elimination
- final accusation flow
- result screen
- single-player mode
- shared mystery / host mode
- local 2-player pass-the-device duel mode
- local browser save/resume
- crash-safe ErrorBoundary recovery
- development-only mystery reveal tools
- playtest summary export with clipboard fallback
- source/IP audit
- production mystery privacy check
- GitHub Actions validate/smoke/audit/build workflow
- CI build artifact upload

## Run Commands

```bash
cd 03_digital-game
npm install
npm run validate
npm run smoke
npm audit
npm run build
node scripts/verify-production-build.mjs
npm run dev
```

## Expected CI Steps

The GitHub Actions workflow should run:

1. install dependencies
2. validate data
3. run smoke test plus UI/source audit
4. run dependency audit
5. build production bundle
6. verify production does not expose mystery reveal controls
7. upload `dist` as an artifact

## Most Important Files

```text
03_digital-game/src/App.jsx
03_digital-game/src/engine/gameEngine.js
03_digital-game/src/engine/storage.js
03_digital-game/src/engine/validateData.js
03_digital-game/src/data/suspects.json
03_digital-game/src/data/items.json
03_digital-game/src/data/questions.json
03_digital-game/scripts/smoke-test.mjs
03_digital-game/scripts/validate-ui-polish.mjs
03_digital-game/scripts/source-audit.mjs
03_digital-game/scripts/verify-production-build.mjs
```

## Known Non-Blocking Limitations

- Final suspect portraits are not created yet.
- Final item icons are not created yet.
- No real online multiplayer yet.
- Duel mode is local pass-and-play.
- Browser click-through testing still needs to happen in a real browser.
- No package-lock is committed yet.
- Deployment target still needs to be chosen and verified.

## Next Best Coding Tasks

1. Run the GitHub Actions workflow and inspect logs.
2. Add a browser interaction test or manual browser QA checklist.
3. Add final placeholder art components without external images.
4. Add a mode help panel explaining Solo, Group, and Duel.
5. Add local score/playtest metrics.
6. Decide deployment target for dtfseeds.com `/games/who-took-it/`.

## Professional Handoff Warning

Do not start online multiplayer until the local single-player and pass-and-play browser version has been manually tested. Online multiplayer will add state sync, rooms, privacy, and race-condition risks.
