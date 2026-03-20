import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

type MapViewportControllerProps = {
  center: [number, number];
  zoom: number;
  revision: number;
};

export default function MapViewportController({
  center,
  zoom,
  revision,
}: MapViewportControllerProps) {
  const map = useMap();
  const hasInitialized = useRef(false);

  useEffect(() => {
    if (!hasInitialized.current) {
      map.setView(center, zoom);
      hasInitialized.current = true;
      return;
    }

    map.flyTo(center, zoom, {
      animate: true,
      duration: 1.15,
      easeLinearity: 0.2,
    });
  }, [map, center, zoom, revision]);

  return null;
}
