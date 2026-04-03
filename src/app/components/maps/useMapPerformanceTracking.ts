import { useCallback, useEffect, useRef, useState } from "react";
import {
  clearMapInteractionSamples,
  getMapPerformanceSummary,
  recordMapInteractionSample,
  type MapPerformanceSummary,
} from "../../services/navigation/mapPerformance";

export interface MapPerformanceTracking {
  performanceSummary: MapPerformanceSummary;
  onZoomStart: () => void;
  onZoomEnd: () => void;
  onMoveStart: () => void;
  onMoveEnd: () => void;
  handleZoom: (e: { viewState: { zoom: number } }) => void;
  liveZoom: number;
  resetPerformance: () => void;
}

export function useMapPerformanceTracking(
  initialZoom: number,
  revision: number
): MapPerformanceTracking {
  const [liveZoom, setLiveZoom] = useState(initialZoom);
  const [performanceSummary, setPerformanceSummary] = useState<MapPerformanceSummary>(() =>
    getMapPerformanceSummary()
  );

  const zoomStartRef = useRef<number | null>(null);
  const moveStartRef = useRef<number | null>(null);
  const isZoomingRef = useRef(false);

  useEffect(() => {
    setLiveZoom(initialZoom);
  }, [initialZoom, revision]);

  const onZoomStart = useCallback(() => {
    isZoomingRef.current = true;
    zoomStartRef.current = performance.now();
  }, []);

  const onZoomEnd = useCallback(() => {
    if (zoomStartRef.current !== null) {
      recordMapInteractionSample("zoom", performance.now() - zoomStartRef.current);
      setPerformanceSummary(getMapPerformanceSummary());
    }
    zoomStartRef.current = null;
    isZoomingRef.current = false;
  }, []);

  const onMoveStart = useCallback(() => {
    moveStartRef.current = performance.now();
  }, []);

  const onMoveEnd = useCallback(() => {
    if (isZoomingRef.current) {
      moveStartRef.current = null;
      return;
    }
    if (moveStartRef.current !== null) {
      recordMapInteractionSample("pan", performance.now() - moveStartRef.current);
      setPerformanceSummary(getMapPerformanceSummary());
    }
    moveStartRef.current = null;
  }, []);

  const handleZoom = useCallback((e: { viewState: { zoom: number } }) => {
    setLiveZoom(e.viewState.zoom);
  }, []);

  const resetPerformance = useCallback(() => {
    clearMapInteractionSamples();
    setPerformanceSummary(getMapPerformanceSummary());
  }, []);

  return {
    performanceSummary,
    onZoomStart,
    onZoomEnd,
    onMoveStart,
    onMoveEnd,
    handleZoom,
    liveZoom,
    resetPerformance,
  };
}
