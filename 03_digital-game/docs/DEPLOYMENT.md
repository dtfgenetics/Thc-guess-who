# Who Took It? Deployment Guide

## Goal

Ship the digital game under the DTF Seeds game route:

```text
/games/who-took-it/
```

The app is a static Vite build. The deployable output is:

```text
03_digital-game/dist/
```

## Required Preflight

Run this before deploying:

```bash
cd 03_digital-game
nvm use
npm ci
npm run check
```

`npm run check` runs data validation, art registry validation, smoke tests, UI/source audits, balance report, dependency audit, production build, and production privacy verification.

## Canonical DTF Seeds Build

Use this for the real DTF Seeds route:

```bash
cd 03_digital-game
VITE_BASE_PATH=/games/who-took-it/ npm run build
node scripts/verify-production-build.mjs
```

Upload or copy everything inside `dist/` to the site route that serves:

```text
https://dtfseeds.com/games/who-took-it/
```

## GitHub Pages Preview Build

The repo also contains `.github/workflows/pages-preview.yml` for a GitHub Pages preview. That workflow uses:

```text
/Thc-guess-who/
```

Do not use the GitHub Pages base path for dtfseeds.com. Do not use the DTF Seeds base path for GitHub Pages preview. Asset URLs will break if the base path is wrong.

## Production Privacy Requirement

Do not deploy if `node scripts/verify-production-build.mjs` fails.

The production build must not expose:

- Reveal Mystery
- Playtest / Host Tools
- hidden answer debug copy

Sourcemaps are disabled by default. Only enable sourcemaps for a private staging/debug build:

```bash
VITE_ENABLE_SOURCEMAPS=true npm run build
```

If sourcemaps are enabled, the privacy verifier scans `.map` files too.

## Manual Browser QA

After deployment, run the manual checklist:

```text
04_playtest/manual-browser-qa-v0.1.md
```

Minimum pass requirements:

- 21+ acknowledgement appears before play.
- Solo mode asks/answers preset questions.
- Group mode creates one shared mystery.
- Duel mode preserves separate Player 1 / Player 2 states.
- Save/resume works after refresh.
- Accusation drawer works on mobile.
- No production reveal/debug tools appear.
- No horizontal overflow at 360px width.

## Current Live-Push Status

The repo is prepared to produce a live static build. Direct upload to dtfseeds.com still depends on the actual site/hosting deployment path or workflow outside this repo.
