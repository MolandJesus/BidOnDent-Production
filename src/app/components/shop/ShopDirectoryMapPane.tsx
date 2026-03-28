import "leaflet/dist/leaflet.css";

import { useState } from "react";
import { MapPin, Search, Shield, Sparkles, X } from "lucide-react";
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
import MapReportMarkers from "../maps/MapReportMarkers";
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
  /** Whether the search-in-area filter is currently active */
  searchWithinViewport?: boolean;
  /** Called when the user taps "Search in this area" after panning */
  onSearchInArea?: () => void;
  /** Called when the user clears the area search */
  onClearAreaSearch?: () => void;
  /** User's real-time geolocation coordinates (blue dot on map) */
  userCoords?: Coordinates | null;
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
  searchWithinViewport,
  onSearchInArea,
  onClearAreaSearch,
  userCoords,
}: ShopDirectoryMapPaneProps) {
  const [hasPanned, setHasPanned] = useState(false);
  const selectedShop = shops.find((shop) => shop.id === selectedShopId) || shops[0] || null;
  const selectedRoute =
    routeOptions.find((route) => route.id === selectedRouteId) || routeOptions[0] || null;
  const tileLayer = mapTheme === "dark" ? DARK_TILE_LAYER : LIGHT_TILE_LAYER;
  const isDark = mapTheme === "dark";
  const fitSignature = [
    selectedOrigin?.placeId || selectedOrigin?.name || "no-origin",
    shops.map((shop) => shop.id).join(","),
  ].join(":");

  // Theme-aware token helpers
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
  const shopCard = isDark
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
  const popupBody = isDark ? "text-slate-400" : "text-slate-600";
  const popupScoreCard = isDark
    ? "border-white/12 bg-slate-800/60 text-slate-300"
    : "border-slate-200 bg-slate-50 text-slate-500";
  const popupScoreValue = isDark ? "text-white" : "text-slate-800";
  const popupCarrierCard = isDark
    ? "border-emerald-400/20 bg-emerald-900/30 text-emerald-300"
    : "border-emerald-200 bg-emerald-50 text-emerald-600";
  const popupCarrierValue = isDark ? "text-emerald-200" : "text-emerald-800";

  return (
    <div
      data-map-theme={mapTheme}
      className="shop-directory-map relative h-full min-h-[420px] w-full overflow-hidden"
    >
      {!suppressHeader && (
        <div
          className={`pointer-events-none absolute inset-x-0 top-0 z-[500] ${topGradient} px-5 py-5`}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className={`rounded-2xl border px-4 py-3 ${badgeCard}`}>
              <div
                className={`flex items-center gap-2 text-xs uppercase tracking-[0.22em] ${badgeLabel}`}
              >
                <Sparkles className="h-4 w-4" />
                {getRoleLabel(userType)}
              </div>
              <p className={`mt-1 text-sm font-medium ${badgeValue}`}>
                {selectedOrigin
                  ? `Centered on ${selectedOrigin.name}`
                  : "Exploring the service area"}
              </p>
            </div>

            <div className={`rounded-2xl border px-4 py-3 text-sm ${badgeCard}`}>
              <p className={badgeLabel}>Visible shops</p>
              <p className={`text-xl font-semibold ${badgeValue}`}>{shops.length}</p>
            </div>
          </div>
        </div>
      )}

      <MapContainer
        center={[initialCenter?.latitude || 41.0534, initialCenter?.longitude || -73.8654]}
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
          onViewportChange={(center, zoom, bounds) => {
            setHasPanned(true);
            onViewportChange(center, zoom, bounds);
          }}
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
                <p className={`font-semibold ${popupTitle}`}>{selectedOrigin.name}</p>
                <p className={`text-sm ${popupSub}`}>{selectedOrigin.address}</p>
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -8]} opacity={0.95} permanent={false}>
              Starting point
            </Tooltip>
          </CircleMarker>
        )}

        {/* User geolocation blue dot */}
        {userCoords && (
          <CircleMarker
            center={[userCoords.latitude, userCoords.longitude]}
            fillColor={isDark ? "#60a5fa" : "#2563eb"}
            fillOpacity={0.95}
            pathOptions={{ color: "#fff", weight: 3 }}
            radius={8}
            stroke
          >
            <CircleMarker
              center={[userCoords.latitude, userCoords.longitude]}
              fillColor={isDark ? "#60a5fa" : "#3b82f6"}
              fillOpacity={0.2}
              pathOptions={{ color: isDark ? "#60a5fa" : "#3b82f6", weight: 1.5 }}
              radius={22}
              stroke
            />
            <Tooltip direction="top" offset={[0, -12]} opacity={0.95} permanent={false}>
              Your location
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
                <p className={`font-semibold ${popupTitle}`}>{place.label}</p>
                <p className={`text-sm ${popupSub}`}>{place.address}</p>
              </div>
            </Popup>
          </CircleMarker>
        ))}

        <MapReportMarkers mapTheme={mapTheme} />

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
                  <p className={`font-semibold ${popupTitle}`}>{route.label} route</p>
                  <p className={`text-sm ${popupBody}`}>
                    {route.totalDistanceLabel} • {route.estimatedDurationMinutes} min
                  </p>
                  <p className={`text-sm ${popupSub}`}>{route.trafficLabel}</p>
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
                    <p className={`font-semibold ${popupTitle}`}>{shop.name}</p>
                    <p className={`text-sm ${popupSub}`}>
                      {shop.mapResult.address}, {shop.mapResult.city}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className={`rounded-xl border px-3 py-2 ${popupScoreCard}`}>
                      <p>AI fit</p>
                      <p className={`font-semibold ${popupScoreValue}`}>
                        {shop.recommendationScore}%
                      </p>
                    </div>
                    <div className={`rounded-xl border px-3 py-2 ${popupCarrierCard}`}>
                      <p>Carrier fit</p>
                      <p className={`font-semibold ${popupCarrierValue}`}>
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

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-[500] ${bottomGradient} px-5 pb-5 pt-16`}
      >
        <div className="flex flex-wrap items-end justify-between gap-3">
          {selectedShop && (
            <div className={`max-w-md rounded-[24px] border p-4 ${shopCard}`}>
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
            </div>
          )}

          <div
            className={`hidden rounded-2xl border px-4 py-3 text-xs shadow-xl sm:block ${legendCard}`}
          >
            <p className={`font-semibold ${isDark ? "text-white" : "text-slate-700"}`}>
              Map legend
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-orange-500" />
                Origin
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-blue-600" />
                Selected
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-900" />
                Top match
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span
                  className="inline-block h-3 w-5 rounded border border-current opacity-50"
                  style={{ borderStyle: "dashed" }}
                />
                Routes
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Search in this area pill — appears after first pan, hides in area-search mode */}
      {onSearchInArea && hasPanned && !searchWithinViewport && (
        <div className="pointer-events-auto absolute inset-x-0 top-4 z-[600] flex justify-center">
          <button
            type="button"
            onClick={onSearchInArea}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-xl backdrop-blur-md transition-colors ${
              isDark
                ? "border-white/20 bg-slate-950/80 text-white hover:bg-slate-950/95"
                : "border-black/10 bg-white/90 text-slate-800 hover:bg-white"
            }`}
          >
            <Search className="h-3.5 w-3.5" />
            Search in this area
          </button>
        </div>
      )}

      {/* Clear area search pill — visible while area search is active */}
      {onClearAreaSearch && searchWithinViewport && (
        <div className="pointer-events-auto absolute inset-x-0 top-4 z-[600] flex justify-center">
          <button
            type="button"
            onClick={() => {
              onClearAreaSearch();
              setHasPanned(false);
            }}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-xl backdrop-blur-md transition-colors ${
              isDark
                ? "border-blue-400/40 bg-blue-600/30 text-white hover:bg-blue-600/45"
                : "border-blue-400/40 bg-blue-100 text-blue-700 hover:bg-blue-200"
            }`}
          >
            <X className="h-3.5 w-3.5" />
            Searching this area
          </button>
        </div>
      )}

      {/* Floating overlay children (route preview, intelligence, deviation prompt) */}
      {children}
    </div>
  );
}
