import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Layer, Map, Popup, Source } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { Compass, MapPin, Search, Shield, Sparkles, X } from "lucide-react";

import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";
import type {
  Coordinates,
  MapTheme,
  MapViewportBounds,
  Place,
  RouteOption,
  SavedPlace,
} from "../../types/mapDomain";
import { mapLibreStyles } from "../maps/mapLibreStyles";
import MapLibreReportLayer from "../maps/MapLibreReportLayer";
import MapLibreShopDirectoryViewportManager, {
  getRoleLabel,
} from "./MapLibreShopDirectoryViewportManager";

/* ── Layer IDs ──────────────────────────────────────────────────────── */
const SHOP_LAYER = "shop-dir-circles";
const ROUTE_SELECTED_LAYER = "route-selected-line";
const ROUTE_UNSELECTED_LAYER = "route-unselected-line";
const ORIGIN_LAYER = "origin-circle";
const USER_DOT_LAYER = "user-dot-circle";
const USER_RING_LAYER = "user-ring-circle";
const SAVED_PLACES_LAYER = "saved-places-circles";

/* ── Props ──────────────────────────────────────────────────────────── */
type ShopDirectoryMapPaneProps = {
  shops: ShopMapListing[];
  routeOptions: RouteOption[];
  selectedRouteId?: string | null;
  selectedShopId: number | null;
  onSelectShop: (shopId: number) => void;
  selectedOrigin?: Place | null;
  savedPlaces: SavedPlace[];
  mapTheme: MapTheme;
  initialCenter?: Coordinates;
  initialZoom?: number;
  preserveViewport?: boolean;
  userType: MarketUserType;
  onViewportChange: (center: Coordinates, zoom: number, bounds: MapViewportBounds) => void;
  children?: React.ReactNode;
  suppressHeader?: boolean;
  searchWithinViewport?: boolean;
  onSearchInArea?: () => void;
  onClearAreaSearch?: () => void;
  userCoords?: Coordinates | null;
  onOpenShopDirections?: (shop: ShopMapListing) => void;
  directionsActionLabel?: string;
};

export default function MapLibreShopDirectoryMapPane({
  shops,
  routeOptions,
  selectedRouteId,
  selectedShopId,
  onSelectShop,
  selectedOrigin,
  savedPlaces,
  mapTheme,
  initialCenter,
  initialZoom,
  preserveViewport,
  userType,
  onViewportChange,
  children,
  suppressHeader,
  searchWithinViewport,
  onSearchInArea,
  onClearAreaSearch,
  userCoords,
  onOpenShopDirections,
  directionsActionLabel,
}: ShopDirectoryMapPaneProps) {
  const [hasPanned, setHasPanned] = useState(false);
  const [cursor, setCursor] = useState("");
  const [shopPopup, setShopPopup] = useState<{
    lng: number;
    lat: number;
    shop: ShopMapListing;
  } | null>(null);

  /* Close popup when selection changes externally (e.g. sidebar click) */
  useEffect(() => {
    if (shopPopup && shopPopup.shop.id !== selectedShopId) {
      setShopPopup(null);
    }
  }, [selectedShopId, shopPopup]);

  const selectedShop = shops.find((s) => s.id === selectedShopId) || shops[0] || null;
  const selectedRoute =
    routeOptions.find((r) => r.id === selectedRouteId) || routeOptions[0] || null;
  const isDark = mapTheme === "dark";
  const mapStyle = isDark ? mapLibreStyles.night : mapLibreStyles.roadmap;
  const fitSignature = [
    selectedOrigin?.placeId || selectedOrigin?.name || "no-origin",
    shops.map((s) => s.id).join(","),
  ].join(":");

  /* ── Theme tokens ─────────────────────────────────────────────────── */
  const badgeCard = isDark
    ? "border-white/15 bg-slate-950/70 text-white shadow-xl backdrop-blur"
    : "border-black/8 bg-white/85 text-slate-800 shadow-xl backdrop-blur";
  const badgeLabel = isDark ? "text-white/65" : "text-slate-500";
  const badgeValue = isDark ? "text-white/95" : "text-slate-800";
  const topGradient = isDark
    ? "bg-gradient-to-b from-slate-950/50 via-slate-950/12 to-transparent"
    : "bg-gradient-to-b from-black/18 via-black/5 to-transparent";
  const bottomGradient = isDark
    ? "bg-gradient-to-t from-slate-950/75 via-slate-950/22 to-transparent"
    : "bg-gradient-to-t from-black/22 via-black/8 to-transparent";
  const shopCardCls = isDark
    ? "border-white/15 bg-slate-950/92 text-white shadow-2xl backdrop-blur-xl"
    : "border-black/8 bg-white/94 text-slate-800 shadow-2xl backdrop-blur-xl";
  const shopCardSecondary = isDark ? "text-slate-300/80" : "text-slate-500";
  const shopCardMeta = isDark ? "text-slate-400" : "text-slate-500";
  const shopCardScore = isDark ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-800";
  const shopCardScoreLabel = isDark ? "text-white/65" : "text-slate-500";
  const legendCard = isDark
    ? "border-white/15 bg-slate-950/70 text-white/80 shadow-xl backdrop-blur"
    : "border-black/8 bg-white/85 text-slate-600 shadow-xl backdrop-blur";
  const popupTitle = isDark ? "text-slate-100" : "text-slate-800";
  const popupSub = isDark ? "text-slate-300" : "text-slate-500";
  const popupScoreCard = isDark
    ? "border-white/12 bg-slate-800/60 text-slate-300"
    : "border-slate-200 bg-slate-50 text-slate-500";
  const popupScoreValue = isDark ? "text-white" : "text-slate-800";
  const popupCarrierCard = isDark
    ? "border-emerald-400/20 bg-emerald-900/30 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-600";
  const popupCarrierValue = isDark ? "text-emerald-200" : "text-emerald-800";

  /* ── GeoJSON data ─────────────────────────────────────────────────── */
  const shopsGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: shops.map((shop) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [shop.mapResult.coordinates.longitude, shop.mapResult.coordinates.latitude],
        },
        properties: {
          id: shop.id,
          name: shop.name,
          address: `${shop.mapResult.address}, ${shop.mapResult.city}`,
          recommendationScore: shop.recommendationScore,
          insuranceCompatibilityScore: shop.insuranceCompatibilityScore,
          isSelected: shop.id === selectedShopId ? 1 : 0,
          topPick: shop.topPick ? 1 : 0,
        },
      })),
    }),
    [shops, selectedShopId]
  );

  const routesGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: routeOptions.map((route) => ({
        type: "Feature" as const,
        geometry: {
          type: "LineString" as const,
          coordinates: route.polyline.map((p) => [p.longitude, p.latitude]),
        },
        properties: {
          id: route.id,
          accentColor: route.accentColor,
          isSelected: route.id === selectedRoute?.id ? 1 : 0,
          label: route.label,
          totalDistanceLabel: route.totalDistanceLabel,
          estimatedDurationMinutes: route.estimatedDurationMinutes,
          trafficLabel: route.trafficLabel,
        },
      })),
    }),
    [routeOptions, selectedRoute]
  );

  const originGeoJson = useMemo(() => {
    if (!selectedOrigin) return null;
    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [selectedOrigin.longitude, selectedOrigin.latitude],
      },
      properties: { name: selectedOrigin.name, address: selectedOrigin.address },
    };
  }, [selectedOrigin]);

  const userCoordsGeoJson = useMemo(() => {
    if (!userCoords) return null;
    return {
      type: "Feature" as const,
      geometry: {
        type: "Point" as const,
        coordinates: [userCoords.longitude, userCoords.latitude],
      },
      properties: {},
    };
  }, [userCoords]);

  const savedPlacesGeoJson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: savedPlaces.map((place) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [place.longitude, place.latitude],
        },
        properties: { id: place.id, label: place.label, address: place.address },
      })),
    }),
    [savedPlaces]
  );

  /* ── Interaction ──────────────────────────────────────────────────── */
  const interactiveLayerIds = [SHOP_LAYER];

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const feature = e.features?.[0];
      if (!feature) {
        setShopPopup(null);
        return;
      }
      if (feature.layer?.id === SHOP_LAYER) {
        const shopId = feature.properties?.id;
        if (shopId != null) {
          onSelectShop(Number(shopId));
          const shop = shops.find((s) => s.id === Number(shopId));
          if (shop) {
            setShopPopup({
              lng: shop.mapResult.coordinates.longitude,
              lat: shop.mapResult.coordinates.latitude,
              shop,
            });
          }
        }
      }
    },
    [onSelectShop, shops]
  );

  /* ── Render ───────────────────────────────────────────────────────── */
  return (
    <div
      data-map-theme={mapTheme}
      className="shop-directory-map relative h-full min-h-[420px] w-full overflow-hidden"
    >
      {/* ── Header badges ── */}
      {!suppressHeader && (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-[500] ${topGradient} px-3 py-3 sm:px-5 sm:py-4`}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className={`rounded-xl border px-3 py-2 ${badgeCard}`}>
              <div
                className={`flex items-center gap-1.5 text-[10px] uppercase tracking-[0.2em] ${badgeLabel}`}
              >
                <Sparkles className="h-3 w-3" />
                {getRoleLabel(userType)}
              </div>
              <p className={`mt-0.5 text-xs font-medium ${badgeValue}`}>
                {selectedOrigin
                  ? `Centered on ${selectedOrigin.name}`
                  : "Exploring the service area"}
              </p>
            </div>

            <div className={`rounded-xl border px-3 py-2 text-right ${badgeCard}`}>
              <p className={`text-[10px] uppercase tracking-[0.2em] ${badgeLabel}`}>Shops</p>
              <p className={`text-lg font-semibold leading-tight ${badgeValue}`}>{shops.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── MapLibre GL map ── */}
      <Map
        id="shop-directory-map"
        initialViewState={{
          longitude: initialCenter?.longitude ?? -73.8654,
          latitude: initialCenter?.latitude ?? 41.0534,
          zoom: initialZoom ?? 11,
        }}
        mapStyle={mapStyle}
        style={{ width: "100%", height: "100%" }}
        cursor={cursor}
        interactiveLayerIds={interactiveLayerIds}
        onClick={handleMapClick}
        onMouseEnter={() => setCursor("pointer")}
        onMouseLeave={() => setCursor("")}
        attributionControl={{ compact: true }}
      >
        {/* Viewport management (fit, fly, broadcast) */}
        <MapLibreShopDirectoryViewportManager
          fitSignature={fitSignature}
          shops={shops}
          selectedShopId={selectedShopId}
          selectedOrigin={selectedOrigin}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          preserveViewport={preserveViewport}
          onViewportChange={(center, zoom, bounds) => {
            setHasPanned(true);
            onViewportChange(center, zoom, bounds);
          }}
        />

        {/* Report markers (Supabase-fetched) */}
        <MapLibreReportLayer mapTheme={mapTheme} />

        {/* ── Route polylines ── */}
        {routeOptions.length > 0 && (
          <Source id="routes-source" type="geojson" data={routesGeoJson}>
            {/* Unselected routes (dashed, lower opacity) */}
            <Layer
              id={ROUTE_UNSELECTED_LAYER}
              type="line"
              filter={["==", ["get", "isSelected"], 0]}
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={
                {
                  "line-color": ["get", "accentColor"],
                  "line-width": 3,
                  "line-opacity": 0.38,
                  "line-dasharray": [2.5, 3],
                } as Record<string, unknown>
              }
            />
            {/* Selected route glow (MapLibre-native blur) */}
            <Layer
              id="route-selected-glow"
              type="line"
              filter={["==", ["get", "isSelected"], 1]}
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={
                {
                  "line-color": ["get", "accentColor"],
                  "line-width": 20,
                  "line-opacity": 0.2,
                  "line-blur": 12,
                } as Record<string, unknown>
              }
            />
            {/* Selected route (solid, full opacity) */}
            <Layer
              id={ROUTE_SELECTED_LAYER}
              type="line"
              filter={["==", ["get", "isSelected"], 1]}
              layout={{ "line-cap": "round", "line-join": "round" }}
              paint={
                {
                  "line-color": ["get", "accentColor"],
                  "line-width": 5,
                  "line-opacity": 0.92,
                } as Record<string, unknown>
              }
            />
          </Source>
        )}

        {/* ── Origin marker ── */}
        {originGeoJson && (
          <Source id="origin-source" type="geojson" data={originGeoJson}>
            <Layer
              id={ORIGIN_LAYER}
              type="circle"
              paint={{
                "circle-radius": 9,
                "circle-color": "#f97316",
                "circle-opacity": 0.9,
                "circle-stroke-width": 3,
                "circle-stroke-color": "#fff7ed",
              }}
            />
          </Source>
        )}

        {/* ── User geolocation blue dot ── */}
        {userCoordsGeoJson && (
          <Source id="user-coords-source" type="geojson" data={userCoordsGeoJson}>
            {/* Accuracy ring */}
            <Layer
              id={USER_RING_LAYER}
              type="circle"
              paint={{
                "circle-radius": 22,
                "circle-color": isDark ? "#60a5fa" : "#3b82f6",
                "circle-opacity": 0.2,
                "circle-stroke-width": 1.5,
                "circle-stroke-color": isDark ? "#60a5fa" : "#3b82f6",
              }}
            />
            {/* Inner dot */}
            <Layer
              id={USER_DOT_LAYER}
              type="circle"
              paint={{
                "circle-radius": 8,
                "circle-color": isDark ? "#60a5fa" : "#2563eb",
                "circle-opacity": 0.95,
                "circle-stroke-width": 3,
                "circle-stroke-color": "#ffffff",
              }}
            />
          </Source>
        )}

        {/* ── Saved places ── */}
        {savedPlacesGeoJson.features.length > 0 && (
          <Source id="saved-places-source" type="geojson" data={savedPlacesGeoJson}>
            <Layer
              id={SAVED_PLACES_LAYER}
              type="circle"
              paint={{
                "circle-radius": 7,
                "circle-color": "#1d4ed8",
                "circle-opacity": 0.3,
                "circle-stroke-width": 2,
                "circle-stroke-color": "#1d4ed8",
              }}
            />
          </Source>
        )}

        {/* ── Shop markers ── */}
        {shopsGeoJson.features.length > 0 && (
          <Source id="shops-source" type="geojson" data={shopsGeoJson}>
            <Layer
              id={SHOP_LAYER}
              type="circle"
              paint={
                {
                  "circle-radius": [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    12,
                    ["==", ["get", "topPick"], 1],
                    10,
                    8,
                  ],
                  "circle-color": [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    "#2563eb",
                    ["==", ["get", "topPick"], 1],
                    "#0f172a",
                    "#38bdf8",
                  ],
                  "circle-opacity": 0.9,
                  "circle-stroke-width": ["case", ["==", ["get", "isSelected"], 1], 4, 2],
                  "circle-stroke-color": [
                    "case",
                    ["==", ["get", "isSelected"], 1],
                    "#dbeafe",
                    "#eff6ff",
                  ],
                } as Record<string, unknown>
              }
            />
          </Source>
        )}

        {/* ── Shop popup ── */}
        {shopPopup && (
          <Popup
            longitude={shopPopup.lng}
            latitude={shopPopup.lat}
            anchor="bottom"
            offset={14}
            closeOnClick={false}
            onClose={() => setShopPopup(null)}
          >
            <div className="space-y-2">
              <div>
                <p className={`font-semibold ${popupTitle}`}>{shopPopup.shop.name}</p>
                <p className={`text-sm ${popupSub}`}>
                  {shopPopup.shop.mapResult.address}, {shopPopup.shop.mapResult.city}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className={`rounded-xl border px-3 py-2 ${popupScoreCard}`}>
                  <p>AI fit</p>
                  <p className={`font-semibold ${popupScoreValue}`}>
                    {shopPopup.shop.recommendationScore}%
                  </p>
                </div>
                <div className={`rounded-xl border px-3 py-2 ${popupCarrierCard}`}>
                  <p>Carrier fit</p>
                  <p className={`font-semibold ${popupCarrierValue}`}>
                    {shopPopup.shop.insuranceCompatibilityScore}%
                  </p>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>

      {/* ── Bottom gradient overlay: selected shop card + legend ── */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[500] ${bottomGradient} px-5 pb-5 pt-16`}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          {selectedShop && (
            <div className={`max-w-md rounded-[24px] border p-4 ${shopCardCls}`}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`text-xs uppercase tracking-[0.2em] ${shopCardMeta}`}>
                    Selected shop
                  </p>
                  <h3
                    className={`mt-1 text-lg font-semibold ${isDark ? "text-white" : "text-slate-800"}`}
                  >
                    {selectedShop.name}
                  </h3>
                </div>
                <div className={`rounded-2xl px-3 py-2 text-center ${shopCardScore}`}>
                  <p className={`text-[11px] uppercase tracking-[0.18em] ${shopCardScoreLabel}`}>
                    AI Fit
                  </p>
                  <p className="text-lg font-semibold">{selectedShop.recommendationScore}%</p>
                </div>
              </div>

              <div
                className={`mt-3 flex flex-wrap items-center gap-3 text-sm ${shopCardSecondary}`}
              >
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className={`h-4 w-4 ${shopCardMeta}`} />
                  {selectedShop.mapDistanceLabel}
                </span>
                {selectedRoute && (
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className={`h-4 w-4 ${shopCardMeta}`} />
                    {selectedRoute.label} • {selectedRoute.estimatedDurationMinutes} min
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Shield className={`h-4 w-4 ${shopCardMeta}`} />
                  {selectedShop.insuranceCompatibilityScore}% carrier fit
                </span>
              </div>

              <p className={`mt-3 text-sm leading-6 ${shopCardSecondary}`}>
                {selectedShop.aiSummary}
              </p>

              {onOpenShopDirections && (
                <button
                  type="button"
                  onClick={() => onOpenShopDirections(selectedShop)}
                  className={`pointer-events-auto mt-3 inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${
                    isDark
                      ? "border-blue-400/35 bg-blue-500/20 text-white hover:bg-blue-500/30"
                      : "border-blue-300/70 bg-blue-50 text-blue-700 hover:bg-blue-100"
                  }`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  {directionsActionLabel || "Directions"}
                </button>
              )}
            </div>
          )}

          <div
            className={`hidden rounded-xl border px-3 py-2 text-[11px] shadow-lg sm:block ${legendCard}`}
          >
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>Legend</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
                Origin
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
                Selected
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="inline-block h-2 w-2 rounded-full bg-slate-900" />
                Top
              </span>
              <span className="inline-flex items-center gap-1">
                <span
                  className="inline-block h-2.5 w-4 rounded border border-current opacity-50"
                  style={{ borderStyle: "dashed" }}
                />
                Routes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search in this area pill */}
      {onSearchInArea && hasPanned && !searchWithinViewport && (
        <div className="pointer-events-auto absolute inset-x-0 top-3 z-[600] flex justify-center">
          <button
            type="button"
            onClick={onSearchInArea}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-xl backdrop-blur-md transition-colors ${
              isDark
                ? "border-white/20 bg-slate-950/80 text-white hover:bg-slate-950/95"
                : "border-black/10 bg-white/90 text-slate-800 hover:bg-white"
            }`}
          >
            <Search className="h-3 w-3" />
            Search this area
          </button>
        </div>
      )}

      {/* Clear area search pill */}
      {onClearAreaSearch && searchWithinViewport && (
        <div className="pointer-events-auto absolute inset-x-0 top-3 z-[600] flex justify-center">
          <button
            type="button"
            onClick={() => {
              onClearAreaSearch();
              setHasPanned(false);
            }}
            className={`inline-flex min-h-[44px] items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold shadow-xl backdrop-blur-md transition-colors ${
              isDark
                ? "border-blue-400/40 bg-blue-600/30 text-white hover:bg-blue-600/45"
                : "border-blue-400/40 bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <X className="h-3 w-3" />
            Area active
          </button>
        </div>
      )}

      {/* Floating overlay children (route preview, intelligence, deviation prompt) */}
      {children}
    </div>
  );
}
