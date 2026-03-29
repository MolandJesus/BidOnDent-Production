import Map, { Source, Layer } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { mapLibreStyles } from "../maps/mapLibreStyles";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import type { MapLayerMouseEvent, ViewState } from "react-map-gl/maplibre";

type MapLibreDashboardMapPreviewProps = {
  shops: CoveragePartnerShop[];
  center: [number, number];
  zoom: number;
  isLight: boolean;
  onShopClick?: (shop: CoveragePartnerShop) => void;
  onMapClick?: () => void;
};

export default function MapLibreDashboardMapPreview({
  shops,
  center,
  zoom,
  isLight,
  onShopClick,
  onMapClick,
}: MapLibreDashboardMapPreviewProps) {
  const mapId = useId();
  const mapStyle = isLight ? mapLibreStyles.roadmap : mapLibreStyles.night;

  /* Controlled viewport — responds when parent changes center/zoom */
  const [viewState, setViewState] = useState<Pick<ViewState, "longitude" | "latitude" | "zoom">>({
    longitude: center[1],
    latitude: center[0],
    zoom,
  });

  useEffect(() => {
    setViewState({ longitude: center[1], latitude: center[0], zoom });
  }, [center, zoom]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: shops.map((shop) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [shop.lng, shop.lat] },
        properties: { id: `${shop.id || shop.name}`, name: shop.name },
      })),
    }),
    [shops]
  );

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (e.features?.length) {
        const shopId = e.features[0].properties?.id as string;
        const shop = shops.find((s) => `${s.id || s.name}` === shopId);
        if (shop) {
          onShopClick?.(shop);
          return;
        }
      }
      onMapClick?.();
    },
    [shops, onShopClick, onMapClick]
  );

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer">
      <Map
        id={`dashboard-preview-${mapId}`}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        attributionControl={false}
        scrollZoom={false}
        dragPan={false}
        dragRotate={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        interactiveLayerIds={["dashboard-shops-circle"]}
        onClick={handleMapClick}
      >
        <Source id="dashboard-shops" type="geojson" data={geojson}>
          <Layer
            id="dashboard-shops-circle"
            type="circle"
            paint={{
              "circle-radius": 7,
              "circle-color": "#2563eb",
              "circle-stroke-color": "#3b82f6",
              "circle-stroke-width": 2,
              "circle-opacity": 0.85,
            }}
          />
        </Source>
      </Map>

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
