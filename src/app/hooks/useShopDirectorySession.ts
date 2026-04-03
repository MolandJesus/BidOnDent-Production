import { useDeferredValue, useEffect, useMemo, useState } from "react";
import type { ShopSortOption, WebsiteIdentity } from "../services/auth/websiteIdentity";
import { loadWebsiteSessionMemory } from "../services/auth/websiteIdentity";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";
import {
  buildShopIntelligenceSummary,
  getInsuranceDirectory,
} from "../services/intelligence/marketIntelligence";
import {
  buildRoleAwareMapHighlights,
  buildRoleAwareRouteSummary,
  buildShopMapListings,
  getRoleCollectionKey,
  getRoleCollectionTitle,
  getSuggestedSearchOrigins,
} from "../services/intelligence/shopMapExperience";
import { convertPartnerShopsToProfiles } from "../services/intelligence/directoryAdapters";
import type { NavigationAddressResult, NavigationAddressSuggestion } from "../types/navigation";
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
import { useNavigationAddressSearch } from "./useNavigationAddressSearch";
import { useNetworkDirectory } from "./useNetworkDirectory";
import { useShopDirectoryHandlers } from "./useShopDirectoryHandlers";
import { useShopDirectoryRoutePreview } from "./useShopDirectoryRoutePreview";
import { useUserGeolocation } from "./useUserGeolocation";
import {
  useIdentitySyncEffect,
  useOsPrefersDark,
  useSessionPersistEffect,
} from "./useShopDirectorySessionSync";
import {
  buildPlaceFromAddressResult,
  buildPlaceFromAddressSuggestion,
  getContextChips,
  slugify,
} from "./shopDirectorySessionUtils";

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
  /** Pre-seed search query from report context (e.g. zip code or city). Used once on mount. */
  initialSearchHint?: string;
  /** Center the map on these coordinates on first mount (e.g. from a report). */
  initialMapCenter?: Coordinates;
};

export function useShopDirectorySession({
  identity,
  userType,
  vehicles,
  reports,
  initialSearchHint,
  initialMapCenter,
}: UseShopDirectorySessionArgs) {
  const { inventory } = useNetworkDirectory();
  const {
    partnerShops,
    usingDemoFallback,
    fetchError: coverageFetchError,
  } = useCoveragePartnerShops();
  const geolocation = useUserGeolocation();
  const originSearch = useNavigationAddressSearch();
  const savedMemory = loadWebsiteSessionMemory(identity);
  const suggestedOrigins = getSuggestedSearchOrigins();

  const [searchQuery, setSearchQuery] = useState(
    savedMemory.shopDirectory.searchQuery || initialSearchHint || ""
  );
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
  // Always start in hybrid — immersive is entered only by explicit user action
  // (directions button or full-screen toggle), never restored from saved state.
  const [mapViewMode, setMapViewMode] = useState<MapViewMode>("hybrid");
  const [mapTheme, setMapTheme] = useState<MapTheme>(savedMemory.mapSession?.mapTheme || "light");

  // Resolve "auto" mapTheme to dark/light based on OS preference
  const osPrefersDark = useOsPrefersDark();
  const isMapDark = mapTheme === "auto" ? osPrefersDark : mapTheme === "dark";

  const [selectedRouteId, setSelectedRouteId] = useState<string>(
    savedMemory.mapSession?.selectedRouteId || "fastest"
  );
  const [mapCenter, setMapCenter] = useState<Coordinates | undefined>(
    initialMapCenter ?? savedMemory.mapSession?.lastMapCenter
  );
  const [mapZoom, setMapZoom] = useState<number | undefined>(
    initialMapCenter ? 12 : savedMemory.mapSession?.lastMapZoom
  );
  const [mapViewportBounds, setMapViewportBounds] = useState<MapViewportBounds | undefined>(
    savedMemory.mapSession?.lastViewportBounds
  );
  const [searchWithinViewport, setSearchWithinViewport] = useState(false);
  const [sessionIntelligenceOpen, setSessionIntelligenceOpen] = useState(
    savedMemory.shopDirectory.sessionIntelligenceOpen
  );
  const deferredSearchQuery = useDeferredValue(searchQuery);

  // ── Session sync on identity change ──
  useIdentitySyncEffect(identity, {
    setSearchQuery,
    setFilterRating,
    setSortBy,
    setSelectedShopId,
    setConnectedInsurerIds,
    setSelectedOrigin,
    setSavedPlaces,
    setRecentSearches,
    setCustomerSavedShopIds,
    setShopWatchlistIds,
    setInsurerShortlistIds,
    setMapViewMode,
    setMapTheme,
    setSelectedRouteId,
    setMapCenter,
    setMapZoom,
    setMapViewportBounds,
    setSessionIntelligenceOpen,
  });

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

  const mapListings = useMemo(
    () =>
      buildShopMapListings({
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
      }),
    [
      allDirectoryShops,
      connectedInsurerIds,
      deferredSearchQuery,
      filterRating,
      inventory.insurers,
      mapViewportBounds,
      reports,
      searchWithinViewport,
      selectedOrigin,
      sortBy,
      userType,
      vehicles,
    ]
  );

  const exactSearchMatchedShop = useMemo(() => {
    const normalizedSearchQuery = slugify(searchQuery.trim());
    if (!normalizedSearchQuery) {
      return null;
    }

    return mapListings.find((shop) => slugify(shop.name) === normalizedSearchQuery) || null;
  }, [mapListings, searchQuery]);
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
    mapListings.find((shop) => shop.id === selectedShopId) ||
    exactSearchMatchedShop ||
    mapListings[0] ||
    null;
  // Auto-select exact search match when no shop is explicitly selected
  // (e.g., arriving from bid acceptance with shop name in search query)
  useEffect(() => {
    if (selectedShopId === null && exactSearchMatchedShop) {
      setSelectedShopId(exactSearchMatchedShop.id);
    }
  }, [exactSearchMatchedShop?.id, selectedShopId]);

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

  const { routeOptions, isLoadingRoutes, routeError, usingLiveRoutes, refreshRoutePreview } =
    useShopDirectoryRoutePreview({
      selectedOrigin,
      selectedShop,
    });

  const selectedRoute =
    routeOptions.find((route) => route.id === selectedRouteId) || routeOptions[0] || null;

  const routeSummary = buildRoleAwareRouteSummary({
    selectedRoute,
    shop: selectedShop,
    userType,
  });

  const directionsActionLabel = "Get Directions";

  const showMapPane = mapViewMode !== "list";
  const isImmersive = mapViewMode === "map";

  const currentOriginIsSaved = selectedOrigin
    ? savedPlaces.some(
        (place) =>
          place.id === `saved-place-${selectedOrigin.placeId || slugify(selectedOrigin.name)}`
      )
    : false;

  const handleSelectOriginSearchResult = (result: NavigationAddressResult) => {
    originSearch.chooseAddressResult(result);
    setSelectedOrigin(buildPlaceFromAddressResult(result));
    setMapCenter({
      latitude: result.lat,
      longitude: result.lng,
    });
    setSearchWithinViewport(false);
  };

  const handleSelectOriginSuggestion = (suggestion: NavigationAddressSuggestion) => {
    originSearch.selectManualOrigin({
      lat: suggestion.coordinate.lat,
      lng: suggestion.coordinate.lng,
      county: suggestion.subtitle,
      label: suggestion.title,
      source: "address",
    });
    setSelectedOrigin(buildPlaceFromAddressSuggestion(suggestion));
    setMapCenter({
      latitude: suggestion.coordinate.lat,
      longitude: suggestion.coordinate.lng,
    });
    setSearchWithinViewport(false);
  };

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
      setSelectedShopId(exactSearchMatchedShop?.id ?? mapListings[0].id);
      return;
    }

    if (selectedShopId && !mapListings.some((shop) => shop.id === selectedShopId)) {
      setSelectedShopId(exactSearchMatchedShop?.id ?? mapListings[0]?.id ?? null);
    }
  }, [exactSearchMatchedShop, mapListings, selectedShopId]);

  useEffect(() => {
    if (routeOptions.length === 0) {
      return;
    }

    if (!routeOptions.some((route) => route.id === selectedRouteId)) {
      setSelectedRouteId(routeOptions[0].id);
    }
  }, [routeOptions, selectedRouteId]);

  // ── Session persist ──
  useSessionPersistEffect(identity, userType, {
    connectedInsurerIds,
    mapCenter,
    mapZoom,
    mapViewportBounds,
    filterRating,
    selectedOrigin,
    searchQuery,
    selectedShopId,
    mapTheme,
    selectedRouteId,
    customerSavedShopIds,
    insurerShortlistIds,
    recentSearches,
    savedPlaces,
    shopWatchlistIds,
    sessionIntelligenceOpen,
    sortBy,
    mapViewMode,
  });

  // ── Handlers (extracted) ──
  const baseHandlers = useShopDirectoryHandlers({
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
    setMapViewMode,
    setMapCenter,
    setSearchWithinViewport,
    geolocation,
  });

  const handleSelectOrigin = (origin: Place) => {
    originSearch.setAddressQuery("");
    originSearch.clearManualOrigin();
    baseHandlers.handleSelectOrigin(origin);
    setSearchWithinViewport(false);
  };

  const handleClearOrigin = () => {
    originSearch.setAddressQuery("");
    originSearch.clearManualOrigin();
    setSelectedOrigin(null);
    setSearchWithinViewport(false);
  };

  const handleUseMyLocation = () => {
    originSearch.setAddressQuery("");
    originSearch.clearManualOrigin();
    baseHandlers.handleUseMyLocation();
    setSearchWithinViewport(false);
  };

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
    isMapDark,
    resolvedMapTheme: (isMapDark ? "dark" : "light") as "light" | "dark",
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
    isLoadingRoutes,
    routeError,
    usingLiveRoutes,
    refreshRoutePreview,
    directionsActionLabel,
    suggestedOrigins,
    originSearchQuery: originSearch.addressQuery,
    originSearchResults: originSearch.addressResults,
    originSuggestions: originSearch.addressSuggestions,
    isSearchingOrigins: originSearch.isSearchingAddresses,
    originSearchError: originSearch.addressError,
    showMapPane,
    isImmersive,
    currentOriginIsSaved,
    // Handlers
    ...baseHandlers,
    handleSelectOrigin,
    handleClearOrigin,
    handleUseMyLocation,
    handleSearchOrigin: originSearch.searchAddresses,
    handleOriginSearchQueryChange: originSearch.setAddressQuery,
    handleSelectOriginSearchResult,
    handleSelectOriginSuggestion,
    // Geolocation + data source
    userGeolocation: geolocation,
    usingDemoFallback,
    coverageFetchError,
  };
}
