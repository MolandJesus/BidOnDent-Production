import type { MapSessionMemory } from "../../types/mapDomain";
import { queueWebsiteSessionMemorySync } from "./websitePreferencesSync";
import { queueWebsiteRelationshipCollectionsSync } from "./websiteRelationshipsSync";
import {
  DEFAULT_MEMORY,
  deepEqual,
  sanitizeMemory,
  sanitizeWebsiteSessionMemory,
} from "./websiteIdentitySanitizers";

export type AuthProvider = "clerk" | "supabase" | "custom" | "anonymous";

export interface WebsiteIdentity {
  provider: AuthProvider;
  providerUserId: string | null;
  normalizedEmail: string;
  displayName: string;
  websiteUserKey: string;
  sessionId: string;
}

export type ShopSortOption = "smart-match" | "rating" | "reviews" | "distance";

export interface ShopDirectoryMemory {
  searchQuery: string;
  filterRating: number;
  sortBy: ShopSortOption;
  lastViewedShopId: number | null;
  sessionIntelligenceOpen: boolean;
}

export interface InsuranceConnectionMemory {
  connectedInsurerIds: number[];
  draftPolicyNumber: string;
  draftClaimNumber: string;
  lastSelectedInsurerId: number | null;
}

export interface WebsiteSessionMemory {
  updatedAt: string;
  shopDirectory: ShopDirectoryMemory;
  insuranceConnection: InsuranceConnectionMemory;
  mapSession?: MapSessionMemory;
}

export interface WebsiteSessionMemoryPatch {
  updatedAt?: string;
  shopDirectory?: Partial<ShopDirectoryMemory>;
  insuranceConnection?: Partial<InsuranceConnectionMemory>;
  mapSession?: Partial<MapSessionMemory>;
}

type WebsiteAccountType = "customer" | "shop" | "insurer";

const WEBSITE_SESSION_PREFIX = "bidondent_website_session";
const WEBSITE_MEMORY_PREFIX = "bidondent_website_memory";
const SESSION_ID_PREFIX = "session-";
const SESSION_ID_PATTERN = /^session-[a-z0-9]+$/;

function normalizeEmail(email?: string | null) {
  return email?.trim().toLowerCase() || "";
}

function hashValue(value: string) {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }

  return Math.abs(hash).toString(36);
}

function buildSessionStorageKey(websiteUserKey: string) {
  return `${WEBSITE_SESSION_PREFIX}:${websiteUserKey}`;
}

function buildMemoryStorageKey(websiteUserKey: string) {
  return `${WEBSITE_MEMORY_PREFIX}:${websiteUserKey}`;
}

function dispatchWebsiteMemoryEvent(websiteUserKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(
    new CustomEvent("bidondent:website-memory-updated", {
      detail: { websiteUserKey },
    })
  );
}

function persistWebsiteSessionMemory(
  identity: WebsiteIdentity | null | undefined,
  nextMemory: WebsiteSessionMemory
) {
  if (!identity || typeof window === "undefined") {
    return nextMemory;
  }

  try {
    window.localStorage.setItem(
      buildMemoryStorageKey(identity.websiteUserKey),
      JSON.stringify(nextMemory)
    );
    dispatchWebsiteMemoryEvent(identity.websiteUserKey);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error saving website session memory:", error);
  }

  return nextMemory;
}

function clearStoredWebsiteSessionMemory(identity: WebsiteIdentity | null | undefined) {
  if (!identity || typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(buildMemoryStorageKey(identity.websiteUserKey));
    dispatchWebsiteMemoryEvent(identity.websiteUserKey);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error clearing website session memory:", error);
  }
}

function getOrCreateSessionId(websiteUserKey: string, sessionHint?: string | null) {
  if (typeof window === "undefined") {
    return `${SESSION_ID_PREFIX}${hashValue(`${websiteUserKey}:${sessionHint || "server"}`)}`;
  }

  const storageKey = buildSessionStorageKey(websiteUserKey);
  try {
    const existingSessionId = window.sessionStorage.getItem(storageKey);

    if (typeof existingSessionId === "string" && SESSION_ID_PATTERN.test(existingSessionId)) {
      return existingSessionId;
    }

    if (existingSessionId !== null) {
      window.sessionStorage.removeItem(storageKey);
    }
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error reading website session ID:", error);
  }

  const generatedSessionId = `${SESSION_ID_PREFIX}${hashValue(
    `${websiteUserKey}:${sessionHint || ""}:${Date.now().toString(36)}:${Math.random()}`
  )}`;

  try {
    window.sessionStorage.setItem(storageKey, generatedSessionId);
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error saving website session ID:", error);
  }

  return generatedSessionId;
}

export { sanitizeWebsiteSessionMemory };

export function buildWebsiteIdentity({
  provider = "anonymous",
  providerUserId,
  email,
  displayName,
  sessionHint,
}: {
  provider?: AuthProvider;
  providerUserId?: string | null;
  email?: string | null;
  displayName?: string | null;
  sessionHint?: string | null;
}): WebsiteIdentity {
  const normalized = normalizeEmail(email);
  const stableAccountSeed = normalized || `${provider}:${providerUserId || "guest"}`;
  const websiteUserKey = `website-user-${hashValue(stableAccountSeed)}`;

  return {
    provider,
    providerUserId: providerUserId || null,
    normalizedEmail: normalized,
    displayName: displayName?.trim() || "BidOnDent user",
    websiteUserKey,
    sessionId: getOrCreateSessionId(websiteUserKey, sessionHint),
  };
}

export function loadWebsiteSessionMemory(identity?: WebsiteIdentity | null): WebsiteSessionMemory {
  if (!identity || typeof window === "undefined") {
    return DEFAULT_MEMORY;
  }

  try {
    const rawMemory = window.localStorage.getItem(buildMemoryStorageKey(identity.websiteUserKey));

    if (!rawMemory) {
      return DEFAULT_MEMORY;
    }

    const parsedMemory: unknown = JSON.parse(rawMemory);
    const sanitizedMemory = sanitizeMemory(parsedMemory);

    if (!deepEqual(parsedMemory, sanitizedMemory)) {
      persistWebsiteSessionMemory(identity, sanitizedMemory);
    }

    return sanitizedMemory;
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error loading website session memory:", error);
    clearStoredWebsiteSessionMemory(identity);
    return DEFAULT_MEMORY;
  }
}

export function replaceWebsiteSessionMemory(
  identity: WebsiteIdentity | null | undefined,
  nextMemory: WebsiteSessionMemory
) {
  return persistWebsiteSessionMemory(identity, sanitizeWebsiteSessionMemory(nextMemory));
}

export function updateWebsiteSessionMemory(
  identity: WebsiteIdentity | null | undefined,
  patch:
    | WebsiteSessionMemoryPatch
    | ((currentMemory: WebsiteSessionMemory) => WebsiteSessionMemoryPatch),
  options?: {
    accountType?: WebsiteAccountType;
  }
) {
  const currentMemory = loadWebsiteSessionMemory(identity);
  const partialMemory = typeof patch === "function" ? patch(currentMemory) : patch;

  const nextMemory = sanitizeMemory({
    ...currentMemory,
    ...partialMemory,
    updatedAt: new Date().toISOString(),
    shopDirectory: {
      ...currentMemory.shopDirectory,
      ...(partialMemory.shopDirectory || {}),
    },
    insuranceConnection: {
      ...currentMemory.insuranceConnection,
      ...(partialMemory.insuranceConnection || {}),
    },
    mapSession: {
      ...currentMemory.mapSession,
      ...(partialMemory.mapSession || {}),
      updatedAt: new Date().toISOString(),
    },
  });

  persistWebsiteSessionMemory(identity, nextMemory);

  if (identity) {
    queueWebsiteSessionMemorySync({
      accountType: options?.accountType,
      identity,
      sessionMemory: nextMemory,
    });
    queueWebsiteRelationshipCollectionsSync({
      accountType: options?.accountType,
      identity,
      sessionMemory: nextMemory,
    });
  }

  return nextMemory;
}
