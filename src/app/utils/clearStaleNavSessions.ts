/**
 * clearStaleNavSessions — defensive localStorage hygiene for navigation sessions.
 *
 * Pass 61 (2026-05-07) — KI-117 fix surface.
 *
 * Two purposes:
 *  1. `clearStalePlanningNavSessions()` — on dashboard/app mount, sweep
 *     `bidondent_nav_session_*` keys and remove any that are still in
 *     `status: "planning"` AND either never activated OR untouched for >30 min.
 *     These are the stale carriers behind the phantom "737mi off route" banner
 *     when paired with KI-116's mount-scope bug. Even after KI-116's gate ships,
 *     these stale keys are user-visible privacy + state-leak risk.
 *
 *  2. `clearAllUserScopedSessionKeys()` — on Sign Out, nuke every
 *     user-scoped local key so the next signed-in user on the same browser
 *     does not inherit prior state. Pairs with KI-134 (Clerk session destroy).
 *
 * Pure side-effect functions. Safe to call when localStorage is unavailable
 * (private mode / SSR / disabled storage) — silently no-op on access errors.
 */

const NAV_SESSION_PREFIX = "bidondent_nav_session_";
const ACTIVE_NAV_SESSION_PREFIX = "bidondent_nav_active_session_";
const USER_SCOPED_PREFIX = "bidondent_user:";
const COVERAGE_LOCATION_KEY = "coverageCurrentLocation";
const NAV_PENDING_QUEUE_KEY = "bidondent_nav_pending_writes";
const NAV_CLOUD_UNAVAILABLE_KEY = "bidondent_nav_cloud_unavailable";

const DEFAULT_PLANNING_MAX_AGE_MS = 30 * 60 * 1000; // 30 minutes

type ParsedSessionShape = {
  status?: unknown;
  activatedAt?: unknown;
  updatedAt?: unknown;
};

function safeGetLocalStorage(): Storage | null {
  try {
    if (typeof window === "undefined") return null;
    return window.localStorage;
  } catch {
    return null;
  }
}

function safeListKeys(storage: Storage): string[] {
  const keys: string[] = [];
  try {
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key) keys.push(key);
    }
  } catch {
    /* ignore */
  }
  return keys;
}

function tryParse(raw: string | null): ParsedSessionShape | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as ParsedSessionShape;
    return null;
  } catch {
    return null;
  }
}

function parseTimestamp(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.length > 0) {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
}

/**
 * Sweep `bidondent_nav_session_*` keys and remove stale planning sessions.
 *
 * A session is considered stale-planning when:
 *   - status === "planning", AND
 *   - either activatedAt is null/missing, OR updatedAt is older than `maxAgeMs`
 *
 * Returns the number of keys removed (useful for diagnostics / tests).
 */
export function clearStalePlanningNavSessions(
  maxAgeMs: number = DEFAULT_PLANNING_MAX_AGE_MS
): number {
  const storage = safeGetLocalStorage();
  if (!storage) return 0;

  const now = Date.now();
  const cutoff = now - maxAgeMs;
  const keys = safeListKeys(storage).filter((key) => key.startsWith(NAV_SESSION_PREFIX));

  let removed = 0;
  for (const key of keys) {
    let raw: string | null = null;
    try {
      raw = storage.getItem(key);
    } catch {
      continue;
    }

    const parsed = tryParse(raw);
    if (!parsed) {
      // Unparseable entry — safer to drop than keep.
      try {
        storage.removeItem(key);
        removed += 1;
      } catch {
        /* ignore */
      }
      continue;
    }

    if (parsed.status !== "planning") continue;

    const activatedAt = parseTimestamp(parsed.activatedAt);
    const updatedAt = parseTimestamp(parsed.updatedAt);

    const neverActivated = activatedAt === null;
    const untouched = updatedAt !== null && updatedAt < cutoff;

    if (neverActivated || untouched) {
      try {
        storage.removeItem(key);
        removed += 1;
      } catch {
        /* ignore */
      }
    }
  }

  return removed;
}

/**
 * Nuke every user-scoped local key on Sign Out.
 *
 * Removes:
 *  - bidondent_nav_session_*       (per-user nav sessions)
 *  - bidondent_nav_active_session_* (per-user active session pointers)
 *  - bidondent_user:*              (per-user profile/vehicle cache; KI-133 surface)
 *  - coverageCurrentLocation       (last known GPS location cache)
 *  - bidondent_nav_pending_writes  (pending cloud-sync queue tied to old user)
 *  - bidondent_nav_cloud_unavailable (cloud-sync disable marker)
 *
 * Idempotent. Safe to call multiple times. Returns count of keys removed.
 */
export function clearAllUserScopedSessionKeys(): number {
  const storage = safeGetLocalStorage();
  if (!storage) return 0;

  const keys = safeListKeys(storage);
  const targets = keys.filter(
    (key) =>
      key.startsWith(NAV_SESSION_PREFIX) ||
      key.startsWith(ACTIVE_NAV_SESSION_PREFIX) ||
      key.startsWith(USER_SCOPED_PREFIX) ||
      key === COVERAGE_LOCATION_KEY ||
      key === NAV_PENDING_QUEUE_KEY ||
      key === NAV_CLOUD_UNAVAILABLE_KEY
  );

  let removed = 0;
  for (const key of targets) {
    try {
      storage.removeItem(key);
      removed += 1;
    } catch {
      /* ignore */
    }
  }

  return removed;
}
