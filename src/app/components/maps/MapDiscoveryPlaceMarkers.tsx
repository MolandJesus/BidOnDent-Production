import { CircleMarker, Popup, Tooltip } from "react-leaflet";
import type { NavigationDiscoveryPlace } from "../../services/navigation/placeDiscovery";
import type { MapSurfaceTone } from "./serviceCoverageMapTypes";

type MapDiscoveryPlaceMarkersProps = {
  tone: MapSurfaceTone;
  places: NavigationDiscoveryPlace[];
  selectedPlaceId?: string;
  onSelectPlace?: (place: NavigationDiscoveryPlace) => void;
};

function markerColors(place: NavigationDiscoveryPlace, tone: MapSurfaceTone) {
  if (place.category === "insurance") {
    return tone === "light"
      ? { stroke: "#f59e0b", fill: "#fbbf24" }
      : { stroke: "#fde68a", fill: "#facc15" };
  }

  if (place.category === "supplier") {
    return tone === "light"
      ? { stroke: "#7c3aed", fill: "#8b5cf6" }
      : { stroke: "#ddd6fe", fill: "#a78bfa" };
  }

  if (place.category === "fuel") {
    return tone === "light"
      ? { stroke: "#0f766e", fill: "#14b8a6" }
      : { stroke: "#99f6e4", fill: "#2dd4bf" };
  }

  if (place.category === "rental") {
    return tone === "light"
      ? { stroke: "#2563eb", fill: "#60a5fa" }
      : { stroke: "#bfdbfe", fill: "#60a5fa" };
  }

  return tone === "light"
    ? { stroke: "#475569", fill: "#94a3b8" }
    : { stroke: "#e2e8f0", fill: "#cbd5e1" };
}

export default function MapDiscoveryPlaceMarkers({
  tone,
  places,
  selectedPlaceId,
  onSelectPlace,
}: MapDiscoveryPlaceMarkersProps) {
  return (
    <>
      {places.map((place) => {
        const colors = markerColors(place, tone);
        const isSelected = selectedPlaceId === place.id;

        return (
          <CircleMarker
            key={place.id}
            center={[place.coordinate.lat, place.coordinate.lng]}
            radius={isSelected ? 8.5 : 5.5}
            eventHandlers={
              onSelectPlace
                ? {
                    click: () => onSelectPlace(place),
                  }
                : undefined
            }
            pathOptions={{
              color: isSelected ? "#f8fafc" : colors.stroke,
              fillColor: colors.fill,
              fillOpacity: isSelected ? 1 : 0.88,
              weight: isSelected ? 4 : 2,
            }}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-semibold">{place.label}</div>
                <div>{place.subtitle}</div>
                <div>{place.distanceMiles.toFixed(1)} miles away</div>
                {place.website ? (
                  <div>
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-600 underline"
                    >
                      Website
                    </a>
                  </div>
                ) : null}
              </div>
            </Popup>
            <Tooltip direction="top" offset={[0, -10]}>
              {place.label}
            </Tooltip>
          </CircleMarker>
        );
      })}
    </>
  );
}
