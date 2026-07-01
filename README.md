# Who Took It?

**Who Took It?** is a THC — Teaching Healthy Cultivation mystery deduction game.

Players ask yes/no questions, eliminate suspects, and solve the hidden mystery:

> **[Suspect] took [Item].**

Core missing items:

- Bag
- Dabs
- Lighter
- Chocolate Bar
- Gummies

This repository is the project home for the physical printable prototype, game master documents, structured data, and digital game.

## Current Version

**Printable Prototype:** v0.8  
**Digital Prototype:** v0.1 React/Vite app added

Final character art should wait until playtesting confirms the rules, clue balance, and mode structure.

## Supported Modes

- 2-player Duel Mode
- 3+ player Shared Mystery Mode
- Team Mode
- Single-player digital mode

## Digital Game

The digital game lives in `03_digital-game/`.

```bash
cd 03_digital-game
npm install
npm run dev
```

Validation and build:

```bash
npm run validate
npm run build
```

Current digital features:

- 25-suspect board
- 5 missing items
- preset yes/no question bank
- binary trait answer engine
- suspect elimination
- item tracking
- accusation flow
- single-player mode
- shared mystery / host mode
- local 2-player duel mode
- data validation
- playtest export tool

## Core Rule

Every clue and question must resolve to a clear **yes** or **no**. No maybe answers, no subjective guesses, and no hidden interpretation.

## Repository Structure

```text
00_master/
  Game design masters, rules, roster, balance notes

01_printable-prototype/v0.8/
  Printable PDF files and ZIP kit

02_data/
  Structured JSON data for suspects, items, and question bank

03_digital-game/
  Browser game implementation

04_playtest/
  Playtest notes and revision logs
```

## Third-Party References

See `THIRD_PARTY_NOTICES.md`.

Public GitHub projects were reviewed as mechanics references. This repository uses original Who Took It? data, rules, branding, and implementation.

## Public Safety / Branding Line

THC — Teaching Healthy Cultivation  
Adult party game. 21+ only. For entertainment purposes.
