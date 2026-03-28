import { CircleMarker, MapContainer, TileLayer, Tooltip } from "react-leaflet";
import { ensureLeafletDefaultIcon } from "../maps/leafletSetup";
import { mapTileLayers } from "../maps/mapTileLayers";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";

ensureLeafletDefaultIcon();

type DashboardMapPreviewProps = {
  shops: CoveragePartnerShop[];
  center: [number, number];
  zoom: number;
  isLight: boolean;
  onShopClick?: (shop: CoveragePartnerShop) => void;
  onMapClick?: () => void;
};

/**
 * Lightweight embedded Leaflet mini-map for the dashboard hero.
 * Shows partner shop markers on dark CARTO tiles with minimal chrome.
 * Designed to be compact (parent controls height) and non-scrollable.
 */
export default function DashboardMapPreview({
  shops,
  center,
  zoom,
  isLight,
  onShopClick,
  onMapClick,
}: DashboardMapPreviewProps) {
  const tile = isLight ? mapTileLayers.roadmap : mapTileLayers.night;

  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer"
      onClick={(e) => {
        if ((e.target as HTMLElement).closest(".leaflet-marker-icon, .leaflet-interactive")) return;
        onMapClick?.();
      }}
    >
      <MapContainer
        center={center}
        zoom={zoom}
        zoomControl={false}
        attributionControl={false}
        dragging={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        touchZoom={false}
        keyboard={false}
        className="w-full h-full"
        style={{ background: isLight ? "#e8ecf0" : "#0a1628" }}
      >
        <TileLayer url={tile.url} attribution={tile.attribution} maxZoom={tile.maxZoom} />

        {shops.map((shop) => (
          <CircleMarker
            key={shop.id || shop.name}
            center={[shop.lat, shop.lng]}
            radius={7}
            pathOptions={{
              color: "#3b82f6",
              fillColor: "#2563eb",
              fillOpacity: 0.85,
              weight: 2,
            }}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation();
                onShopClick?.(shop);
              },
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} className="bd-map-tooltip">
              <span className="text-xs font-medium text-slate-800">{shop.name}</span>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      {/* Subtle vignette overlay to blend edges */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          boxShadow: isLight
            ? "inset 0 0 30px rgba(248, 250, 252, 0.5)"
            : "inset 0 0 40px rgba(8, 18, 38, 0.6)",
        }}
      />
    </div>
  );
}
