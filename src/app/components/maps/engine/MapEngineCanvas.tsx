/**
 * MapEngineCanvas — headless MapLibre canvas adapter.
 *
 * Step C.1 sub-pass 2 of the map unification plan
 * (PLAN_MAP_UNIFICATION_2026-05-08.md §4). Extracts the `<Map>` instance,
 * its built-in controls (Attribution, Navigation), the three viewport
 * controllers (viewport / follow-location / arrival-camera), and the
 * `<MapLibreCoverageMapLayers>` block out of `MapLibreServiceCoverageMap`
 * so chrome composition (header badges, surface controls, navigation HUD,
 * status bar, ambient overlays) is no longer entangled with the canvas
 * region. No behavior change: same JSX, same prop wiring, same
 * controller order.
 *
 * The `engine/` sub-folder is intentional — LAW_LAYERED_ARCHITECTURE.md
 * labels the MapLibre adapter as L4-in-spirit. Component code can't
 * literally live in `services/`, so this folder makes the headless-adapter
 * boundary explicit for reviewers (per plan §7.1).
 *
 * No `forwardRef` / `useImperativeHandle`: Pass 188 pre-flight grep
 * confirmed zero `MapRef` / `mapRef.current` consumers anywhere in `src/`.
 * If a future host needs an imperative handle, that's a separate sub-pass.
 *
 * Refs:
 *  - PLAN_MAP_UNIFICATION_2026-05-08.md §4 Step C.1
 *  - LAW_LAYERED_ARCHITECTURE.md (L4 boundary discipline)
 */

// Must run before any Map instantiation — patches resize crash
import "../../../utils/maplibreResizePatch";

import { useEffect } from "react";
import Map, { AttributionControl, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import type { StyleSpecification } from "maplibre-gl";
import type { GeoJSON } from "geojson";

import { cn } from "../../ui/utils";
import { markEngineMount, markEngineDispose } from "../../../utils/perfMarks";
import {
  MapLibreViewportController,
  MapLibreFollowLocationController,
  MapLibreArrivalCameraEffect,
} from "../mapLibreControllers";
import MapLibreCoverageMapLayers from "../MapLibreCoverageMapLayers";
import type {
  CoverageCountyMarker,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapSurfaceTone,
} from "../serviceCoverageMapTypes";
import type { NavigationDiscoveryPlace } from "../../../services/navigation/placeDiscovery";

export type MapEngineCanvasProps = {
  // Canvas frame styling
  mapCanvasClassName?: string;
  mapHeightClassName?: string;

  // Map config
  center: [number, number];
  zoom: number;
  mapStyle: StyleSpecification;
  immersiveFullscreen: boolean;
  interactiveLayerIds: string[];

  // Performance handlers (sourced from useMapPerformanceTracking on host)
  onZoomStart: () => void;
  onZoomEnd: () => void;
  onMoveStart: () => void;
  onMoveEnd: () => void;
  onZoom: (e: { viewState: { zoom: number } }) => void;

  // Viewport controller
  revision: number;

  // Follow-location controller
  followCurrentPosition: boolean;
  followCurrentPositionRevision: number;
  guidanceMode: boolean;
  currentHeadingDegrees?: number | null;
  currentPosition?: [number, number] | null;

  // Arrival camera effect
  hasArrived: boolean;
  destination?: [number, number] | null;

  // Layer props (passed through to MapLibreCoverageMapLayers)
  tone: MapSurfaceTone;
  isNavigationPresentation: boolean;
  showReportLayer: boolean;
  routeGeoJSON: GeoJSON | null;
  routeGeometry?: [number, number][];
  routeFitKey?: string | null;
  counties: CoverageCountyMarker[];
  countyGeoJSON: GeoJSON;
  partnerShops: CoveragePartnerShop[];
  selectedShopId?: string;
  onSelectShop?: (shopId: string) => void;
  discoveryPlaces: NavigationDiscoveryPlace[];
  selectedDiscoveryPlaceId?: string;
  onSelectDiscoveryPlace?: (place: NavigationDiscoveryPlace) => void;
  gpsAccuracyGeoJSON: GeoJSON | null;
  gpsPointGeoJSON: GeoJSON | null;
  gpsHeadingGeoJSON: GeoJSON | null;
  activeSearchTarget: CoverageSearchTarget | null;
  searchTargetRadiusGeoJSON: GeoJSON | null;
  searchTargetPointGeoJSON: GeoJSON | null;
  radiusLabelGeoJSON: GeoJSON | null;
};

export default function MapEngineCanvas({
  mapCanvasClassName,
  mapHeightClassName,
  center,
  zoom,
  mapStyle,
  immersiveFullscreen,
  interactiveLayerIds,
  onZoomStart,
  onZoomEnd,
  onMoveStart,
  onMoveEnd,
  onZoom,
  revision,
  followCurrentPosition,
  followCurrentPositionRevision,
  guidanceMode,
  currentHeadingDegrees,
  currentPosition,
  hasArrived,
  destination,
  tone,
  isNavigationPresentation,
  showReportLayer,
  routeGeoJSON,
  routeGeometry,
  routeFitKey,
  counties,
  countyGeoJSON,
  partnerShops,
  selectedShopId,
  onSelectShop,
  discoveryPlaces,
  selectedDiscoveryPlaceId,
  onSelectDiscoveryPlace,
  gpsAccuracyGeoJSON,
  gpsPointGeoJSON,
  gpsHeadingGeoJSON,
  activeSearchTarget,
  searchTargetRadiusGeoJSON,
  searchTargetPointGeoJSON,
  radiusLabelGeoJSON,
}: MapEngineCanvasProps) {
  useEffect(() => {
    markEngineMount("e1:coverage");
    return () => markEngineDispose("e1:coverage");
  }, []);

  return (
    <div
      className={cn(
        "coverage-map-canvas h-[280px] sm:h-[380px] md:h-[420px] w-full",
        mapCanvasClassName,
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
        // Cooperative gestures on the embedded preview only — single-finger
        // touch scrolls the page, two-finger drag pans the map. Without this
        // the preview map captured all touches and the landing page could
        // not scroll past it on mobile. The fullscreen dialog keeps the
        // standard "single-finger pans the map" behavior.
        cooperativeGestures={!immersiveFullscreen}
        interactiveLayerIds={interactiveLayerIds}
        onZoomStart={onZoomStart}
        onZoomEnd={onZoomEnd}
        onMoveStart={onMoveStart}
        onMoveEnd={onMoveEnd}
        onZoom={onZoom}
      >
        <AttributionControl position="bottom-right" compact />
        {/* Pass 172 (2026-05-07) — Phase 7 map-program-feel #7: compass +
            click-to-reset-north in fullscreen / immersive surfaces only.
            Inline previews on landing + dashboard keep clean chrome
            (showCompass false) so the embedded card stays minimal; the
            full-screen experience gets the premium map-program affordance
            users expect when actually navigating. The map has bearing
            tracking via MapLibreFollowLocationController so the compass
            actually reflects heading. */}
        <NavigationControl position="bottom-right" showCompass={immersiveFullscreen} />

        <MapLibreViewportController center={center} zoom={zoom} revision={revision} />
        <MapLibreFollowLocationController
          enabled={followCurrentPosition}
          currentPosition={currentPosition}
          revision={followCurrentPositionRevision}
          guidanceMode={guidanceMode}
          bearing={currentHeadingDegrees}
        />
        <MapLibreArrivalCameraEffect hasArrived={hasArrived} destination={destination ?? null} />

        <MapLibreCoverageMapLayers
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
      </Map>
    </div>
  );
}
