import { useCallback, useEffect, useMemo, useState } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { MapPin, Star, X } from "lucide-react";
import type { CoveragePartnerShop, MapSurfaceTone } from "./serviceCoverageMapTypes";

type MapLibrePartnerShopLayerProps = {
  partnerShops: CoveragePartnerShop[];
  selectedShopId?: string;
  isNavigationPresentation: boolean;
  tone?: MapSurfaceTone;
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
  tone = "dark",
  onSelectShop,
}: MapLibrePartnerShopLayerProps) {
  const isLight = tone === "light";
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
          isLight ? "#2563eb" : "#38bdf8",
          isLight ? "#2563eb" : "#1d4ed8",
        ],
        "circle-opacity": ["case", ["==", ["get", "isSelected"], 1], 1, 0.9],
        "circle-stroke-width": [
          "case",
          ["==", ["get", "isNavigation"], 1],
          5,
          ["==", ["get", "isSelected"], 1],
          3,
          2.5,
        ],
        "circle-stroke-color": [
          "case",
          ["==", ["get", "isNavigation"], 1],
          "#fef3c7",
          ["==", ["get", "isSelected"], 1],
          isLight ? "#bfdbfe" : "#dbeafe",
          isLight ? "#ffffff" : "#0f172a",
        ],
      }) as Record<string, unknown>,
    [isLight]
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
        <Layer
          id="partner-shops-rating-label"
          type="symbol"
          layout={
            {
              "text-field": ["get", "rating"],
              "text-size": 9,
              "text-font": ["Open Sans Bold"],
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            } as Record<string, unknown>
          }
          paint={
            {
              "text-color": "#ffffff",
              "text-halo-color": "rgba(0,0,0,0.25)",
              "text-halo-width": 0.5,
            } as Record<string, unknown>
          }
        />
      </Source>
      {popupShop ? (
        <Popup
          longitude={popupShop.lng}
          latitude={popupShop.lat}
          closeOnClick={false}
          closeButton={false}
          onClose={() => setPopupShop(null)}
          anchor="bottom"
          offset={24}
          className="bd-map-tooltip"
        >
          <div
            style={{ margin: 0 }}
            className={`w-[264px] overflow-hidden rounded-2xl border backdrop-blur-2xl ${
              isLight
                ? "border-[rgba(140,82,22,0.24)] shadow-[0_20px_56px_rgba(15,23,42,0.14),0_6px_18px_rgba(15,23,42,0.08),inset_0_1px_0_rgba(252,240,208,0.78),0_0_0_1px_rgba(140,82,22,0.16),0_0_44px_rgba(196,130,45,0.10)]"
                : "border-[rgba(96,165,250,0.20)] shadow-[inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.18),0_22px_56px_rgba(2,6,23,0.42),0_0_56px_rgba(196,130,45,0.14)]"
            }`}
          >
            {/* Header */}
            <div
              className={`px-4 py-3.5 ${
                isLight
                  ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.92),rgba(232,238,248,0.86))] border-b border-[rgba(140,82,22,0.22)] shadow-[inset_0_1px_0_rgba(252,240,208,0.85)]"
                  : "bg-slate-900"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div
                    className={`truncate font-semibold text-[13px] leading-tight ${
                      isLight ? "text-slate-900" : "text-white"
                    }`}
                  >
                    {popupShop.name}
                  </div>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <MapPin
                      className={`h-3 w-3 shrink-0 ${isLight ? "text-blue-500/80" : "text-sky-400/80"}`}
                    />
                    <span
                      className={`text-[11px] truncate ${isLight ? "text-blue-600/70" : "text-sky-300/80"}`}
                    >
                      {popupShop.countyLabel}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setPopupShop(null)}
                  className={`shrink-0 mt-0.5 transition-colors ${
                    isLight
                      ? "text-slate-400 hover:text-slate-600"
                      : "text-white/30 hover:text-white/70"
                  }`}
                  aria-label="Close"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
              {/* Rating row */}
              <div className="flex items-center gap-2 mt-2.5">
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                  <span
                    className={`text-[11px] font-semibold ${isLight ? "text-amber-600" : "text-amber-300"}`}
                  >
                    {(popupShop.rating ?? 0).toFixed(1)}
                  </span>
                </div>
                {popupShop.dataMode === "demo" && (
                  <>
                    <span className={`text-[11px] ${isLight ? "text-slate-300" : "text-white/20"}`}>
                      ·
                    </span>
                    <span
                      className={`text-[11px] ${isLight ? "text-amber-500/70" : "text-amber-400/70"}`}
                    >
                      Preview location
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Body */}
            <div
              className={`px-4 py-3 space-y-2.5 ${
                isLight
                  ? "bg-[linear-gradient(180deg,rgba(232,238,248,0.78),rgba(247,232,194,0.74))]"
                  : "bg-[linear-gradient(180deg,rgba(15,23,42,0.88),rgba(15,23,42,0.76))]"
              }`}
            >
              {popupShop.addressLine ? (
                <div
                  className={`text-[11px] leading-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}
                >
                  {popupShop.addressLine}
                </div>
              ) : popupShop.label ? (
                <div
                  className={`text-[11px] leading-4 ${isLight ? "text-slate-500" : "text-slate-400"}`}
                >
                  {popupShop.label}
                </div>
              ) : null}

              {(popupShop.specialties ?? []).length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {popupShop.specialties.slice(0, 2).map((s) => (
                    <span
                      key={s}
                      className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${
                        isLight
                          ? "bg-sky-50 text-sky-700 border-sky-100"
                          : "bg-sky-400/10 text-sky-300 border-sky-400/20"
                      }`}
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
                className={`w-full active:scale-[0.98] text-[11px] font-semibold py-2.5 px-3 rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                  isLight
                    ? "bg-[linear-gradient(180deg,rgba(59,130,246,0.9),rgba(37,99,235,0.96))] text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] hover:brightness-110"
                    : "bg-blue-600 hover:bg-blue-700 text-white shadow-[0_4px_12px_rgba(37,99,235,0.30)]"
                }`}
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
