import { useEffect, useState } from "react";
import ShopDirectoryMapPane from "./MapLibreShopDirectoryMapPane";
import ShopDirectoryMapOverlays from "./ShopDirectoryMapOverlays";
import NavigationActionRail from "../maps/navigation/NavigationActionRail";
import NavigationSettingsSheet from "../maps/navigation/NavigationSettingsSheet";
import NavigationTurnListSheet from "../maps/navigation/NavigationTurnListSheet";
import NavigationVoiceControlsSheet from "../maps/navigation/NavigationVoiceControlsSheet";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { IntelligenceSummary } from "../../services/intelligence/marketIntelligence";
import type { NavigationSessionStatus } from "../../features/navigation";
import type { GpsStatus } from "../../hooks/useNavigationGpsTracking";
import type { DamageReport } from "../../types";
import type { NavigationRouteStep } from "../../types/navigation";
import type { NavigationVoiceMode, NavigationVoiceVolumePreset } from "../../types/navigation";
import { getShopRouteActionLabel } from "../../hooks/shopDirectorySessionUtils";
import type {
  Coordinates,
  MapTheme,
  MapViewportBounds,
  Place,
  RouteOption,
  SavedPlace,
} from "../../types/mapDomain";

type ImmersiveMapViewportProps = {
  isDark: boolean;
  isNight: boolean;
  isSatellite: boolean;
  effectiveMapTheme: MapTheme;
  isGuidanceMode: boolean;
  mapCenter: Coordinates | null;
  mapZoom: number;
  mapTheme: MapTheme;
  mapListings: ShopMapListing[];
  routeOptions: RouteOption[];
  selectedRoute: RouteOption | null;
  selectedRouteId: string | null;
  selectedShopId: number | null;
  selectedShop: ShopMapListing | null;
  selectedOrigin: Place | null;
  savedPlaces: SavedPlace[];
  routeSummary: IntelligenceSummary;
  userType: MarketUserType;
  roleHighlights: { title: string; callouts: string[] };
  directionsActionLabel: string;
  navigationSessionStatus: NavigationSessionStatus;
  navigationSessionDestinationId: string | null;
  sessionActiveSeconds: number;
  hasArrived: boolean;
  remainingEtaLabel?: string | null;
  remainingDistanceLabel?: string | null;
  usingLiveRoutes: boolean;
  routeError: string;
  isLoadingRoute: boolean;
  guidanceOverlay?: React.ReactNode;
  followCurrentPosition: boolean;
  followCurrentPositionRevision: number;
  deviationPrompt?: React.ReactNode;
  isOffRoute: boolean;
  navigationMode: "browse" | "route-preview" | "guidance";
  routeSteps: NavigationRouteStep[];
  currentStepIndex: number;
  nextInstruction?: string | null;
  currentSpeedMph?: number | null;
  speedLimitMph?: number | null;
  gpsStatus?: GpsStatus;
  gpsError?: string;
  followingInstruction?: string | null;
  voiceMode: NavigationVoiceMode;
  voiceVolumePreset: NavigationVoiceVolumePreset;
  preferredVoiceLabel: string | null;
  voiceGuidanceSupported: boolean;
  onVoiceModeChange?: (mode: NavigationVoiceMode) => void;
  onVoiceVolumePresetChange?: (preset: NavigationVoiceVolumePreset) => void;
  gpsTrackingEnabled: boolean;
  speedLimitMonitorEnabled: boolean;
  autoRerouteEnabled: boolean;
  onToggleGpsTracking?: () => void;
  onToggleSpeedLimitMonitor?: () => void;
  onToggleAutoReroute?: () => void;
  onRetryGps?: () => void;
  onRetryRoute?: () => void;
  searchWithinViewport: boolean;
  onSearchInArea?: () => void;
  onClearAreaSearch?: () => void;
  onFindShopsNear?: (coords: { lat: number; lng: number }) => void;
  onSelectShop: (id: number | null) => void;
  onSelectRoute: (id: string) => void;
  onOpenShopDirections: (shop: ShopMapListing) => void;
  onStartNavigation?: (shop: ShopMapListing) => void;
  onViewDetails?: (shop: ShopMapListing) => void;
  onRequestEstimate?: (shop: ShopMapListing) => void;
  onPauseNavigation?: () => void;
  onResumeNavigation?: () => void;
  onEndNavigation?: () => void;
  onRecenterNavigation?: () => void;
  onSetMapCenter: (center: Coordinates) => void;
  onSetMapZoom: (zoom: number) => void;
  onSetMapViewportBounds: (bounds: MapViewportBounds) => void;
  userCoords?: Coordinates | null;
  userHeadingDegrees?: number | null;
  onViewReportDetail?: (reportId: string) => void;
  onPlaceBid?: (report: DamageReport) => void;
  onViewBids?: (reportId: string) => void;
  initialReports?: DamageReport[];
  tileModeOverride: MapTileMode | null;
  onTileDarkChange: (dark: boolean | null) => void;
  onTileModeChange: (mode: MapTileMode | null) => void;
};

const getDefaultCenter = (): Coordinates => ({ latitude: 40.7128, longitude: -74.006 });

export default function ImmersiveMapViewport({
  isDark,
  isNight,
  isSatellite,
  effectiveMapTheme,
  isGuidanceMode,
  mapCenter,
  mapZoom,
  mapTheme,
  mapListings,
  routeOptions,
  selectedRoute,
  selectedRouteId,
  selectedShopId,
  selectedShop,
  selectedOrigin,
  savedPlaces,
  routeSummary,
  userType,
  roleHighlights,
  directionsActionLabel,
  navigationSessionStatus,
  navigationSessionDestinationId,
  sessionActiveSeconds,
  hasArrived,
  remainingEtaLabel,
  remainingDistanceLabel,
  usingLiveRoutes,
  routeError,
  isLoadingRoute,
  guidanceOverlay,
  followCurrentPosition,
  followCurrentPositionRevision,
  deviationPrompt,
  isOffRoute,
  navigationMode,
  routeSteps,
  currentStepIndex,
  nextInstruction,
  currentSpeedMph,
  speedLimitMph,
  gpsStatus,
  gpsError,
  followingInstruction,
  voiceMode,
  voiceVolumePreset,
  preferredVoiceLabel,
  voiceGuidanceSupported,
  onVoiceModeChange,
  onVoiceVolumePresetChange,
  gpsTrackingEnabled,
  speedLimitMonitorEnabled,
  autoRerouteEnabled,
  onToggleGpsTracking,
  onToggleSpeedLimitMonitor,
  onToggleAutoReroute,
  onRetryGps,
  onRetryRoute,
  searchWithinViewport,
  onSearchInArea,
  onClearAreaSearch,
  onFindShopsNear,
  onSelectShop,
  onSelectRoute,
  onOpenShopDirections,
  onStartNavigation,
  onViewDetails,
  onRequestEstimate,
  onPauseNavigation,
  onResumeNavigation,
  onEndNavigation,
  onRecenterNavigation,
  onSetMapCenter,
  onSetMapZoom,
  onSetMapViewportBounds,
  userCoords,
  userHeadingDegrees,
  onViewReportDetail,
  onPlaceBid,
  onViewBids,
  initialReports,
  tileModeOverride,
  onTileDarkChange,
  onTileModeChange,
}: ImmersiveMapViewportProps) {
  const [turnListOpen, setTurnListOpen] = useState(false);
  const [voiceControlsOpen, setVoiceControlsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  useEffect(() => {
    if (!isGuidanceMode && turnListOpen) setTurnListOpen(false);
    if (!isGuidanceMode && voiceControlsOpen) setVoiceControlsOpen(false);
    if (!isGuidanceMode && settingsOpen) setSettingsOpen(false);
  }, [isGuidanceMode, turnListOpen, voiceControlsOpen, settingsOpen]);

  return (
    <div className="absolute inset-0 z-[2]">
      {/* Edge vignette (night mode) */}
      {isNight && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            boxShadow: "inset 0 0 80px rgba(8,18,38,0.55), inset 0 0 200px rgba(10,26,56,0.25)",
          }}
        />
      )}
      {/* Edge vignette (satellite) */}
      {isSatellite && (
        <div
          className="pointer-events-none absolute inset-0 z-10"
          style={{
            boxShadow: "inset 0 0 60px rgba(4,10,22,0.40), inset 0 0 150px rgba(6,14,30,0.18)",
          }}
        />
      )}
      <ShopDirectoryMapPane
        initialCenter={mapCenter || getDefaultCenter()}
        initialZoom={mapZoom}
        mapTheme={mapTheme}
        onSelectShop={onSelectShop}
        onViewportChange={(center, zoom, bounds) => {
          onSetMapCenter(center);
          onSetMapZoom(zoom);
          onSetMapViewportBounds(bounds);
        }}
        routeOptions={routeOptions}
        savedPlaces={savedPlaces}
        selectedOrigin={selectedOrigin}
        selectedRouteId={selectedRouteId}
        selectedShopId={selectedShopId}
        shops={mapListings}
        suppressHeader
        suppressTilePicker
        externalTileMode={tileModeOverride}
        suppressBottomCard={Boolean(isGuidanceMode || (selectedShop && !selectedOrigin))}
        userCoords={userCoords}
        userHeadingDegrees={userHeadingDegrees}
        userType={userType}
        followCurrentPosition={followCurrentPosition}
        followCurrentPositionRevision={followCurrentPositionRevision}
        onOpenShopDirections={onOpenShopDirections}
        onStartNavigation={onStartNavigation}
        onViewDetails={onViewDetails}
        onRequestEstimate={onRequestEstimate}
        navigationSessionStatus={navigationSessionStatus}
        navigationSessionDestinationId={navigationSessionDestinationId}
        directionsActionLabel={directionsActionLabel}
        searchWithinViewport={searchWithinViewport}
        preserveViewport={searchWithinViewport}
        onSearchInArea={onSearchInArea}
        onClearAreaSearch={onClearAreaSearch}
        onFindShopsNear={onFindShopsNear}
        hasArrived={hasArrived}
        isLoadingRoute={isLoadingRoute}
        remainingDistanceLabel={remainingDistanceLabel}
        remainingEtaLabel={remainingEtaLabel}
        routeError={routeError}
        usingLiveRoutes={usingLiveRoutes}
        onViewReportDetail={onViewReportDetail}
        onPlaceBid={onPlaceBid}
        onViewBids={onViewBids}
        initialReports={initialReports}
        navigationSteps={routeSteps}
        currentStepIndex={currentStepIndex}
        navigationMode={navigationMode}
        isOffRoute={isOffRoute}
        suppressShopPopup
        onTileDarkChange={onTileDarkChange}
        onTileModeChange={onTileModeChange}
      >
        <>
          <ShopDirectoryMapOverlays
            deviationPrompt={deviationPrompt}
            directionsLabel={
              selectedShop
                ? getShopRouteActionLabel({
                    shopId: selectedShop.id,
                    routeReady: Boolean(selectedOrigin && selectedRoute),
                    defaultLabel: directionsActionLabel,
                    navigationSessionStatus,
                    navigationSessionDestinationId,
                  })
                : directionsActionLabel
            }
            intelligenceCallouts={roleHighlights.callouts}
            intelligenceTitle={roleHighlights.title}
            mapTheme={effectiveMapTheme}
            navigationMode={navigationMode}
            onEndNavigation={onEndNavigation}
            onPauseNavigation={onPauseNavigation}
            onRecenterNavigation={onRecenterNavigation}
            onResumeNavigation={onResumeNavigation}
            onSelectRoute={onSelectRoute}
            onStartNavigation={
              selectedShop
                ? () =>
                    onStartNavigation
                      ? onStartNavigation(selectedShop)
                      : onOpenShopDirections(selectedShop)
                : undefined
            }
            routeOptions={routeOptions}
            routeSummary={routeSummary}
            hasArrived={hasArrived}
            remainingDistanceLabel={remainingDistanceLabel}
            remainingEtaLabel={remainingEtaLabel}
            routeError={routeError}
            sessionActiveSeconds={sessionActiveSeconds}
            sessionDestinationId={navigationSessionDestinationId}
            sessionDestinationLabel={selectedShop?.name ?? null}
            sessionStatus={navigationSessionStatus}
            isLoadingRoute={isLoadingRoute}
            selectedOrigin={selectedOrigin}
            selectedRoute={selectedRoute}
            selectedShop={selectedShop}
            usingLiveRoutes={usingLiveRoutes}
            overlayTopClass={isGuidanceMode ? "top-16" : "top-28"}
            intelligenceLeftClass="left-4 sm:left-[324px]"
            nextInstruction={nextInstruction}
            followingInstruction={followingInstruction}
            currentSpeedMph={currentSpeedMph}
            gpsStatus={gpsStatus}
            gpsError={gpsError}
            speedLimitMph={speedLimitMph}
            onRetryGps={onRetryGps}
            onRetryRoute={onRetryRoute}
            onViewDetails={onViewDetails}
            onRequestEstimate={onRequestEstimate}
          />
          {guidanceOverlay}
          {isGuidanceMode && (
            <>
              <NavigationActionRail
                tone={isDark ? "dark" : "light"}
                turnListOpen={turnListOpen}
                voiceControlsOpen={voiceControlsOpen}
                settingsOpen={settingsOpen}
                showVoiceControl
                className="bottom-[calc(max(env(safe-area-inset-bottom),0.75rem)_+_20rem)]"
                onToggleTurnList={() => {
                  setTurnListOpen((c) => !c);
                  setVoiceControlsOpen(false);
                  setSettingsOpen(false);
                }}
                onToggleVoiceControls={() => {
                  setVoiceControlsOpen((c) => !c);
                  setTurnListOpen(false);
                  setSettingsOpen(false);
                }}
                onToggleSettings={() => {
                  setSettingsOpen((c) => !c);
                  setTurnListOpen(false);
                  setVoiceControlsOpen(false);
                }}
                onRecenter={() => onRecenterNavigation?.()}
              />
              <NavigationTurnListSheet
                tone={isDark ? "dark" : "light"}
                open={turnListOpen}
                steps={routeSteps}
                currentStepIndex={currentStepIndex}
                onClose={() => setTurnListOpen(false)}
              />
              <NavigationVoiceControlsSheet
                tone={isDark ? "dark" : "light"}
                open={voiceControlsOpen}
                voiceMode={voiceMode}
                voiceVolumePreset={voiceVolumePreset}
                preferredVoiceLabel={preferredVoiceLabel}
                voiceGuidanceSupported={voiceGuidanceSupported}
                onVoiceModeChange={(mode) => onVoiceModeChange?.(mode)}
                onVoiceVolumePresetChange={(preset) => onVoiceVolumePresetChange?.(preset)}
                onClose={() => setVoiceControlsOpen(false)}
              />
              <NavigationSettingsSheet
                tone={isDark ? "dark" : "light"}
                open={settingsOpen}
                gpsTrackingEnabled={gpsTrackingEnabled}
                speedLimitMonitorEnabled={speedLimitMonitorEnabled}
                autoRerouteEnabled={autoRerouteEnabled}
                onToggleGpsTracking={() => onToggleGpsTracking?.()}
                onToggleSpeedLimitMonitor={() => onToggleSpeedLimitMonitor?.()}
                onToggleAutoReroute={() => onToggleAutoReroute?.()}
                onClose={() => setSettingsOpen(false)}
              />
            </>
          )}
        </>
      </ShopDirectoryMapPane>
    </div>
  );
}
