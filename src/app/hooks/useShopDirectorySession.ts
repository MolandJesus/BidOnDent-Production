import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { ShopSortOption, WebsiteIdentity } from "../services/auth/websiteIdentity";
import {
  loadWebsiteSessionMemory,
  updateWebsiteSessionMemory,
} from "../services/auth/websiteIdentity";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";
import {
  buildShopIntelligenceSummary,
  getInsuranceDirectory,
} from "../services/intelligence/marketIntelligence";
import {
  buildRoleAwareMapHighlights,
  buildRoleAwareRouteSummary,
  buildShopMapListings,
  buildShopRouteOptions,
  getRoleCollectionKey,
  getRoleCollectionTitle,
  getSuggestedSearchOrigins,
} from "../services/intelligence/shopMapExperience";
import { convertPartnerShopsToProfiles } from "../services/intelligence/directoryAdapters";
import { getNavigationProviderLabel } from "../services/navigation/externalNavigation";
import { loadNavigationSession } from "../services/navigation/navigationSession";
import type {
  Coordinates,
  MapTheme,
  MapViewMode,
  MapViewportBounds,
  Place,
  RecentSearch,
  SavedPlace,
} from "../types/mapDomain";
import { useCoveragePartnerShops } from "./useCoveragePartnerShops";
import { useNetworkDirectory } from "./useNetworkDirectory";
import { useShopDirectoryHandlers } from "./useShopDirectoryHandlers";
import { useUserGeolocation } from "./useUserGeolocation";
import { getContextChips, slugify } from "./shopDirectorySessionUtils";

type UseShopDirectorySessionArgs = {
  identity?: WebsiteIdentity | null;
  userType: MarketUserType;
  vehicles: Array<{ make?: string; model?: string; year?: string | number }>;
  reports: Array<{
    damageArea?: string;
    damageAreas?: string[];
    damageType?: string;
    description?: string;
  }>;
};

export function useShopDirectorySession({
  identity,
  userType,
  vehicles,
  reports,
}: UseShopDirectorySessionArgs) {
  const { inventory } = useNetworkDirectory();
  const { partnerShops } = useCoveragePartnerShops();
  const geolocation = useUserGeolocation();
  const savedMemory = loadWebsiteSessionMemory(identity);
  const suggestedOrigins = getSuggestedSearchOrigins();

  const [searchQuery, setSearchQuery] = useState(savedMemory.shopDirectory.searchQuery);
  const [filterRating, setFilterRating] = useState(savedMemory.shopDirectory.filterRating);
  const [sortBy, setSortBy] = useState<ShopSortOption>(savedMemory.shopDirectory.sortBy);
  const [selectedShopId, setSelectedShopId] = useState<number | null>(
    savedMemory.mapSession?.lastViewedShopId ?? savedMemory.shopDirectory.lastViewedShopId
  );
  const [connectedInsurerIds, setConnectedInsurerIds] = useState<number[]>(
    savedMemory.insuranceConnection.connectedInsurerIds
  );
  const [selectedOrigin, setSelectedOrigin] = useState<Place | null>(
    savedMemory.mapSession?.lastSearchOrigin || null
  );
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>(
    savedMemory.mapSession?.savedPlaces || []
  );
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>(
    savedMemory.mapSession?.recentSearches || []
  );
  const [customerSavedShopIds, setCustomerSavedShopIds] = useState<number[]>(
    savedMemory.mapSession?.customerSavedShopIds || []
  );
  const [shopWatchlistIds, setShopWatchlistIds] = useState<number[]>(
    savedMemory.mapSession?.shopWatchlistIds || []
  );
  const [insurerShortlistIds, setInsurerShortlistIds] = useState<number[]>(
    savedMemory.mapSession?.insurerShortlistIds || []
  );
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>(
    savedMemory.mapSession?.mapViewMode || "hybrid"
  );
  const [mapTheme, setMapTheme] = useState<MapTheme>(savedMemory.mapSession?.mapTheme || "light");
  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    savedMemory.mapSession?.selectedRouteId || "fastest"
  );
  const [mapCenter, setMapCenter] = useState<Coordinates | undefined>(
    savedMemory.mapSession?.lastMapCenter
  );
  const [mapZoom, setMapZoom] = useState<number | undefined>(savedMemory.mapSession?.lastMapZoom);
  const [mapViewportBounds, setMapViewportBounds] = useState<MapViewportBounds | undefined>(
    savedMemory.mapSession?.lastViewportBounds
  );
  const [searchWithinViewport, setSearchWithinViewport] = useState(false);
  const [sessionIntelligenceOpen, setSessionIntelligenceOpen] = useState(
    savedMemory.shopDirectory.sessionIntelligenceOpen
  );
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // ── Session sync on identity change ──
  useEffect(() => {
    const memory = loadWebsiteSessionMemory(identity);
    setSearchQuery(memory.shopDirectory.searchQuery);
    setFilterRating(memory.shopDirectory.filterRating);
    setSortBy(memory.shopDirectory.sortBy);
    setSelectedShopId(memory.mapSession?.lastViewedShopId ?? memory.shopDirectory.lastViewedShopId);
    setConnectedInsurerIds(memory.insuranceConnection.connectedInsurerIds);
    setSelectedOrigin(memory.mapSession?.lastSearchOrigin || null);
    setSavedPlaces(memory.mapSession?.savedPlaces || []);
    setRecentSearches(memory.mapSession?.recentSearches || []);
    setCustomerSavedShopIds(memory.mapSession?.customerSavedShopIds || []);
    setShopWatchlistIds(memory.mapSession?.shopWatchlistIds || []);
    setInsurerShortlistIds(memory.mapSession?.insurerShortlistIds || []);
    setMapViewMode(memory.mapSession?.mapViewMode || "hybrid");
    setMapTheme(memory.mapSession?.mapTheme || "light");
    setSelectedRouteId(memory.mapSession?.selectedRouteId || "fastest");
    setMapCenter(memory.mapSession?.lastMapCenter);
    setMapZoom(memory.mapSession?.lastMapZoom);
    setMapViewportBounds(memory.mapSession?.lastViewportBounds);
    setSessionIntelligenceOpen(memory.shopDirectory.sessionIntelligenceOpen);
  }, [identity?.websiteUserKey]);

  // ── Computed values ──
  const allDirectoryShops = useMemo(() => {
    const partnerProfiles = convertPartnerShopsToProfiles(partnerShops);
    if (partnerProfiles.length === 0) return inventory.shops;
    const byName = new Map(inventory.shops.map((s) => [s.businessName.toLowerCase(), s]));
    const merged = [...inventory.shops];
    for (const profile of partnerProfiles) {
      if (!byName.has(profile.businessName.toLowerCase())) {
        merged.push(profile);
      }
    }
    return merged;
  }, [inventory.shops, partnerShops]);

  const mapListings = buildShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventory.insurers,
    directoryShops: allDirectoryShops,
    filterRating,
    filters: searchWithinViewport ? { searchWithinViewport: true } : undefined,
    origin: selectedOrigin,
    reports,
    searchQuery: deferredSearchQuery,
    sortBy,
    userType,
    vehicles,
    viewportBounds: mapViewportBounds,
  });

  const summary = buildShopIntelligenceSummary(mapListings, {
    connectedInsurerIds,
    reports,
    searchQuery: deferredSearchQuery,
    userType,
    vehicles,
  });

  const connectedCarrierNames = getInsuranceDirectory(inventory.insurers)
    .filter((insurer) => connectedInsurerIds.includes(insurer.id))
    .map((insurer) => insurer.name);

  const contextChips = getContextChips(vehicles, reports);

  const roleHighlights = buildRoleAwareMapHighlights({
    connectedCarrierCount: connectedCarrierNames.length,
    recommendations: mapListings,
    reports,
    userType,
  });

  const collectionUniverse = buildShopMapListings({
    connectedInsurerIds,
    directoryInsurers: inventory.insurers,
    directoryShops: allDirectoryShops,
    origin: selectedOrigin,
    reports,
    searchQuery: "",
    sortBy: "smart-match",
    userType,
    vehicles,
  });

  const selectedShop =
    mapListings.find((shop) => shop.id === selectedShopId) || mapListings[0] || null;

  const roleCollectionKey = getRoleCollectionKey(userType);
  const roleCollectionTitle = getRoleCollectionTitle(userType);
  const roleCollectionIds =
    roleCollectionKey === "shopWatchlistIds"
      ? shopWatchlistIds
      : roleCollectionKey === "insurerShortlistIds"
        ? insurerShortlistIds
        : customerSavedShopIds;
  const roleCollectionListings = collectionUniverse.filter((shop) =>
    roleCollectionIds.includes(shop.id)
  );

  const routeOptions = buildShopRouteOptions({
    origin: selectedOrigin,
    shop: selectedShop,
  });

  const selectedRoute =
    routeOptions.find((route) => route.id === selectedRouteId) || routeOptions[0] || null;

  const routeSummary = buildRoleAwareRouteSummary({
    selectedRoute,
    shop: selectedShop,
    userType,
  });

  const preferredDirectionsProvider = loadNavigationSession()?.provider || "google";
  const directionsActionLabel = `Directions (${getNavigationProviderLabel(preferredDirectionsProvider)})`;

  const showMapPane = mapViewMode !== "list";
  const isImmersive = mapViewMode === "map";

  const currentOriginIsSaved = selectedOrigin
    ? savedPlaces.some(
        (place) =>
          place.id === `saved-place-${selectedOrigin.placeId || slugify(selectedOrigin.name)}`
      )
    : false;

  // ── Auto-center on geolocation when no prior origin saved ──
  useEffect(() => {
    if (!geolocation.coords || selectedOrigin) return;
    // Only auto-apply if there was no saved session origin
    if (savedMemory.mapSession?.lastSearchOrigin) return;

    const myPlace: Place = {
      name: "My Location",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      latitude: geolocation.coords.latitude,
      longitude: geolocation.coords.longitude,
      placeId: "user-geolocation",
    };
    setSelectedOrigin(myPlace);
    setMapCenter(geolocation.coords);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geolocation.coords]);

  // ── Selection sync effects ──
  useEffect(() => {
    if (!selectedShopId && mapListings[0]) {
      setSelectedShopId(mapListings[0].id);
      return;
    }

    if (selectedShopId && !mapListings.some((shop) => shop.id === selectedShopId)) {
      setSelectedShopId(mapListings[0]?.id ?? null);
    }
  }, [mapListings, selectedShopId]);

  useEffect(() => {
    if (routeOptions.length === 0) {
      return;
    }

    if (!routeOptions.some((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(routeOptions[0].id);
    }
  }, [routeOptions, selectedRouteId]);

  // ── Session persist ──
  useEffect(() => {
    updateWebsiteSessionMemory(
      identity,
      {
        insuranceConnection: {
          connectedInsurerIds,
        },
        mapSession: {
          lastMapCenter: mapCenter,
          lastMapZoom: mapZoom,
          lastViewportBounds: mapViewportBounds,
          lastSearchFilters: {
            minRating: filterRating,
          },
          lastSearchOrigin: selectedOrigin || undefined,
          lastSearchQuery: searchQuery,
          lastViewedShopId: selectedShopId ?? undefined,
          mapTheme,
          mapViewMode,
          selectedRouteId,
          customerSavedShopIds,
          insurerShortlistIds,
          recentSearches,
          savedPlaces,
          shopWatchlistIds,
        },
        shopDirectory: {
          filterRating,
          lastViewedShopId: selectedShopId,
          searchQuery,
          sessionIntelligenceOpen,
          sortBy,
        },
      },
      { accountType: userType }
    );
  }, [
    connectedInsurerIds,
    customerSavedShopIds,
    filterRating,
    identity,
    insurerShortlistIds,
    mapCenter,
    mapTheme,
    mapViewMode,
    mapZoom,
    recentSearches,
    savedPlaces,
    searchQuery,
    selectedOrigin,
    selectedRouteId,
    selectedShopId,
    sessionIntelligenceOpen,
    shopWatchlistIds,
    sortBy,
  ]);

  // ── Handlers (extracted) ──
  const handlers = useShopDirectoryHandlers({
    searchQuery,
    selectedOrigin,
    mapListingsLength: mapListings.length,
    roleCollectionKey,
    setSelectedShopId,
    setSelectedOrigin,
    setSavedPlaces,
    setRecentSearches,
    setCustomerSavedShopIds,
    setShopWatchlistIds,
    setInsurerShortlistIds,
    setMapTheme,
    setMapCenter,
    setSearchWithinViewport,
    geolocation,
  });

  return {
    // State
    searchQuery,
    filterRating,
    sortBy,
    selectedShopId,
    connectedInsurerIds,
    selectedOrigin,
    savedPlaces,
    recentSearches,
    mapViewMode,
    mapTheme,
    selectedRouteId,
    mapCenter,
    mapZoom,
    mapViewportBounds,
    searchWithinViewport,
    sessionIntelligenceOpen,
    // Setters
    setSearchQuery,
    setFilterRating,
    setSortBy,
    setSelectedShopId,
    setConnectedInsurerIds,
    setSelectedOrigin,
    setMapViewMode,
    setMapTheme,
    setSelectedRouteId,
    setMapCenter,
    setMapZoom,
    setMapViewportBounds,
    setSessionIntelligenceOpen,
    // Computed
    mapListings,
    summary,
    connectedCarrierNames,
    contextChips,
    roleHighlights,
    roleCollectionIds,
    roleCollectionTitle,
    roleCollectionListings,
    selectedShop,
    routeOptions,
    selectedRoute,
    routeSummary,
    directionsActionLabel,
    suggestedOrigins,
    showMapPane,
    isImmersive,
    currentOriginIsSaved,
    // Handlers
    ...handlers,
    // Geolocation
    userGeolocation: geolocation,
  };
}
