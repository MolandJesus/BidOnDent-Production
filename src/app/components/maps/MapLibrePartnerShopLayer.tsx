import { useCallback, useEffect, useMemo, useState } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { MapPin, Star, X } from "lucide-react";
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
          offset={24}
          style={{ padding: 0, background: "transparent", border: "none", boxShadow: "none" }}
        >
          {/* Destination detail card — styled to match the app design language */}
          <div
            style={{ margin: 0 }}
            className="w-[264px] overflow-hidden rounded-2xl shadow-[0_20px_56px_rgba(2,6,23,0.32),0_6px_18px_rgba(2,6,23,0.18)]"
          >
            {/* Header — dark navy */}
            <div className="bg-slate-900 px-4 py-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="truncate font-semibold text-white text-[13px] leading-tight">
                    {popupShop.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin className="h-3 w-3 text-sky-400/80 shrink-0" />
                    <span className="text-sky-300/80 text-[11px] truncate">
                      {popupShop.countyLabel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPopupShop(null)}
                  className="shrink-0 mt-0.5 text-white/30 hover:text-white/70 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Rating row */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span className="text-amber-300 text-[11px] font-semibold">
                    {(popupShop.rating ?? 0).toFixed(1)}
                  </span>
                </div>
                {popupShop.dataMode === "demo" && (
                  <>
                    <span className="text-white/20 text-[11px]">·</span>
                    <span className="text-amber-400/70 text-[11px]">Preview location</span>
                  </>
                )}
              </div>
            </div>

            {/* Body — white */}
            <div className="bg-white px-4 py-3 space-y-2.5">
              {popupShop.addressLine ? (
                <div className="text-slate-500 text-[11px] leading-4">{popupShop.addressLine}</div>
              ) : popupShop.label ? (
                <div className="text-slate-500 text-[11px] leading-4">{popupShop.label}</div>
              ) : null}

              {(popupShop.specialties ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {popupShop.specialties.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className="bg-sky-50 text-sky-700 text-[10px] font-medium px-2 py-0.5 rounded-full border border-sky-100"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              )}

              <button
                onClick={() => {
                  const shopId = `${popupShop.id || popupShop.name}`;
                  if (onSelectShop) onSelectShop(shopId);
                  setPopupShop(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-[11px] font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(37,99,235,0.30)]"
              >
                View Shop Details
                <span className="text-blue-200">→</span>
              </button>
            </div>
          </div>
        </Popup>
      ) : null}
    </>
  );
}

export { LAYER_ID as PARTNER_SHOPS_LAYER_ID };
