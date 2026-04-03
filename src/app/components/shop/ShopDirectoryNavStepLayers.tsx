/**
 * ShopDirectoryNavStepLayers — MapLibre Source + Layer group for turn-by-turn
 * navigation step markers. Extracted from ShopDirectoryMapLayers to enforce
 * file-size limits.
 */
import { useMemo } from "react";
import { Layer, Source } from "react-map-gl/maplibre";
import type { NavigationRouteStep } from "../../types/navigation";

const NAV_STEP_GLOW_LAYER = "nav-step-glow";
const NAV_STEP_CIRCLE_LAYER = "nav-step-circles";
const NAV_STEP_NEXT_PULSE_LAYER = "nav-step-next-pulse";

type ShopDirectoryNavStepLayersProps = {
  isDark: boolean;
  navigationSteps: NavigationRouteStep[];
  currentStepIndex: number;
  isGuidanceActive: boolean;
};

export default function ShopDirectoryNavStepLayers({
  isDark,
  navigationSteps,
  currentStepIndex,
  isGuidanceActive,
}: ShopDirectoryNavStepLayersProps) {
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

  if (!navStepsGeoJson || navStepsGeoJson.features.length === 0) return null;

  return (
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
  );
}
