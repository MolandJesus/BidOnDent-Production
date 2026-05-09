import { useMemo } from "react";
import { cn } from "../ui/utils";
import MapNavigationHud from "./MapNavigationHud";
import MapSurfaceControls from "./MapSurfaceControls";
import MapSurfaceHeaderBadges from "./MapSurfaceHeaderBadges";
import MapSurfaceStatusBar from "./MapSurfaceStatusBar";
import { useMapPerformanceTracking } from "./useMapPerformanceTracking";
import { useMapEngineGeoJSON } from "./useMapEngineGeoJSON";
import MapEngineCanvas from "./engine/MapEngineCanvas";
import { PARTNER_SHOPS_LAYER_ID } from "./MapLibrePartnerShopLayer";
import { REPORT_MARKERS_LAYER_ID } from "./MapLibreReportLayer";
import { DISCOVERY_PLACES_LAYER_ID } from "./MapLibreDiscoveryPlaceLayer";
import { getMapSurfaceTheme, resolveMapSurfaceTone } from "./mapSurfaceTheme";
import { mapLibreStyles, mapLibreTileLabels } from "./mapLibreStyles";
import { type MapLibreServiceCoverageMapProps } from "./mapLibreServiceCoverageMapHelpers";
import type { CoverageCountyMarker, CoveragePartnerShop } from "./serviceCoverageMapTypes";

/**
 * Pass 251 (KI-196 hardening) — module-scope empty-array singletons.
 *
 * `counties` and `partnerShops` defaults previously used inline
 * `[]` literals, which produce a fresh array identity on every
 * render when the caller omits the prop. The downstream
 * `useMapEngineGeoJSON` hook would re-fire its GeoJSON-building
 * memos on identity churn even though nothing observable changed.
 *
 * Production callers always pass these props explicitly today
 * (verified Pass 250 caller-side audit). These singletons are
 * defensive only — zero behavior change for any existing call
 * site, but eliminates the latent recomputation churn for any
 * future caller that omits.
 *
 * Exported for test-side identity assertions.
 */
export const EMPTY_COUNTIES: CoverageCountyMarker[] = Object.freeze(
  [] as CoverageCountyMarker[]
) as CoverageCountyMarker[];
export const EMPTY_PARTNER_SHOPS: CoveragePartnerShop[] = Object.freeze(
  [] as CoveragePartnerShop[]
) as CoveragePartnerShop[];

export default function MapLibreServiceCoverageMap({
  center,
  zoom,
  revision,
  tileMode,
  counties = EMPTY_COUNTIES,
  partnerShops = EMPTY_PARTNER_SHOPS,
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
  showReportLayer = false,
  followCurrentPosition = false,
  followCurrentPositionRevision = 0,
  guidanceMode = false,
  currentHeadingDegrees,
  hasArrived = false,
  destination,
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
  const {
    liveZoom,
    performanceSummary,
    onZoomStart,
    onZoomEnd,
    onMoveStart,
    onMoveEnd,
    handleZoom,
    resetPerformance,
  } = useMapPerformanceTracking(zoom, revision);

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

  // Pass 185 — Step C.1 sub-pass 1: engine-side GeoJSON memoization
  // moved into useMapEngineGeoJSON so the eventual <MapEngineCanvas>
  // extraction has a clean engine-data-prep boundary. No behavior change;
  // same builders, same memoization, same dependency arrays.
  const {
    routeGeoJSON,
    countyGeoJSON,
    gpsPointGeoJSON,
    gpsHeadingGeoJSON,
    gpsAccuracyGeoJSON,
    searchTargetRadiusGeoJSON,
    searchTargetPointGeoJSON,
    radiusLabelGeoJSON,
  } = useMapEngineGeoJSON({
    routeGeometry,
    counties,
    currentPosition,
    guidanceMode,
    currentHeadingDegrees,
    gpsAccuracyMeters,
    activeSearchTarget,
    radiusMeters,
    radiusMiles,
  });

  const interactiveLayerIds = useMemo(() => {
    const ids = [PARTNER_SHOPS_LAYER_ID];
    if (!isNavigationPresentation) {
      if (showReportLayer) {
        ids.push(REPORT_MARKERS_LAYER_ID);
      }
      if (discoveryPlaces.length > 0) ids.push(DISCOVERY_PLACES_LAYER_ID);
    }
    return ids;
  }, [isNavigationPresentation, discoveryPlaces.length, showReportLayer]);

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
      {/* Pass 100 — KI-112 F6: extend landing-side bd-liquid-gold-flow sheen
          to the coverage map frame so map surfaces share the same ambient
          marketplace ribbon. Very subtle (0.18 dark / 0.10 light) so the
          map remains the dominant signal. */}
      <div
        aria-hidden="true"
        className={cn(
          "bd-liquid-gold-flow pointer-events-none absolute inset-0 z-[249]",
          tone === "light" ? "bd-liquid-gold-flow--light" : "bd-liquid-gold-flow--dark"
        )}
        style={{ opacity: tone === "light" ? 0.1 : 0.18 }}
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
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] flex flex-wrap items-start justify-between gap-1.5 p-2 sm:gap-2 sm:p-3 animate-in fade-in slide-in-from-top-2 duration-400 motion-reduce:animate-none">
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
              ? "border-[rgba(140,82,22,0.32)] bg-[linear-gradient(180deg,rgba(247,232,194,0.85),rgba(232,238,248,0.80))] text-blue-800/85 shadow-[0_6px_16px_rgba(140,82,22,0.14),inset_0_1px_0_rgba(252,240,208,0.80)]"
              : "border-blue-200/18 bg-slate-950/70 text-blue-200/70"
          )}
        >
          BidOnDent Maps
        </div>
      </div>

      {/* ---- MapLibre GL Canvas ----
          Pass 189 — Step C.1 sub-pass 2: lifted into <MapEngineCanvas>.
          Engine-side concerns (Map instance, Attribution + Navigation
          controls, viewport / follow-location / arrival-camera controllers,
          coverage layers) live in src/app/components/maps/engine/. The
          host now only composes chrome around the canvas region. */}
      <MapEngineCanvas
        mapCanvasClassName={theme.mapCanvasClassName}
        mapHeightClassName={mapHeightClassName}
        center={center}
        zoom={zoom}
        mapStyle={mapStyle}
        immersiveFullscreen={immersiveFullscreen}
        interactiveLayerIds={interactiveLayerIds}
        onZoomStart={onZoomStart}
        onZoomEnd={onZoomEnd}
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        onZoom={handleZoom}
        revision={revision}
        followCurrentPosition={followCurrentPosition}
        followCurrentPositionRevision={followCurrentPositionRevision}
        guidanceMode={guidanceMode}
        currentHeadingDegrees={currentHeadingDegrees}
        currentPosition={currentPosition}
        hasArrived={hasArrived}
        destination={destination}
        tone={tone}
        isNavigationPresentation={isNavigationPresentation}
        showReportLayer={showReportLayer}
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
        gpsHeadingGeoJSON={gpsHeadingGeoJSON}
        activeSearchTarget={activeSearchTarget}
        searchTargetRadiusGeoJSON={searchTargetRadiusGeoJSON}
        searchTargetPointGeoJSON={searchTargetPointGeoJSON}
        radiusLabelGeoJSON={radiusLabelGeoJSON}
      />

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
          onResetPerformance={showPerformanceResetControl ? resetPerformance : undefined}
        />
      ) : null}
    </div>
  );
}
