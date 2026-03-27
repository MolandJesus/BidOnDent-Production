import { useDeferredValue, useEffect, useMemo, useState, type FormEvent } from "react";
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
  toggleRoleCollectionShopId,
  type ShopMapListing,
} from "../services/intelligence/shopMapExperience";
import { convertPartnerShopsToProfiles } from "../services/intelligence/directoryAdapters";
import {
  getNavigationProviderLabel,
  openDirections,
} from "../services/navigation/externalNavigation";
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
import {
  buildRecentSearches,
  buildSavedPlace,
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
};

export function useShopDirectorySession({
  identity,
  userType,
  vehicles,
  reports,
}: UseShopDirectorySessionArgs) {
  const { inventory } = useNetworkDirectory();
  const { partnerShops } = useCoveragePartnerShops();
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
    undefined
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

  // ── Handlers ──
  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setRecentSearches((currentSearches) =>
      buildRecentSearches(currentSearches, searchQuery, selectedOrigin, mapListings.length)
    );
  };

  const handleSelectOrigin = (origin: Place) => {
    setSelectedOrigin(origin);
    setSavedPlaces((currentPlaces) =>
      currentPlaces.map((place) =>
        place.id === `saved-place-${origin.placeId || slugify(origin.name)}`
          ? { ...place, lastUsedAt: new Date().toISOString() }
          : place
      )
    );
  };

  const handleSaveOrigin = () => {
    if (!selectedOrigin) {
      return;
    }

    const nextPlace = buildSavedPlace(selectedOrigin);
    setSavedPlaces((currentPlaces) => {
      const existingPlace = currentPlaces.find((place) => place.id === nextPlace.id);
      if (existingPlace) {
        return currentPlaces.map((place) =>
          place.id === nextPlace.id
            ? { ...place, lastUsedAt: new Date().toISOString(), isFavorite: true }
            : place
        );
      }

      return [nextPlace, ...currentPlaces].slice(0, 6);
    });
  };

  const handleToggleRoleCollection = (shopId: number) => {
    setSelectedShopId(shopId);

    if (roleCollectionKey === "shopWatchlistIds") {
      setShopWatchlistIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
      return;
    }

    if (roleCollectionKey === "insurerShortlistIds") {
      setInsurerShortlistIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
      return;
    }

    setCustomerSavedShopIds((currentIds) => toggleRoleCollectionShopId(currentIds, shopId));
  };

  const handleOpenShopDirections = (shop: ShopMapListing) => {
    const provider = loadNavigationSession()?.provider || "google";

    openDirections({
      provider,
      destination: {
        id: String(shop.id),
        name: shop.name,
        lat: shop.mapResult.coordinates.latitude,
        lng: shop.mapResult.coordinates.longitude,
        addressLine: `${shop.mapResult.address}, ${shop.mapResult.city}, ${shop.mapResult.state} ${shop.mapResult.zipCode}`,
      },
      origin: selectedOrigin
        ? {
            label: selectedOrigin.name,
            lat: selectedOrigin.latitude,
            lng: selectedOrigin.longitude,
            source: "address",
          }
        : undefined,
    });
  };

  const handleToggleTheme = () => {
    setMapTheme((currentTheme) => (currentTheme === "light" ? "dark" : "light"));
  };

  const handleSearchInArea = () => {
    setSearchWithinViewport(true);
  };

  const handleClearAreaSearch = () => {
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
    handleSearchSubmit,
    handleSelectOrigin,
    handleSaveOrigin,
    handleToggleRoleCollection,
    handleOpenShopDirections,
    handleToggleTheme,
    handleSearchInArea,
    handleClearAreaSearch,
  };
}
