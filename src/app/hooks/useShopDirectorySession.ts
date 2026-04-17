import { useDeferredValue, useEffect, useState } from "react";
import type { ShopSortOption, WebsiteIdentity } from "../services/auth/websiteIdentity";
import { loadWebsiteSessionMemory } from "../services/auth/websiteIdentity";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";
import type { DashboardAppearanceMode } from "../routers/dashboard-router-types";
import { buildRoleAwareRouteSummary } from "../services/intelligence/shopMapExperience";
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
} from "./shopDirectorySessionUtils";
import { useShopDirectoryComputedValues } from "./useShopDirectoryComputedValues";

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
  /** Site-level appearance mode — syncs the map tile style to light/dark. */
  appearanceMode?: DashboardAppearanceMode;
};

export function useShopDirectorySession({
  identity,
  userType,
  vehicles,
  reports,
  initialSearchHint,
  initialMapCenter,
  appearanceMode,
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
  const [mapTheme, setMapTheme] = useState<MapTheme>(() => {
    // Appearance mode wins on initial load; only fall back to saved memory
    // when no appearance setting is available.
    if (appearanceMode) return appearanceMode === "light" ? "light" : "dark";
    return savedMemory.mapSession?.mapTheme || "light";
  });

  // Keep map tile in sync when the user toggles the site appearance mode.
  useEffect(() => {
    if (!appearanceMode) return;
    setMapTheme(appearanceMode === "light" ? "light" : "dark");
  }, [appearanceMode]);

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
    // Appearance mode always wins — don't let session memory clobber it.
    setMapTheme: appearanceMode
      ? () => setMapTheme(appearanceMode === "light" ? "light" : "dark")
      : setMapTheme,
    setSelectedRouteId,
    setMapCenter,
    setMapZoom,
    setMapViewportBounds,
    setSessionIntelligenceOpen,
  });

  // ── Computed values (extracted) ──
  const computed = useShopDirectoryComputedValues({
    inventoryShops: inventory.shops,
    inventoryInsurers: inventory.insurers,
    partnerShops,
    searchQuery,
    deferredSearchQuery,
    filterRating,
    sortBy,
    selectedShopId,
    connectedInsurerIds,
    selectedOrigin,
    savedPlaces,
    customerSavedShopIds,
    shopWatchlistIds,
    insurerShortlistIds,
    mapViewMode,
    isMapDark,
    mapViewportBounds,
    searchWithinViewport,
    userType,
    vehicles,
    reports,
  });

  const { mapListings, exactSearchMatchedShop, selectedShop, roleCollectionKey, suggestedOrigins } =
    computed;

  // Auto-select exact search match when no shop is explicitly selected
  useEffect(() => {
    if (selectedShopId === null && exactSearchMatchedShop) {
      setSelectedShopId(exactSearchMatchedShop.id);
    }
  }, [exactSearchMatchedShop?.id, selectedShopId]);

  // ── Route preview (depends on selectedShop from computed) ──
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

  const contextChips = getContextChips(vehicles, reports);

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
    summary: computed.summary,
    connectedCarrierNames: computed.connectedCarrierNames,
    contextChips,
    roleHighlights: computed.roleHighlights,
    roleCollectionIds: computed.roleCollectionIds,
    roleCollectionTitle: computed.roleCollectionTitle,
    roleCollectionListings: computed.roleCollectionListings,
    selectedShop,
    routeOptions,
    selectedRoute,
    routeSummary,
    isLoadingRoutes,
    routeError,
    usingLiveRoutes,
    refreshRoutePreview,
    directionsActionLabel: computed.directionsActionLabel,
    suggestedOrigins,
    originSearchQuery: originSearch.addressQuery,
    originSearchResults: originSearch.addressResults,
    originSuggestions: originSearch.addressSuggestions,
    isSearchingOrigins: originSearch.isSearchingAddresses,
    originSearchError: originSearch.addressError,
    showMapPane: computed.showMapPane,
    isImmersive: computed.isImmersive,
    currentOriginIsSaved: computed.currentOriginIsSaved,
    resolvedMapTheme: computed.resolvedMapTheme,
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
