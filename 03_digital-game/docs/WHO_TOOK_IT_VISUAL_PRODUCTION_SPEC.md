# Who Took It? — Visual Production Spec v1

Status: ACTIVE / P0
Date: 2026-09-08

## Goal
Turn the existing 5×5 deduction game into an original late-night case-file mystery without changing canonical mechanics. Art must encode the suspect data rather than contradict it.

## Locked visual language
- Illustrated, stylized adult cast; chest-up portraits; consistent camera and scale.
- Warm grow-room practical light + cooler evidence-board shadows.
- Strong silhouettes and props; faces remain readable at card thumbnail size.
- No celebrity likenesses, franchise imitation, baked-in microtext, or smoke covering faces.
- Cannabis references are environmental/prop details, not leaf wallpaper.

## Concept-sheet gate
Create one 16:9 benchmark containing six representative suspects, two missing-item icons, normal and eliminated cards, question panel, YES/NO controls, and culprit reveal.

### Six benchmark suspects
These six intentionally span the existing trait vocabulary.
1. Pocket Benny — oversized hoodie pockets, guarded posture; visual cues: Pocket / Borrowing / Hiding.
2. Sticky Dan — slightly messy work shirt, concentrate-tool case, tacky glove detail; Sticky / Flame / Tools.
3. Candy Mandy — bright chaotic accessories, candy pouch, lighter clipped visibly; Bright / Chaotic / Flame.
4. Ziplock Zara — hyper-organized labeled pouch system, neat silhouette; Organized / Containers / Sticky.
5. Rig Rick — technical glasses, precision-tool roll, glass-rig motif in background; Technical / Glass / Candy.
6. Torch Tina — confident posture, heat-safe glove/tool silhouette; Flame / Tools / Confident.

Do not invent visual traits that would make binary-question answers ambiguous.

## Full 25-portrait production rules
- Master: 1024×1024 PNG/WebP source, square crop-safe.
- Eye line: upper-middle band; head/shoulders never touch crop.
- Neutral gameplay expression first. Reveal expressions are a later optional pass.
- Every suspect receives 3–5 deliberately visible cues derived from `publicTags`/`traits`.
- Avoid repeating the same hair, hat, glasses, clothing silhouette, or dominant prop across adjacent board positions.
- Names remain DOM text, never painted into portrait art.

## Missing-item system
Produce five 1024×1024 transparent masters corresponding exactly to canonical item data. Icons must read at 64 px. Runtime states should use CSS overlays/borders when possible: neutral, selected, eliminated, reveal.

## Card state language
- Normal: warm paper/evidence-card surface, clear portrait.
- Hover/focus: raised edge + high-contrast focus ring.
- Selected: evidence-pin/tape accent without covering face.
- Eliminated: desaturated/dimmed portrait + unmistakable strike/tape treatment; never color-only.
- Accused: stronger framed warning state.
- Culprit reveal: spotlight/evidence burst, portrait still fully readable.

## Board/environment
- 16:9 master with center-safe mobile crop.
- Grow-room mystery setting: practical fixtures, shelves, ducting, evidence cork/metal board, subtle plant-room context.
- Keep the 5×5 portrait grid visually dominant.
- Background detail density falls behind text/control zones.

## UI rules
- Question and YES/NO controls remain DOM-first and high contrast.
- Minimum mobile touch target: 44×44 CSS px.
- Do not rely on color alone for state.
- Motion: short reveal/elimination feedback only; honor reduced-motion.

## Runtime naming convention
`who-took-it/<group>/<asset-id>.<ext>`

Groups:
- `suspects/`
- `items/`
- `environment/`
- `ui/`
- `vfx/`
- `key-art/`

Suspect IDs must retain canonical IDs (`suspect_001` … `suspect_025`) so art can be mapped without name parsing.

## Acceptance gates
1. Six-suspect concept sheet approved.
2. Trait-to-art matrix reviewed against `suspects.json`.
3. Five item icons verified against `items.json`.
4. 25 portraits produced and uniqueness checked.
5. Desktop 5×5 board screenshot reviewed.
6. 390×844 mobile screenshot reviewed.
7. Keyboard focus, contrast, eliminated-state and reduced-motion checks pass.
8. Only then integrate production masters and ship through the canonical release path.
