import { useCallback, useEffect, useMemo, useState } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import type { NavigationDiscoveryPlace } from "../../services/navigation/placeDiscovery";
import type { MapSurfaceTone } from "./serviceCoverageMapTypes";

type MapLibreDiscoveryPlaceLayerProps = {
  tone: MapSurfaceTone;
  places: NavigationDiscoveryPlace[];
  selectedPlaceId?: string;
  onSelectPlace?: (place: NavigationDiscoveryPlace) => void;
};

function colorForCategory(
  category: string,
  tone: MapSurfaceTone
): { stroke: string; fill: string } {
  if (category === "insurance") {
    return tone === "light"
      ? { stroke: "#f59e0b", fill: "#fbbf24" }
      : { stroke: "#fde68a", fill: "#facc15" };
  }
  if (category === "supplier") {
    return tone === "light"
      ? { stroke: "#7c3aed", fill: "#8b5cf6" }
      : { stroke: "#ddd6fe", fill: "#a78bfa" };
  }
  if (category === "fuel") {
    return tone === "light"
      ? { stroke: "#0f766e", fill: "#14b8a6" }
      : { stroke: "#99f6e4", fill: "#2dd4bf" };
  }
  if (category === "rental") {
    return tone === "light"
      ? { stroke: "#2563eb", fill: "#60a5fa" }
      : { stroke: "#bfdbfe", fill: "#60a5fa" };
  }
  return tone === "light"
    ? { stroke: "#475569", fill: "#94a3b8" }
    : { stroke: "#e2e8f0", fill: "#cbd5e1" };
}

const LAYER_ID = "discovery-places-circle";

export default function MapLibreDiscoveryPlaceLayer({
  tone,
  places,
  selectedPlaceId,
  onSelectPlace,
}: MapLibreDiscoveryPlaceLayerProps) {
  const [popupPlace, setPopupPlace] = useState<NavigationDiscoveryPlace | null>(null);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: places.map((place) => {
        const colors = colorForCategory(place.category, tone);
        const isSelected = selectedPlaceId === place.id;
        return {
          type: "Feature" as const,
          geometry: {
            type: "Point" as const,
            coordinates: [place.coordinate.lng, place.coordinate.lat],
          },
          properties: {
            id: place.id,
            label: place.label,
            subtitle: place.subtitle,
            distanceMiles: place.distanceMiles.toFixed(1),
            qualityLabel: place.qualityLabel,
            fill: colors.fill,
            stroke: isSelected ? "#f8fafc" : colors.stroke,
            radius: isSelected ? 8.5 : 5.5,
            opacity: isSelected ? 1 : 0.88,
            strokeWidth: isSelected ? 4 : 2,
          },
        };
      }),
    }),
    [places, selectedPlaceId, tone]
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const features = e.features;
      if (!features?.length) return;
      const placeId = features[0].properties?.id as string;
      const place = places.find((p) => p.id === placeId);
      if (place) {
        setPopupPlace(place);
        onSelectPlace?.(place);
      }
    },
    [places, onSelectPlace]
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

  if (places.length === 0) return null;

  return (
    <>
      <Source id="discovery-places" type="geojson" data={geojson}>
        <Layer
          id={LAYER_ID}
          type="circle"
          paint={{
            "circle-radius": ["get", "radius"],
            "circle-color": ["get", "fill"],
            "circle-opacity": ["get", "opacity"],
            "circle-stroke-color": ["get", "stroke"],
            "circle-stroke-width": ["get", "strokeWidth"],
          }}
        />
      </Source>
      {popupPlace ? (
        <Popup
          longitude={popupPlace.coordinate.lng}
          latitude={popupPlace.coordinate.lat}
          closeOnClick={false}
          onClose={() => setPopupPlace(null)}
          anchor="bottom"
          offset={12}
        >
          <div className="text-sm animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
            <div className="font-semibold">{popupPlace.label}</div>
            <div>{popupPlace.subtitle}</div>
            <div>{popupPlace.distanceMiles.toFixed(1)} miles away</div>
            <div>Quality: {popupPlace.qualityLabel}</div>
          </div>
        </Popup>
      ) : null}
    </>
  );
}

export { LAYER_ID as DISCOVERY_PLACES_LAYER_ID };
