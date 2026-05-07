import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
import {
  deleteNavigationSavedPlace,
  fetchNavigationSavedPlaces,
  upsertNavigationSavedPlace,
} from "../services/supabase/navigationSavedPlaces";
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

  /**
   * Pass 58 (F2 scaffolding): hydrate-on-mount from cloud, then merge into
   * the localStorage mirror. localStorage stays the authoritative cache so
   * offline users keep their pinned places. The cloud call is fire-and-forget
   * — `fetchNavigationSavedPlaces` already implements a 60s circuit breaker
   * for KI-095 (table missing / RLS denying) so missing migrations degrade
   * silently instead of spamming the edge function.
   */
  const hasHydratedRef = useRef(false);
  useEffect(() => {
    if (hasHydratedRef.current) return;
    hasHydratedRef.current = true;
    let cancelled = false;
    void fetchNavigationSavedPlaces().then(({ places, fallback }) => {
      if (cancelled || fallback || places.length === 0) return;
      // Mirror cloud rows into the localStorage cache. addSavedNavigationLocation
      // is idempotent on the (label, coordinate) key for non-recent entries
      // and on the id key for everything else, so re-hydration is safe to run.
      places.forEach((row) => {
        if (row.category === "recent") {
          markRecentNavigationLocation({
            label: row.label,
            subtitle: row.subtitle ?? undefined,
            coordinate: { lat: Number(row.lat), lng: Number(row.lng) },
          });
        } else {
          addSavedNavigationLocation({
            label: row.label,
            subtitle: row.subtitle ?? undefined,
            category: row.category,
            coordinate: { lat: Number(row.lat), lng: Number(row.lng) },
          });
        }
      });
      setSavedLocations(loadSavedNavigationLocations());
    });
    return () => {
      cancelled = true;
    };
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
      // Pass 58: cloud sync is fire-and-forget; localStorage remains the
      // authoritative cache so a cloud failure doesn't roll back the user's
      // action. The service traps every error under its 60s backoff.
      void upsertNavigationSavedPlace(location);
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
      // Pass 58: recents also sync up so a fresh device sees them. We pull
      // the freshly-added recent off the local list (markRecentNavigationLocation
      // returns void) so we have an id/timestamp to send.
      const updated = loadSavedNavigationLocations().find(
        (entry) =>
          entry.category === "recent" &&
          entry.label === label &&
          Math.abs(entry.coordinate.lat - coordinate.lat) < 0.00001 &&
          Math.abs(entry.coordinate.lng - coordinate.lng) < 0.00001
      );
      if (updated) {
        void upsertNavigationSavedPlace(updated);
      }
    },
    [reload]
  );

  const removeLocation = useCallback(
    (id: string) => {
      removeSavedNavigationLocation(id);
      reload();
      // Pass 58: cloud delete is fire-and-forget. If it fails, the next
      // hydrate-on-mount will re-introduce the row, but a subsequent local
      // remove will retry — eventual consistency under the 60s backoff.
      void deleteNavigationSavedPlace(id);
    },
    [reload]
  );

  const markLocationUsed = useCallback(
    (id: string) => {
      touchSavedNavigationLocation(id);
      reload();
      const touched = loadSavedNavigationLocations().find((entry) => entry.id === id);
      if (touched) {
        void upsertNavigationSavedPlace(touched);
      }
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
