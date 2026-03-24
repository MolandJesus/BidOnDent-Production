import "leaflet/dist/leaflet.css";

import { MapPin, Shield, Sparkles } from "lucide-react";
import { CircleMarker, MapContainer, Polyline, Popup, TileLayer, Tooltip } from "react-leaflet";
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
import MapViewportManager, {
  DARK_TILE_LAYER,
  getRoleLabel,
  LIGHT_TILE_LAYER,
} from "./ShopDirectoryMapViewportManager";

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
  /** Floating overlay children rendered above the map surface */
  children?: React.ReactNode;
  /** When true, suppress the built-in top gradient header badges (used in immersive mode) */
  suppressHeader?: boolean;
};

export default function ShopDirectoryMapPane({
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
}: ShopDirectoryMapPaneProps) {
  const selectedShop = shops.find((shop) => shop.id === selectedShopId) || shops[0] || null;
  const selectedRoute =
    routeOptions.find((route) => route.id === selectedRouteId) || routeOptions[0] || null;
  const tileLayer = mapTheme === "dark" ? DARK_TILE_LAYER : LIGHT_TILE_LAYER;
  const fitSignature = [
    selectedOrigin?.placeId || selectedOrigin?.name || "no-origin",
    shops.map((shop) => shop.id).join(","),
  ].join(":");

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden bg-slate-200">
      {!suppressHeader && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-[500] bg-gradient-to-b from-slate-950/45 via-slate-950/10 to-transparent px-5 py-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="rounded-2xl border border-white/15 bg-slate-950/65 px-4 py-3 text-white shadow-xl backdrop-blur">
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.22em] text-white/65">
                <Sparkles className="h-4 w-4" />
                {getRoleLabel(userType)}
              </div>
              <p className="mt-1 text-sm font-medium text-white/95">
                {selectedOrigin
                  ? `Centered on ${selectedOrigin.name}`
                  : "Exploring the Dallas repair market"}
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-slate-950/65 px-4 py-3 text-sm text-white shadow-xl backdrop-blur">
              <p className="text-white/65">Visible shops</p>
              <p className="text-xl font-semibold">{shops.length}</p>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={[initialCenter?.latitude || 32.7767, initialCenter?.longitude || -96.797]}
        className="h-full w-full"
        scrollWheelZoom
        zoom={initialZoom || 11}
        zoomControl={false}
      >
        <TileLayer attribution={tileLayer.attribution} url={tileLayer.url} />

        <MapViewportManager
          fitSignature={fitSignature}
          initialCenter={initialCenter}
          initialZoom={initialZoom}
          onViewportChange={onViewportChange}
          preserveViewport={preserveViewport}
          selectedOrigin={selectedOrigin}
          selectedShopId={selectedShopId}
          shops={shops}
        />

        {selectedOrigin && (
          <CircleMarker
            center={[selectedOrigin.latitude, selectedOrigin.longitude]}
            fillColor="#f97316"
            fillOpacity={0.9}
            pathOptions={{ color: "#fff7ed", weight: 3 }}
            radius={9}
            stroke
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">{selectedOrigin.name}</p>
                <p className="text-sm text-slate-600">{selectedOrigin.address}</p>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95} permanent={false}>
              Starting point
            </Tooltip>
          </CircleMarker>
        )}

        {savedPlaces.map((place) => (
          <CircleMarker
            key={place.id}
            center={[place.latitude, place.longitude]}
            fillColor="#1d4ed8"
            fillOpacity={0.3}
            pathOptions={{ color: "#1d4ed8", weight: 2 }}
            radius={7}
            stroke
          >
            <Popup>
              <div className="space-y-1">
                <p className="font-semibold text-slate-900">{place.label}</p>
                <p className="text-sm text-slate-600">{place.address}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        {routeOptions.map((route) => {
          const isSelectedRoute = route.id === selectedRoute?.id;

          return (
            <Polyline
              key={route.id}
              pathOptions={{
                color: route.accentColor,
                dashArray: isSelectedRoute ? undefined : "10 12",
                lineCap: "round",
                lineJoin: "round",
                opacity: isSelectedRoute ? 0.92 : 0.38,
                weight: isSelectedRoute ? 5 : 3,
              }}
              positions={route.polyline.map((point) => [point.latitude, point.longitude])}
            >
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{route.label} route</p>
                  <p className="text-sm text-slate-600">
                    {route.totalDistanceLabel} • {route.estimatedDurationMinutes} min
                  </p>
                  <p className="text-sm text-slate-500">{route.trafficLabel}</p>
                </div>
              </Popup>
            </Polyline>
          );
        })}

        {shops.map((shop) => {
          const isSelected = shop.id === selectedShopId;

          return (
            <CircleMarker
              key={shop.id}
              center={[shop.mapResult.coordinates.latitude, shop.mapResult.coordinates.longitude]}
              eventHandlers={{
                click: () => onSelectShop(shop.id),
              }}
              fillColor={isSelected ? "#2563eb" : shop.topPick ? "#0f172a" : "#38bdf8"}
              fillOpacity={0.9}
              pathOptions={{
                color: isSelected ? "#dbeafe" : "#eff6ff",
                weight: isSelected ? 4 : 2,
              }}
              radius={isSelected ? 12 : shop.topPick ? 10 : 8}
              stroke
            >
              <Popup>
                <div className="space-y-2">
                  <div>
                    <p className="font-semibold text-slate-900">{shop.name}</p>
                    <p className="text-sm text-slate-600">
                      {shop.mapResult.address}, {shop.mapResult.city}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-xl bg-slate-100 px-3 py-2">
                      <p className="text-slate-500">AI fit</p>
                      <p className="font-semibold text-slate-900">{shop.recommendationScore}%</p>
                    </div>
                    <div className="rounded-xl bg-emerald-50 px-3 py-2">
                      <p className="text-emerald-700">Carrier fit</p>
                      <p className="font-semibold text-emerald-900">
                        {shop.insuranceCompatibilityScore}%
                      </p>
                    </div>
                  </div>
                </div>
              </Popup>
              <Tooltip direction="top" offset={[0, -8]} opacity={0.95}>
                {shop.name}
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[500] bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent px-5 pb-5 pt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          {selectedShop && (
            <div className="max-w-md rounded-[24px] border border-white/15 bg-white/96 p-4 shadow-2xl backdrop-blur">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Selected shop</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-950">{selectedShop.name}</h3>
                </div>
                <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
                  <p className="text-[11px] uppercase tracking-[0.18em] text-white/65">AI Fit</p>
                  <p className="text-lg font-semibold">{selectedShop.recommendationScore}%</p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-slate-400" />
                  {selectedShop.mapDistanceLabel}
                </span>
                {selectedRoute && (
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles className="h-4 w-4 text-slate-400" />
                    {selectedRoute.label} • {selectedRoute.estimatedDurationMinutes} min
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-slate-400" />
                  {selectedShop.insuranceCompatibilityScore}% carrier fit
                </span>
              </div>

              <p className="mt-3 text-sm leading-6 text-slate-700">{selectedShop.aiSummary}</p>
            </div>
          )}

          <div className="hidden rounded-2xl border border-white/15 bg-slate-950/70 px-4 py-3 text-xs text-white/80 shadow-xl backdrop-blur sm:block">
            <p className="font-semibold text-white">Marker legend</p>
            <p className="mt-1">
              Orange = origin, blue = selected, dark = top match, lines = route options
            </p>
          </div>
        </div>
      </div>

      {/* Floating overlay children (route preview, intelligence, deviation prompt) */}
      {children}
    </div>
  );
}
