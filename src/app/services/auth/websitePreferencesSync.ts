import {
  sanitizeWebsiteSessionMemory,
  type WebsiteIdentity,
  type WebsiteSessionMemory,
} from "./websiteIdentity";
import {
  buildSupabaseEdgeHeadersAsync,
  buildSupabaseFunctionUrl,
  SUPABASE_EDGE_ROUTES,
} from "../supabase/runtime";
import { createTimeoutAbortController } from "../navigation/requestTimeout";

type SyncPayload = {
  accountType?: "customer" | "shop" | "insurer";
  identity: WebsiteIdentity;
  sessionMemory: WebsiteSessionMemory;
};

const WEBSITE_PREFERENCES_ENDPOINT = buildSupabaseFunctionUrl(
  SUPABASE_EDGE_ROUTES.websitePreferences
);
const SYNC_TIMEOUT_MS = 5000;
const pendingSyncTimers = new Map<string, number>();

async function buildHeaders() {
  return await buildSupabaseEdgeHeadersAsync();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/**
 * Pass 15 (audit AI) — auth-sync canonical timeout migration.
 *
 * The previous local `withTimeout` helper used a `Promise.race`-style
 * wrapper that rejected the awaited Promise on timeout but did NOT abort
 * the underlying fetch — leaving a soft resource leak (network request
 * continued until server response, even though the consumer had moved on).
 *
 * Migrated to the canonical `createTimeoutAbortController` pattern shipped
 * across Pass 14 (services/supabase/map.ts, services/networkProfiles.ts,
 * services/supabase/runtime.ts, services/supabase/edgeFunctions.ts,
 * services/supabase/adminIntake.ts, components/landing/WaitlistCapture.tsx)
 * so the abort signal propagates to fetch and the network request is
 * actually canceled. Same 5s ceiling preserved.
 */
async function withTimeout<T>(
  fetchFactory: (signal: AbortSignal) => Promise<T>,
  timeoutMs = SYNC_TIMEOUT_MS,
): Promise<T> {
  const request = createTimeoutAbortController(timeoutMs);
  try {
    return await fetchFactory(request.controller.signal);
  } catch (error) {
    if (request.didTimeout()) {
      throw new Error("Website preferences request timed out");
    }
    throw error;
  } finally {
    request.clear();
  }
}

export async function fetchWebsiteSessionMemoryFromCloud(identity: WebsiteIdentity) {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(WEBSITE_PREFERENCES_ENDPOINT);
  url.searchParams.set("websiteUserKey", identity.websiteUserKey);

  try {
    const response = await withTimeout(async (signal) =>
      fetch(url.toString(), {
        headers: await buildHeaders(),
        method: "GET",
        signal,
      }),
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch website preferences: ${response.status}`);
    }

    const payload: unknown = await response.json();
    const payloadRecord = isRecord(payload) ? payload : null;
    const preferences =
      payloadRecord && isRecord(payloadRecord.preferences) ? payloadRecord.preferences : null;
    const sessionMemory = preferences?.session_memory;

    return sessionMemory ? sanitizeWebsiteSessionMemory(sessionMemory) : null;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error fetching website preferences from cloud:", error);
    return null;
  }
}

export async function saveWebsiteSessionMemoryToCloud({
  accountType,
  identity,
  sessionMemory,
}: SyncPayload) {
  if (typeof window === "undefined") {
    return false;
  }

  try {
    const response = await withTimeout(async (signal) =>
      fetch(WEBSITE_PREFERENCES_ENDPOINT, {
        body: JSON.stringify({
          accountType,
          identity,
          sessionMemory,
        }),
        headers: await buildHeaders(),
        method: "POST",
        signal,
      }),
    );

    if (!response.ok) {
      throw new Error(`Failed to save website preferences: ${response.status}`);
    }

    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error saving website preferences to cloud:", error);
    return false;
  }
}

export function queueWebsiteSessionMemorySync(payload: SyncPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const existingTimer = pendingSyncTimers.get(payload.identity.websiteUserKey);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const timerId = window.setTimeout(async () => {
    pendingSyncTimers.delete(payload.identity.websiteUserKey);
    await saveWebsiteSessionMemoryToCloud(payload);
  }, 900);

  pendingSyncTimers.set(payload.identity.websiteUserKey, timerId);
}
