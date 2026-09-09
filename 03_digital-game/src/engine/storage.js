const STORAGE_KEY = 'who-took-it:digital-game:v1';
const SCHEMA_VERSION = 1;
const ALLOWED_MODES = new Set(['solo', 'shared', 'duel']);
const DUEL_PLAYERS = ['Player 1', 'Player 2'];
const ACTIVE_PLAYER_BY_MODE = {
  solo: 'Solo Player',
  shared: 'Group'
};

export function loadSavedGame() {
  if (!canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!isValidSavedSession(parsed)) {
      clearSavedGame();
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn('Unable to load saved Who Took It? game.', error);
    clearSavedGame();
    return null;
  }
}

export function saveGame(session) {
  if (!canUseStorage() || !isValidSessionPayload(session)) return;

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

export function isValidSavedSession(session) {
  if (!session || typeof session !== 'object') return false;
  if (session.schemaVersion !== SCHEMA_VERSION) return false;
  return isValidSessionPayload(session);
}

function isValidSessionPayload(session) {
  if (!session || typeof session !== 'object') return false;
  if (!ALLOWED_MODES.has(session.mode)) return false;
  if (!isPlainObject(session.roundState)) return false;
  if (session.roundState.mode !== session.mode) return false;
  if (!isPlainObject(session.roundState.mysteries)) return false;
  if (!isPlainObject(session.roundState.eliminatedByPlayer)) return false;
  if (!isPlainObject(session.roundState.eliminatedItemsByPlayer)) return false;
  if (!isPlainObject(session.roundState.historyByPlayer)) return false;

  if (session.mode === 'duel') {
    if (!DUEL_PLAYERS.includes(session.roundState.activePlayer)) return false;
    return DUEL_PLAYERS.every((player) =>
      isMystery(session.roundState.mysteries[player]) &&
      Array.isArray(session.roundState.eliminatedByPlayer[player]) &&
      Array.isArray(session.roundState.eliminatedItemsByPlayer[player]) &&
      Array.isArray(session.roundState.historyByPlayer[player])
    );
  }

  if (session.roundState.activePlayer !== ACTIVE_PLAYER_BY_MODE[session.mode]) return false;
  return (
    isMystery(session.roundState.mysteries.shared) &&
    Array.isArray(session.roundState.eliminatedByPlayer.shared) &&
    Array.isArray(session.roundState.eliminatedItemsByPlayer.shared) &&
    Array.isArray(session.roundState.historyByPlayer.shared)
  );
}

function isMystery(mystery) {
  return Boolean(mystery?.suspect?.id && mystery?.item?.id);
}

function isPlainObject(value) {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}
