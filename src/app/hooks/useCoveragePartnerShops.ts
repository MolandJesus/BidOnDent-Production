import { useEffect, useMemo, useState } from "react";

import type { CoveragePartnerShop } from "../components/maps/serviceCoverageMapTypes";
import { fallbackPartnerHubs } from "../components/landing/coverageData";
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
        rating: shop.rating || 4.6,
      };
    })
    .filter(Boolean) as CoveragePartnerShop[];
}

export function useCoveragePartnerShops() {
  const [publicShops, setPublicShops] = useState<PartnerShopMapRecord[]>([]);
  const [isLoadingShops, setIsLoadingShops] = useState(false);

  useEffect(() => {
    let mounted = true;
    setIsLoadingShops(true);

    void getPublicPartnerShops()
      .then((rows) => {
        if (!mounted) return;
        setPublicShops(rows);
      })
      .finally(() => {
        if (!mounted) return;
        setIsLoadingShops(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const mappedPartnerShops = useMemo(() => mapPartnerShopRecords(publicShops), [publicShops]);

  return {
    isLoadingShops,
    partnerShops: mappedPartnerShops.length > 0 ? mappedPartnerShops : fallbackPartnerHubs,
  };
}
