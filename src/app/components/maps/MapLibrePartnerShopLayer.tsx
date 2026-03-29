import { useCallback, useEffect, useMemo, useState } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { CoveragePartnerShop } from "./serviceCoverageMapTypes";

type MapLibrePartnerShopLayerProps = {
  partnerShops: CoveragePartnerShop[];
  selectedShopId?: string;
  isNavigationPresentation: boolean;
  onSelectShop?: (shopId: string) => void;
};

function buildShopsGeoJSON(
  shops: CoveragePartnerShop[],
  selectedShopId: string | undefined,
  isNavigation: boolean
) {
  const filtered = isNavigation
    ? shops.filter((s) => `${s.id || s.name}` === selectedShopId)
    : shops;

  return {
    type: "FeatureCollection" as const,
    features: filtered.map((shop) => ({
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [shop.lng, shop.lat],
      },
      properties: {
        id: `${shop.id || shop.name}`,
        name: shop.name,
        countyLabel: shop.countyLabel,
        label: shop.label,
        rating: (shop.rating ?? 0).toFixed(1),
        addressLine: shop.addressLine ?? "",
        specialties: (shop.specialties ?? []).slice(0, 3).join(" • "),
        dataMode: shop.dataMode ?? "live",
        isSelected: `${shop.id || shop.name}` === selectedShopId ? 1 : 0,
        isNavigation: isNavigation ? 1 : 0,
      },
    })),
  };
}

const LAYER_ID = "partner-shops-circle";

export default function MapLibrePartnerShopLayer({
  partnerShops,
  selectedShopId,
  isNavigationPresentation,
  onSelectShop,
}: MapLibrePartnerShopLayerProps) {
  const [popupShop, setPopupShop] = useState<CoveragePartnerShop | null>(null);

  const geojson = useMemo(
    () => buildShopsGeoJSON(partnerShops, selectedShopId, isNavigationPresentation),
    [partnerShops, selectedShopId, isNavigationPresentation]
  );

  // MapLibre expressions typed loosely — the engine validates at runtime
  const circlePaint = useMemo(
    () =>
      ({
        "circle-radius": [
          "case",
          ["==", ["get", "isNavigation"], 1],
          16,
          ["==", ["get", "isSelected"], 1],
          13,
          11,
        ],
        "circle-color": [
          "case",
          ["==", ["get", "isNavigation"], 1],
          "#fbbf24",
          ["==", ["get", "isSelected"], 1],
          "#38bdf8",
          "#1d4ed8",
        ],
        "circle-opacity": ["case", ["==", ["get", "isSelected"], 1], 1, 0.9],
        "circle-stroke-width": [
          "case",
          ["==", ["get", "isNavigation"], 1],
          5,
          ["==", ["get", "isSelected"], 1],
          3,
          2,
        ],
        "circle-stroke-color": [
          "case",
          ["==", ["get", "isNavigation"], 1],
          "#fef3c7",
          ["==", ["get", "isSelected"], 1],
          "#dbeafe",
          "#0f172a",
        ],
      }) as Record<string, unknown>,
    []
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const features = e.features;
      if (!features?.length) return;
      const shopId = features[0].properties?.id as string;
      if (shopId && onSelectShop) {
        onSelectShop(shopId);
      }
      const shop = partnerShops.find((s) => `${s.id || s.name}` === shopId);
      if (shop) setPopupShop(shop);
    },
    [partnerShops, onSelectShop]
  );

  const { current: mapRef } = useMap();

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    map.on("click", LAYER_ID, handleClick as unknown as (e: unknown) => void);
    return () => {
      map.off("click", LAYER_ID, handleClick as unknown as (e: unknown) => void);
    };
  }, [mapRef, handleClick]);

  return (
    <>
      <Source id="partner-shops" type="geojson" data={geojson}>
        <Layer id={LAYER_ID} type="circle" paint={circlePaint} />
      </Source>
      {popupShop ? (
        <Popup
          longitude={popupShop.lng}
          latitude={popupShop.lat}
          closeOnClick={false}
          onClose={() => setPopupShop(null)}
          anchor="bottom"
          offset={20}
        >
          <div className="text-sm">
            <div className="font-semibold">{popupShop.name}</div>
            {popupShop.dataMode === "demo" ? (
              <div className="font-semibold text-amber-500">Demo</div>
            ) : null}
            <div>{popupShop.countyLabel}</div>
            <div>{popupShop.label}</div>
            <div>Rating: {(popupShop.rating ?? 0).toFixed(1)}</div>
            {popupShop.addressLine ? <div>{popupShop.addressLine}</div> : null}
            {(popupShop.specialties ?? []).length > 0 ? (
              <div>Focus: {popupShop.specialties.slice(0, 3).join(" • ")}</div>
            ) : null}
          </div>
        </Popup>
      ) : null}
    </>
  );
}

export { LAYER_ID as PARTNER_SHOPS_LAYER_ID };
