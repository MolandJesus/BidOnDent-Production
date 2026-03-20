import { useEffect } from "react";
import { useMap } from "react-leaflet";

type MapRouteFitControllerProps = {
  routeGeometry: [number, number][];
  routeFitKey?: string | null;
};

export default function MapRouteFitController({
  routeGeometry,
  routeFitKey,
}: MapRouteFitControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (!routeFitKey || routeGeometry.length < 2) {
      return;
    }

    map.fitBounds(routeGeometry, {
      padding: [72, 72],
      maxZoom: 14,
    });
  }, [map, routeFitKey, routeGeometry]);

  return null;
}
