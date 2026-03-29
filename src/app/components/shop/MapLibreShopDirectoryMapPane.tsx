import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Layer, Map, Popup, Source } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";

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
import MapLibreShopDirectoryViewportManager from "./MapLibreShopDirectoryViewportManager";
import {
  MapPaneHeaderBadges,
  MapPaneBottomOverlay,
  MapPaneSearchPills,
} from "./ShopDirectoryMapPaneOverlays";

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

  /* ── Popup theme tokens ───────────────────────────────────────────── */
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
        <MapPaneHeaderBadges
          isDark={isDark}
          userType={userType}
          selectedOrigin={selectedOrigin}
          shopCount={shops.length}
        />
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
      <MapPaneBottomOverlay
        isDark={isDark}
        selectedShop={selectedShop}
        selectedRoute={selectedRoute}
        onOpenShopDirections={onOpenShopDirections}
        directionsActionLabel={directionsActionLabel}
      />

      {/* Search area pills */}
      <MapPaneSearchPills
        isDark={isDark}
        hasPanned={hasPanned}
        searchWithinViewport={searchWithinViewport}
        onSearchInArea={onSearchInArea}
        onClearAreaSearch={onClearAreaSearch}
        onClearPan={() => setHasPanned(false)}
      />

      {/* Floating overlay children (route preview, intelligence, deviation prompt) */}
      {children}
    </div>
  );
}
