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
- host/playtest reveal tools
- data validation panel
- playtest summary copy tool

## Run Locally

```bash
cd 03_digital-game
npm install
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Build

```bash
npm run build
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
src/engine/validateData.js
```

## Next Features

1. Add generated placeholder art or final suspect portraits.
2. Add automated tests for the engine.
3. Add local storage for unfinished rounds.
4. Add hosted group mode with room codes.
5. Add online multiplayer only after local modes are stable.
