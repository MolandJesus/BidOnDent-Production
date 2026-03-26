import type { NavigationProvider } from "../../services/navigation/externalNavigation";
import type { CoverageSearchTarget, MapTileMode } from "../maps/serviceCoverageMapTypes";
import { sanitizeZipInput } from "./coverageData";

export const focusZoomByRadius: Record<string, number> = {
  "10": 11,
  "20": 10,
  "25": 9,
  "35": 8,
};

export const COVERAGE_STATE_STORAGE_KEY = "bidondent_coverage_state";

export type MapViewState = {
  center: [number, number];
  zoom: number;
  revision: number;
};

export type SavedCoverageState = {
  zipCode?: string;
  radiusMiles?: string;
  tileMode?: MapTileMode;
  isMapExpanded?: boolean;
  activeOriginMode?: "zip" | "geolocation";
  selectedShopId?: string;
  preferredNavigationProvider?: NavigationProvider;
  currentLocationTarget?: CoverageSearchTarget | null;
  mapView?: {
    center?: [number, number];
    zoom?: number;
    revision?: number;
  };
};

export function loadSavedCoverageState(): SavedCoverageState {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const savedState = localStorage.getItem(COVERAGE_STATE_STORAGE_KEY);
    if (!savedState) {
      return {};
    }

    const parsed = JSON.parse(savedState) as SavedCoverageState;
    return {
      zipCode: typeof parsed.zipCode === "string" ? sanitizeZipInput(parsed.zipCode) : undefined,
      radiusMiles:
        typeof parsed.radiusMiles === "string" && focusZoomByRadius[parsed.radiusMiles]
          ? parsed.radiusMiles
          : undefined,
      tileMode:
        parsed.tileMode === "roadmap" ||
        parsed.tileMode === "night" ||
        parsed.tileMode === "satellite"
          ? parsed.tileMode
          : undefined,
      isMapExpanded: Boolean(parsed.isMapExpanded),
      activeOriginMode:
        parsed.activeOriginMode === "geolocation" ? "geolocation" : parsed.activeOriginMode,
      selectedShopId: typeof parsed.selectedShopId === "string" ? parsed.selectedShopId : undefined,
      preferredNavigationProvider:
        parsed.preferredNavigationProvider === "google" ||
        parsed.preferredNavigationProvider === "waze"
          ? parsed.preferredNavigationProvider
          : parsed.preferredNavigationProvider === "apple"
            ? "apple"
            : undefined,
      currentLocationTarget:
        parsed.currentLocationTarget &&
        typeof parsed.currentLocationTarget.lat === "number" &&
        typeof parsed.currentLocationTarget.lng === "number"
          ? parsed.currentLocationTarget
          : null,
      mapView:
        parsed.mapView &&
        Array.isArray(parsed.mapView.center) &&
        parsed.mapView.center.length === 2 &&
        typeof parsed.mapView.center[0] === "number" &&
        typeof parsed.mapView.center[1] === "number" &&
        typeof parsed.mapView.zoom === "number" &&
        typeof parsed.mapView.revision === "number"
          ? parsed.mapView
          : undefined,
    };
  } catch (error) {
    if (import.meta.env.DEV) console.error("Error loading coverage map state:", error);
    return {};
  }
}
