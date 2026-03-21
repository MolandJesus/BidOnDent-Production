import { useEffect, useMemo, useState } from "react";
import { MapPin } from "lucide-react";
import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";
import { useCoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import {
  openDirections,
  type NavigationProvider,
} from "../../services/navigation/externalNavigation";
import { markRecentNavigationLocation } from "../../services/navigation/savedLocations";
import { loadNavigationSession } from "../../services/navigation/navigationSession";
import { haversineMiles, zipToCoordinates } from "../../services/supabase/map";
import type { ExternalNavigationSession } from "../../types/navigation";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import ServiceCoverageMap from "../maps/ServiceCoverageMap";
import { resolveMapSurfaceTone } from "../maps/mapSurfaceTheme";
import type {
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import CoverageMapDialog from "./CoverageMapDialog";
import CoverageNearestShops from "./CoverageNearestShops";
import CoverageSearchPanel from "./CoverageSearchPanel";
import {
  COVERAGE_STATE_STORAGE_KEY,
  focusZoomByRadius,
  loadSavedCoverageState,
  type MapViewState,
  type SavedCoverageState,
} from "./coverageState";
import {
  countyCenters,
  defaultCoverageCenter,
  operatingRegions,
  resolveCoverageLookup,
  sanitizeZipInput,
} from "./coverageData";

type OperatingRegionsSectionProps = {
  initialDiscoveryRole?: NavigationDiscoveryRole;
};

export default function OperatingRegionsSection({
  initialDiscoveryRole,
}: OperatingRegionsSectionProps) {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const [savedCoverageState] = useState(loadSavedCoverageState);
  const [zipCode, setZipCode] = useState(() => savedCoverageState.zipCode || "");
  const [radiusMiles, setRadiusMiles] = useState(() => savedCoverageState.radiusMiles || "20");
  const [geoMessage, setGeoMessage] = useState("");
  const [tileMode, setTileMode] = useState<MapTileMode>(
    () => savedCoverageState.tileMode || "roadmap"
  );
  const [isMapExpanded, setIsMapExpanded] = useState(
    () => savedCoverageState.isMapExpanded || false
  );
  const [isFindingLocation, setIsFindingLocation] = useState(false);
  const [activeOriginMode, setActiveOriginMode] = useState<"zip" | "geolocation">(
    () => savedCoverageState.activeOriginMode || "zip"
  );
  const [selectedShopId, setSelectedShopId] = useState(
    () => savedCoverageState.selectedShopId || ""
  );
  const [preferredNavigationProvider, setPreferredNavigationProvider] =
    useState<NavigationProvider>(() => savedCoverageState.preferredNavigationProvider || "apple");
  const [navigationSession, setNavigationSession] = useState<ExternalNavigationSession | null>(
    loadNavigationSession
  );
  const [currentLocationTarget, setCurrentLocationTarget] = useState<CoverageSearchTarget | null>(
    () => savedCoverageState.currentLocationTarget || null
  );
  const [mapView, setMapView] = useState<MapViewState>({
    center: savedCoverageState.mapView?.center || defaultCoverageCenter,
    zoom: savedCoverageState.mapView?.zoom || 9,
    revision: savedCoverageState.mapView?.revision || 0,
  });
  const { partnerShops: mapPartnerShops, isLoadingShops } = useCoveragePartnerShops();
  const surfaceTone = resolveMapSurfaceTone(tileMode);

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

  const mapFocusTarget = activeOriginMode === "geolocation" ? currentLocationTarget : zipMapTarget;
  const listSearchTarget =
    activeOriginMode === "geolocation" ? currentLocationTarget : zipSearchTarget;

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
      mapPartnerShops.find((shop) => `${shop.id || shop.name}` === selectedShopId) ||
      nearbyShops[0] ||
      null,
    [mapPartnerShops, nearbyShops, selectedShopId]
  );
  const navigation = useCoverageNavigationExperience({
    selectedShop,
    fallbackOriginTarget: listSearchTarget,
  });
  const routeGeometry =
    navigation.routePreview?.geometry.map(({ lat, lng }) => [lat, lng] as [number, number]) ||
    undefined;

  useEffect(() => {
    if (!selectedShop && nearbyShops.length > 0) {
      setSelectedShopId(`${nearbyShops[0].id || nearbyShops[0].name}`);
      return;
    }

    if (nearbyShops.length === 0 && selectedShopId) {
      setSelectedShopId("");
    }
  }, [nearbyShops, selectedShop, selectedShopId]);

  useEffect(() => {
    const syncNavigationSession = () => {
      setNavigationSession(loadNavigationSession());
    };

    window.addEventListener("focus", syncNavigationSession);
    return () => window.removeEventListener("focus", syncNavigationSession);
  }, []);

  useEffect(() => {
    const nextState: SavedCoverageState = {
      zipCode,
      radiusMiles,
      tileMode,
      isMapExpanded,
      activeOriginMode,
      selectedShopId,
      preferredNavigationProvider,
      currentLocationTarget,
      mapView,
    };

    try {
      localStorage.setItem(COVERAGE_STATE_STORAGE_KEY, JSON.stringify(nextState));
    } catch (error) {
      console.error("Error saving coverage map state:", error);
    }
  }, [
    zipCode,
    radiusMiles,
    tileMode,
    isMapExpanded,
    activeOriginMode,
    selectedShopId,
    preferredNavigationProvider,
    currentLocationTarget,
    mapView,
  ]);

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

  function handleOpenDirections(shop: CoveragePartnerShop) {
    handleSelectShop(shop);
    markRecentNavigationLocation({
      label: shop.name,
      subtitle: shop.addressLine || shop.countyLabel,
      coordinate: {
        lat: shop.lat,
        lng: shop.lng,
      },
    });
    openDirections({
      provider: preferredNavigationProvider,
      destination: shop,
      origin: navigation.activeOriginTarget,
    });
    setNavigationSession(loadNavigationSession());
  }

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
    const nextZip = sanitizeZipInput(value);
    setZipCode(nextZip);

    if (nextZip.length >= 3) {
      setActiveOriginMode("zip");
      setGeoMessage("");
    } else if (currentLocationTarget) {
      setActiveOriginMode("geolocation");
    }
  }

  function handleUseCurrentLocation() {
    if (!navigator.geolocation) {
      setGeoMessage("Geolocation is not supported on this browser.");
      return;
    }

    setIsFindingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const target: CoverageSearchTarget = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          county: "Current location",
          label: "Your current location",
          source: "geolocation",
        };

        setCurrentLocationTarget(target);
        setGeoMessage("");
        setActiveOriginMode("geolocation");
        centerOnTarget(target, "Coverage map centered to your live location.");
        setIsFindingLocation(false);
      },
      () => {
        setGeoMessage("Location permission denied. You can still search by ZIP code.");
        setIsFindingLocation(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 300000,
        timeout: 10000,
      }
    );
  }

  return (
    <section id="coverage" className="py-14 bg-slate-900 text-white" ref={sectionRef}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <p className="uppercase tracking-[0.12em] text-sm text-slate-300 mb-2">
                Current Coverage
              </p>
              <h3 className="text-3xl font-bold">Actively operating in New York service regions</h3>
              <p className="text-slate-300 mt-2 max-w-2xl">
                Explore coverage with our interactive map. Enter ZIP and radius to preview service
                availability and nearby partner hubs.
              </p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-8">
            {operatingRegions.map((region) => (
              <div
                key={region}
                className="rounded-xl border border-slate-700 bg-slate-800/60 px-4 py-3 flex items-center gap-2"
              >
                <MapPin className="w-4 h-4 text-cyan-300" />
                <span>{region}</span>
              </div>
            ))}
          </div>

          <div className="mt-8">
            <CoverageSearchPanel
              tone={surfaceTone}
              zipCode={zipCode}
              radiusMiles={radiusMiles}
              normalizedZip={normalizedZip}
              hasCoverageSignal={hasCoverageSignal}
              coverageCounty={lookup?.county}
              activeOriginMode={activeOriginMode}
              currentLocationLabel={currentLocationTarget?.label || null}
              geoMessage={geoMessage}
              isFindingLocation={isFindingLocation}
              canCenterMap={Boolean(mapFocusTarget)}
              onZipCodeChange={handleZipCodeChange}
              onRadiusMilesChange={setRadiusMiles}
              onCenterMap={() => {
                if (!mapFocusTarget) {
                  return;
                }

                centerOnTarget(
                  mapFocusTarget,
                  mapFocusTarget.source === "geolocation"
                    ? "Coverage map centered to your live location."
                    : `Coverage map centered on ${mapFocusTarget.label}.`
                );
              }}
              onUseCurrentLocation={handleUseCurrentLocation}
              onExpandMap={() => setIsMapExpanded(true)}
            />

            <ServiceCoverageMap
              className="mt-4"
              center={mapView.center}
              zoom={mapView.zoom}
              revision={mapView.revision}
              tileMode={tileMode}
              counties={countyCenters}
              partnerShops={mapPartnerShops}
              activeSearchTarget={mapFocusTarget}
              radiusMeters={radiusMeters}
              radiusMiles={radiusMiles}
              regionCount={operatingRegions.length}
              selectedShopId={selectedShopId}
              showNavigationHud={false}
              routeGeometry={routeGeometry}
              routeFitKey={navigation.routePreview?.fetchedAt ?? null}
              currentPosition={
                navigation.currentPosition
                  ? [navigation.currentPosition.lat, navigation.currentPosition.lng]
                  : null
              }
              gpsAccuracyMeters={navigation.gpsAccuracyMeters}
              currentSpeedMph={navigation.currentSpeedMph}
              postedSpeedLimitMph={navigation.speedLimitSnapshot?.speedLimitMph ?? null}
              postedSpeedLimitConfidence={navigation.speedLimitSnapshot?.confidence ?? null}
              speedLimitMatchDistanceMeters={
                navigation.speedLimitSnapshot?.matchDistanceMeters ?? null
              }
              nearestRoadName={navigation.speedLimitSnapshot?.roadName ?? null}
              nextInstruction={navigation.nextStep?.instruction ?? null}
              voiceMode={navigation.settings.voiceMode}
              onTileModeChange={setTileMode}
              onCenterActive={() => centerOnTarget(mapFocusTarget)}
              onResetView={resetOverviewMap}
              onExpand={() => setIsMapExpanded(true)}
              onSelectShop={handleSelectShopById}
            />

            <div className="mt-4">
              <CoverageNearestShops
                tone={surfaceTone}
                isLoadingShops={isLoadingShops}
                activeSearchTarget={listSearchTarget}
                nearbyShops={nearbyShops}
                radiusMiles={radiusMiles}
                selectedShopId={selectedShopId}
                preferredNavigationProvider={preferredNavigationProvider}
                onSelectShop={(shop) => handleSelectShop(shop, { centerMap: true })}
                onPreferredNavigationProviderChange={setPreferredNavigationProvider}
                onOpenDirections={handleOpenDirections}
              />
            </div>
          </div>
        </div>
      </div>

      <CoverageMapDialog
        open={isMapExpanded}
        onOpenChange={setIsMapExpanded}
        center={mapView.center}
        zoom={mapView.zoom}
        revision={mapView.revision}
        tileMode={tileMode}
        counties={countyCenters}
        partnerShops={mapPartnerShops}
        mapSearchTarget={mapFocusTarget}
        listSearchTarget={listSearchTarget}
        nearbyShops={nearbyShops}
        radiusMiles={radiusMiles}
        radiusMeters={radiusMeters}
        regionCount={operatingRegions.length}
        isLoadingShops={isLoadingShops}
        selectedShopId={selectedShopId}
        initialDiscoveryRole={initialDiscoveryRole}
        preferredNavigationProvider={preferredNavigationProvider}
        selectedShop={selectedShop}
        navigationSession={navigationSession}
        navigation={navigation}
        onTileModeChange={setTileMode}
        onCenterActive={() => centerOnTarget(mapFocusTarget)}
        onResetView={resetOverviewMap}
        onSelectShop={(shop) => handleSelectShop(shop, { centerMap: true })}
        onPreferredNavigationProviderChange={setPreferredNavigationProvider}
        onOpenDirections={handleOpenDirections}
      />
    </section>
  );
}
