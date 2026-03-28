import type { WebsiteIdentity, WebsiteSessionMemory } from "./websiteIdentity";
import {
  buildSupabaseEdgeHeadersAsync,
  buildSupabaseFunctionUrl,
  SUPABASE_EDGE_ROUTES,
} from "../supabase/runtime";

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

async function withTimeout<T>(promise: Promise<T>, timeoutMs = SYNC_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Website preferences request timed out"));
    }, timeoutMs);

    promise
      .then((value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      })
      .catch((error) => {
        window.clearTimeout(timeoutId);
        reject(error);
      });
  });
}

export async function fetchWebsiteSessionMemoryFromCloud(identity: WebsiteIdentity) {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(WEBSITE_PREFERENCES_ENDPOINT);
  url.searchParams.set("websiteUserKey", identity.websiteUserKey);

  try {
    const response = await withTimeout(
      fetch(url.toString(), {
        headers: await buildHeaders(),
        method: "GET",
      })
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch website preferences: ${response.status}`);
    }

    const payload = await response.json();
    return payload?.preferences?.session_memory || null;
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
    const response = await withTimeout(
      fetch(WEBSITE_PREFERENCES_ENDPOINT, {
        body: JSON.stringify({
          accountType,
          identity,
          sessionMemory,
        }),
        headers: await buildHeaders(),
        method: "POST",
      })
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
