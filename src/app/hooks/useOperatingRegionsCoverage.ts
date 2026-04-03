import { useCallback, useEffect, useMemo, useState } from "react";
import { useCoveragePersistEffect } from "./useCoveragePersistEffect";
import { useCoveragePartnerShops } from "./useCoveragePartnerShops";
import { useCoverageNavigationExperience } from "./useCoverageNavigationExperience";
import { useUserGeolocation } from "./useUserGeolocation";
import { useNavigationLaunch } from "./useNavigationLaunch";
import type { NavigationProvider } from "../services/navigation/externalNavigation";
import { addressResultToSearchTarget } from "../services/navigation/addressSearch";
import { haversineMiles, zipToCoordinates } from "../services/supabase/map";
import { resolveMapSurfaceTone } from "../components/maps/mapSurfaceTheme";
import type {
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
} from "../components/maps/serviceCoverageMapTypes";
import {
  focusZoomByRadius,
  loadSavedCoverageState,
  type MapViewState,
} from "../components/landing/coverageState";
import {
  countyCenters,
  defaultCoverageCenter,
  resolveCoverageLookup,
  sanitizeZipInput,
} from "../components/landing/coverageData";

export function useOperatingRegionsCoverage() {
  const [savedCoverageState] = useState(loadSavedCoverageState);
  const [zipCode, setZipCode] = useState(() => savedCoverageState.zipCode || "");
  const [radiusMiles, setRadiusMiles] = useState(() => savedCoverageState.radiusMiles || "20");
  const [geoMessage, setGeoMessage] = useState("");
  const [tileMode, setTileMode] = useState<MapTileMode>(
    () => savedCoverageState.tileMode || "night"
  );
  const [isMapExpanded, setIsMapExpanded] = useState(
    () => savedCoverageState.isMapExpanded || false
  );
  const [activeOriginMode, setActiveOriginMode] = useState<"zip" | "geolocation" | "address">(
    () => savedCoverageState.activeOriginMode || "zip"
  );
  const [selectedShopId, setSelectedShopId] = useState(
    () => savedCoverageState.selectedShopId || ""
  );
  const [preferredNavigationProvider, setPreferredNavigationProvider] =
    useState<NavigationProvider>(() => savedCoverageState.preferredNavigationProvider || "apple");
  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState(false);
  const [currentLocationTarget, setCurrentLocationTarget] = useState<CoverageSearchTarget | null>(
    () => savedCoverageState.currentLocationTarget || null
  );
  const [manualSearchTarget, setManualSearchTarget] = useState<CoverageSearchTarget | null>(
    () => savedCoverageState.manualSearchTarget || null
  );
  const [mapView, setMapView] = useState<MapViewState>({
    center: savedCoverageState.mapView?.center || defaultCoverageCenter,
    zoom: savedCoverageState.mapView?.zoom || 9,
    revision: savedCoverageState.mapView?.revision || 0,
  });
  const {
    partnerShops: mapPartnerShops,
    isLoadingShops,
    fetchError: coverageFetchError,
    retryPartnerShops,
    usingDemoFallback,
  } = useCoveragePartnerShops();
  const surfaceTone = resolveMapSurfaceTone(tileMode);
  const geolocation = useUserGeolocation();

  const normalizedZip = zipCode.trim();
  const lookup = useMemo(() => {
    return resolveCoverageLookup(normalizedZip);
  }, [normalizedZip]);

  const hasCoverageSignal = Boolean(lookup);
  const radiusMeters = Number(radiusMiles) * 1609.34;

  const zipSearchTarget = useMemo<CoverageSearchTarget | null>(() => {
    if (normalizedZip.length < 5) return null;

    const fallbackCoordinates = zipToCoordinates(normalizedZip);
    const lat = lookup?.lat ?? fallbackCoordinates?.lat;
    const lng = lookup?.lng ?? fallbackCoordinates?.lng;

    if (typeof lat !== "number" || typeof lng !== "number") {
      return null;
    }

    return {
      lat,
      lng,
      county: lookup?.county || "Regional coverage",
      label: `ZIP ${normalizedZip}`,
      source: "zip",
    };
  }, [lookup, normalizedZip]);

  const zipMapTarget = useMemo<CoverageSearchTarget | null>(() => {
    if (!lookup) return null;

    return {
      lat: lookup.lat,
      lng: lookup.lng,
      county: lookup.county,
      label: normalizedZip.length >= 5 ? `ZIP ${normalizedZip}` : `${normalizedZip} area`,
      source: "zip",
    };
  }, [lookup, normalizedZip]);

  const fallbackSearchTarget =
    activeOriginMode === "geolocation"
      ? currentLocationTarget
      : activeOriginMode === "address"
        ? manualSearchTarget
        : zipSearchTarget;

  const preselectedShop = useMemo<CoveragePartnerShop | null>(
    () => mapPartnerShops.find((shop) => `${shop.id || shop.name}` === selectedShopId) || null,
    [mapPartnerShops, selectedShopId]
  );
  const navigation = useCoverageNavigationExperience({
    selectedShop: preselectedShop,
    fallbackOriginTarget: fallbackSearchTarget,
    originPriority: activeOriginMode === "geolocation" ? "gps-first" : "fallback-first",
    voiceGuidanceEnabled,
  });
  const listSearchTarget = navigation.activeOriginTarget || fallbackSearchTarget;
  const mapFocusTarget =
    listSearchTarget ||
    (activeOriginMode === "geolocation"
      ? currentLocationTarget
      : activeOriginMode === "address"
        ? manualSearchTarget
        : zipMapTarget);

  const nearbyShops = useMemo<CoverageNearbyShop[]>(() => {
    if (!listSearchTarget) return [];

    return mapPartnerShops
      .map((shop) => {
        const distanceMiles = haversineMiles(
          { lat: listSearchTarget.lat, lng: listSearchTarget.lng },
          { lat: shop.lat, lng: shop.lng }
        );
        return {
          ...shop,
          distanceMiles,
        };
      })
      .filter((shop) => shop.distanceMiles <= Number(radiusMiles))
      .sort((a, b) => a.distanceMiles - b.distanceMiles)
      .slice(0, 6);
  }, [listSearchTarget, mapPartnerShops, radiusMiles]);

  const selectedShop = useMemo<CoveragePartnerShop | null>(
    () =>
      nearbyShops.find((shop) => `${shop.id || shop.name}` === selectedShopId) ||
      preselectedShop ||
      nearbyShops[0] ||
      null,
    [nearbyShops, preselectedShop, selectedShopId]
  );
  const routeGeometry =
    navigation.routePreview?.geometry.map(({ lat, lng }) => [lat, lng] as [number, number]) ||
    undefined;

  useEffect(() => {
    if (nearbyShops.length > 0) {
      const selectedNearbyShop = nearbyShops.find(
        (shop) => `${shop.id || shop.name}` === selectedShopId
      );

      if (!selectedNearbyShop) {
        setSelectedShopId(`${nearbyShops[0].id || nearbyShops[0].name}`);
      }
      return;
    }

    if (nearbyShops.length === 0 && selectedShopId) {
      setSelectedShopId("");
    }
  }, [nearbyShops, selectedShopId]);

  useEffect(() => {
    if (!isMapExpanded && voiceGuidanceEnabled) {
      setVoiceGuidanceEnabled(false);
    }
  }, [isMapExpanded, voiceGuidanceEnabled]);

  useCoveragePersistEffect({
    zipCode,
    radiusMiles,
    tileMode,
    isMapExpanded,
    activeOriginMode,
    selectedShopId,
    preferredNavigationProvider,
    currentLocationTarget,
    manualSearchTarget,
    mapView,
  });

  function focusMapOnShop(shop: CoveragePartnerShop, message?: string) {
    updateMapView([shop.lat, shop.lng], 12, message || `Map focused on ${shop.name}.`);
  }

  function handleSelectShop(shop: CoveragePartnerShop, options?: { centerMap?: boolean }) {
    setSelectedShopId(`${shop.id || shop.name}`);

    if (options?.centerMap) {
      focusMapOnShop(shop);
    }
  }

  function handleSelectShopById(shopId: string) {
    const shop =
      nearbyShops.find((entry) => `${entry.id || entry.name}` === shopId) ||
      mapPartnerShops.find((entry) => `${entry.id || entry.name}` === shopId);

    if (!shop) {
      setSelectedShopId(shopId);
      return;
    }

    handleSelectShop(shop);
  }

  const navLaunch = useNavigationLaunch({
    selectedShop,
    preferredNavigationProvider,
    activeOriginTarget: navigation.activeOriginTarget,
    isLoadingRoute: navigation.isLoadingRoute,
    routePreview: navigation.routePreview,
    voiceMode: navigation.settings.voiceMode,
    fallbackSearchTarget,
    isMapExpanded,
    setIsMapExpanded,
    setGeoMessage,
    onSelectShop: handleSelectShop,
  });

  function updateMapView(target: [number, number], zoom: number, message?: string) {
    setMapView((previous) => ({
      center: target,
      zoom,
      revision: previous.revision + 1,
    }));

    if (message) {
      setGeoMessage(message);
    }
  }

  function centerOnTarget(target: CoverageSearchTarget | null, message?: string) {
    if (!target) return;

    updateMapView([target.lat, target.lng], focusZoomByRadius[radiusMiles] || 9, message);
  }

  function resetOverviewMap() {
    updateMapView(
      defaultCoverageCenter,
      9,
      "Coverage map returned to the New York regional overview."
    );
  }

  function handleZipCodeChange(value: string) {
    const trimmedValue = value.trim();
    const looksLikeZip = /^[0-9\s-]*$/.test(value);

    if (trimmedValue.length === 0) {
      setZipCode("");
      setManualSearchTarget(null);
      navigation.clearManualOrigin();
      navigation.setAddressQuery("");
      setGeoMessage("");
      setActiveOriginMode(currentLocationTarget ? "geolocation" : "zip");
      return;
    }

    if (looksLikeZip) {
      const nextZip = sanitizeZipInput(value);
      setZipCode(nextZip);
      setManualSearchTarget(null);
      navigation.clearManualOrigin();
      navigation.setAddressQuery("");

      if (nextZip.length >= 3) {
        setActiveOriginMode("zip");
        setGeoMessage("");
      } else if (currentLocationTarget) {
        setActiveOriginMode("geolocation");
      }

      return;
    }

    setZipCode("");
    navigation.setAddressQuery(value);
    setGeoMessage("");

    if (manualSearchTarget) {
      setActiveOriginMode("address");
    }
  }

  function handleSearchSubmit() {
    if (zipCode.length >= 5 && zipMapTarget) {
      setActiveOriginMode("zip");
      centerOnTarget(zipMapTarget, `Coverage map centered on ZIP ${normalizedZip}.`);
      return;
    }

    void navigation.searchAddresses();
  }

  function handleChooseAddressResult(result: Parameters<typeof navigation.chooseAddressResult>[0]) {
    const target = addressResultToSearchTarget(result);

    navigation.chooseAddressResult(result);
    setManualSearchTarget(target);
    setGeoMessage("");
    setActiveOriginMode("address");
    centerOnTarget(target, `Coverage map centered on ${target.label}.`);
  }

  function handleClearAddressResult() {
    setManualSearchTarget(null);
    navigation.clearManualOrigin();
    navigation.setAddressQuery("");

    if (zipCode.length >= 3) {
      setActiveOriginMode("zip");
      return;
    }

    setActiveOriginMode(currentLocationTarget ? "geolocation" : "zip");
  }

  // Sync currentLocationTarget when geolocation.coords updates
  useEffect(() => {
    if (!geolocation.coords) return;

    const target: CoverageSearchTarget = {
      lat: geolocation.coords.latitude,
      lng: geolocation.coords.longitude,
      county: "Current location",
      label: "Your current location",
      source: "geolocation",
    };

    setCurrentLocationTarget(target);
    if (activeOriginMode === "geolocation") {
      centerOnTarget(target, "Coverage map centered to your live location.");
    }
  }, [geolocation.coords]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUseCurrentLocation = useCallback(() => {
    if (geolocation.permissionState === "unsupported") {
      setGeoMessage("Geolocation is not supported on this browser.");
      return;
    }

    setZipCode("");
    setManualSearchTarget(null);
    navigation.clearManualOrigin();
    navigation.setAddressQuery("");
    setGeoMessage("");
    setActiveOriginMode("geolocation");

    // Request geolocation (the effect will sync the target when coords arrive)
    geolocation.requestLocation();
  }, [geolocation, navigation]);

  const searchQuery =
    navigation.addressQuery ||
    (activeOriginMode === "address" ? manualSearchTarget?.label || "" : zipCode);

  return {
    surfaceTone,
    zipCode,
    normalizedZip,
    searchQuery,
    radiusMiles,
    radiusMeters,
    geoMessage,
    tileMode,
    isMapExpanded,
    isFindingLocation: geolocation.isLocating,
    locationError: geolocation.error,
    locationPermissionState: geolocation.permissionState,
    activeOriginMode,
    hasCoverageSignal,
    coverageCounty: lookup?.county,
    currentLocationLabel: currentLocationTarget?.label || null,
    activeOriginLabel: navigation.activeOriginLabel,
    mapView,
    mapPartnerShops,
    isLoadingShops,
    coverageFetchError,
    retryCoveragePartnerShops: retryPartnerShops,
    usingDemoFallback,
    mapFocusTarget,
    listSearchTarget,
    nearbyShops,
    selectedShopId,
    selectedShop,
    preferredNavigationProvider,
    navigationSession: navLaunch.navigationSession,
    navigationStartRequestId: navLaunch.navigationStartRequestId,
    setVoiceGuidanceEnabled,
    navigation,
    routeGeometry,
    countyCenters,
    setRadiusMiles,
    setTileMode,
    setIsMapExpanded,
    setPreferredNavigationProvider,
    handleZipCodeChange,
    handleSearchSubmit,
    handleChooseAddressResult,
    handleClearAddressResult,
    handleUseCurrentLocation,
    handleSelectShop,
    handleSelectShopById,
    handleOpenBidOnDentNavigation: navLaunch.handleOpenBidOnDentNavigation,
    handleOpenDirections: navLaunch.handleOpenDirections,
    centerOnTarget,
    resetOverviewMap,
    addressSuggestions: navigation.addressSuggestions,
    addressResults: navigation.addressResults,
    isSearchingAddresses: navigation.isSearchingAddresses,
    addressError: navigation.addressError,
  };
}
