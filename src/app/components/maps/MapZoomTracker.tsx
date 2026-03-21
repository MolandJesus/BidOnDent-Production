import { useEffect, useRef } from "react";
import { useMapEvents } from "react-leaflet";
import { recordMapInteractionSample } from "../../services/navigation/mapPerformance";

type MapZoomTrackerProps = {
  onZoomChange: (zoom: number) => void;
  onPerformanceSample?: () => void;
};

export default function MapZoomTracker({ onZoomChange, onPerformanceSample }: MapZoomTrackerProps) {
  const zoomStartRef = useRef<number | null>(null);
  const moveStartRef = useRef<number | null>(null);
  const isZoomingRef = useRef(false);

  const map = useMapEvents({
    zoomstart() {
      isZoomingRef.current = true;
      zoomStartRef.current = performance.now();
    },
    zoomend() {
      if (zoomStartRef.current !== null) {
        recordMapInteractionSample("zoom", performance.now() - zoomStartRef.current);
        onPerformanceSample?.();
      }

      zoomStartRef.current = null;
      isZoomingRef.current = false;
      onZoomChange(map.getZoom());
    },
    movestart() {
      moveStartRef.current = performance.now();
    },
    moveend() {
      if (isZoomingRef.current) {
        moveStartRef.current = null;
        return;
      }

      if (moveStartRef.current !== null) {
        recordMapInteractionSample("pan", performance.now() - moveStartRef.current);
        onPerformanceSample?.();
      }

      moveStartRef.current = null;
    },
  });

  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);

  return null;
}
