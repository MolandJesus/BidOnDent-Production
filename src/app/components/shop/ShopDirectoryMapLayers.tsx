import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import type { NavigationRouteStep } from "../../types/navigation";

export const SHOP_LAYER = "shop-dir-circles";

const SHOP_GLOW_LAYER = "shop-dir-glow";
const SHOP_LABEL_LAYER = "shop-dir-labels";
const ROUTE_SELECTED_LAYER = "route-selected-line";
const ROUTE_UNSELECTED_LAYER = "route-unselected-line";
const ORIGIN_LAYER = "origin-circle";
const USER_DOT_LAYER = "user-dot-circle";
const USER_RING_LAYER = "user-ring-circle";
const SAVED_PLACES_LAYER = "saved-places-circles";
const NAV_STEP_GLOW_LAYER = "nav-step-glow";
const NAV_STEP_CIRCLE_LAYER = "nav-step-circles";
const NAV_STEP_NEXT_PULSE_LAYER = "nav-step-next-pulse";

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
  navigationSteps?: NavigationRouteStep[];
  currentStepIndex?: number;
  isGuidanceActive?: boolean;
};

export default function ShopDirectoryMapLayers({
  isDark,
  hasRoutes,
  routesGeoJson,
  originGeoJson,
  userCoordsGeoJson,
  savedPlacesGeoJson,
  shopsGeoJson,
  navigationSteps = [],
  currentStepIndex = 0,
  isGuidanceActive = false,
}: ShopDirectoryMapLayersProps) {
  const navStepsGeoJson = useMemo(() => {
    if (!isGuidanceActive || navigationSteps.length === 0) return null;
    return {
      type: "FeatureCollection" as const,
      features: navigationSteps
        .filter((step) => step.location?.lat != null && step.location?.lng != null)
        .map((step, index) => ({
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [step.location.lng, step.location.lat],
          },
          properties: {
            id: step.id,
            instruction: step.instruction,
            maneuverType: step.maneuverType || "",
            stepIndex: index,
            isNext: index === currentStepIndex ? 1 : 0,
            isCompleted: index < currentStepIndex ? 1 : 0,
            isUpcoming: index > currentStepIndex ? 1 : 0,
          },
        })),
    };
  }, [navigationSteps, currentStepIndex, isGuidanceActive]);

  return (
    <>
      {hasRoutes && (
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
                "line-color": ["get", "accentColor"],
                "line-width": ["case", ["==", ["get", "isGuidanceActive"], 1], 32, 22],
                "line-opacity": [
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
                "line-color": isDark ? "#e0f2fe" : "#ffffff",
                "line-width": ["case", ["==", ["get", "isGuidanceActive"], 1], 14, 11],
                "line-opacity": [
                  "case",
                  ["==", ["get", "isTravelled"], 1],
                  0.25,
                  isDark ? 0.88 : 0.92,
                ],
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
                "line-color": [
                  "case",
                  ["==", ["get", "isTravelled"], 1],
                  isDark ? "#475569" : "#94a3b8",
                  ["get", "accentColor"],
                ],
                "line-width": ["case", ["==", ["get", "isGuidanceActive"], 1], 9, 7],
                "line-opacity": ["case", ["==", ["get", "isTravelled"], 1], 0.5, 0.92],
              } as Record<string, unknown>
            }
          />
        </Source>
      )}

      {originGeoJson && (
        <Source id="origin-source" type="geojson" data={originGeoJson}>
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
        </Source>
      )}

      {userCoordsGeoJson && (
        <Source id="user-coords-source" type="geojson" data={userCoordsGeoJson}>
          <Layer
            id={USER_RING_LAYER}
            type="circle"
            paint={{
              "circle-radius": 22,
              "circle-color": isDark ? "#60a5fa" : "#3b82f6",
              "circle-opacity": 0.2,
              "circle-stroke-width": 1.5,
              "circle-stroke-color": isDark ? "#60a5fa" : "#3b82f6",
            }}
          />
          <Layer
            id={USER_DOT_LAYER}
            type="circle"
            paint={{
              "circle-radius": 8,
              "circle-color": isDark ? "#60a5fa" : "#2563eb",
              "circle-opacity": 0.95,
              "circle-stroke-width": 3,
              "circle-stroke-color": "#ffffff",
            }}
          />
        </Source>
      )}

      {savedPlacesGeoJson.features.length > 0 && (
        <Source id="saved-places-source" type="geojson" data={savedPlacesGeoJson}>
          <Layer
            id={SAVED_PLACES_LAYER}
            type="circle"
            paint={{
              "circle-radius": 7,
              "circle-color": "#1d4ed8",
              "circle-opacity": 0.3,
              "circle-stroke-width": 2,
              "circle-stroke-color": "#1d4ed8",
            }}
          />
        </Source>
      )}

      {shopsGeoJson.features.length > 0 && (
        <Source id="shops-source" type="geojson" data={shopsGeoJson}>
          <Layer
            id={SHOP_GLOW_LAYER}
            type="circle"
            filter={["==", ["get", "isSelected"], 1]}
            paint={
              {
                "circle-radius": ["interpolate", ["linear"], ["zoom"], 8, 18, 12, 24, 15, 30],
                "circle-color": "#2563eb",
                "circle-opacity": 0.2,
                "circle-blur": 1,
              } as Record<string, unknown>
            }
          />
          <Layer
            id={SHOP_LAYER}
            type="circle"
            paint={
              {
                "circle-radius": [
                  "interpolate",
                  ["linear"],
                  ["zoom"],
                  8,
                  [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    7,
                    ["==", ["get", "topPick"], 1],
                    6,
                    4,
                  ],
                  12,
                  [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    12,
                    ["==", ["get", "topPick"], 1],
                    10,
                    8,
                  ],
                  15,
                  [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    16,
                    ["==", ["get", "topPick"], 1],
                    13,
                    10,
                  ],
                ],
                "circle-color": [
                  "case",
                  ["==", ["get", "isSelected"], 1],
                  "#2563eb",
                  ["==", ["get", "topPick"], 1],
                  "#0f172a",
                  "#38bdf8",
                ],
                "circle-opacity": 0.92,
                "circle-stroke-width": ["case", ["==", ["get", "isSelected"], 1], 4, 2],
                "circle-stroke-color": [
                  "case",
                  ["==", ["get", "isSelected"], 1],
                  "#dbeafe",
                  "#eff6ff",
                ],
              } as Record<string, unknown>
            }
          />
          <Layer
            id={SHOP_LABEL_LAYER}
            type="symbol"
            minzoom={12}
            layout={
              {
                "text-field": ["get", "name"],
                "text-size": ["interpolate", ["linear"], ["zoom"], 12, 10, 15, 13],
                "text-offset": [0, 1.8],
                "text-anchor": "top",
                "text-max-width": 10,
                "text-allow-overlap": false,
                "text-optional": true,
              } as Record<string, unknown>
            }
            paint={
              {
                "text-color": isDark ? "#e2e8f0" : "#1e293b",
                "text-halo-color": isDark ? "#0f172a" : "#ffffff",
                "text-halo-width": 1.5,
                "text-opacity": ["case", ["==", ["get", "isSelected"], 1], 1, 0.8],
              } as Record<string, unknown>
            }
          />
        </Source>
      )}

      {/* ── Navigation turn markers ── */}
      {navStepsGeoJson && navStepsGeoJson.features.length > 0 && (
        <Source id="nav-steps-source" type="geojson" data={navStepsGeoJson}>
          {/* Glow ring for the next/active step */}
          <Layer
            id={NAV_STEP_NEXT_PULSE_LAYER}
            type="circle"
            filter={["==", ["get", "isNext"], 1]}
            paint={{
              "circle-radius": 20,
              "circle-color": "#3b82f6",
              "circle-opacity": 0.25,
              "circle-blur": 0.8,
            }}
          />
          {/* Glow for upcoming steps */}
          <Layer
            id={NAV_STEP_GLOW_LAYER}
            type="circle"
            filter={["==", ["get", "isCompleted"], 0]}
            paint={
              {
                "circle-radius": ["case", ["==", ["get", "isNext"], 1], 14, 10],
                "circle-color": ["case", ["==", ["get", "isNext"], 1], "#3b82f6", "#60a5fa"],
                "circle-opacity": ["case", ["==", ["get", "isNext"], 1], 0.35, 0.18],
                "circle-blur": 0.6,
              } as Record<string, unknown>
            }
          />
          {/* Solid circles for each step */}
          <Layer
            id={NAV_STEP_CIRCLE_LAYER}
            type="circle"
            paint={
              {
                "circle-radius": [
                  "case",
                  ["==", ["get", "isNext"], 1],
                  7,
                  ["==", ["get", "isCompleted"], 1],
                  4,
                  5,
                ],
                "circle-color": [
                  "case",
                  ["==", ["get", "isNext"], 1],
                  "#2563eb",
                  ["==", ["get", "isCompleted"], 1],
                  isDark ? "#475569" : "#94a3b8",
                  "#60a5fa",
                ],
                "circle-opacity": ["case", ["==", ["get", "isCompleted"], 1], 0.45, 0.92],
                "circle-stroke-width": [
                  "case",
                  ["==", ["get", "isNext"], 1],
                  3,
                  ["==", ["get", "isCompleted"], 1],
                  1,
                  2,
                ],
                "circle-stroke-color": [
                  "case",
                  ["==", ["get", "isNext"], 1],
                  "#dbeafe",
                  ["==", ["get", "isCompleted"], 1],
                  isDark ? "#334155" : "#e2e8f0",
                  "#bfdbfe",
                ],
              } as Record<string, unknown>
            }
          />
        </Source>
      )}
    </>
  );
}
