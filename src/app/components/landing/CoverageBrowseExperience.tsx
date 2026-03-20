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
import ServiceCoverageMap from "../maps/ServiceCoverageMap";
import CoverageCommandCenterHeader from "../maps/command-center/CoverageCommandCenterHeader";
import CoverageCommandCenterSidebar from "../maps/command-center/CoverageCommandCenterSidebar";
import CoverageNavigationPlanner from "../maps/command-center/CoverageNavigationPlanner";
import NavigationBrowseDiscoveryPanel from "../maps/navigation/NavigationBrowseDiscoveryPanel";
import NavigationSavedPlacesPanel from "../maps/navigation/NavigationSavedPlacesPanel";
import type { ExternalNavigationSession } from "../../types/navigation";
import type {
  CoverageCountyMarker,
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapSurfaceTone,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";
import CoverageNearestShops from "./CoverageNearestShops";
import { cn } from "../ui/utils";
import { getMapSurfaceTheme } from "../maps/mapSurfaceTheme";

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

  return (
    <>
      <CoverageCommandCenterHeader tone={tone} navigationSession={navigationSession} />

      <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="p-4 sm:p-6">
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
            mapHeightClassName="h-[70vh] min-h-[540px]"
            immersiveFullscreen
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
        </div>

        <CoverageCommandCenterSidebar
          tone={tone}
          tileMode={tileMode}
          regionCount={regionCount}
          partnerShops={partnerShops}
          selectedShop={selectedShop}
          preferredNavigationProvider={preferredNavigationProvider}
          navigationSession={navigationSession}
          onOpenDirections={onOpenDirections}
        >
          <CoverageNavigationPlanner
            tone={tone}
            selectedShop={selectedShop}
            activeOriginLabel={navigation.activeOriginLabel}
            addressQuery={navigation.addressQuery}
            onAddressQueryChange={navigation.setAddressQuery}
            onSearchAddresses={() => {
              void navigation.searchAddresses();
            }}
            addressResults={navigation.addressResults}
            selectedAddressResult={navigation.selectedAddressResult}
            isSearchingAddresses={navigation.isSearchingAddresses}
            addressError={navigation.addressError}
            onChooseAddressResult={navigation.chooseAddressResult}
            onClearAddressResult={navigation.clearAddressResult}
            settings={navigation.settings}
            onVoiceModeChange={navigation.setVoiceMode}
            onVoiceVolumePresetChange={navigation.setVoiceVolumePreset}
            onGpsTrackingEnabledChange={navigation.setGpsTrackingEnabled}
            onSpeedLimitMonitorEnabledChange={navigation.setSpeedLimitMonitorEnabled}
            onResetNavigationSettings={navigation.resetNavigationSettings}
            onStartNavigation={onStartNavigation}
            preferredVoiceLabel={navigation.preferredVoiceLabel}
            voiceGuidanceSupported={navigation.voiceGuidanceSupported}
            routePreview={navigation.routePreview}
            isLoadingRoute={navigation.isLoadingRoute}
            routeError={navigation.routeError}
            currentStepIndex={navigation.currentStepIndex}
            gpsAccuracyMeters={navigation.gpsAccuracyMeters}
            gpsError={navigation.gpsError}
          />

          <NavigationBrowseDiscoveryPanel
            tone={tone}
            activeSearchTarget={listSearchTarget}
            nearbyShops={nearbyShops}
            selectedShopId={selectedShopId}
            discoveryRole={discoveryRole}
            defaultDiscoveryRole={initialDiscoveryRole}
            selectedDiscoveryPlaceId={selectedDiscoveryPlaceId || undefined}
            selectedDiscoveryPlace={selectedDiscoveryPlace}
            discoveryPlaces={discovery.places}
            isLoadingDiscoveryPlaces={discovery.isLoading}
            discoveryError={discovery.error}
            onDiscoveryRoleChange={setDiscoveryRole}
            onSelectShop={(shop) => {
              setSelectedDiscoveryPlaceId(null);
              onSelectShop(shop);
            }}
            onSelectDiscoveryPlace={(place) => {
              handleSelectDiscoveryPlace(place, { centerMap: true });
            }}
            onOpenDiscoveryPlaceDirections={handleOpenDiscoveryPlaceDirections}
          />

          <NavigationSavedPlacesPanel
            tone={tone}
            activeOriginLabel={navigation.activeOriginLabel}
            activeOriginTarget={navigation.activeOriginTarget}
            currentPositionAvailable={Boolean(navigation.currentPosition)}
            pinnedLocations={savedNavigation.pinnedLocations}
            recentLocations={savedNavigation.recentLocations}
            parkedCar={savedNavigation.parkedCar}
            onSaveCurrentOrigin={handleSaveCurrentOrigin}
            onUseSavedLocation={(target, id) => {
              navigation.selectManualOrigin(target);
              if (id) {
                savedNavigation.markLocationUsed(id);
              }
            }}
            onDeleteSavedLocation={savedNavigation.removeLocation}
            onSaveParkedCar={() => {
              if (!navigation.currentPosition) {
                return;
              }

              savedNavigation.saveParkedCar({
                coordinate: navigation.currentPosition,
                accuracyMeters: navigation.gpsAccuracyMeters,
                roadName: navigation.speedLimitSnapshot?.roadName,
              });
            }}
            onClearParkedCar={savedNavigation.clearParkedCar}
          />

          <CoverageNearestShops
            tone={tone}
            className={cn("p-4", theme.panelStrongClassName)}
            isLoadingShops={isLoadingShops}
            activeSearchTarget={listSearchTarget}
            nearbyShops={nearbyShops}
            radiusMiles={radiusMiles}
            selectedShopId={selectedShopId}
            preferredNavigationProvider={preferredNavigationProvider}
            onSelectShop={(shop) => {
              setSelectedDiscoveryPlaceId(null);
              onSelectShop(shop);
            }}
            onPreferredNavigationProviderChange={onPreferredNavigationProviderChange}
            onOpenDirections={handleOpenDirectionsWithHistory}
          />
        </CoverageCommandCenterSidebar>
      </div>
    </>
  );
}
