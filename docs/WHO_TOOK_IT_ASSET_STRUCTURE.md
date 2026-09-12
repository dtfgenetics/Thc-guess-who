# Who Took It? Asset Storage Structure

Updated: 2026-09-12
Status: LOCKED FOR PRODUCTION

## Source of truth

Game repository: `dtfgenetics/Thc-guess-who`
Digital runtime: `03_digital-game`

The project uses two asset layers:

1. `assets/` stores high-resolution production masters, concepts, and optimized review derivatives.
2. `03_digital-game/public/assets/` stores only runtime-ready assets shipped by Vite to `/games/who-took-it/`.

Do not point runtime code at `assets/`. Do not store editable masters inside `public/`.

## Locked directory layout

```text
assets/
  concepts/
  characters/
    suspects/
      source/
      web/
  items/
    source/
    web/
  evidence/
    source/
    web/
  environments/
    source/
    web/
  world-map/
    source/
    web/
  ui/
    source/
    web/
  branding/
    source/
    web/
  marketing/
    source/
    web/

03_digital-game/public/assets/
  suspects/
  items/
  evidence/
  environments/
  maps/
  ui/
  branding/
```

## Runtime naming

### Suspects
Already locked:
`03_digital-game/public/assets/suspects/suspect_NNN.webp`

### Missing items
Canonical item IDs come from `03_digital-game/src/data/items.json`. There are exactly five gameplay items; do not create extra item cards unless the canonical rules/data expand first.

- `item_bag.webp`
- `item_dabs.webp`
- `item_lighter.webp`
- `item_chocolate_bar.webp`
- `item_gummies.webp`

Runtime destination:
`03_digital-game/public/assets/items/<item-id>.webp`

Production masters:
`assets/items/source/<item-id>-v1.png`

Review derivatives:
`assets/items/web/<item-id>-v1.webp`

The deterministic item-art mapping lives in `03_digital-game/src/data/item-art.json`. An item may be marked `approved` only after its runtime file exists at the mapped path. Item art cues must exactly match the canonical `tags` array for that item so visuals cannot contradict clue logic.

### Evidence
Use stable semantic IDs rather than display labels:
`evidence_<type>_<nnn>.webp`

Runtime destination:
`03_digital-game/public/assets/evidence/`

### Environments
Use stable slugs:
- `headquarters.webp`
- `grow-room.webp`
- `lounge.webp`
- `lab.webp`
- `dispensary.webp`
- `rooftop.webp`
- `backyard.webp`

Runtime destination:
`03_digital-game/public/assets/environments/`

Production masters:
`assets/environments/source/<slug>-v1.png`

### World map
Runtime destination:
`03_digital-game/public/assets/maps/world-map.webp`

Production master:
`assets/world-map/source/world-map-v1.png`

### UI
UI art must be componentized. Do not bake gameplay text, suspect names, item names, questions, scores, or buttons into raster images.

Runtime destination:
`03_digital-game/public/assets/ui/`

Suggested IDs:
- `frame-suspect-default.webp`
- `frame-suspect-selected.webp`
- `frame-suspect-eliminated.webp`
- `frame-item-default.webp`
- `frame-clue.webp`
- `fx-correct.webp`
- `fx-wrong.webp`
- `fx-case-solved.webp`

Prefer CSS/SVG for simple borders, buttons, icons and state color changes when practical.

### Branding
Runtime destination:
`03_digital-game/public/assets/branding/`

Keep title art and DTF/THC branding separate from interactive UI text.

## Master/output rules

- Character master: 1024×1536 PNG as already locked by the visual production spec.
- Item master: square transparent PNG, minimum 1024×1024.
- Evidence master: square transparent PNG, minimum 1024×1024.
- Environment master: 16:9 PNG, minimum 1920×1080; design with mobile-safe central crop.
- World map master: wide 16:9 or larger, minimum 2048 px wide.
- Runtime raster format: WebP unless transparency/quality testing proves PNG materially better.
- All generated text that affects gameplay stays in React/HTML, not inside image files.
- Concept sheets and collages never ship as runtime assets.

## Integration rule

Each runtime asset must have:
1. a stable semantic ID;
2. a production master;
3. an optimized runtime derivative;
4. a registry or deterministic code mapping;
5. a visual QA pass at desktop and mobile sizes.

Suspects use `src/data/suspect-art.json`; missing items use `src/data/item-art.json`. Both registries are enforced by `scripts/validate-art-registry.mjs` so approved runtime art cannot silently drift away from canonical gameplay data.
