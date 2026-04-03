import type { MapSessionMemory, RecentSearch, SavedPlace } from "../../types/mapDomain";
import type { WebsiteSessionMemory } from "./websiteIdentity";
import {
  CLUSTER_LEVELS,
  MAP_THEMES,
  MAP_VIEW_MODES,
  SHOP_SORT_OPTIONS,
  deepEqual,
  isAllowedValue,
  isFiniteNumber,
  isNonEmptyString,
  isRecord,
  isValidTimestamp,
  sanitizeCoordinates,
  sanitizeNumericCollection,
  sanitizeNullablePositiveInteger,
  sanitizePlace,
  sanitizeRecentSearch,
  sanitizeSavedPlace,
  sanitizeSearchFilters,
  sanitizePositiveInteger,
  sanitizeViewportBounds,
} from "./websiteIdentitySanitizerUtils";

export { deepEqual };

// ── Default values ──────────────────────────────────────────────────

export const DEFAULT_MAP_SESSION: MapSessionMemory = {
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

export const DEFAULT_MEMORY: WebsiteSessionMemory = {
  updatedAt: new Date(0).toISOString(),
  shopDirectory: {
    searchQuery: "",
    filterRating: 0,
    sortBy: "smart-match",
    lastViewedShopId: null,
    sessionIntelligenceOpen: false,
  },
  insuranceConnection: {
    connectedInsurerIds: [],
    draftPolicyNumber: "",
    draftClaimNumber: "",
    lastSelectedInsurerId: null,
  },
  mapSession: DEFAULT_MAP_SESSION,
};

// ── Main sanitizer ──────────────────────────────────────────────────

export function sanitizeMemory(memory?: unknown): WebsiteSessionMemory {
  const parsedMemory = isRecord(memory) ? memory : null;
  const shopDirectory = isRecord(parsedMemory?.shopDirectory) ? parsedMemory.shopDirectory : null;
  const insuranceConnection = isRecord(parsedMemory?.insuranceConnection)
    ? parsedMemory.insuranceConnection
    : null;
  const mapSession = isRecord(parsedMemory?.mapSession) ? parsedMemory.mapSession : null;
  const lastSearchOrigin = sanitizePlace(mapSession?.lastSearchOrigin);
  const lastSearchFilters = sanitizeSearchFilters(mapSession?.lastSearchFilters);
  const lastViewedShopId = sanitizePositiveInteger(mapSession?.lastViewedShopId);
  const selectedRouteId = isNonEmptyString(mapSession?.selectedRouteId)
    ? mapSession.selectedRouteId
    : undefined;
  const lastMapCenter = sanitizeCoordinates(mapSession?.lastMapCenter);
  const lastMapZoom =
    isFiniteNumber(mapSession?.lastMapZoom) &&
    mapSession.lastMapZoom >= 0 &&
    mapSession.lastMapZoom <= 24
      ? mapSession.lastMapZoom
      : undefined;
  const lastViewportBounds = sanitizeViewportBounds(mapSession?.lastViewportBounds);

  return {
    updatedAt: isValidTimestamp(parsedMemory?.updatedAt)
      ? parsedMemory.updatedAt
      : DEFAULT_MEMORY.updatedAt,
    shopDirectory: {
      searchQuery:
        typeof shopDirectory?.searchQuery === "string"
          ? shopDirectory.searchQuery
          : DEFAULT_MEMORY.shopDirectory.searchQuery,
      filterRating:
        isFiniteNumber(shopDirectory?.filterRating) &&
        shopDirectory.filterRating >= 0 &&
        shopDirectory.filterRating <= 5
          ? shopDirectory.filterRating
          : DEFAULT_MEMORY.shopDirectory.filterRating,
      sortBy: isAllowedValue(SHOP_SORT_OPTIONS, shopDirectory?.sortBy)
        ? shopDirectory.sortBy
        : DEFAULT_MEMORY.shopDirectory.sortBy,
      lastViewedShopId: sanitizeNullablePositiveInteger(shopDirectory?.lastViewedShopId),
      sessionIntelligenceOpen:
        typeof shopDirectory?.sessionIntelligenceOpen === "boolean"
          ? shopDirectory.sessionIntelligenceOpen
          : DEFAULT_MEMORY.shopDirectory.sessionIntelligenceOpen,
    },
    insuranceConnection: {
      connectedInsurerIds: sanitizeNumericCollection(insuranceConnection?.connectedInsurerIds),
      draftPolicyNumber:
        typeof insuranceConnection?.draftPolicyNumber === "string"
          ? insuranceConnection.draftPolicyNumber
          : DEFAULT_MEMORY.insuranceConnection.draftPolicyNumber,
      draftClaimNumber:
        typeof insuranceConnection?.draftClaimNumber === "string"
          ? insuranceConnection.draftClaimNumber
          : DEFAULT_MEMORY.insuranceConnection.draftClaimNumber,
      lastSelectedInsurerId: sanitizeNullablePositiveInteger(
        insuranceConnection?.lastSelectedInsurerId
      ),
    },
    mapSession: {
      ...DEFAULT_MAP_SESSION,
      savedPlaces: Array.isArray(mapSession?.savedPlaces)
        ? mapSession.savedPlaces
            .map((value) => sanitizeSavedPlace(value))
            .filter((value): value is SavedPlace => Boolean(value))
        : DEFAULT_MAP_SESSION.savedPlaces,
      recentSearches: Array.isArray(mapSession?.recentSearches)
        ? mapSession.recentSearches
            .map((value) => sanitizeRecentSearch(value))
            .filter((value): value is RecentSearch => Boolean(value))
        : DEFAULT_MAP_SESSION.recentSearches,
      customerSavedShopIds: sanitizeNumericCollection(mapSession?.customerSavedShopIds),
      shopWatchlistIds: sanitizeNumericCollection(mapSession?.shopWatchlistIds),
      insurerShortlistIds: sanitizeNumericCollection(mapSession?.insurerShortlistIds),
      mapViewMode: isAllowedValue(MAP_VIEW_MODES, mapSession?.mapViewMode)
        ? mapSession.mapViewMode
        : DEFAULT_MAP_SESSION.mapViewMode,
      mapTheme: isAllowedValue(MAP_THEMES, mapSession?.mapTheme)
        ? mapSession.mapTheme
        : DEFAULT_MAP_SESSION.mapTheme,
      showClusters:
        typeof mapSession?.showClusters === "boolean"
          ? mapSession.showClusters
          : DEFAULT_MAP_SESSION.showClusters,
      clusterLevel: isAllowedValue(CLUSTER_LEVELS, mapSession?.clusterLevel)
        ? mapSession.clusterLevel
        : DEFAULT_MAP_SESSION.clusterLevel,
      updatedAt: isValidTimestamp(mapSession?.updatedAt)
        ? mapSession.updatedAt
        : DEFAULT_MAP_SESSION.updatedAt,
      ...(lastSearchOrigin ? { lastSearchOrigin } : {}),
      ...(typeof mapSession?.lastSearchQuery === "string"
        ? { lastSearchQuery: mapSession.lastSearchQuery }
        : {}),
      ...(lastSearchFilters ? { lastSearchFilters } : {}),
      ...(lastViewedShopId !== undefined ? { lastViewedShopId } : {}),
      ...(selectedRouteId ? { selectedRouteId } : {}),
      ...(lastMapCenter ? { lastMapCenter } : {}),
      ...(lastMapZoom !== undefined ? { lastMapZoom } : {}),
      ...(lastViewportBounds ? { lastViewportBounds } : {}),
    },
  };
}

export function sanitizeWebsiteSessionMemory(memory?: unknown): WebsiteSessionMemory {
  return sanitizeMemory(memory);
}
