import {
  AttributionControl,
  Circle,
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  ZoomControl,
} from "react-leaflet";
import { useEffect, useState } from "react";
import { cn } from "../ui/utils";
import { ensureLeafletDefaultIcon } from "./leafletSetup";
import MapDiscoveryPlaceMarkers from "./MapDiscoveryPlaceMarkers";
import MapNavigationHud from "./MapNavigationHud";
import MapPartnerShopMarkers from "./MapPartnerShopMarkers";
import MapSearchTargetMarkers from "./MapSearchTargetMarkers";
import MapFollowLocationController from "./MapFollowLocationController";
import MapRouteFitController from "./MapRouteFitController";
import MapViewportController from "./MapViewportController";
import MapZoomTracker from "./MapZoomTracker";
import MapSurfaceControls from "./MapSurfaceControls";
import MapSurfaceHeaderBadges from "./MapSurfaceHeaderBadges";
import MapSurfaceStatusBar from "./MapSurfaceStatusBar";
import { getMapSurfaceTheme, resolveMapSurfaceTone } from "./mapSurfaceTheme";
import { mapTileLayers } from "./mapTileLayers";
import MapReportMarkers from "./MapReportMarkers";
import NavigationErrorBoundary from "./NavigationErrorBoundary";
import { runMapPerformanceDiagnosticsChecks } from "../../services/navigation/mapPerformanceDiagnostics.check";
import { runNavigationDiagnosticsChecks } from "../../services/navigation/navigationDiagnostics.check";
import { runProviderHealthDiagnosticsChecks } from "../../services/navigation/providerHealthDiagnostics.check";
import {
  clearMapInteractionSamples,
  getMapPerformanceSummary,
  type MapPerformanceSummary,
} from "../../services/navigation/mapPerformance";
import type {
  CoverageCountyMarker,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
} from "./serviceCoverageMapTypes";
import type { NavigationSpeedLimitConfidence, NavigationVoiceMode } from "../../types/navigation";
import type { NavigationDiscoveryPlace } from "../../services/navigation/placeDiscovery";

ensureLeafletDefaultIcon();
const worldBounds: [[number, number], [number, number]] = [
  [-85, -179.999],
  [85, 179.999],
];

type ServiceCoverageMapProps = {
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: CoveragePartnerShop[];
  activeSearchTarget: CoverageSearchTarget | null;
  radiusMeters: number;
  radiusMiles: string;
  regionCount: number;
  selectedShopId?: string;
  selectedDiscoveryPlaceId?: string;
  className?: string;
  mapHeightClassName?: string;
  immersiveFullscreen?: boolean;
  presentationMode?: "coverage" | "navigation";
  showSurfaceChrome?: boolean;
  showNavigationHud?: boolean;
  followCurrentPosition?: boolean;
  followCurrentPositionRevision?: number;
  discoveryPlaces?: NavigationDiscoveryPlace[];
  routeGeometry?: [number, number][];
  routeFitKey?: string | null;
  currentPosition?: [number, number] | null;
  gpsAccuracyMeters?: number | null;
  currentSpeedMph?: number | null;
  postedSpeedLimitMph?: number | null;
  postedSpeedLimitConfidence?: NavigationSpeedLimitConfidence | null;
  speedLimitMatchDistanceMeters?: number | null;
  nearestRoadName?: string | null;
  nextInstruction?: string | null;
  voiceMode?: NavigationVoiceMode;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
  onSelectShop?: (shopId: string) => void;
  onSelectDiscoveryPlace?: (place: NavigationDiscoveryPlace) => void;
  onExpand?: () => void;
};

export default function ServiceCoverageMap({
  center,
  zoom,
  revision,
  tileMode,
  counties,
  partnerShops,
  activeSearchTarget,
  radiusMeters,
  radiusMiles,
  regionCount,
  selectedShopId,
  selectedDiscoveryPlaceId,
  className,
  mapHeightClassName,
  immersiveFullscreen = false,
  presentationMode = "coverage",
  showSurfaceChrome = true,
  showNavigationHud = true,
  followCurrentPosition = false,
  followCurrentPositionRevision = 0,
  discoveryPlaces = [],
  routeGeometry,
  routeFitKey,
  currentPosition,
  gpsAccuracyMeters,
  currentSpeedMph,
  postedSpeedLimitMph,
  postedSpeedLimitConfidence,
  speedLimitMatchDistanceMeters,
  nearestRoadName,
  nextInstruction,
  voiceMode = "alerts-only",
  onTileModeChange,
  onCenterActive,
  onResetView,
  onSelectShop,
  onSelectDiscoveryPlace,
  onExpand,
}: ServiceCoverageMapProps) {
  const [liveZoom, setLiveZoom] = useState(zoom);
  const [performanceSummary, setPerformanceSummary] = useState<MapPerformanceSummary>(() =>
    getMapPerformanceSummary()
  );
  const isNavigationPresentation = presentationMode === "navigation";
  const tileLayer = mapTileLayers[tileMode];
  const tone = resolveMapSurfaceTone(tileMode);
  const theme = getMapSurfaceTheme(tone, immersiveFullscreen);
  const activeFocusLabel = activeSearchTarget
    ? activeSearchTarget.source === "geolocation"
      ? "Live location focus"
      : activeSearchTarget.label
    : "Regional overview";
  const showWorldOverview = immersiveFullscreen && liveZoom <= 3;
  const showStrategicOverview = immersiveFullscreen && liveZoom <= 6;
  const showNightBackdrop = immersiveFullscreen && (tileMode === "night" || showWorldOverview);
  const showPerformanceResetControl =
    typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV);
  const overviewLabel = showWorldOverview
    ? "World overview"
    : showStrategicOverview
      ? "Strategic overview"
      : null;

  useEffect(() => {
    setLiveZoom(zoom);
  }, [zoom, revision]);

  useEffect(() => {
    if (!(typeof import.meta !== "undefined" && Boolean(import.meta.env?.DEV))) {
      return;
    }

    if (typeof window === "undefined") {
      return;
    }

    // Dev-only: expose deterministic diagnostics checks for quick console verification.
    (window as unknown as Record<string, unknown>).runMapPerformanceDiagnosticsChecks =
      runMapPerformanceDiagnosticsChecks;
    (window as unknown as Record<string, unknown>).runProviderHealthDiagnosticsChecks =
      runProviderHealthDiagnosticsChecks;
    (window as unknown as Record<string, unknown>).runNavigationDiagnosticsChecks =
      runNavigationDiagnosticsChecks;

    return () => {
      delete (window as unknown as Record<string, unknown>).runMapPerformanceDiagnosticsChecks;
      delete (window as unknown as Record<string, unknown>).runProviderHealthDiagnosticsChecks;
      delete (window as unknown as Record<string, unknown>).runNavigationDiagnosticsChecks;
    };
  }, []);

  return (
    <div
      data-map-tone={tone}
      className={cn(
        "coverage-map-surface relative overflow-hidden rounded-[2rem]",
        theme.shellClassName,
        className
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-0 z-[248]",
          theme.ambientOverlayClassName
        )}
      />

      {showNightBackdrop ? (
        <div
          className="pointer-events-none absolute inset-0 z-[250] opacity-35"
          style={{
            backgroundImage: [
              "radial-gradient(circle at 14% 20%, rgba(255,255,255,0.95) 0, rgba(255,255,255,0.95) 1px, transparent 1.5px)",
              "radial-gradient(circle at 31% 72%, rgba(148,163,184,0.9) 0, rgba(148,163,184,0.9) 1px, transparent 1.5px)",
              "radial-gradient(circle at 72% 18%, rgba(255,255,255,0.85) 0, rgba(255,255,255,0.85) 1px, transparent 1.5px)",
              "radial-gradient(circle at 84% 62%, rgba(125,211,252,0.8) 0, rgba(125,211,252,0.8) 1px, transparent 1.5px)",
              "radial-gradient(circle at 56% 42%, rgba(255,255,255,0.75) 0, rgba(255,255,255,0.75) 1px, transparent 1.5px)",
              "radial-gradient(circle at 66% 82%, rgba(255,255,255,0.92) 0, rgba(255,255,255,0.92) 1px, transparent 1.5px)",
              "radial-gradient(circle at center, rgba(56,189,248,0.18), transparent 44%)",
            ].join(", "),
          }}
        />
      ) : null}

      {immersiveFullscreen ? (
        <div className="pointer-events-none absolute inset-0 z-[260] bg-[radial-gradient(circle_at_center,transparent_52%,rgba(15,23,42,0.14)_74%,rgba(15,23,42,0.32)_100%)]" />
      ) : null}

      {showSurfaceChrome ? (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-wrap items-start justify-between gap-1.5 p-2 sm:gap-3 sm:p-4">
          <MapSurfaceHeaderBadges
            tone={tone}
            activeFocusLabel={activeFocusLabel}
            overviewBadge={overviewLabel}
          />
          <MapSurfaceControls
            tone={tone}
            tileMode={tileMode}
            canCenter={Boolean(activeSearchTarget)}
            onTileModeChange={onTileModeChange}
            onCenterActive={onCenterActive}
            onResetView={onResetView}
            onExpand={onExpand}
          />
        </div>
      ) : null}

      {showNavigationHud ? (
        <MapNavigationHud
          tone={tone}
          currentSpeedMph={currentSpeedMph}
          postedSpeedLimitMph={postedSpeedLimitMph}
          postedSpeedLimitConfidence={postedSpeedLimitConfidence}
          nearestRoadName={nearestRoadName}
          gpsAccuracyMeters={gpsAccuracyMeters}
          speedLimitMatchDistanceMeters={speedLimitMatchDistanceMeters}
          nextInstruction={nextInstruction}
          voiceMode={voiceMode}
        />
      ) : null}

      <div className="pointer-events-none absolute bottom-3 left-2 z-[620] sm:left-3 map-ui-enter map-ui-enter-delay-2">
        <div
          className={cn(
            "coverage-map-brand-badge rounded-full border px-2 py-0.5 text-[8px] font-semibold uppercase tracking-[0.12em] sm:px-2.5 sm:py-1 sm:text-[10px] sm:tracking-[0.14em]",
            tone === "light"
              ? "border-blue-200/85 bg-white/88 text-blue-900"
              : "border-blue-200/25 bg-slate-950/78 text-blue-100"
          )}
        >
          BidOnDent Maps
        </div>
      </div>

      <MapContainer
        center={center}
        zoom={zoom}
        minZoom={immersiveFullscreen ? 2 : 8}
        zoomControl={false}
        attributionControl={false}
        className={cn(
          "coverage-map-canvas h-[420px] w-full",
          theme.mapCanvasClassName,
          mapHeightClassName
        )}
        preferCanvas
        scrollWheelZoom
        maxBounds={immersiveFullscreen ? worldBounds : undefined}
        maxBoundsViscosity={immersiveFullscreen ? 1 : undefined}
        zoomSnap={0.5}
        zoomDelta={0.5}
        worldCopyJump={false}
      >
        <AttributionControl position="bottomright" prefix={false} />
        <ZoomControl position="bottomright" />
        <MapViewportController center={center} zoom={zoom} revision={revision} />
        <MapZoomTracker
          onZoomChange={setLiveZoom}
          onPerformanceSample={() => {
            setPerformanceSummary(getMapPerformanceSummary());
          }}
        />
        <MapFollowLocationController
          enabled={followCurrentPosition}
          currentPosition={currentPosition}
          revision={followCurrentPositionRevision}
        />
        {routeGeometry && routeGeometry.length > 1 ? (
          <>
            <MapRouteFitController routeGeometry={routeGeometry} routeFitKey={routeFitKey} />
            <Polyline
              positions={routeGeometry}
              pathOptions={{
                color: tone === "light" ? "#ffffff" : "#e0f2fe",
                opacity: isNavigationPresentation ? 0.94 : 0.9,
                weight: isNavigationPresentation ? 12 : 10,
              }}
            />
            <Polyline
              positions={routeGeometry}
              pathOptions={{
                color: tone === "light" ? "#2563eb" : "#38bdf8",
                opacity: 0.98,
                weight: isNavigationPresentation ? 7 : 5,
              }}
            />
          </>
        ) : null}

        <TileLayer
          key={tileMode}
          attribution={tileLayer.attribution}
          maxZoom={tileLayer.maxZoom}
          url={tileLayer.url}
          noWrap={immersiveFullscreen}
        />

        {!isNavigationPresentation &&
          counties.map((county) => (
            <CircleMarker
              key={county.name}
              center={[county.lat, county.lng]}
              radius={8}
              pathOptions={{
                color: "#2563eb",
                fillColor: "#7dd3fc",
                fillOpacity: 0.8,
                weight: 2,
              }}
            >
              <Popup>
                <div className="text-sm">
                  <div className="font-semibold">{county.name}</div>
                  <div>Active BidOnDent coverage signal</div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

        <MapPartnerShopMarkers
          partnerShops={partnerShops}
          selectedShopId={selectedShopId}
          isNavigationPresentation={isNavigationPresentation}
          onSelectShop={onSelectShop}
        />

        {/* PASS 176: Render report markers on the map (not in navigation mode) */}
        {!isNavigationPresentation && (
          <NavigationErrorBoundary>
            <MapReportMarkers />
          </NavigationErrorBoundary>
        )}

        {!isNavigationPresentation && discoveryPlaces.length > 0 ? (
          <MapDiscoveryPlaceMarkers
            tone={tone}
            places={discoveryPlaces}
            selectedPlaceId={selectedDiscoveryPlaceId}
            onSelectPlace={onSelectDiscoveryPlace}
          />
        ) : null}

        {currentPosition ? (
          <>
            {gpsAccuracyMeters ? (
              <Circle
                center={currentPosition}
                radius={Math.max(18, Math.min(gpsAccuracyMeters, 180))}
                pathOptions={{
                  color: tone === "light" ? "#60a5fa" : "#67e8f9",
                  fillColor: tone === "light" ? "#60a5fa" : "#22d3ee",
                  fillOpacity: 0.12,
                  weight: 1.5,
                }}
              />
            ) : null}
            <CircleMarker
              center={currentPosition}
              radius={isNavigationPresentation ? 14 : 12}
              pathOptions={{
                color: "#ffffff",
                fillColor: tone === "light" ? "#0ea5e9" : "#22d3ee",
                fillOpacity: 1,
                weight: 4,
              }}
            >
              <Tooltip direction="top" offset={[0, -16]}>
                Live GPS
              </Tooltip>
            </CircleMarker>
          </>
        ) : null}

        {activeSearchTarget && !isNavigationPresentation ? (
          <MapSearchTargetMarkers
            activeSearchTarget={activeSearchTarget}
            radiusMeters={radiusMeters}
            radiusMiles={radiusMiles}
          />
        ) : null}
      </MapContainer>

      {showSurfaceChrome ? (
        <MapSurfaceStatusBar
          tone={tone}
          regionCount={regionCount}
          partnerShopCount={partnerShops.length}
          modeLabel={`${tileLayer.label} mode`}
          radiusMiles={activeSearchTarget ? radiusMiles : null}
          overviewLabel={overviewLabel}
          performanceOverBudgetCount={performanceSummary.overBudgetCount}
          performanceRecentOverBudgetCount={performanceSummary.recentOverBudgetCount}
          performanceRecentSampleCount={performanceSummary.recentSampleCount}
          performanceSampleCount={performanceSummary.sampleCount}
          performanceRecentStatus={performanceSummary.recentStatus}
          performanceLatestSampleAt={performanceSummary.latestSampleAt}
          performanceLatestSampleAgeMs={performanceSummary.latestSampleAgeMs}
          lastZoomDurationMs={performanceSummary.lastZoomDurationMs}
          lastPanDurationMs={performanceSummary.lastPanDurationMs}
          onResetPerformance={
            showPerformanceResetControl
              ? () => {
                  clearMapInteractionSamples();
                  setPerformanceSummary(getMapPerformanceSummary());
                }
              : undefined
          }
        />
      ) : null}
    </div>
  );
}
