// navigationSessionCloudService.ts
// Service for Supabase-backed navigation session sync
// with localStorage fallback + background retry

import { EdgeFunctionError, requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "../supabase/runtime";
import type { NavigationSession } from "../../features/navigation/sessionTypes";

const LS_PREFIX = "bidondent_nav_session_";
const ACTIVE_SESSION_PREFIX = "bidondent_nav_active_session_";
const STALENESS_MS = 24 * 60 * 60 * 1000; // 24 hours
const PENDING_QUEUE_KEY = "bidondent_nav_pending_writes";
const CLOUD_UNAVAILABLE_KEY = "bidondent_nav_cloud_unavailable";
const CLOUD_UNAVAILABLE_COOLDOWN_MS = 15 * 60 * 1000;

type CloudOptions = {
  enableCloud?: boolean;
};

type CloudUnavailableState = {
  detectedAt: number;
  reason: "missing-table";
};

// ─── Retry queue (in-memory, non-blocking) ─────────────────────

type PendingWrite = {
  ownerKey: string;
  session: NavigationSession;
  attempts: number;
  queuedAt: number;
};

const pendingWrites: PendingWrite[] = [];
let retryTimerId: ReturnType<typeof setTimeout> | null = null;
const MAX_RETRY_ATTEMPTS = 4;
// Exponential backoff delays: 5s, 10s, 20s, 40s (~75s total coverage)
const RETRY_DELAYS_MS = [5_000, 10_000, 20_000, 40_000] as const;
// Track the latest write timestamp per session to skip stale retries
const latestWriteTs = new Map<string, number>();
let cloudSyncDisabledUntil = 0;
let hasWarnedCloudUnavailable = false;

function getRetryDelay(attempt: number): number {
  const index = Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1);
  return RETRY_DELAYS_MS[Math.max(0, index)];
}

function writeKey(ownerKey: string, sessionId: string): string {
  return `${ownerKey}::${sessionId}`;
}

function readCloudUnavailableState(): CloudUnavailableState | null {
  try {
    const raw = localStorage.getItem(CLOUD_UNAVAILABLE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<CloudUnavailableState>;
    if (parsed.reason !== "missing-table" || typeof parsed.detectedAt !== "number") {
      localStorage.removeItem(CLOUD_UNAVAILABLE_KEY);
      return null;
    }

    return {
      detectedAt: parsed.detectedAt,
      reason: parsed.reason,
    };
  } catch {
    localStorage.removeItem(CLOUD_UNAVAILABLE_KEY);
    return null;
  }
}

function isCloudSyncTemporarilyUnavailable() {
  const now = Date.now();
  if (cloudSyncDisabledUntil > now) {
    return true;
  }

  const state = readCloudUnavailableState();
  if (!state) {
    cloudSyncDisabledUntil = 0;
    return false;
  }

  const disabledUntil = state.detectedAt + CLOUD_UNAVAILABLE_COOLDOWN_MS;
  if (disabledUntil <= now) {
    cloudSyncDisabledUntil = 0;
    localStorage.removeItem(CLOUD_UNAVAILABLE_KEY);
    return false;
  }

  cloudSyncDisabledUntil = disabledUntil;
  return true;
}

function clearPendingWrites() {
  pendingWrites.length = 0;
  if (retryTimerId !== null) {
    clearTimeout(retryTimerId);
    retryTimerId = null;
  }
  persistPendingQueue();
}

function markCloudSyncUnavailable() {
  const detectedAt = Date.now();
  cloudSyncDisabledUntil = detectedAt + CLOUD_UNAVAILABLE_COOLDOWN_MS;
  clearPendingWrites();

  try {
    localStorage.setItem(
      CLOUD_UNAVAILABLE_KEY,
      JSON.stringify({
        detectedAt,
        reason: "missing-table",
      } satisfies CloudUnavailableState)
    );
  } catch {
    // localStorage unavailable — keep the in-memory cooldown only
  }

  if (import.meta.env.DEV && !hasWarnedCloudUnavailable) {
    hasWarnedCloudUnavailable = true;
    console.warn(
      "[NavigationSession] Cloud sync temporarily disabled because navigation_sessions is unavailable; local session storage remains active."
    );
  }
}

function isNavigationSessionsTableMissingError(error: unknown) {
  if (!(error instanceof EdgeFunctionError) || error.status < 500) {
    return false;
  }

  const message = error.message.toLowerCase();
  return (
    message.includes("navigation_sessions") &&
    (message.includes("schema cache") ||
      message.includes("could not find the table") ||
      message.includes("does not exist"))
  );
}

function handleCloudUnavailableError(error: unknown) {
  if (!isNavigationSessionsTableMissingError(error)) {
    return false;
  }

  markCloudSyncUnavailable();
  return true;
}

// ─── Persistent queue (survives tab close / refresh) ───────────

function persistPendingQueue(): void {
  try {
    if (pendingWrites.length === 0) {
      localStorage.removeItem(PENDING_QUEUE_KEY);
      return;
    }
    localStorage.setItem(PENDING_QUEUE_KEY, JSON.stringify(pendingWrites));
  } catch (err) {
    // localStorage full or unavailable — warn for debugging visibility
    if (import.meta.env.DEV)
      console.warn(
        "[NavigationSession] Failed to persist pending writes to localStorage:",
        err instanceof Error ? err.message : "storage unavailable"
      );
  }
}

function recoverPendingQueue(): void {
  try {
    const raw = localStorage.getItem(PENDING_QUEUE_KEY);
    if (!raw) return;
    localStorage.removeItem(PENDING_QUEUE_KEY);
    const recovered: PendingWrite[] = JSON.parse(raw);
    if (!Array.isArray(recovered) || recovered.length === 0) return;
    for (const entry of recovered) {
      if (entry.ownerKey && entry.session?.id) {
        pendingWrites.push({
          ...entry,
          attempts: entry.attempts + 1,
          queuedAt: entry.queuedAt ?? Date.now(),
        });
      }
    }
    if (pendingWrites.length > 0) {
      scheduleRetry();
    }
  } catch {
    // Corrupted data — discard silently
    localStorage.removeItem(PENDING_QUEUE_KEY);
  }
}

// Persist pending writes on tab close / navigation away / mobile background
if (typeof window !== "undefined") {
  window.addEventListener("pagehide", persistPendingQueue);
  // Resume retries immediately when network connectivity is restored
  window.addEventListener("online", () => {
    if (pendingWrites.length > 0) {
      if (import.meta.env.DEV)
        console.info("[NavigationSession] Network restored — resuming pending writes");
      scheduleRetry();
    }
  });
  // Recover any writes left over from a previous session
  recoverPendingQueue();
}

function scheduleRetry() {
  if (retryTimerId !== null || pendingWrites.length === 0) return;
  // Use exponential backoff based on the lowest-attempt entry in the queue
  const minAttempts = Math.min(...pendingWrites.map((e) => e.attempts));
  const delay = getRetryDelay(minAttempts);
  retryTimerId = setTimeout(async () => {
    retryTimerId = null;
    const batch = [...pendingWrites];
    pendingWrites.length = 0;
    for (const entry of batch) {
      // Skip stale retries — a newer write for this session has already been issued
      const key = writeKey(entry.ownerKey, entry.session.id);
      const latest = latestWriteTs.get(key) ?? 0;
      if (entry.queuedAt < latest) continue;

      const ok = await writeToCloud(entry.session);
      if (!ok && entry.attempts < MAX_RETRY_ATTEMPTS) {
        pendingWrites.push({ ...entry, attempts: entry.attempts + 1 });
      }
    }
    scheduleRetry();
  }, delay);
}

// ─── localStorage helpers ──────────────────────────────────────

function lsKey(ownerKey: string, sessionId: string) {
  return `${LS_PREFIX}${ownerKey}_${sessionId}`;
}

function activeSessionKey(ownerKey: string) {
  return `${ACTIVE_SESSION_PREFIX}${ownerKey}`;
}

function shouldTrackAsActiveSession(session: NavigationSession) {
  return (
    session.status === "planning" || session.status === "active" || session.status === "paused"
  );
}

function resolveActiveSessionId(ownerKey: string) {
  try {
    return localStorage.getItem(activeSessionKey(ownerKey));
  } catch {
    return null;
  }
}

function saveToLocalStorage(ownerKey: string, session: NavigationSession) {
  try {
    const payload = { session, savedAt: Date.now() };
    localStorage.setItem(lsKey(ownerKey, session.id), JSON.stringify(payload));

    if (shouldTrackAsActiveSession(session)) {
      localStorage.setItem(activeSessionKey(ownerKey), session.id);
    } else {
      localStorage.removeItem(activeSessionKey(ownerKey));
    }
  } catch {
    // localStorage full or unavailable — non-blocking
  }
}

function loadFromLocalStorage(ownerKey: string): NavigationSession | null {
  try {
    const sessionId = resolveActiveSessionId(ownerKey);
    if (!sessionId) return null;

    const raw = localStorage.getItem(lsKey(ownerKey, sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.session || !parsed?.savedAt) return null;
    const age = Date.now() - parsed.savedAt;
    if (age > STALENESS_MS) {
      localStorage.removeItem(lsKey(ownerKey, sessionId));
      localStorage.removeItem(activeSessionKey(ownerKey));
      return null;
    }
    return parsed.session as NavigationSession;
  } catch {
    return null;
  }
}

function clearLocalStorage(ownerKey: string, sessionId?: string) {
  try {
    const resolvedSessionId = sessionId || resolveActiveSessionId(ownerKey);
    if (resolvedSessionId) {
      localStorage.removeItem(lsKey(ownerKey, resolvedSessionId));
    }

    const activeSessionId = resolveActiveSessionId(ownerKey);
    if (!sessionId || activeSessionId === sessionId) {
      localStorage.removeItem(activeSessionKey(ownerKey));
    }
  } catch {
    // non-blocking
  }
}

// ─── Cloud operations ──────────────────────────────────────────

async function writeToCloud(session: NavigationSession): Promise<boolean> {
  try {
    await requestSupabaseEdge<{ success: boolean }>(SUPABASE_EDGE_ROUTES.navigationSession, {
      body: JSON.stringify({
        session,
        sessionId: session.id,
      }),
      method: "POST",
    });
    return true;
  } catch (error) {
    if (handleCloudUnavailableError(error)) {
      return true;
    }
    return false;
  }
}

function canUseCloudSync(options?: CloudOptions) {
  return options?.enableCloud === true && !isCloudSyncTemporarilyUnavailable();
}

// ─── Public API ────────────────────────────────────────────────

export async function fetchNavigationSession(
  ownerKey: string,
  options?: CloudOptions
): Promise<NavigationSession | null> {
  if (canUseCloudSync(options)) {
    try {
      const data = await requestSupabaseEdge<{
        session?: NavigationSession | null;
        sessionId?: string | null;
      }>(SUPABASE_EDGE_ROUTES.navigationSession, { method: "GET" });

      if (data?.session) {
        saveToLocalStorage(ownerKey, data.session);
        return data.session;
      }
    } catch (error) {
      if (handleCloudUnavailableError(error)) {
        return loadFromLocalStorage(ownerKey);
      }
      // Fall through to localStorage cache recovery
    }
  }

  return loadFromLocalStorage(ownerKey);
}

export async function saveNavigationSessionToCloud(
  ownerKey: string,
  session: NavigationSession,
  options?: CloudOptions
): Promise<boolean> {
  // Always cache locally first (instant durability)
  saveToLocalStorage(ownerKey, session);

  if (!canUseCloudSync(options)) {
    return true;
  }

  const now = Date.now();
  latestWriteTs.set(writeKey(ownerKey, session.id), now);

  const ok = await writeToCloud(session);
  if (!ok) {
    // Queue for background retry instead of silently failing
    pendingWrites.push({ ownerKey, session, attempts: 1, queuedAt: now });
    scheduleRetry();
    if (import.meta.env.DEV)
      console.warn("[NavigationSession] Cloud save failed — queued for retry");
  }
  return ok;
}

export async function deleteNavigationSessionFromCloud(
  ownerKey: string,
  sessionId: string,
  options?: CloudOptions
): Promise<boolean> {
  clearLocalStorage(ownerKey, sessionId);

  if (!canUseCloudSync(options)) {
    return true;
  }

  try {
    await requestSupabaseEdge<{ success: boolean }>(SUPABASE_EDGE_ROUTES.navigationSession, {
      body: JSON.stringify({ sessionId }),
      method: "DELETE",
    });
    return true;
  } catch (error) {
    if (handleCloudUnavailableError(error)) {
      return true;
    }
    return false;
  }
}
