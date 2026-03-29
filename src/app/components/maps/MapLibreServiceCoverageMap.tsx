import Map, { AttributionControl, NavigationControl, Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { cn } from "../ui/utils";
import MapNavigationHud from "./MapNavigationHud";
import MapSurfaceControls from "./MapSurfaceControls";
import MapSurfaceHeaderBadges from "./MapSurfaceHeaderBadges";
import MapSurfaceStatusBar from "./MapSurfaceStatusBar";
import MapLibrePartnerShopLayer, { PARTNER_SHOPS_LAYER_ID } from "./MapLibrePartnerShopLayer";
import MapLibreReportLayer, { REPORT_MARKERS_LAYER_ID } from "./MapLibreReportLayer";
import MapLibreDiscoveryPlaceLayer, {
  DISCOVERY_PLACES_LAYER_ID,
} from "./MapLibreDiscoveryPlaceLayer";
import NavigationErrorBoundary from "./NavigationErrorBoundary";
import { getMapSurfaceTheme, resolveMapSurfaceTone } from "./mapSurfaceTheme";
import { mapLibreStyles, mapLibreTileLabels } from "./mapLibreStyles";
import {
  MapLibreViewportController,
  MapLibreFollowLocationController,
  MapLibreRouteFitController,
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

          {/* Route polyline */}
          {routeGeoJSON ? (
            <>
              <MapLibreRouteFitController
                routeGeometry={routeGeometry!}
                routeFitKey={routeFitKey}
              />
              <Source id="route" type="geojson" data={routeGeoJSON}>
                {/* Route glow (MapLibre-native blur effect) */}
                <Layer
                  id="route-glow"
                  type="line"
                  paint={{
                    "line-color": tone === "light" ? "#3b82f6" : "#38bdf8",
                    "line-opacity": isNavigationPresentation ? 0.28 : 0.22,
                    "line-width": isNavigationPresentation ? 26 : 22,
                    "line-blur": isNavigationPresentation ? 14 : 12,
                  }}
                  layout={{ "line-cap": "round", "line-join": "round" }}
                />
                <Layer
                  id="route-outline"
                  type="line"
                  paint={{
                    "line-color": tone === "light" ? "#ffffff" : "#e0f2fe",
                    "line-opacity": isNavigationPresentation ? 0.94 : 0.9,
                    "line-width": isNavigationPresentation ? 12 : 10,
                  }}
                  layout={{ "line-cap": "round", "line-join": "round" }}
                />
                <Layer
                  id="route-inner"
                  type="line"
                  paint={{
                    "line-color": tone === "light" ? "#2563eb" : "#38bdf8",
                    "line-opacity": 0.98,
                    "line-width": isNavigationPresentation ? 7 : 5,
                  }}
                  layout={{ "line-cap": "round", "line-join": "round" }}
                />
              </Source>
            </>
          ) : null}

          {/* County markers */}
          {!isNavigationPresentation && counties.length > 0 ? (
            <Source id="counties" type="geojson" data={countyGeoJSON}>
              <Layer
                id="counties-circle"
                type="circle"
                paint={{
                  "circle-radius": 6,
                  "circle-color": "#7dd3fc",
                  "circle-opacity": 0.8,
                  "circle-stroke-color": "#2563eb",
                  "circle-stroke-width": 2,
                }}
              />
              <Layer
                id="counties-label"
                type="symbol"
                minzoom={8}
                layout={
                  {
                    "text-field": ["get", "name"],
                    "text-size": ["interpolate", ["linear"], ["zoom"], 8, 9, 12, 11],
                    "text-offset": [0, 1.6],
                    "text-anchor": "top",
                    "text-max-width": 8,
                    "text-allow-overlap": false,
                    "text-optional": true,
                  } as Record<string, unknown>
                }
                paint={
                  {
                    "text-color": tone === "light" ? "#1e40af" : "#93c5fd",
                    "text-halo-color": tone === "light" ? "#ffffff" : "#0f172a",
                    "text-halo-width": 1.5,
                    "text-opacity": 0.85,
                  } as Record<string, unknown>
                }
              />
            </Source>
          ) : null}

          {/* Partner shop markers */}
          <MapLibrePartnerShopLayer
            partnerShops={partnerShops}
            selectedShopId={selectedShopId}
            isNavigationPresentation={isNavigationPresentation}
            onSelectShop={onSelectShop}
          />

          {/* Report markers */}
          {!isNavigationPresentation ? (
            <NavigationErrorBoundary>
              <MapLibreReportLayer />
            </NavigationErrorBoundary>
          ) : null}

          {/* Discovery place markers */}
          {!isNavigationPresentation && discoveryPlaces.length > 0 ? (
            <MapLibreDiscoveryPlaceLayer
              tone={tone}
              places={discoveryPlaces}
              selectedPlaceId={selectedDiscoveryPlaceId}
              onSelectPlace={onSelectDiscoveryPlace}
            />
          ) : null}

          {/* GPS accuracy ring */}
          {gpsAccuracyGeoJSON ? (
            <Source id="gps-accuracy" type="geojson" data={gpsAccuracyGeoJSON}>
              <Layer
                id="gps-accuracy-fill"
                type="fill"
                paint={{
                  "fill-color": tone === "light" ? "#60a5fa" : "#22d3ee",
                  "fill-opacity": 0.12,
                }}
              />
              <Layer
                id="gps-accuracy-stroke"
                type="line"
                paint={{
                  "line-color": tone === "light" ? "#60a5fa" : "#67e8f9",
                  "line-width": 1.5,
                }}
              />
            </Source>
          ) : null}

          {/* GPS current position dot */}
          {gpsPointGeoJSON ? (
            <Source id="gps-position" type="geojson" data={gpsPointGeoJSON}>
              {/* Outer glow ring */}
              <Layer
                id="gps-glow"
                type="circle"
                paint={{
                  "circle-radius": isNavigationPresentation ? 28 : 24,
                  "circle-color": tone === "light" ? "#0ea5e9" : "#22d3ee",
                  "circle-opacity": 0.12,
                  "circle-blur": 1,
                }}
              />
              {/* Main dot */}
              <Layer
                id="gps-dot"
                type="circle"
                paint={{
                  "circle-radius": isNavigationPresentation ? 12 : 10,
                  "circle-color": tone === "light" ? "#0ea5e9" : "#22d3ee",
                  "circle-stroke-color": "#ffffff",
                  "circle-stroke-width": 3,
                }}
              />
            </Source>
          ) : null}

          {/* Search target radius + markers */}
          {activeSearchTarget && !isNavigationPresentation ? (
            <>
              {searchTargetRadiusGeoJSON ? (
                <Source id="search-radius" type="geojson" data={searchTargetRadiusGeoJSON}>
                  <Layer
                    id="search-radius-fill"
                    type="fill"
                    paint={{ "fill-color": "#22d3ee", "fill-opacity": 0.12 }}
                  />
                  <Layer
                    id="search-radius-stroke"
                    type="line"
                    paint={{ "line-color": "#22d3ee", "line-width": 2 }}
                  />
                </Source>
              ) : null}
              {searchTargetPointGeoJSON ? (
                <Source id="search-target" type="geojson" data={searchTargetPointGeoJSON}>
                  <Layer
                    id="search-target-outer"
                    type="circle"
                    filter={["==", ["get", "kind"], "outer"]}
                    paint={{
                      "circle-radius": 11,
                      "circle-color": "#06b6d4",
                      "circle-opacity": 0.75,
                      "circle-stroke-color": "#67e8f9",
                      "circle-stroke-width": 2.5,
                    }}
                  />
                  <Layer
                    id="search-target-inner"
                    type="circle"
                    filter={["==", ["get", "kind"], "inner"]}
                    paint={{
                      "circle-radius": 5,
                      "circle-color": "#f8fafc",
                      "circle-stroke-color": "#f8fafc",
                      "circle-stroke-width": 1,
                    }}
                  />
                </Source>
              ) : null}
              {radiusLabelGeoJSON ? (
                <Source id="radius-label" type="geojson" data={radiusLabelGeoJSON}>
                  <Layer
                    id="radius-label-text"
                    type="symbol"
                    layout={
                      {
                        "text-field": ["get", "label"],
                        "text-size": 11,
                        "text-anchor": "left",
                        "text-offset": [0.5, 0],
                        "text-allow-overlap": true,
                      } as Record<string, unknown>
                    }
                    paint={
                      {
                        "text-color": tone === "light" ? "#0891b2" : "#67e8f9",
                        "text-halo-color": tone === "light" ? "#ffffff" : "#0f172a",
                        "text-halo-width": 1.5,
                      } as Record<string, unknown>
                    }
                  />
                </Source>
              ) : null}
            </>
          ) : null}
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
