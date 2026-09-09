# Who Took It? Visual Production Specification

## Approved portrait contract

- Roster: exactly 25 suspects keyed by `suspect_001` through `suspect_025`.
- Source master: 1024×1536 PNG, sRGB, portrait orientation.
- Browser asset: 640×960 WebP, stripped metadata, quality 84.
- Framing: waist-up or chest-up, face readable at card size, primary clue prop visible.
- Style: cohesive stylized 3D illustration, warm lounge lighting, dark botanical backdrop.
- Runtime path: `public/assets/suspects/suspect_NNN.webp`.
- Mapping: `src/data/suspect-art.json` is the only runtime registry.

## Release gates

An asset may be marked `approved` only when its suspect ID, name, public clue cues,
filename, source master, and optimized runtime image all agree. The full set must pass
visual consistency review, data validation, production build, base-path asset checks,
and the production mystery privacy scan before deployment.

Procedural avatars remain the fallback for missing or unapproved entries. They are not
accepted as production art.
