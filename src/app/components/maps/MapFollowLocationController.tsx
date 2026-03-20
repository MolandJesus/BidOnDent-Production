import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";

type MapFollowLocationControllerProps = {
  enabled: boolean;
  currentPosition: [number, number] | null | undefined;
  minimumZoom?: number;
  revision?: number;
};

export default function MapFollowLocationController({
  enabled,
  currentPosition,
  minimumZoom = 15.5,
  revision = 0,
}: MapFollowLocationControllerProps) {
  const map = useMap();
  const lastPositionRef = useRef<[number, number] | null>(null);
  const lastRevisionRef = useRef(revision);

  useEffect(() => {
    if (!enabled || !currentPosition) {
      return;
    }

    const lastPosition = lastPositionRef.current;
    const shouldForceFollow = revision !== lastRevisionRef.current;

    if (!shouldForceFollow && lastPosition && map.distance(lastPosition, currentPosition) < 18) {
      return;
    }

    map.flyTo(currentPosition, Math.max(map.getZoom(), minimumZoom), {
      animate: true,
      duration: 0.85,
      easeLinearity: 0.25,
    });

    lastPositionRef.current = currentPosition;
    lastRevisionRef.current = revision;
  }, [enabled, currentPosition, map, minimumZoom, revision]);

  return null;
}
