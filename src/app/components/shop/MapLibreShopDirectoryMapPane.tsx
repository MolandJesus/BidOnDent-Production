import "maplibre-gl/dist/maplibre-gl.css";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Map, Popup } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { Compass } from "lucide-react";

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
import ShopDirectoryMapLayers, { SHOP_LAYER } from "./ShopDirectoryMapLayers";
import {
  MapPaneHeaderBadges,
  MapPaneBottomOverlay,
  MapPaneSearchPills,
} from "./ShopDirectoryMapPaneOverlays";

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

  /* Keep popup aligned with selected shop, regardless of map/list origin */
  useEffect(() => {
    if (selectedShopId == null) {
      setShopPopup(null);
      return;
    }

    const selected = shops.find((shop) => shop.id === selectedShopId);
    if (!selected) {
      setShopPopup(null);
      return;
    }

    setShopPopup((current) => {
      if (current?.shop.id === selected.id) {
        return current;
      }

      return {
        lng: selected.mapResult.coordinates.longitude,
        lat: selected.mapResult.coordinates.latitude,
        shop: selected,
      };
    });
  }, [selectedShopId, shops]);

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
  const popupSub = isDark ? "text-slate-200" : "text-slate-500";
  const popupScoreCard = isDark
    ? "border-white/22 bg-slate-900/72 text-slate-200"
    : "border-slate-200 bg-slate-50 text-slate-500";
  const popupScoreValue = isDark ? "text-white" : "text-slate-800";
  const popupCarrierCard = isDark
    ? "border-emerald-300/35 bg-emerald-900/42 text-emerald-200"
    : "border-emerald-200 bg-emerald-50 text-emerald-600";
  const popupCarrierValue = isDark ? "text-emerald-200" : "text-emerald-800";
  const popupCta = isDark
    ? "border-blue-300/55 bg-blue-600/42 text-white hover:bg-blue-600/55"
    : "border-blue-300/70 bg-blue-50 text-blue-700 hover:bg-blue-100";

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

  const handleMapMouseMove = useCallback((e: MapLayerMouseEvent) => {
    const isHoveringShop = e.features?.some((feature) => feature.layer?.id === SHOP_LAYER);
    setCursor(isHoveringShop ? "pointer" : "");
  }, []);

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
        onMouseMove={handleMapMouseMove}
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

        <ShopDirectoryMapLayers
          isDark={isDark}
          hasRoutes={routeOptions.length > 0}
          routesGeoJson={routesGeoJson}
          originGeoJson={originGeoJson}
          userCoordsGeoJson={userCoordsGeoJson}
          savedPlacesGeoJson={savedPlacesGeoJson}
          shopsGeoJson={shopsGeoJson}
        />

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
              {onOpenShopDirections && (
                <button
                  type="button"
                  onClick={() => onOpenShopDirections(shopPopup.shop)}
                  className={`inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-colors ${popupCta}`}
                >
                  <Compass className="h-3.5 w-3.5" />
                  {directionsActionLabel || "Directions"}
                </button>
              )}
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
        compact={Boolean(children && selectedRoute)}
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
