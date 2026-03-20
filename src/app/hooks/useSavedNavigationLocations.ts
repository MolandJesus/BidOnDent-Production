import { useCallback, useMemo, useState } from "react";
import {
  addSavedNavigationLocation,
  loadSavedNavigationLocations,
  markRecentNavigationLocation,
  removeSavedNavigationLocation,
  touchSavedNavigationLocation,
} from "../services/navigation/savedLocations";
import {
  clearParkedCarLocation,
  loadParkedCarLocation,
  saveParkedCarLocation,
} from "../services/navigation/parkedCarLocation";
import type {
  NavigationCoordinate,
  NavigationParkedCarLocation,
  NavigationSavedLocation,
  NavigationSavedLocationCategory,
} from "../types/navigation";

type SaveLocationArgs = {
  label: string;
  subtitle?: string;
  category: Exclude<NavigationSavedLocationCategory, "recent" | "parked-car">;
  coordinate: NavigationCoordinate;
};

type SaveRecentArgs = {
  label: string;
  subtitle?: string;
  coordinate: NavigationCoordinate;
};

type SaveParkedCarArgs = {
  coordinate: NavigationCoordinate;
  accuracyMeters?: number | null;
  roadName?: string | null;
};

export function useSavedNavigationLocations() {
  const [savedLocations, setSavedLocations] = useState<NavigationSavedLocation[]>(
    loadSavedNavigationLocations
  );
  const [parkedCar, setParkedCar] = useState<NavigationParkedCarLocation | null>(
    loadParkedCarLocation
  );

  const reload = useCallback(() => {
    setSavedLocations(loadSavedNavigationLocations());
    setParkedCar(loadParkedCarLocation());
  }, []);

  const pinnedLocations = useMemo(
    () => savedLocations.filter((location) => location.category !== "recent"),
    [savedLocations]
  );
  const recentLocations = useMemo(
    () => savedLocations.filter((location) => location.category === "recent"),
    [savedLocations]
  );

  const saveLocation = useCallback(
    ({ label, subtitle, category, coordinate }: SaveLocationArgs) => {
      const location = addSavedNavigationLocation({
        label,
        subtitle,
        category,
        coordinate,
      });
      reload();
      return location;
    },
    [reload]
  );

  const saveRecentLocation = useCallback(
    ({ label, subtitle, coordinate }: SaveRecentArgs) => {
      markRecentNavigationLocation({
        label,
        subtitle,
        coordinate,
      });
      reload();
    },
    [reload]
  );

  const removeLocation = useCallback(
    (id: string) => {
      removeSavedNavigationLocation(id);
      reload();
    },
    [reload]
  );

  const markLocationUsed = useCallback(
    (id: string) => {
      touchSavedNavigationLocation(id);
      reload();
    },
    [reload]
  );

  const saveParkedCar = useCallback(
    ({ coordinate, accuracyMeters, roadName }: SaveParkedCarArgs) => {
      const parkedLocation = saveParkedCarLocation({
        coordinate,
        accuracyMeters,
        roadName,
      });
      setParkedCar(parkedLocation);
      return parkedLocation;
    },
    []
  );

  const clearParkedCar = useCallback(() => {
    clearParkedCarLocation();
    setParkedCar(null);
  }, []);

  return {
    savedLocations,
    pinnedLocations,
    recentLocations,
    parkedCar,
    reload,
    saveLocation,
    saveRecentLocation,
    removeLocation,
    markLocationUsed,
    saveParkedCar,
    clearParkedCar,
  };
}
