import { useEffect, useState } from "react";
import { useNavigationDiscoveryPlaces } from "../../hooks/useNavigationDiscoveryPlaces";
import type { CoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import { useSavedNavigationLocations } from "../../hooks/useSavedNavigationLocations";
import {
  loadNavigationDiscoveryRole,
  saveNavigationDiscoveryRole,
} from "../../services/navigation/discoveryPreferences";
import { primeVoiceEngine } from "../../services/navigation/voiceSupport";
import type { NavigationDiscoveryPlace } from "../../services/navigation/placeDiscovery";
import type { NavigationDiscoveryRole } from "../../services/navigation/placeDiscovery";
import ServiceCoverageMap from "../maps/MapLibreServiceCoverageMap";
import CoverageCommandCenterSidebar from "../maps/command-center/CoverageCommandCenterSidebar";
import type { ExternalNavigationSession } from "../../types/navigation";
import type {
  CoverageCountyMarker,
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapSurfaceTone,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import CoverageBrowseMapOverlays from "./CoverageBrowseMapOverlays";
import CoverageBrowseSidebarContent from "./CoverageBrowseSidebarContent";
import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import MobileMapBottomSheet from "./MobileMapBottomSheet";

type SidebarView = "search" | "explore" | "saved" | "shops";

function resolveInitialSidebarView({
  selectedShop,
  listSearchTarget,
  nearbyShops,
}: {
  selectedShop: CoveragePartnerShop | null;
  listSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
}): SidebarView {
  if (selectedShop) {
    return "search";
  }

  if (listSearchTarget && nearbyShops.length > 0) {
    return "shops";
  }

  return "search";
}

type CoverageBrowseExperienceProps = {
  tone: MapSurfaceTone;
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: CoveragePartnerShop[];
  mapSearchTarget: CoverageSearchTarget | null;
  listSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  radiusMiles: string;
  radiusMeters: number;
  regionCount: number;
  isLoadingShops: boolean;
  coverageFetchError?: string | null;
  usingDemoFallback?: boolean;
  selectedShopId?: string;
  initialDiscoveryRole?: NavigationDiscoveryRole;
  selectedShop: CoveragePartnerShop | null;
  navigationSession: ExternalNavigationSession | null;
  navigation: CoverageNavigationExperience;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop: (shop: CoveragePartnerShop) => void;
  onOpenBidOnDentNavigation: (shop: CoveragePartnerShop) => void;
  onExportDirections: (shop: CoveragePartnerShop) => void;
  onStartNavigation: () => void;
  onRetryPartnerShops?: () => void;
};

export default function CoverageBrowseExperience({
  tone,
  center,
  zoom,
  revision,
  tileMode,
  counties,
  partnerShops,
  mapSearchTarget,
  listSearchTarget,
  nearbyShops,
  radiusMiles,
  radiusMeters,
  regionCount,
  isLoadingShops,
  coverageFetchError,
  usingDemoFallback = false,
  selectedShopId,
  initialDiscoveryRole,
  selectedShop,
  navigationSession,
  navigation,
  onTileModeChange,
  onCenterActive,
  onResetView,
  onSelectShop,
  onOpenBidOnDentNavigation,
  onStartNavigation,
  onRetryPartnerShops,
}: CoverageBrowseExperienceProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const savedNavigation = useSavedNavigationLocations();
  const [selectedDiscoveryPlaceId, setSelectedDiscoveryPlaceId] = useState<string | null>(null);
  const [mapOverride, setMapOverride] = useState<{
    center: [number, number];
    zoom: number;
    revision: number;
  } | null>(null);
  const [discoveryRole, setDiscoveryRole] = useState<NavigationDiscoveryRole>(
    () => initialDiscoveryRole || loadNavigationDiscoveryRole()
  );
  const discovery = useNavigationDiscoveryPlaces({
    target: listSearchTarget,
    role: discoveryRole,
    radiusMiles: Number(radiusMiles),
  });
  const selectedDiscoveryPlace =
    discovery.places.find((place) => place.id === selectedDiscoveryPlaceId) || null;
  const [navigationStartRequestedShopId, setNavigationStartRequestedShopId] = useState<
    string | null
  >(null);
  const [sidebarView, setSidebarView] = useState<SidebarView>(() =>
    resolveInitialSidebarView({ selectedShop, listSearchTarget, nearbyShops })
  );
  const effectiveCenter = mapOverride?.center || center;
  const effectiveZoom = mapOverride?.zoom || zoom;
  const effectiveRevision = mapOverride?.revision || revision;
  const routeGeometry =
    navigation.routePreview?.geometry.map(({ lat, lng }) => [lat, lng] as [number, number]) ||
    undefined;
  const currentPosition = navigation.currentPosition
    ? ([navigation.currentPosition.lat, navigation.currentPosition.lng] as [number, number])
    : null;

  useEffect(() => {
    saveNavigationDiscoveryRole(discoveryRole);
  }, [discoveryRole]);

  useEffect(() => {
    if (initialDiscoveryRole) {
      setDiscoveryRole(initialDiscoveryRole);
    }
  }, [initialDiscoveryRole]);

  useEffect(() => {
    setMapOverride(null);
  }, [center, revision, zoom]);

  useEffect(() => {
    if (!selectedDiscoveryPlaceId) {
      return;
    }

    const stillExists = discovery.places.some((place) => place.id === selectedDiscoveryPlaceId);
    if (!stillExists) {
      setSelectedDiscoveryPlaceId(null);
    }
  }, [discovery.places, selectedDiscoveryPlaceId]);

  useEffect(() => {
    setSelectedDiscoveryPlaceId(null);
    setMapOverride(null);
  }, [discoveryRole, listSearchTarget]);

  useEffect(() => {
    if (selectedShop || !listSearchTarget || nearbyShops.length === 0) {
      return;
    }

    setSidebarView((current) => (current === "search" ? "shops" : current));
  }, [listSearchTarget, nearbyShops.length, selectedShop]);

  useEffect(() => {
    if (!navigationStartRequestedShopId) {
      return;
    }

    if (
      !selectedShop ||
      `${selectedShop.id || selectedShop.name}` !== navigationStartRequestedShopId
    ) {
      return;
    }

    if (!navigation.activeOriginTarget || navigation.isLoadingRoute || !navigation.routePreview) {
      return;
    }

    onStartNavigation();
    setNavigationStartRequestedShopId(null);
  }, [
    navigationStartRequestedShopId,
    selectedShop,
    navigation.activeOriginTarget,
    navigation.isLoadingRoute,
    navigation.routePreview,
    onStartNavigation,
  ]);

  function focusMapOnDiscoveryPlace(place: NavigationDiscoveryPlace) {
    setMapOverride((current) => ({
      center: [place.coordinate.lat, place.coordinate.lng],
      zoom: Math.max(current?.zoom || zoom, 13.5),
      revision: (current?.revision || revision) + 1,
    }));
  }

  function handleSelectDiscoveryPlace(
    place: NavigationDiscoveryPlace,
    options?: { centerMap?: boolean }
  ) {
    setSelectedDiscoveryPlaceId(place.id);

    if (options?.centerMap) {
      focusMapOnDiscoveryPlace(place);
    }
  }

  function handleSaveCurrentOrigin(category: "home" | "work" | "saved") {
    if (!navigation.activeOriginTarget) {
      return;
    }

    savedNavigation.saveLocation({
      label: navigation.activeOriginLabel,
      subtitle: navigation.activeOriginTarget.county,
      category,
      coordinate: {
        lat: navigation.activeOriginTarget.lat,
        lng: navigation.activeOriginTarget.lng,
      },
    });
  }

  function handleStartShopRouteInApp(shop: CoveragePartnerShop) {
    if (navigation.settings.voiceMode !== "muted") {
      primeVoiceEngine();
    }

    setSelectedDiscoveryPlaceId(null);
    savedNavigation.saveRecentLocation({
      label: shop.name,
      subtitle: shop.addressLine || shop.countyLabel,
      coordinate: {
        lat: shop.lat,
        lng: shop.lng,
      },
    });

    onSelectShop(shop);
    setSidebarView("search");
    setMapOverride((current) => ({
      center: [shop.lat, shop.lng],
      zoom: Math.max(current?.zoom || zoom, 12.5),
      revision: (current?.revision || revision) + 1,
    }));
    setNavigationStartRequestedShopId(`${shop.id || shop.name}`);
  }

  function handleOpenDiscoveryPlaceDirections(place: NavigationDiscoveryPlace) {
    handleSelectDiscoveryPlace(place, { centerMap: true });
    setSidebarView("explore");
    savedNavigation.saveRecentLocation({
      label: place.label,
      subtitle: place.subtitle,
      coordinate: {
        lat: place.coordinate.lat,
        lng: place.coordinate.lng,
      },
    });
  }

  function handleSelectShopUnified(shop: CoverageNearbyShop) {
    setSelectedDiscoveryPlaceId(null);
    onSelectShop(shop);
  }

  function handleOpenShopDirections(shop: CoverageNearbyShop) {
    handleStartShopRouteInApp(shop);
  }

  function handleSelectDiscoveryPlaceWithCenter(place: NavigationDiscoveryPlace) {
    handleSelectDiscoveryPlace(place, { centerMap: true });
  }

  function handleUseSavedLocation(target: CoverageSearchTarget, id?: string) {
    navigation.selectManualOrigin(target);
    if (id) {
      savedNavigation.markLocationUsed(id);
    }
  }

  function handleSaveParkedCar() {
    if (!navigation.currentPosition) {
      return;
    }

    savedNavigation.saveParkedCar({
      coordinate: navigation.currentPosition,
      accuracyMeters: navigation.gpsAccuracyMeters,
      roadName: navigation.speedLimitSnapshot?.roadName,
    });
  }

  const sidebarContent = (
    <CoverageBrowseSidebarContent
      tone={tone}
      theme={theme}
      sidebarView={sidebarView}
      onSidebarViewChange={setSidebarView}
      tileMode={tileMode}
      onTileModeChange={onTileModeChange}
      navigation={navigation}
      selectedShop={selectedShop}
      onStartNavigation={onStartNavigation}
      listSearchTarget={listSearchTarget}
      nearbyShops={nearbyShops}
      selectedShopId={selectedShopId}
      discoveryRole={discoveryRole}
      initialDiscoveryRole={initialDiscoveryRole}
      onDiscoveryRoleChange={setDiscoveryRole}
      selectedDiscoveryPlaceId={selectedDiscoveryPlaceId || undefined}
      selectedDiscoveryPlace={selectedDiscoveryPlace}
      discoveryPlaces={discovery.places}
      isLoadingDiscoveryPlaces={discovery.isLoading}
      discoveryError={discovery.error}
      onSelectShop={handleSelectShopUnified}
      onOpenShopDirections={handleOpenShopDirections}
      onSelectDiscoveryPlace={handleSelectDiscoveryPlaceWithCenter}
      onOpenDiscoveryPlaceDirections={handleOpenDiscoveryPlaceDirections}
      savedNavigation={{
        pinnedLocations: savedNavigation.pinnedLocations,
        recentLocations: savedNavigation.recentLocations,
        parkedCar: savedNavigation.parkedCar,
      }}
      onSaveCurrentOrigin={handleSaveCurrentOrigin}
      onUseSavedLocation={handleUseSavedLocation}
      onDeleteSavedLocation={savedNavigation.removeLocation}
      onSaveParkedCar={handleSaveParkedCar}
      onClearParkedCar={savedNavigation.clearParkedCar}
      isLoadingShops={isLoadingShops}
      coverageFetchError={coverageFetchError}
      usingDemoFallback={usingDemoFallback}
      radiusMiles={radiusMiles}
      onOpenDirections={handleStartShopRouteInApp}
      onRetryPartnerShops={onRetryPartnerShops}
    />
  );

  const routeMinutes = navigation.routePreview
    ? Math.max(1, Math.round(navigation.routePreview.durationSeconds / 60))
    : null;
  const routeMiles = navigation.routePreview
    ? (navigation.routePreview.distanceMeters / 1609.34).toFixed(1)
    : null;
  const arrivalLabel = navigation.routePreview
    ? new Date(Date.now() + navigation.routePreview.durationSeconds * 1000).toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      })
    : "--:--";
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  return (
    <div className="relative overflow-hidden border-0 bg-transparent shadow-none rounded-none lg:rounded-2xl">
      <div className="relative">
        <ServiceCoverageMap
          className="rounded-none lg:rounded-[2rem]"
          center={effectiveCenter}
          zoom={effectiveZoom}
          revision={effectiveRevision}
          tileMode={tileMode}
          counties={counties}
          partnerShops={partnerShops}
          activeSearchTarget={mapSearchTarget}
          radiusMeters={radiusMeters}
          radiusMiles={radiusMiles}
          regionCount={regionCount}
          mapHeightClassName="h-[100dvh] min-h-[100dvh] lg:h-[84vh] lg:min-h-[620px]"
          immersiveFullscreen
          showSurfaceChrome={false}
          selectedShopId={selectedShopId}
          selectedDiscoveryPlaceId={selectedDiscoveryPlaceId || undefined}
          showNavigationHud={false}
          discoveryPlaces={discovery.places}
          routeGeometry={routeGeometry}
          routeFitKey={navigation.routePreview?.fetchedAt ?? null}
          currentPosition={currentPosition}
          gpsAccuracyMeters={navigation.gpsAccuracyMeters}
          currentSpeedMph={navigation.currentSpeedMph}
          postedSpeedLimitMph={navigation.speedLimitSnapshot?.speedLimitMph ?? null}
          postedSpeedLimitConfidence={navigation.speedLimitSnapshot?.confidence ?? null}
          speedLimitMatchDistanceMeters={navigation.speedLimitSnapshot?.matchDistanceMeters ?? null}
          nearestRoadName={navigation.speedLimitSnapshot?.roadName ?? null}
          nextInstruction={navigation.nextStep?.instruction ?? null}
          voiceMode={navigation.settings.voiceMode}
          onTileModeChange={onTileModeChange}
          onCenterActive={() => {
            setMapOverride(null);
            onCenterActive();
          }}
          onResetView={() => {
            setMapOverride(null);
            onResetView();
          }}
          onSelectShop={(shopId) => {
            const shop = partnerShops.find((entry) => `${entry.id || entry.name}` === shopId);
            if (shop) {
              setSelectedDiscoveryPlaceId(null);
              onSelectShop(shop);
            }
          }}
          onSelectDiscoveryPlace={(place) => {
            handleSelectDiscoveryPlace(place);
          }}
        />

        {isDesktop ? (
          <div className="pointer-events-none absolute inset-y-6 left-4 z-[610] hidden w-[420px] lg:block xl:left-6 xl:w-[448px] 2xl:left-8 2xl:w-[468px]">
            <div
              className={cn(
                "pointer-events-auto h-full overflow-hidden rounded-[1.5rem] border backdrop-blur-2xl",
                tone === "dark"
                  ? "border-white/10 bg-slate-950/55 shadow-[0_24px_64px_rgba(2,6,23,0.4)]"
                  : "border-slate-200/78 bg-[linear-gradient(180deg,rgba(248,250,252,0.8),rgba(226,232,240,0.74))] shadow-[0_24px_64px_rgba(15,23,42,0.1)]"
              )}
            >
              <CoverageCommandCenterSidebar
                tone={tone}
                dock="left"
                showOverviewCards={false}
                tileMode={tileMode}
                regionCount={regionCount}
                partnerShops={partnerShops}
                selectedShop={selectedShop}
                navigationSession={navigationSession}
                onOpenDirections={onOpenBidOnDentNavigation}
              >
                {sidebarContent}
              </CoverageCommandCenterSidebar>
            </div>
          </div>
        ) : null}

        <CoverageBrowseMapOverlays
          className="hidden lg:contents"
          theme={theme}
          tileMode={tileMode}
          nextInstruction={navigation.nextStep?.instruction ?? null}
          selectedShop={selectedShop}
          arrivalLabel={arrivalLabel}
          routeMinutes={routeMinutes}
          routeMiles={routeMiles}
          canStartNavigation={
            Boolean(navigation.routePreview) && Boolean(selectedShop) && !navigation.isLoadingRoute
          }
          onSidebarViewChange={setSidebarView}
          onTileModeChange={onTileModeChange}
          onCenterMap={() => {
            setMapOverride(null);
            onCenterActive();
          }}
          onResetMap={() => {
            setMapOverride(null);
            onResetView();
          }}
          onStartNavigation={onStartNavigation}
        />
      </div>

      {!isDesktop ? (
        <MobileMapBottomSheet tone={tone}>{sidebarContent}</MobileMapBottomSheet>
      ) : null}
    </div>
  );
}
