// navigationSessionCloudService.ts
// Service for Supabase-backed navigation session sync
// with localStorage fallback + background retry

import { supabase } from "../supabaseService";
import type { ExternalNavigationSession } from "../../types/navigation";

const TABLE = "navigation_sessions";
const LS_PREFIX = "bidondent_nav_session_";
const STALENESS_MS = 24 * 60 * 60 * 1000; // 24 hours
const PENDING_QUEUE_KEY = "bidondent_nav_pending_writes";

// ─── Retry queue (in-memory, non-blocking) ─────────────────────

type PendingWrite = {
  userId: string;
  sessionId: string;
  session: ExternalNavigationSession;
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

function getRetryDelay(attempt: number): number {
  const index = Math.min(attempt - 1, RETRY_DELAYS_MS.length - 1);
  return RETRY_DELAYS_MS[Math.max(0, index)];
}

function writeKey(userId: string, sessionId: string): string {
  return `${userId}::${sessionId}`;
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
      if (entry.userId && entry.sessionId && entry.session) {
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
      const key = writeKey(entry.userId, entry.sessionId);
      const latest = latestWriteTs.get(key) ?? 0;
      if (entry.queuedAt < latest) continue;

      const ok = await writeToCloud(entry.userId, entry.sessionId, entry.session);
      if (!ok && entry.attempts < MAX_RETRY_ATTEMPTS) {
        pendingWrites.push({ ...entry, attempts: entry.attempts + 1 });
      }
    }
    scheduleRetry();
  }, delay);
}

// ─── localStorage helpers ──────────────────────────────────────

function lsKey(userId: string, sessionId: string) {
  return `${LS_PREFIX}${userId}_${sessionId}`;
}

function saveToLocalStorage(userId: string, sessionId: string, session: ExternalNavigationSession) {
  try {
    const payload = { session, savedAt: Date.now() };
    localStorage.setItem(lsKey(userId, sessionId), JSON.stringify(payload));
  } catch {
    // localStorage full or unavailable — non-blocking
  }
}

function loadFromLocalStorage(userId: string, sessionId: string): ExternalNavigationSession | null {
  try {
    const raw = localStorage.getItem(lsKey(userId, sessionId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.session || !parsed?.savedAt) return null;
    const age = Date.now() - parsed.savedAt;
    if (age > STALENESS_MS) {
      localStorage.removeItem(lsKey(userId, sessionId));
      return null;
    }
    return parsed.session as ExternalNavigationSession;
  } catch {
    return null;
  }
}

function clearLocalStorage(userId: string, sessionId: string) {
  try {
    localStorage.removeItem(lsKey(userId, sessionId));
  } catch {
    // non-blocking
  }
}

// ─── Cloud operations ──────────────────────────────────────────

async function writeToCloud(
  userId: string,
  sessionId: string,
  session: ExternalNavigationSession
): Promise<boolean> {
  try {
    const { error } = await supabase.from(TABLE).upsert(
      {
        user_id: userId,
        session_id: sessionId,
        session_data: session,
        updated_at: new Date().toISOString(),
      },
      { onConflict: ["user_id", "session_id"] }
    );
    return !error;
  } catch {
    return false;
  }
}

// ─── Public API ────────────────────────────────────────────────

export async function fetchNavigationSession(
  userId: string,
  sessionId: string
): Promise<ExternalNavigationSession | null> {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select("session_data")
      .eq("user_id", userId)
      .eq("session_id", sessionId)
      .single();
    if (!error && data) {
      // Update localStorage cache with cloud truth
      saveToLocalStorage(userId, sessionId, data.session_data as ExternalNavigationSession);
      return data.session_data as ExternalNavigationSession;
    }
  } catch {
    // Supabase unreachable — fall through to localStorage
  }
  // Fallback: try localStorage (cache recovery)
  return loadFromLocalStorage(userId, sessionId);
}

export async function saveNavigationSessionToCloud(
  userId: string,
  sessionId: string,
  session: ExternalNavigationSession
): Promise<boolean> {
  // Always cache locally first (instant durability)
  saveToLocalStorage(userId, sessionId, session);

  const now = Date.now();
  latestWriteTs.set(writeKey(userId, sessionId), now);

  const ok = await writeToCloud(userId, sessionId, session);
  if (!ok) {
    // Queue for background retry instead of silently failing
    pendingWrites.push({ userId, sessionId, session, attempts: 1, queuedAt: now });
    scheduleRetry();
    console.warn("[NavigationSession] Cloud save failed — queued for retry");
  }
  return ok;
}

export async function deleteNavigationSessionFromCloud(
  userId: string,
  sessionId: string
): Promise<boolean> {
  clearLocalStorage(userId, sessionId);
  try {
    const { error } = await supabase
      .from(TABLE)
      .delete()
      .eq("user_id", userId)
      .eq("session_id", sessionId);
    return !error;
  } catch {
    return false;
  }
}
