const STORAGE_KEY = 'who-took-it:digital-game:v1';
const SCHEMA_VERSION = 1;

export function loadSavedGame() {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (parsed?.schemaVersion !== SCHEMA_VERSION) return null;
    if (!parsed?.roundState || !parsed?.mode) return null;

    return parsed;
  } catch (error) {
    console.warn('Unable to load saved Who Took It? game.', error);
    return null;
  }
}

export function saveGame(session) {
  if (!canUseStorage()) return;

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        schemaVersion: SCHEMA_VERSION,
        savedAt: new Date().toISOString(),
        ...session
      })
    );
  } catch (error) {
    console.warn('Unable to save Who Took It? game.', error);
  }
}

export function clearSavedGame() {
  if (!canUseStorage()) return;
  window.localStorage.removeItem(STORAGE_KEY);
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}
