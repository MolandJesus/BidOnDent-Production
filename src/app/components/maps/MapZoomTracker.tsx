import { useEffect } from "react";
import { useMapEvents } from "react-leaflet";

type MapZoomTrackerProps = {
  onZoomChange: (zoom: number) => void;
};

export default function MapZoomTracker({ onZoomChange }: MapZoomTrackerProps) {
  const map = useMapEvents({
    zoomend() {
      onZoomChange(map.getZoom());
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}
