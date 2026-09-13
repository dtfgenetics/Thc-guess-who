# Who Took It? Visual Asset Audit — 2026-09-12

## Result
Blocking visual assets missing: **0**

The game now has complete runtime coverage for canonical suspects, canonical missing items, core UI, the case-room environment, and interaction/reveal states. Review-only concept art is not treated as runtime production art.

## Runtime production coverage

| Group | Required | Complete | Runtime authority | Status |
|---|---:|---:|---|---|
| Suspect portraits | 25 | 25 | `03_digital-game/public/assets/suspects/` | Complete |
| Canonical missing-item art | 5 | 5 | `03_digital-game/public/assets/items/` | Complete |
| UI/HUD runtime pack | 20 | 20 | `03_digital-game/public/assets/ui/` | Complete |
| Case-room environment | 1 | 1 | `03_digital-game/public/assets/environment/` | Complete |
| Interaction/reveal state system | 4 states | 4 states | DOM/CSS + approved UI surfaces | Complete |

Manifest-backed visual runtime assets: **51**  
Additional CSS/DOM visual state systems: **4**

## Drive source-master coverage

- `04 Environments` — source master + runtime export saved and verified.
- `05 Gameplay Objects` — five canonical source masters + runtime exports saved and verified.
- `06 UI + HUD` — source masters + runtime exports saved and verified.
- `09 Marketing` — game hub thumbnail, promotional hero, social square, social vertical, OG share saved.
- `03 Characters` — typed Source Masters / Runtime Exports folders now exist. The 25 legacy suspect masters remain repo-authoritative because the complete source and web packs are already versioned and validated there; they are intentionally not duplicated solely for storage symmetry.
- `07 FX + Animation` — standalone raster FX are not required for the current selected/eliminated/hidden/reveal states. Those effects are implemented with DOM/CSS and approved UI frames; a policy marker has been saved in the folder.

## Review-only assets

- `who-took-it-key-art-v1` remains optional P2 review work.
- Concept sheets remain review-only and must not be sliced into runtime assets.

## Validation and deployment rules

- `npm run assets:audit` checks production asset counts, registries, runtime files, and blocking status.
- The audit runs inside the normal smoke/CI path.
- The environment loader uses `import.meta.env.BASE_URL`, preloads approved art, and fails closed to the base UI if the environment asset cannot load.
- Digital Game Check and production build validation must pass before runtime asset work is considered complete.
