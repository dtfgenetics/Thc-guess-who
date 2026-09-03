# Shared Game Data

The current authoritative digital data lives in:

```text
../03_digital-game/src/data/suspects.json
../03_digital-game/src/data/items.json
../03_digital-game/src/data/questions.json
```

Do not maintain duplicate JSON here until there is an automated export step. Duplicate data will drift.

Future use for this folder:

- canonical CSV exports
- printable prototype data exports
- balance reports
- question answer matrices
- expansion-pack data

Current rule: update the digital JSON files first, then regenerate any print/export data from them.
