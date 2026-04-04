/**
 * useShopServiceAreas — Fetches service areas for the authenticated shop user.
 * Pass 812 — Wire ShopMapWidget to real service area data.
 */

import { useCallback, useEffect, useState } from "react";

import { getMyShopServiceAreas, type ShopServiceArea } from "../services/supabase/serviceAreas";

export function useShopServiceAreas() {
  const [serviceAreas, setServiceAreas] = useState<ShopServiceArea[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const retry = useCallback(() => {
    setRetryNonce((n) => n + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    getMyShopServiceAreas()
      .then((areas) => {
        if (mounted) {
          setServiceAreas(areas);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        if (mounted) {
          setError(err instanceof Error ? err.message : "Failed to load service areas");
          setIsLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, [retryNonce]);

  return { serviceAreas, isLoading, error, retry };
}
