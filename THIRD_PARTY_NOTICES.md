# Third-Party Reference Notes

This project uses original THC / Who Took It? game data, rules, branding, and code.

During planning, we reviewed open GitHub projects for mechanics reference only.

## Reference Reviewed: philcrooks/Guess-Who

Repository: https://github.com/philcrooks/Guess-Who

Reason reviewed:

- React state structure
- hidden character selection
- question-based elimination
- card overlay logic

License noted during audit: ISC in `package.json`.

No Harry Potter character data, image URLs, or themed assets are included in this repository.

## Reference Reviewed: bocaletto-luca/Guess-Who

Repository: https://github.com/bocaletto-luca/Guess-Who

Reason reviewed:

- vanilla JavaScript board rendering
- preset question buttons
- binary attribute filtering
- reset and click-to-guess flow

License noted during audit: GPLv3.

No GPL code was copied into this repository. This project uses its own implementation.

## Avoided References

Projects without clear licensing or with third-party IP assets were not copied or forked.

## Project Rule

Do not copy branded assets, character data, images, logos, or GPL code unless the project explicitly accepts the license requirements.
