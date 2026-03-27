import { Circle, CircleMarker, Popup } from "react-leaflet";
import type { CoverageSearchTarget } from "./serviceCoverageMapTypes";

type MapSearchTargetMarkersProps = {
  activeSearchTarget: CoverageSearchTarget;
  radiusMeters: number;
  radiusMiles: string;
};

export default function MapSearchTargetMarkers({
  activeSearchTarget,
  radiusMeters,
  radiusMiles,
}: MapSearchTargetMarkersProps) {
  return (
    <>
      <Circle
        center={[activeSearchTarget.lat, activeSearchTarget.lng]}
        radius={radiusMeters}
        pathOptions={{
          color: "#22d3ee",
          fillColor: "#22d3ee",
          fillOpacity: 0.12,
          weight: 2,
        }}
      />
      <CircleMarker
        center={[activeSearchTarget.lat, activeSearchTarget.lng]}
        radius={11}
        pathOptions={{
          color: "#67e8f9",
          fillColor: "#06b6d4",
          fillOpacity: 0.75,
          weight: 2.5,
        }}
      >
        <Popup>
          <div className="text-sm">
            <div className="font-semibold">{activeSearchTarget.label}</div>
            <div>{activeSearchTarget.county || "Service area"}</div>
            <div>Search radius: {radiusMiles} miles</div>
          </div>
        </Popup>
      </CircleMarker>
      <CircleMarker
        center={[activeSearchTarget.lat, activeSearchTarget.lng]}
        radius={5}
        pathOptions={{
          color: "#f8fafc",
          fillColor: "#f8fafc",
          fillOpacity: 1,
          weight: 1,
        }}
      />
    </>
  );
}
