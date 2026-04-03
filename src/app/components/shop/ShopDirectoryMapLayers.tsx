import { useEffect } from "react";
import { Layer, Source, useMap } from "react-map-gl/maplibre";
import type { NavigationRouteStep } from "../../types/navigation";
import ShopDirectoryShopPinLayers from "./ShopDirectoryShopPinLayers";
import ShopDirectoryNavStepLayers from "./ShopDirectoryNavStepLayers";

// Re-export layer IDs consumed by useMapPaneState / useShopMapInteraction
export { SHOP_LAYER, SHOP_CLUSTER_LAYER } from "./ShopDirectoryShopPinLayers";

/** Heading cone layer ID */
const USER_HEADING_CONE_LAYER = "user-heading-cone";
/** Image ID for the heading cone icon registered in MapLibre */
const HEADING_CONE_IMAGE_ID = "heading-cone";
const USER_GLOW_LAYER = "user-glow-circle";

export const ROUTE_SELECTED_LAYER = "route-selected-line";
export const ROUTE_UNSELECTED_LAYER = "route-unselected-line";
const ORIGIN_LAYER = "origin-circle";
const USER_DOT_LAYER = "user-dot-circle";
const USER_RING_LAYER = "user-ring-circle";
export const SAVED_PLACES_LAYER = "saved-places-circles";

type PointFeature = {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: number[];
  };
  properties: Record<string, unknown>;
};

type PointFeatureCollection = {
  type: "FeatureCollection";
  features: PointFeature[];
};

type LineFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: {
      type: "LineString";
      coordinates: number[][];
    };
    properties: Record<string, unknown>;
  }>;
};

type ShopDirectoryMapLayersProps = {
  isDark: boolean;
  hasRoutes: boolean;
  routesGeoJson: LineFeatureCollection;
  originGeoJson: PointFeature | null;
  userCoordsGeoJson: PointFeature | null;
  savedPlacesGeoJson: PointFeatureCollection;
  shopsGeoJson: PointFeatureCollection;
  showSavedPlaces?: boolean;
  showRoutes?: boolean;
  navigationSteps?: NavigationRouteStep[];
  currentStepIndex?: number;
  isGuidanceActive?: boolean;
  isOffRoute?: boolean;
  userHeadingDegrees?: number | null;
};

/**
 * Create an 80×80 heading cone ImageData for the user direction indicator.
 * Draws a semi-transparent blue sector (pie-slice) pointing up (0°).
 */
function createHeadingConeImageData(): ImageData {
  const size = 80;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 2;

  // Cone: 50° sector centered at "up" — slightly tighter for precision
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, radius, -Math.PI / 2 - Math.PI / 7.2, -Math.PI / 2 + Math.PI / 7.2);
  ctx.closePath();

  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
  gradient.addColorStop(0, "rgba(59, 130, 246, 0.7)");
  gradient.addColorStop(0.5, "rgba(59, 130, 246, 0.3)");
  gradient.addColorStop(1, "rgba(59, 130, 246, 0.02)");
  ctx.fillStyle = gradient;
  ctx.fill();

  return ctx.getImageData(0, 0, size, size);
}

export default function ShopDirectoryMapLayers({
  isDark,
  hasRoutes,
  routesGeoJson,
  originGeoJson,
  userCoordsGeoJson,
  savedPlacesGeoJson,
  shopsGeoJson,
  showSavedPlaces = true,
  showRoutes = true,
  navigationSteps = [],
  currentStepIndex = 0,
  isGuidanceActive = false,
  isOffRoute = false,
  userHeadingDegrees,
}: ShopDirectoryMapLayersProps) {
  /* ── Register heading cone image on the map ── */
  const { current: map } = useMap();
  useEffect(() => {
    if (!map) return;
    const m = map.getMap?.() ?? map;
    if (!m || typeof m.hasImage !== "function") return;
    if (!m.hasImage(HEADING_CONE_IMAGE_ID)) {
      m.addImage(HEADING_CONE_IMAGE_ID, createHeadingConeImageData(), {
        pixelRatio: 2,
      });
    }
  }, [map]);

  const showHeadingCone =
    isGuidanceActive && typeof userHeadingDegrees === "number" && userCoordsGeoJson !== null;

  return (
    <>
      {(showRoutes || isGuidanceActive) && hasRoutes && (
        <Source id="routes-source" type="geojson" data={routesGeoJson}>
          {/* Hide unselected routes during guidance */}
          <Layer
            id={ROUTE_UNSELECTED_LAYER}
            type="line"
            filter={[
              "all",
              ["==", ["get", "isSelected"], 0],
              ["==", ["get", "isGuidanceActive"], 0],
            ]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={
              {
                "line-color": ["get", "accentColor"],
                "line-width": 3,
                "line-opacity": isGuidanceActive ? 0 : 0.38,
                "line-dasharray": [2.5, 3],
              } as Record<string, unknown>
            }
          />
          <Layer
            id="route-selected-glow"
            type="line"
            filter={["==", ["get", "isSelected"], 1]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={
              {
                "line-color": isOffRoute
                  ? isDark
                    ? "#f59e0b"
                    : "#d97706"
                  : ["get", "accentColor"],
                "line-width": ["case", ["==", ["get", "isGuidanceActive"], 1], 38, 22],
                "line-opacity": isOffRoute
                  ? 0.1
                  : [
                      "case",
                      ["==", ["get", "isTravelled"], 1],
                      0.06,
                      ["==", ["get", "isGuidanceActive"], 1],
                      0.28,
                      0.18,
                    ],
                "line-blur": 14,
              } as Record<string, unknown>
            }
          />
          {/* White outline — sits between glow and inner core */}
          <Layer
            id="route-selected-outline"
            type="line"
            filter={["==", ["get", "isSelected"], 1]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={
              {
                "line-color": isOffRoute
                  ? isDark
                    ? "#fbbf24"
                    : "#f59e0b"
                  : isDark
                    ? "#e0f2fe"
                    : "#ffffff",
                "line-width": ["case", ["==", ["get", "isGuidanceActive"], 1], 16, 11],
                "line-opacity": isOffRoute
                  ? 0.4
                  : ["case", ["==", ["get", "isTravelled"], 1], 0.25, isDark ? 0.88 : 0.92],
              } as Record<string, unknown>
            }
          />
          <Layer
            id={ROUTE_SELECTED_LAYER}
            type="line"
            filter={["==", ["get", "isSelected"], 1]}
            layout={{ "line-cap": "round", "line-join": "round" }}
            paint={
              {
                "line-color": isOffRoute
                  ? isDark
                    ? "#f59e0b"
                    : "#d97706"
                  : [
                      "case",
                      ["==", ["get", "isTravelled"], 1],
                      isDark ? "#475569" : "#94a3b8",
                      ["get", "accentColor"],
                    ],
                "line-width": ["case", ["==", ["get", "isGuidanceActive"], 1], 11, 7],
                "line-opacity": isOffRoute
                  ? 0.55
                  : ["case", ["==", ["get", "isTravelled"], 1], 0.5, 0.92],
                ...(isOffRoute ? { "line-dasharray": [3, 2.5] } : {}),
              } as Record<string, unknown>
            }
          />
        </Source>
      )}

      {originGeoJson && (
        <Source id="origin-source" type="geojson" data={originGeoJson}>
          {/* ── Origin glow ring ── */}
          <Layer
            id="origin-glow"
            type="circle"
            paint={{
              "circle-radius": 18,
              "circle-color": "#f97316",
              "circle-opacity": 0.12,
              "circle-stroke-width": 0,
            }}
          />
          <Layer
            id={ORIGIN_LAYER}
            type="circle"
            paint={{
              "circle-radius": 9,
              "circle-color": "#f97316",
              "circle-opacity": 0.9,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#fff7ed",
            }}
          />
          {/* ── Origin label ── */}
          <Layer
            id="origin-label"
            type="symbol"
            layout={
              {
                "text-field": ["get", "name"],
                "text-size": 11,
                "text-offset": [0, -1.8],
                "text-anchor": "bottom",
                "text-max-width": 12,
                "text-allow-overlap": false,
                "text-optional": true,
              } as Record<string, unknown>
            }
            paint={
              {
                "text-color": isDark ? "#fdba74" : "#c2410c",
                "text-halo-color": isDark ? "#0f172a" : "#ffffff",
                "text-halo-width": 1.5,
                "text-opacity": 0.85,
              } as Record<string, unknown>
            }
          />
        </Source>
      )}

      {userCoordsGeoJson && (
        <Source id="user-coords-source" type="geojson" data={userCoordsGeoJson}>
          {/* ── Heading cone (visible during guidance when heading known) ── */}
          {showHeadingCone && (
            <Layer
              id={USER_HEADING_CONE_LAYER}
              type="symbol"
              filter={["==", ["get", "hasHeading"], 1]}
              layout={
                {
                  "icon-image": HEADING_CONE_IMAGE_ID,
                  "icon-size": isGuidanceActive ? 1.8 : 1.4,
                  "icon-rotate": ["get", "heading"],
                  "icon-rotation-alignment": "map",
                  "icon-allow-overlap": true,
                  "icon-ignore-placement": true,
                } as Record<string, unknown>
              }
              paint={{ "icon-opacity": isGuidanceActive ? 0.9 : 0.85 } as Record<string, unknown>}
            />
          )}
          {/* ── Outer glow (navigation pulse) ── */}
          {isGuidanceActive && (
            <Layer
              id={USER_GLOW_LAYER}
              type="circle"
              paint={{
                "circle-radius": 36,
                "circle-color": "#3b82f6",
                "circle-opacity": 0.12,
                "circle-blur": 1,
              }}
            />
          )}
          <Layer
            id={USER_RING_LAYER}
            type="circle"
            paint={{
              "circle-radius": isGuidanceActive ? 26 : 22,
              "circle-color": isDark ? "#60a5fa" : "#3b82f6",
              "circle-opacity": isGuidanceActive ? 0.25 : 0.2,
              "circle-stroke-width": isGuidanceActive ? 2 : 1.5,
              "circle-stroke-color": isDark ? "#60a5fa" : "#3b82f6",
            }}
          />
          <Layer
            id={USER_DOT_LAYER}
            type="circle"
            paint={{
              "circle-radius": isGuidanceActive ? 10 : 8,
              "circle-color": isDark ? "#60a5fa" : "#2563eb",
              "circle-opacity": 0.95,
              "circle-stroke-width": isGuidanceActive ? 3.5 : 3,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
      )}

      {showSavedPlaces && savedPlacesGeoJson.features.length > 0 && (
        <Source id="saved-places-source" type="geojson" data={savedPlacesGeoJson}>
          {/* ── Saved places glow ring ── */}
          <Layer
            id="saved-places-glow"
            type="circle"
            paint={{
              "circle-radius": 12,
              "circle-color": "#1d4ed8",
              "circle-opacity": 0.12,
              "circle-stroke-width": 0,
            }}
          />
          {/* ── Saved places circle ── */}
          <Layer
            id={SAVED_PLACES_LAYER}
            type="circle"
            paint={{
              "circle-radius": 7,
              "circle-color": "#1d4ed8",
              "circle-opacity": 0.35,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#1d4ed8",
            }}
          />
          {/* ── Saved places label ── */}
          <Layer
            id="saved-places-labels"
            type="symbol"
            minzoom={10}
            layout={
              {
                "text-field": ["get", "label"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 10, 9, 14, 11],
                "text-offset": [0, 1.6],
                "text-anchor": "top",
                "text-max-width": 10,
                "text-allow-overlap": false,
                "text-optional": true,
              } as Record<string, unknown>
            }
            paint={
              {
                "text-color": isDark ? "#93c5fd" : "#1e40af",
                "text-halo-color": isDark ? "#0f172a" : "#ffffff",
                "text-halo-width": 1.5,
                "text-opacity": 0.8,
              } as Record<string, unknown>
            }
          />
        </Source>
      )}

      <ShopDirectoryShopPinLayers isDark={isDark} shopsGeoJson={shopsGeoJson} />

      {/* ── Navigation turn markers ── */}
      <ShopDirectoryNavStepLayers
        isDark={isDark}
        navigationSteps={navigationSteps}
        currentStepIndex={currentStepIndex}
        isGuidanceActive={isGuidanceActive}
      />
    </>
  );
}
