import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Compass,
  Crosshair,
  MapPinned,
  MessageCircle,
  RotateCcw,
  Search,
  Star,
  Volume2,
} from "lucide-react";
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
import NavigationErrorBoundary from "../maps/NavigationErrorBoundary";
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

  const sidebarViews: Array<{
    id: "search" | "explore" | "saved" | "shops";
    label: string;
    Icon: typeof Search;
  }> = [
    { id: "search", label: "Search", Icon: Search },
    { id: "explore", label: "Explore", Icon: Compass },
    { id: "saved", label: "Saved", Icon: Star },
    { id: "shops", label: "Shops", Icon: MapPinned },
  ];
  const tileModes: MapTileMode[] = ["map", "satellite", "night"];
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

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-white/30 bg-[linear-gradient(180deg,rgba(245,250,255,0.7),rgba(226,236,247,0.62))] shadow-[0_34px_100px_rgba(15,23,42,0.24)] backdrop-blur-3xl">
      <CoverageCommandCenterHeader tone={tone} navigationSession={navigationSession} />

      <div className="grid gap-0 xl:grid-cols-[380px_minmax(0,1fr)] 2xl:grid-cols-[410px_minmax(0,1fr)]">
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
          <div
            className={cn(
              "sticky top-0 z-20 rounded-[1.25rem] p-2 backdrop-blur-2xl",
              theme.panelStrongClassName
            )}
          >
            <div className="grid grid-cols-2 gap-1.5">
              {sidebarViews.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSidebarView(id)}
                  className={
                    sidebarView === id
                      ? cn(
                          theme.primaryButtonClassName,
                          "!py-1.5 !px-3 !text-xs !gap-1 motion-safe:hover:-translate-y-0.5"
                        )
                      : cn(
                          theme.secondaryButtonClassName,
                          "!py-1.5 !px-3 !text-xs !gap-1 motion-safe:hover:-translate-y-0.5"
                        )
                  }
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div
              className={cn(
                "mt-1.5 flex overflow-hidden rounded-[0.75rem] border",
                tone === "light"
                  ? "border-white/60 bg-slate-100/50"
                  : "border-white/12 bg-slate-900/50"
              )}
            >
              {tileModes.map((mode, i) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => onTileModeChange(mode)}
                  className={cn(
                    "flex flex-1 items-center justify-center py-1.5 text-xs font-semibold transition-colors",
                    i > 0 &&
                      (tone === "light" ? "border-l border-white/50" : "border-l border-white/10"),
                    tileMode === mode
                      ? "bg-sky-500 text-white"
                      : tone === "light"
                        ? "text-slate-600 hover:bg-white/60"
                        : "text-slate-300 hover:bg-white/10"
                  )}
                >
                  {mode === "map" ? "Map" : mode === "satellite" ? "Sat" : "Night"}
                </button>
              ))}
            </div>

            <div className="mt-1.5 grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={onCenterActive}
                className={cn(theme.secondaryButtonClassName, "!py-1.5 !px-3 !text-xs")}
              >
                <Crosshair className="h-3.5 w-3.5" />
                Center
              </button>
              <button
                type="button"
                onClick={onResetView}
                className={cn(theme.secondaryButtonClassName, "!py-1.5 !px-3 !text-xs")}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>

          <NavigationErrorBoundary>
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
              addressSuggestions={navigation.addressSuggestions}
              settings={navigation.settings}
              onVoiceModeChange={navigation.setVoiceMode}
              onVoiceVolumePresetChange={navigation.setVoiceVolumePreset}
              onGpsTrackingEnabledChange={navigation.setGpsTrackingEnabled}
              onSpeedLimitMonitorEnabledChange={navigation.setSpeedLimitMonitorEnabled}
              onResetNavigationSettings={navigation.resetNavigationSettings}
              onRetryRoutePreview={navigation.refreshRoutePreview}
              onStartNavigation={onStartNavigation}
              preferredVoiceLabel={navigation.preferredVoiceLabel}
              voiceGuidanceSupported={navigation.voiceGuidanceSupported}
              routePreview={navigation.routePreview}
              routeAlternatives={navigation.routeAlternatives}
              selectedRouteIndex={navigation.selectedRouteIndex}
              onSelectRouteIndex={navigation.setSelectedRouteIndex}
              isLoadingRoute={navigation.isLoadingRoute}
              routeError={navigation.routeError}
              currentStepIndex={navigation.currentStepIndex}
              gpsAccuracyMeters={navigation.gpsAccuracyMeters}
              gpsError={navigation.gpsError}
              gpsStatus={navigation.gpsStatus}
              speedLimitStatus={navigation.speedLimitStatus}
              focusMode={sidebarView === "search" ? "search" : "route"}
              showDiagnostics={sidebarView === "search" ? false : true}
              showSavedAndDiscoveryHints={sidebarView === "search"}
              showAdvancedControls={sidebarView !== "search"}
            />

            {sidebarView === "explore" ? (
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
                onOpenShopDirections={(shop) => {
                  handleOpenDirectionsWithHistory(shop);
                }}
                onSelectDiscoveryPlace={(place) => {
                  handleSelectDiscoveryPlace(place, { centerMap: true });
                }}
                onOpenDiscoveryPlaceDirections={handleOpenDiscoveryPlaceDirections}
              />
            ) : null}

            {sidebarView === "saved" ? (
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
            ) : null}

            {sidebarView === "shops" ? (
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
            ) : null}
          </NavigationErrorBoundary>
        </CoverageCommandCenterSidebar>

        <div className="relative p-4 sm:p-6">
          <div className="pointer-events-none absolute inset-x-6 top-6 z-10 hidden h-28 rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(15,23,42,0.22),transparent)] xl:block" />
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
            mapHeightClassName="h-[74vh] min-h-[600px]"
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
            speedLimitMatchDistanceMeters={
              navigation.speedLimitSnapshot?.matchDistanceMeters ?? null
            }
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

          <div className="pointer-events-none absolute inset-x-6 top-8 z-[620] hidden items-start justify-between gap-4 lg:flex">
            <div className="pointer-events-auto flex max-w-[320px] flex-col gap-2">
              <div
                className={cn(
                  "map-liquid-card map-glass-float map-ui-enter map-ui-enter-delay-1 rounded-[1.25rem] border px-3 py-2.5 backdrop-blur-2xl",
                  theme.panelStrongClassName
                )}
              >
                <div className={theme.metricLabelClassName}>Next maneuver</div>
                <div
                  className={cn("mt-1 text-base font-semibold leading-tight", theme.titleClassName)}
                >
                  {navigation.nextStep?.instruction || "Start route from selected origin"}
                </div>
                <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                  {selectedShop
                    ? `Destination: ${selectedShop.name}`
                    : "Pick a partner shop to begin."}
                </div>
              </div>

              <div
                className={cn(
                  "map-liquid-card map-ui-enter map-ui-enter-delay-2 rounded-[1.1rem] border px-2.5 py-2.5 backdrop-blur-3xl",
                  theme.panelClassName
                )}
              >
                <div className="grid grid-cols-4 gap-1">
                  <button
                    type="button"
                    onClick={() => setSidebarView("search")}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px] !gap-1"
                    )}
                    aria-label="Search panel"
                  >
                    <Search className="h-3 w-3" />
                    Search
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarView("explore")}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px] !gap-1"
                    )}
                    aria-label="Explore panel"
                  >
                    <Compass className="h-3 w-3" />
                    Explore
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarView("saved")}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px] !gap-1"
                    )}
                    aria-label="Saved panel"
                  >
                    <Star className="h-3 w-3" />
                    Saved
                  </button>
                  <button
                    type="button"
                    onClick={() => setSidebarView("shops")}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px] !gap-1"
                    )}
                    aria-label="Shops panel"
                  >
                    <MapPinned className="h-3 w-3" />
                    Shops
                  </button>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onTileModeChange("roadmap")}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px]",
                      tileMode === "roadmap" ? "!bg-blue-500 !text-white" : null
                    )}
                    aria-label="Roadmap tile"
                  >
                    Map
                  </button>
                  <button
                    type="button"
                    onClick={() => onTileModeChange("satellite")}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px]",
                      tileMode === "satellite" ? "!bg-blue-500 !text-white" : null
                    )}
                    aria-label="Satellite tile"
                  >
                    Sat
                  </button>
                  <button
                    type="button"
                    onClick={() => onTileModeChange("night")}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px]",
                      tileMode === "night" ? "!bg-blue-500 !text-white" : null
                    )}
                    aria-label="Night tile"
                  >
                    Night
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMapOverride(null);
                      onCenterActive();
                    }}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px] !gap-1"
                    )}
                    aria-label="Center map"
                  >
                    <Crosshair className="h-3 w-3" />
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMapOverride(null);
                      onResetView();
                    }}
                    className={cn(
                      theme.secondaryButtonClassName,
                      "!py-1 !px-2 !text-[10px] !gap-1"
                    )}
                    aria-label="Reset map"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
              </div>
            </div>

            <div className="pointer-events-auto map-ui-enter map-ui-enter-delay-3 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={() => setSidebarView("search")}
                className={cn(theme.iconButtonClassName, "h-9 w-9")}
                aria-label="Navigation controls"
              >
                <Compass className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSidebarView("search")}
                className={cn(theme.iconButtonClassName, "h-9 w-9")}
                aria-label="Voice controls"
              >
                <Volume2 className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSidebarView("explore")}
                className={cn(theme.iconButtonClassName, "h-9 w-9")}
                aria-label="Share ETA and incidents"
              >
                <MessageCircle className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => setSidebarView("shops")}
                className={cn(theme.iconButtonClassName, "h-9 w-9")}
                aria-label="Report issue"
              >
                <AlertTriangle className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-6 bottom-8 z-[620] hidden justify-center lg:flex">
            <div
              className={cn(
                "map-liquid-card map-ui-enter pointer-events-auto w-full max-w-[680px] rounded-[1.5rem] border px-4 py-3 backdrop-blur-2xl",
                theme.panelStrongClassName
              )}
            >
              <div className="grid grid-cols-3 gap-2 text-center">
                <div>
                  <div className={cn("text-xl font-semibold tabular-nums", theme.titleClassName)}>
                    {arrivalLabel}
                  </div>
                  <div className={cn("text-xs", theme.secondaryTextClassName)}>arrival</div>
                </div>
                <div>
                  <div className={cn("text-xl font-semibold tabular-nums", theme.titleClassName)}>
                    {routeMinutes ? `${routeMinutes}` : "--"}
                  </div>
                  <div className={cn("text-xs", theme.secondaryTextClassName)}>min</div>
                </div>
                <div>
                  <div className={cn("text-xl font-semibold tabular-nums", theme.titleClassName)}>
                    {routeMiles ? `${routeMiles}` : "--"}
                  </div>
                  <div className={cn("text-xs", theme.secondaryTextClassName)}>mi</div>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => setSidebarView("explore")}
                  className={cn(theme.secondaryButtonClassName, "!py-1.5 !px-3 !text-xs")}
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  Share ETA
                </button>
                <button
                  type="button"
                  onClick={onStartNavigation}
                  disabled={!navigation.routePreview || !selectedShop || navigation.isLoadingRoute}
                  className={cn(
                    theme.primaryButtonClassName,
                    "!py-1.5 !px-4 !text-xs disabled:opacity-50"
                  )}
                >
                  <Compass className="h-3.5 w-3.5" />
                  Start Route
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
