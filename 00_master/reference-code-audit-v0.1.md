# Reference Code Audit v0.1

## Goal

Find existing GitHub projects with Guess-Who-style mechanics that can help us build **Who Took It?** without starting from nothing.

## Required Mechanics for Our Game

- 5x5 suspect board
- hidden suspect selection
- hidden item selection
- preset yes/no questions
- binary trait answer engine
- manual suspect elimination
- accusation flow
- single-player digital support
- later 2-player and group modes

## Best Candidate: philcrooks/Guess-Who

Repo: https://github.com/philcrooks/Guess-Who

### Why it matters

This is a simple React implementation. The README says all React state and game logic lives in `container.js` / `container.jsx`; the game randomly chooses a target character, uses question selection to hide cards, and redraws the board after state changes.

### Useful files

- `client/src/components/container.jsx`
- `client/src/components/cards/card.jsx`
- `client/src/characters.js`
- `package.json`

### Relevant mechanics

- random unknown character
- hidden/visible card state
- questionSelected elimination logic
- card overlay for eliminated suspects
- character data array

### License note

`package.json` lists license as ISC. There is no separate LICENSE file found during audit. Treat as usable with attribution, but strip all Harry Potter/API assets and replace with our own data and art.

## Strong Reference Only: bocaletto-luca/Guess-Who

Repo: https://github.com/bocaletto-luca/Guess-Who

### Why it matters

This is a very clean vanilla HTML/CSS/JS implementation. It has a random secret character, dynamic board rendering, filter/question buttons, active filters, click-to-guess, and reset.

### Useful files

- `index.html`
- `main.js`
- `style.css`

### Relevant mechanics

- simple static app
- no React build required
- character array with attributes
- preset question buttons
- yes/no filter logic
- card dimming for eliminated suspects

### License note

This repo is GPLv3. Do not copy code into our repo unless we are willing to make our derivative code GPLv3. Use as an architecture reference only unless GPL is accepted.

## Not Recommended: murilo-oli/guess-who-one-piece

Repo: https://github.com/murilo-oli/guess-who-one-piece

### Why it matters

Modern React hooks structure with random selected character, filtered database, score, reset, filters, and choose-character logic.

### Problem

No LICENSE file found during audit, and the theme uses One Piece IP. Do not fork/copy. Use only as a conceptual reference.

## Avoid: eric-gilles/guess-who-game

Repo: https://github.com/eric-gilles/guess-who-game

### Problem

No license found during audit, and README warns that logos from the original game belong to Hasbro. Avoid copying or forking.

## Recommendation

Do not fork a whole clone directly.

Build our own clean implementation in `03_digital-game/` using our own:

- suspect JSON
- item JSON
- question bank JSON
- binary trait engine
- Who Took It? branding
- original character art

Use philcrooks/Guess-Who as the closest permissive React reference for state and elimination mechanics.

Use bocaletto-luca/Guess-Who only as a vanilla-JS architecture reference if we want a no-build prototype.

## Next Build Direction

For our repo, the best first digital implementation is a small Vite/React app:

```text
03_digital-game/
  package.json
  index.html
  src/
    App.jsx
    data/
      suspects.json
      items.json
      questions.json
    engine/
      gameEngine.js
    components/
      Board.jsx
      SuspectCard.jsx
      QuestionPanel.jsx
      AccusationPanel.jsx
      ResultPanel.jsx
```

Start with single-player digital mode first. Then add local 2-player and shared host mode.
