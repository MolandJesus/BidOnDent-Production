import { useEffect, useMemo, useRef, useState } from "react";
import type { CoverageSearchTarget } from "../components/maps/serviceCoverageMapTypes";
import {
  fetchNearbyDiscoveryPlaces,
  type NavigationDiscoveryPlace,
  type NavigationDiscoveryRole,
} from "../services/navigation/placeDiscovery";
import { createTimeoutAbortController } from "../services/navigation/requestTimeout";

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
    const discoveryRequest = createTimeoutAbortController(12000);
    abortRef.current = discoveryRequest.controller;
    setIsLoading(true);
    setError("");

    fetchNearbyDiscoveryPlaces({
      center: {
        lat: target.lat,
        lng: target.lng,
      },
      role,
      radiusMiles,
      signal: discoveryRequest.controller.signal,
    })
      .then((nextPlaces) => {
        if (discoveryRequest.controller.signal.aborted) {
          return;
        }

        discoveryCache.set(cacheKey, nextPlaces);
        setPlaces(nextPlaces);
      })
      .catch((nextError) => {
        if (discoveryRequest.controller.signal.aborted && !discoveryRequest.didTimeout()) {
          return;
        }

        setPlaces([]);
        setError(
          discoveryRequest.didTimeout()
            ? "Live place discovery timed out. Retry or reduce the search area."
            : nextError instanceof Error
              ? nextError.message
              : "Live places failed to load."
        );
      })
      .finally(() => {
        discoveryRequest.clear();

        if (!discoveryRequest.controller.signal.aborted || discoveryRequest.didTimeout()) {
          setIsLoading(false);
        }
      });

    return () => {
      discoveryRequest.clear();
      discoveryRequest.controller.abort();
    };
  }, [cacheKey, radiusMiles, role, target]);

  return {
    places,
    isLoading,
    error,
  };
}
