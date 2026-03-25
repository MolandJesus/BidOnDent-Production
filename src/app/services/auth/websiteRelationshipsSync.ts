import type { WebsiteIdentity, WebsiteSessionMemory } from "./websiteIdentity";
import {
  buildSupabaseEdgeHeaders,
  buildSupabaseFunctionUrl,
  SUPABASE_EDGE_ROUTES,
} from "../supabase/runtime";

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

function buildHeaders() {
  return buildSupabaseEdgeHeaders();
}

function toNumericCollection(values: unknown) {
  return Array.isArray(values)
    ? [...new Set(values.map((value) => Number(value)).filter((value) => Number.isFinite(value)))]
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
    updatedAt: sessionMemory.updatedAt,
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

async function withTimeout<T>(promise: Promise<T>, timeoutMs = SYNC_TIMEOUT_MS): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error("Website relationships request timed out"));
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

export async function fetchWebsiteRelationshipCollectionsFromCloud(identity: WebsiteIdentity) {
  if (typeof window === "undefined") {
    return null;
  }

  const url = new URL(WEBSITE_RELATIONSHIPS_ENDPOINT);
  url.searchParams.set("websiteUserKey", identity.websiteUserKey);

  try {
    const response = await withTimeout(
      fetch(url.toString(), {
        headers: buildHeaders(),
        method: "GET",
      })
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch website relationships: ${response.status}`);
    }

    const payload = await response.json();
    const collections = payload?.collections || {};

    const nextCollections = {
      connectedInsurerIds: toNumericCollection(collections.connectedInsurerIds),
      customerSavedShopIds: toNumericCollection(collections.customerSavedShopIds),
      insurerShortlistIds: toNumericCollection(collections.insurerShortlistIds),
      shopWatchlistIds: toNumericCollection(collections.shopWatchlistIds),
      updatedAt: payload?.updatedAt || null,
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

  return {
    ...sessionMemory,
    updatedAt: collections.updatedAt || sessionMemory.updatedAt,
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
            collections.updatedAt || sessionMemory.mapSession.updatedAt || sessionMemory.updatedAt,
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
    const response = await withTimeout(
      fetch(WEBSITE_RELATIONSHIPS_ENDPOINT, {
        body: JSON.stringify({
          accountType,
          collections,
          identity,
        }),
        headers: buildHeaders(),
        method: "POST",
      })
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
