# Manual Browser QA v0.1

Use this checklist before deploying **Who Took It?** to dtfseeds.com.

## Setup

```bash
cd 03_digital-game
npm install
npm run validate
npm run smoke
npm audit
npm run build
npm run dev
```

## Browser Matrix

Test at minimum:

- Chrome desktop
- Chrome Android
- Safari iOS, if available
- Firefox desktop, if available

## Single Player Test

- [ ] Page loads without console errors.
- [ ] Data health banner is hidden when data is valid.
- [ ] A mystery is created.
- [ ] Asking a suspect question returns only Yes or No.
- [ ] Asking an item question returns only Yes or No.
- [ ] Asked questions become disabled.
- [ ] Suspect cards can be eliminated and restored.
- [ ] Missing items can be eliminated and restored.
- [ ] Quick Accuse opens the accusation drawer.
- [ ] Quick Accuse focuses the item selector.
- [ ] Correct accusation shows win result.
- [ ] Wrong accusation shows loss result.
- [ ] New case resets the board.

## Save / Resume Test

- [ ] Ask at least two questions.
- [ ] Eliminate at least two suspects.
- [ ] Eliminate one item.
- [ ] Refresh the browser.
- [ ] Round state is restored.
- [ ] New case overwrites the saved case.

## Shared Mystery / Host Mode Test

- [ ] Switch to Group mode.
- [ ] New shared mystery is created.
- [ ] Questions work.
- [ ] Host tools appear only in development.
- [ ] Production build does not expose mystery reveal controls.

## Duel Mode Test

- [ ] Switch to Duel mode.
- [ ] Player 1 and Player 2 have separate tracking states.
- [ ] Player 1 questions target Player 2 mystery.
- [ ] End Turn switches to Player 2.
- [ ] Player 2 questions target Player 1 mystery.
- [ ] Each player keeps separate eliminated suspects, eliminated items, and clue history.
- [ ] Accusation resolves against the opponent mystery.

## Accessibility / Mobile Test

- [ ] Game is usable at 360px wide.
- [ ] No horizontal page overflow.
- [ ] Buttons have visible focus states.
- [ ] Motion respects reduced-motion setting.
- [ ] Result dialog is readable on mobile.
- [ ] Accusation drawer is readable on mobile.

## Fail Conditions

Do not deploy if:

- production build exposes mystery reveal tools
- any question returns maybe or unclear wording
- the app crashes after refresh
- the 5x5 board overflows mobile width badly
- Vite build fails
- npm audit fails
