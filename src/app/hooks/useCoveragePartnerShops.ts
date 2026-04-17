import { useCallback, useEffect, useMemo, useState } from "react";

import type { CoveragePartnerShop } from "../components/maps/serviceCoverageMapTypes";
import { fallbackPartnerHubs } from "../components/landing/coverageData";
import { DEMO_MODE } from "../config/demoMode";
import { getPublicPartnerShops, resolveShopCoordinates } from "../services/supabase/map";
import type { PartnerShopMapRecord } from "../services/supabase/types";

function mapPartnerShopRecords(publicShops: PartnerShopMapRecord[]): CoveragePartnerShop[] {
  return publicShops
    .map((shop) => {
      const coords = resolveShopCoordinates(shop);
      if (!coords) return null;

      return {
        id: shop.id,
        name: shop.shop_name,
        dataMode: "live" as const,
        countyLabel:
          [shop.city, shop.state].filter(Boolean).join(", ") ||
          (shop.zip_code ? `ZIP ${shop.zip_code}` : "Partner shop"),
        lat: coords.lat,
        lng: coords.lng,
        label: [shop.city, shop.state].filter(Boolean).join(", ") || "NY service region",
        addressLine: [shop.address, shop.city, shop.state, shop.zip_code]
          .filter(Boolean)
          .join(", "),
        phoneNumber: shop.phone_number || undefined,
        email: shop.email || undefined,
        specialties: shop.specialties || [],
        rating: shop.rating ?? 4.6,
      };
    })
    .filter(Boolean) as CoveragePartnerShop[];
}

export function useCoveragePartnerShops() {
  const [publicShops, setPublicShops] = useState<PartnerShopMapRecord[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [retryNonce, setRetryNonce] = useState(0);

  const retryPartnerShops = useCallback(() => {
    setRetryNonce((current) => current + 1);
  }, []);

  useEffect(() => {
    let mounted = true;
    setIsLoadingShops(true);
    setFetchError(null);

    void getPublicPartnerShops()
      .then((rows) => {
        if (!mounted) return;
        setPublicShops(rows);
      })
      .catch((error: unknown) => {
        if (!mounted) return;
        const message = error instanceof Error ? error.message : "Failed to load partner shops";
        setFetchError(message);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingShops(false);
      });

    return () => {
      mounted = false;
    };
  }, [retryNonce]);

  const mappedPartnerShops = useMemo(() => mapPartnerShopRecords(publicShops), [publicShops]);
  // Keep production backend-first while ensuring local demo/dev route flows remain testable.
  // In DEV mode always allow fallback so the map has data to display during development.
  const explicitDemoFallback = import.meta.env.VITE_ENABLE_MAP_DEMO_FALLBACK === "true";
  const allowDemoFallback = explicitDemoFallback || import.meta.env.DEV || DEMO_MODE;
  const usingDemoFallback = mappedPartnerShops.length === 0 && allowDemoFallback;

  return {
    isLoadingShops,
    partnerShops:
      mappedPartnerShops.length > 0
        ? mappedPartnerShops
        : allowDemoFallback
          ? fallbackPartnerHubs
          : [],
    usingDemoFallback,
    fetchError,
    retryPartnerShops,
  };
}
