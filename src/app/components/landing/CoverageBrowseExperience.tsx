import { useEffect, useState } from "react";
import { useNavigationDiscoveryPlaces } from "../../hooks/useNavigationDiscoveryPlaces";
import type { CoverageNavigationExperience } from "../../hooks/useCoverageNavigationExperience";
import { useSavedNavigationLocations } from "../../hooks/useSavedNavigationLocations";
import {
  loadNavigationDiscoveryRole,
  saveNavigationDiscoveryRole,
} from "../../services/navigation/discoveryPreferences";
import {
  openDirections,
  type NavigationMapDestination,
  type NavigationProvider,
} from "../../services/navigation/externalNavigation";
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
  selectedShopId?: string;
  initialDiscoveryRole?: NavigationDiscoveryRole;
  preferredNavigationProvider: NavigationProvider;
  selectedShop: CoveragePartnerShop | null;
  navigationSession: ExternalNavigationSession | null;
  navigation: CoverageNavigationExperience;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop: (shop: CoveragePartnerShop) => void;
  onPreferredNavigationProviderChange: (provider: NavigationProvider) => void;
  onOpenDirections: (shop: CoveragePartnerShop) => void;
  onStartNavigation: () => void;
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
  selectedShopId,
  initialDiscoveryRole,
  preferredNavigationProvider,
  selectedShop,
  navigationSession,
  navigation,
  onTileModeChange,
  onCenterActive,
  onResetView,
  onSelectShop,
  onPreferredNavigationProviderChange,
  onOpenDirections,
  onStartNavigation,
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
  const [sidebarView, setSidebarView] = useState<"search" | "explore" | "saved" | "shops">(
    "search"
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

  function handleOpenDirectionsWithHistory(shop: CoveragePartnerShop) {
    setSelectedDiscoveryPlaceId(null);
    savedNavigation.saveRecentLocation({
      label: shop.name,
      subtitle: shop.addressLine || shop.countyLabel,
      coordinate: {
        lat: shop.lat,
        lng: shop.lng,
      },
    });
    onOpenDirections(shop);
  }

  function handleOpenDiscoveryPlaceDirections(place: NavigationDiscoveryPlace) {
    handleSelectDiscoveryPlace(place);
    savedNavigation.saveRecentLocation({
      label: place.label,
      subtitle: place.subtitle,
      coordinate: {
        lat: place.coordinate.lat,
        lng: place.coordinate.lng,
      },
    });

    const destination: NavigationMapDestination = {
      id: place.id,
      name: place.label,
      lat: place.coordinate.lat,
      lng: place.coordinate.lng,
      addressLine: place.subtitle,
    };

    openDirections({
      provider: preferredNavigationProvider,
      destination,
      origin: navigation.activeOriginTarget,
    });
  }

  function handleSelectShopUnified(shop: CoverageNearbyShop) {
    setSelectedDiscoveryPlaceId(null);
    onSelectShop(shop);
  }

  function handleOpenShopDirections(shop: CoverageNearbyShop) {
    handleOpenDirectionsWithHistory(shop);
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
      radiusMiles={radiusMiles}
      preferredNavigationProvider={preferredNavigationProvider}
      onPreferredNavigationProviderChange={onPreferredNavigationProviderChange}
      onOpenDirections={handleOpenDirectionsWithHistory}
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
  const isDesktop = useMediaQuery("(min-width: 1280px)");

  return (
    <div className="relative overflow-hidden rounded-2xl border-0 bg-transparent shadow-none">
      <div className="relative">
        <ServiceCoverageMap
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
          mapHeightClassName="h-[100dvh] xl:h-[82vh] min-h-[360px] xl:min-h-[640px]"
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
          <div className="pointer-events-none absolute inset-y-6 left-6 z-[610] hidden w-[380px] xl:block 2xl:left-8 2xl:w-[410px]">
            <div
              className={cn(
                "pointer-events-auto h-full overflow-hidden rounded-[1.5rem] border backdrop-blur-2xl",
                tone === "dark"
                  ? "border-white/10 bg-slate-950/55 shadow-[0_24px_64px_rgba(2,6,23,0.4)]"
                  : "border-blue-100/50 bg-white/50 shadow-[0_24px_64px_rgba(15,23,42,0.12)]"
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
                preferredNavigationProvider={preferredNavigationProvider}
                navigationSession={navigationSession}
                onOpenDirections={onOpenDirections}
              >
                {sidebarContent}
              </CoverageCommandCenterSidebar>
            </div>
          </div>
        ) : null}

        <CoverageBrowseMapOverlays
          className="hidden xl:contents"
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
