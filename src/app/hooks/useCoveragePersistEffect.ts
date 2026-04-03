import { useEffect } from "react";
import {
  COVERAGE_STATE_STORAGE_KEY,
  type SavedCoverageState,
} from "../components/landing/coverageState";

/**
 * Persist coverage-map state to localStorage whenever any tracked value changes.
 */
export function useCoveragePersistEffect(state: SavedCoverageState) {
  useEffect(() => {
    try {
      localStorage.setItem(COVERAGE_STATE_STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error saving coverage map state:", error);
    }
  }, [
    state.zipCode,
    state.radiusMiles,
    state.tileMode,
    state.isMapExpanded,
    state.activeOriginMode,
    state.selectedShopId,
    state.preferredNavigationProvider,
    state.currentLocationTarget,
    state.manualSearchTarget,
    state.mapView,
  ]);
}
