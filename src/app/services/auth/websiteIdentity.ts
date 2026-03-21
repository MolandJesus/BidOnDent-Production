import type { MapSessionMemory } from "../../types/mapDomain";
import { queueWebsiteSessionMemorySync } from "./websitePreferencesSync";
import { queueWebsiteRelationshipCollectionsSync } from "./websiteRelationshipsSync";

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

const DEFAULT_MAP_SESSION: MapSessionMemory = {
  savedPlaces: [],
  recentSearches: [],
  customerSavedShopIds: [],
  shopWatchlistIds: [],
  insurerShortlistIds: [],
  mapViewMode: "hybrid",
  mapTheme: "light",
  selectedRouteId: "fastest",
  showClusters: true,
  clusterLevel: "balanced",
  updatedAt: new Date(0).toISOString(),
};

const DEFAULT_MEMORY: WebsiteSessionMemory = {
  updatedAt: new Date(0).toISOString(),
  shopDirectory: {
    searchQuery: "",
    filterRating: 0,
    sortBy: "smart-match",
    lastViewedShopId: null,
  },
  insuranceConnection: {
    connectedInsurerIds: [],
    draftPolicyNumber: "",
    draftClaimNumber: "",
    lastSelectedInsurerId: null,
  },
  mapSession: DEFAULT_MAP_SESSION,
};

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
    console.error("Error saving website session memory:", error);
  }

  return nextMemory;
}

function getOrCreateSessionId(websiteUserKey: string, sessionHint?: string | null) {
  if (typeof window === "undefined") {
    return `session-${hashValue(`${websiteUserKey}:${sessionHint || "server"}`)}`;
  }

  const storageKey = buildSessionStorageKey(websiteUserKey);
  const existingSessionId = window.sessionStorage.getItem(storageKey);

  if (existingSessionId) {
    return existingSessionId;
  }

  const generatedSessionId = `session-${hashValue(
    `${websiteUserKey}:${sessionHint || ""}:${Date.now().toString(36)}:${Math.random()}`
  )}`;

  window.sessionStorage.setItem(storageKey, generatedSessionId);
  return generatedSessionId;
}

function sanitizeMemory(memory?: WebsiteSessionMemoryPatch | WebsiteSessionMemory | null): WebsiteSessionMemory {
  return {
    updatedAt: memory?.updatedAt || DEFAULT_MEMORY.updatedAt,
    shopDirectory: {
      searchQuery: memory?.shopDirectory?.searchQuery || "",
      filterRating: memory?.shopDirectory?.filterRating || 0,
      sortBy: memory?.shopDirectory?.sortBy || "smart-match",
      lastViewedShopId: memory?.shopDirectory?.lastViewedShopId ?? null,
    },
    insuranceConnection: {
      connectedInsurerIds: Array.isArray(memory?.insuranceConnection?.connectedInsurerIds)
        ? memory?.insuranceConnection?.connectedInsurerIds
        : [],
      draftPolicyNumber: memory?.insuranceConnection?.draftPolicyNumber || "",
      draftClaimNumber: memory?.insuranceConnection?.draftClaimNumber || "",
      lastSelectedInsurerId: memory?.insuranceConnection?.lastSelectedInsurerId ?? null,
    },
    mapSession: {
      ...DEFAULT_MAP_SESSION,
      ...(memory?.mapSession || {}),
      savedPlaces: Array.isArray(memory?.mapSession?.savedPlaces)
        ? memory?.mapSession?.savedPlaces
        : DEFAULT_MAP_SESSION.savedPlaces,
      recentSearches: Array.isArray(memory?.mapSession?.recentSearches)
        ? memory?.mapSession?.recentSearches
        : DEFAULT_MAP_SESSION.recentSearches,
      customerSavedShopIds: Array.isArray(memory?.mapSession?.customerSavedShopIds)
        ? memory?.mapSession?.customerSavedShopIds
        : DEFAULT_MAP_SESSION.customerSavedShopIds,
      shopWatchlistIds: Array.isArray(memory?.mapSession?.shopWatchlistIds)
        ? memory?.mapSession?.shopWatchlistIds
        : DEFAULT_MAP_SESSION.shopWatchlistIds,
      insurerShortlistIds: Array.isArray(memory?.mapSession?.insurerShortlistIds)
        ? memory?.mapSession?.insurerShortlistIds
        : DEFAULT_MAP_SESSION.insurerShortlistIds,
      updatedAt: memory?.mapSession?.updatedAt || DEFAULT_MAP_SESSION.updatedAt,
    },
  };
}

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

    return sanitizeMemory(JSON.parse(rawMemory));
  } catch (error) {
    console.error("Error loading website session memory:", error);
    return DEFAULT_MEMORY;
  }
}

export function replaceWebsiteSessionMemory(
  identity: WebsiteIdentity | null | undefined,
  nextMemory: WebsiteSessionMemory
) {
  return persistWebsiteSessionMemory(identity, sanitizeMemory(nextMemory));
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
