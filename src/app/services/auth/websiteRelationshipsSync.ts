import type { WebsiteIdentity, WebsiteSessionMemory } from "./websiteIdentity";
import {
  buildSupabaseEdgeHeadersAsync,
  buildSupabaseFunctionUrl,
  SUPABASE_EDGE_ROUTES,
} from "../supabase/runtime";
import { createTimeoutAbortController } from "../navigation/requestTimeout";

type WebsiteAccountType = "customer" | "shop" | "insurer";

type SyncPayload = {
  accountType?: WebsiteAccountType;
  identity: WebsiteIdentity;
  sessionMemory: WebsiteSessionMemory;
};

export interface WebsiteRelationshipCollections {
  connectedInsurerIds: number[];
  customerSavedShopIds: number[];
  insurerShortlistIds: number[];
  shopWatchlistIds: number[];
  updatedAt?: string | null;
}

const WEBSITE_RELATIONSHIPS_ENDPOINT = buildSupabaseFunctionUrl(
  SUPABASE_EDGE_ROUTES.websiteRelationships
);
const SYNC_TIMEOUT_MS = 5000;
const pendingSyncTimers = new Map<string, number>();
const queuedCollectionSignatures = new Map<string, string>();
const savedCollectionSignatures = new Map<string, string>();

async function buildHeaders() {
  return await buildSupabaseEdgeHeadersAsync();
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isValidRelationshipId(value: number) {
  return Number.isInteger(value) && value > 0;
}

function toOptionalTimestampString(value: unknown) {
  return typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : null;
}

function toNumericCollection(values: unknown) {
  return Array.isArray(values)
    ? [
        ...new Set(
          values.map((value) => Number(value)).filter((value) => isValidRelationshipId(value))
        ),
      ]
    : [];
}

export function extractRelationshipCollections(
  sessionMemory: WebsiteSessionMemory
): WebsiteRelationshipCollections {
  return {
    connectedInsurerIds: toNumericCollection(sessionMemory.insuranceConnection.connectedInsurerIds),
    customerSavedShopIds: toNumericCollection(sessionMemory.mapSession?.customerSavedShopIds),
    insurerShortlistIds: toNumericCollection(sessionMemory.mapSession?.insurerShortlistIds),
    shopWatchlistIds: toNumericCollection(sessionMemory.mapSession?.shopWatchlistIds),
    updatedAt: toOptionalTimestampString(sessionMemory.updatedAt),
  };
}

function buildCollectionSignature(collections: WebsiteRelationshipCollections) {
  return JSON.stringify({
    connectedInsurerIds: [...collections.connectedInsurerIds].sort((left, right) => left - right),
    customerSavedShopIds: [...collections.customerSavedShopIds].sort((left, right) => left - right),
    insurerShortlistIds: [...collections.insurerShortlistIds].sort((left, right) => left - right),
    shopWatchlistIds: [...collections.shopWatchlistIds].sort((left, right) => left - right),
  });
}

function areCollectionsEmpty(collections: WebsiteRelationshipCollections) {
  return (
    collections.connectedInsurerIds.length === 0 &&
    collections.customerSavedShopIds.length === 0 &&
    collections.insurerShortlistIds.length === 0 &&
    collections.shopWatchlistIds.length === 0
  );
}

/**
 * Pass 15 (audit AI) — auth-sync canonical timeout migration.
 * Same migration as `websitePreferencesSync.ts`: replaces the prior
 * `Promise.race`-style wrapper (soft resource leak — fetch continued
 * after timeout) with the canonical `createTimeoutAbortController`
 * pattern (proper fetch abort via signal). 5s ceiling preserved.
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
      throw new Error("Website relationships request timed out");
    }
    throw error;
  } finally {
    request.clear();
  }
}

export async function fetchWebsiteRelationshipCollectionsFromCloud(identity: WebsiteIdentity) {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(WEBSITE_RELATIONSHIPS_ENDPOINT);
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
      throw new Error(`Failed to fetch website relationships: ${response.status}`);
    }

    const payload: unknown = await response.json();
    const payloadRecord = isRecord(payload) ? payload : null;
    const collections =
      payloadRecord && isRecord(payloadRecord.collections) ? payloadRecord.collections : {};

    const nextCollections = {
      connectedInsurerIds: toNumericCollection(collections.connectedInsurerIds),
      customerSavedShopIds: toNumericCollection(collections.customerSavedShopIds),
      insurerShortlistIds: toNumericCollection(collections.insurerShortlistIds),
      shopWatchlistIds: toNumericCollection(collections.shopWatchlistIds),
      updatedAt: toOptionalTimestampString(payloadRecord?.updatedAt),
    } satisfies WebsiteRelationshipCollections;

    savedCollectionSignatures.set(
      identity.websiteUserKey,
      buildCollectionSignature(nextCollections)
    );
    return nextCollections;
  } catch (error) {
    if (import.meta.env.DEV)
      console.error("Error fetching website relationships from cloud:", error);
    return null;
  }
}

export function mergeRelationshipCollectionsIntoSessionMemory(
  sessionMemory: WebsiteSessionMemory,
  collections?: WebsiteRelationshipCollections | null
): WebsiteSessionMemory {
  if (!collections) {
    return sessionMemory;
  }

  const normalizedUpdatedAt = toOptionalTimestampString(collections.updatedAt);

  return {
    ...sessionMemory,
    updatedAt: normalizedUpdatedAt || sessionMemory.updatedAt,
    insuranceConnection: {
      ...sessionMemory.insuranceConnection,
      connectedInsurerIds: collections.connectedInsurerIds,
    },
    mapSession: sessionMemory.mapSession
      ? {
          ...sessionMemory.mapSession,
          customerSavedShopIds: collections.customerSavedShopIds,
          insurerShortlistIds: collections.insurerShortlistIds,
          shopWatchlistIds: collections.shopWatchlistIds,
          updatedAt:
            normalizedUpdatedAt || sessionMemory.mapSession.updatedAt || sessionMemory.updatedAt,
        }
      : undefined,
  };
}

export async function saveWebsiteRelationshipCollectionsToCloud({
  accountType,
  identity,
  sessionMemory,
}: SyncPayload) {
  if (typeof window === "undefined") {
    return false;
  }

  const collections = extractRelationshipCollections(sessionMemory);

  try {
    const response = await withTimeout(async (signal) =>
      fetch(WEBSITE_RELATIONSHIPS_ENDPOINT, {
        body: JSON.stringify({
          accountType,
          collections,
          identity,
        }),
        headers: await buildHeaders(),
        method: "POST",
        signal,
      }),
    );

    if (!response.ok) {
      throw new Error(`Failed to save website relationships: ${response.status}`);
    }

    savedCollectionSignatures.set(identity.websiteUserKey, buildCollectionSignature(collections));
    return true;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error saving website relationships to cloud:", error);
    return false;
  }
}

export function queueWebsiteRelationshipCollectionsSync(payload: SyncPayload) {
  if (typeof window === "undefined") {
    return;
  }

  const collections = extractRelationshipCollections(payload.sessionMemory);
  const signature = buildCollectionSignature(collections);
  const savedSignature = savedCollectionSignatures.get(payload.identity.websiteUserKey);

  if (signature === savedSignature) {
    return;
  }

  const existingTimer = pendingSyncTimers.get(payload.identity.websiteUserKey);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  queuedCollectionSignatures.set(payload.identity.websiteUserKey, signature);

  const timerId = window.setTimeout(async () => {
    pendingSyncTimers.delete(payload.identity.websiteUserKey);
    const latestSignature = queuedCollectionSignatures.get(payload.identity.websiteUserKey);

    if (!latestSignature || latestSignature !== signature) {
      return;
    }

    if (areCollectionsEmpty(collections) && savedSignature === signature) {
      return;
    }

    const didSave = await saveWebsiteRelationshipCollectionsToCloud(payload);
    if (didSave) {
      queuedCollectionSignatures.delete(payload.identity.websiteUserKey);
    }
  }, 900);

  pendingSyncTimers.set(payload.identity.websiteUserKey, timerId);
}
