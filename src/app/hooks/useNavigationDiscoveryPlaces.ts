import { useEffect, useMemo, useRef, useState } from "react";
import type { CoverageSearchTarget } from "../components/maps/serviceCoverageMapTypes";
import {
  fetchNearbyDiscoveryPlaces,
  type NavigationDiscoveryPlace,
  type NavigationDiscoveryRole,
} from "../services/navigation/placeDiscovery";

type UseNavigationDiscoveryPlacesArgs = {
  target: CoverageSearchTarget | null;
  role: NavigationDiscoveryRole;
  radiusMiles: number;
};

const discoveryCache = new Map<string, NavigationDiscoveryPlace[]>();

export function useNavigationDiscoveryPlaces({
  target,
  role,
  radiusMiles,
}: UseNavigationDiscoveryPlacesArgs) {
  const [places, setPlaces] = useState<NavigationDiscoveryPlace[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const abortRef = useRef<AbortController | null>(null);

  const cacheKey = useMemo(() => {
    if (!target) {
      return null;
    }

    return `${role}|${Math.round(radiusMiles)}|${target.lat.toFixed(2)}|${target.lng.toFixed(2)}`;
  }, [radiusMiles, role, target]);

  useEffect(() => {
    if (!target || !cacheKey) {
      setPlaces([]);
      setIsLoading(false);
      setError("");
      return;
    }

    const cached = discoveryCache.get(cacheKey);
    if (cached) {
      setPlaces(cached);
      setError("");
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setIsLoading(true);
    setError("");

    fetchNearbyDiscoveryPlaces({
      center: {
        lat: target.lat,
        lng: target.lng,
      },
      role,
      radiusMiles,
      signal: controller.signal,
    })
      .then((nextPlaces) => {
        if (controller.signal.aborted) {
          return;
        }

        discoveryCache.set(cacheKey, nextPlaces);
        setPlaces(nextPlaces);
      })
      .catch((nextError) => {
        if (controller.signal.aborted) {
          return;
        }

        setPlaces([]);
        setError(nextError instanceof Error ? nextError.message : "Live places failed to load.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [cacheKey, radiusMiles, role, target]);

  return {
    places,
    isLoading,
    error,
  };
}
