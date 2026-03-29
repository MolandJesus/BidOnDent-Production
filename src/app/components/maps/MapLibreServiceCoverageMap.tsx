import Map, { AttributionControl, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../ui/utils";
import MapNavigationHud from "./MapNavigationHud";
import MapSurfaceControls from "./MapSurfaceControls";
import MapSurfaceHeaderBadges from "./MapSurfaceHeaderBadges";
import MapSurfaceStatusBar from "./MapSurfaceStatusBar";
import MapLibreCoverageMapLayers from "./MapLibreCoverageMapLayers";
import MapLibrePartnerShopLayer, { PARTNER_SHOPS_LAYER_ID } from "./MapLibrePartnerShopLayer";
import MapLibreReportLayer, { REPORT_MARKERS_LAYER_ID } from "./MapLibreReportLayer";
import MapLibreDiscoveryPlaceLayer, {
  DISCOVERY_PLACES_LAYER_ID,
} from "./MapLibreDiscoveryPlaceLayer";
import { getMapSurfaceTheme, resolveMapSurfaceTone } from "./mapSurfaceTheme";
import { mapLibreStyles, mapLibreTileLabels } from "./mapLibreStyles";
import {
  MapLibreViewportController,
  MapLibreFollowLocationController,
} from "./mapLibreControllers";
import { circlePolygon } from "./mapLibreHelpers";
import {
  clearMapInteractionSamples,
  getMapPerformanceSummary,
  recordMapInteractionSample,
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

/* ---------- main component ---------- */

type MapLibreServiceCoverageMapProps = {
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

export default function MapLibreServiceCoverageMap({
  center,
  zoom,
  revision,
  tileMode,
  counties = [],
  partnerShops = [],
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
}: MapLibreServiceCoverageMapProps) {
  const [liveZoom, setLiveZoom] = useState(zoom);
  const [performanceSummary, setPerformanceSummary] = useState<MapPerformanceSummary>(() =>
    getMapPerformanceSummary()
  );

  const isNavigationPresentation = presentationMode === "navigation";
  const tone = resolveMapSurfaceTone(tileMode);
  const theme = getMapSurfaceTheme(tone, immersiveFullscreen);
  const mapStyle = mapLibreStyles[tileMode];

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

  /* --- performance tracking --- */
  const zoomStartRef = useRef<number | null>(null);
  const moveStartRef = useRef<number | null>(null);
  const isZoomingRef = useRef(false);

  const onZoomStart = useCallback(() => {
    isZoomingRef.current = true;
    zoomStartRef.current = performance.now();
  }, []);

  const onZoomEnd = useCallback(() => {
    if (zoomStartRef.current !== null) {
      recordMapInteractionSample("zoom", performance.now() - zoomStartRef.current);
      setPerformanceSummary(getMapPerformanceSummary());
    }
    zoomStartRef.current = null;
    isZoomingRef.current = false;
  }, []);

  const onMoveStart = useCallback(() => {
    moveStartRef.current = performance.now();
  }, []);

  const onMoveEnd = useCallback(() => {
    if (isZoomingRef.current) {
      moveStartRef.current = null;
      return;
    }
    if (moveStartRef.current !== null) {
      recordMapInteractionSample("pan", performance.now() - moveStartRef.current);
      setPerformanceSummary(getMapPerformanceSummary());
    }
    moveStartRef.current = null;
  }, []);

  const handleZoom = useCallback((e: { viewState: { zoom: number } }) => {
    setLiveZoom(e.viewState.zoom);
  }, []);

  /* --- route GeoJSON --- */
  const routeGeoJSON = useMemo(() => {
    if (!routeGeometry || routeGeometry.length < 2) return null;
    return {
      type: "Feature" as const,
      geometry: {
        type: "LineString" as const,
        coordinates: routeGeometry.map(([lat, lng]) => [lng, lat]),
      },
      properties: {},
    };
  }, [routeGeometry]);

  /* --- county GeoJSON --- */
  const countyGeoJSON = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: counties.map((c) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [c.lng, c.lat] },
        properties: { name: c.name },
      })),
    }),
    [counties]
  );

  /* --- GPS GeoJSON --- */
  const gpsPointGeoJSON = useMemo(() => {
    if (!currentPosition) return null;
    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [currentPosition[1], currentPosition[0]],
      },
      properties: {},
    };
  }, [currentPosition]);

  const gpsAccuracyGeoJSON = useMemo(() => {
    if (!currentPosition || !gpsAccuracyMeters) return null;
    return circlePolygon(
      currentPosition[0],
      currentPosition[1],
      Math.max(18, Math.min(gpsAccuracyMeters, 180))
    );
  }, [currentPosition, gpsAccuracyMeters]);

  /* --- search target GeoJSON --- */
  const searchTargetRadiusGeoJSON = useMemo(() => {
    if (!activeSearchTarget) return null;
    return circlePolygon(activeSearchTarget.lat, activeSearchTarget.lng, radiusMeters);
  }, [activeSearchTarget, radiusMeters]);

  const searchTargetPointGeoJSON = useMemo(() => {
    if (!activeSearchTarget) return null;
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [activeSearchTarget.lng, activeSearchTarget.lat],
          },
          properties: { kind: "outer" },
        },
        {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [activeSearchTarget.lng, activeSearchTarget.lat],
          },
          properties: { kind: "inner" },
        },
      ],
    };
  }, [activeSearchTarget]);

  /* --- radius edge label point (east edge of radius circle) --- */
  const radiusLabelGeoJSON = useMemo(() => {
    if (!activeSearchTarget || !radiusMiles) return null;
    const latRad = (activeSearchTarget.lat * Math.PI) / 180;
    const lngOffset = radiusMeters / (111320 * Math.cos(latRad));
    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [activeSearchTarget.lng + lngOffset, activeSearchTarget.lat],
      },
      properties: { label: `${radiusMiles} mi` },
    };
  }, [activeSearchTarget, radiusMeters, radiusMiles]);

  const interactiveLayerIds = useMemo(() => {
    const ids = [PARTNER_SHOPS_LAYER_ID];
    if (!isNavigationPresentation) {
      ids.push(REPORT_MARKERS_LAYER_ID);
      if (discoveryPlaces.length > 0) ids.push(DISCOVERY_PLACES_LAYER_ID);
    }
    return ids;
  }, [isNavigationPresentation, discoveryPlaces.length]);

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
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-wrap items-start justify-between gap-1.5 p-2 sm:gap-2 sm:p-3">
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
            "coverage-map-brand-badge rounded-full border px-1.5 py-0.5 text-[7px] font-semibold uppercase tracking-[0.10em] sm:px-2.5 sm:py-1 sm:text-[9px] sm:tracking-[0.12em]",
            tone === "light"
              ? "border-blue-200/60 bg-white/80 text-blue-800/80"
              : "border-blue-200/18 bg-slate-950/70 text-blue-200/70"
          )}
        >
          BidOnDent Maps
        </div>
      </div>

      {/* ---- MapLibre GL Canvas ---- */}
      <div
        className={cn(
          "coverage-map-canvas h-[280px] sm:h-[380px] md:h-[420px] w-full",
          theme.mapCanvasClassName,
          mapHeightClassName
        )}
      >
        <Map
          id="coverage-map"
          initialViewState={{
            longitude: center[1],
            latitude: center[0],
            zoom,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle={mapStyle}
          attributionControl={false}
          minZoom={immersiveFullscreen ? 2 : 8}
          maxBounds={
            immersiveFullscreen
              ? [
                  [-179.999, -85],
                  [179.999, 85],
                ]
              : undefined
          }
          interactiveLayerIds={interactiveLayerIds}
          onZoomStart={onZoomStart}
          onZoomEnd={onZoomEnd}
          onMoveStart={onMoveStart}
          onMoveEnd={onMoveEnd}
          onZoom={handleZoom}
        >
          <AttributionControl position="bottom-right" compact />
          <NavigationControl position="bottom-right" showCompass={false} />

          <MapLibreViewportController center={center} zoom={zoom} revision={revision} />
          <MapLibreFollowLocationController
            enabled={followCurrentPosition}
            currentPosition={currentPosition}
            revision={followCurrentPositionRevision}
          />

          <MapLibreCoverageMapLayers
            tone={tone}
            isNavigationPresentation={isNavigationPresentation}
            routeGeoJSON={routeGeoJSON}
            routeGeometry={routeGeometry}
            routeFitKey={routeFitKey}
            counties={counties}
            countyGeoJSON={countyGeoJSON}
            partnerShops={partnerShops}
            selectedShopId={selectedShopId}
            onSelectShop={onSelectShop}
            discoveryPlaces={discoveryPlaces}
            selectedDiscoveryPlaceId={selectedDiscoveryPlaceId}
            onSelectDiscoveryPlace={onSelectDiscoveryPlace}
            gpsAccuracyGeoJSON={gpsAccuracyGeoJSON}
            gpsPointGeoJSON={gpsPointGeoJSON}
            activeSearchTarget={activeSearchTarget}
            searchTargetRadiusGeoJSON={searchTargetRadiusGeoJSON}
            searchTargetPointGeoJSON={searchTargetPointGeoJSON}
            radiusLabelGeoJSON={radiusLabelGeoJSON}
          />
        </Map>
      </div>

      {showSurfaceChrome ? (
        <MapSurfaceStatusBar
          tone={tone}
          regionCount={regionCount}
          partnerShopCount={partnerShops.length}
          modeLabel={`${mapLibreTileLabels[tileMode]} mode`}
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
