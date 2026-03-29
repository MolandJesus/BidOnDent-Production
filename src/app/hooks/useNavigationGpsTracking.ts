/**
 * useNavigationGpsTracking — GPS position tracking and speed limit monitoring.
 *
 * Extracted from useCoverageNavigationExperience.ts (Pass 30). Zero behavior change.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import type { NavigationCoordinate, NavigationSpeedLimitSnapshot } from "../types/navigation";
import { haversineMiles } from "../services/supabase/map";
import {
  calculateFallbackSpeedMph,
  resolveReliableCurrentSpeedMph,
} from "../services/navigation/navigationGuidanceHelpers";
import { fetchNearestSpeedLimit } from "../services/navigation/speedLimit";
import { createTimeoutAbortController } from "../services/navigation/requestTimeout";

export type GpsStatus = "active" | "lost" | "stale" | "denied";
export type SpeedLimitStatus = "off" | "waiting" | "loading" | "available" | "unavailable";

const GPS_STALE_THRESHOLD_MS = 10_000;

type UseNavigationGpsTrackingArgs = {
  gpsTrackingEnabled: boolean;
  speedLimitMonitorEnabled: boolean;
};

export type NavigationGpsTrackingResult = {
  currentPosition: NavigationCoordinate | null;
  currentSpeedMph: number | null;
  gpsAccuracyMeters: number | null;
  gpsError: string;
  gpsStatus: GpsStatus;
  retryGps: () => void;
  speedLimitSnapshot: NavigationSpeedLimitSnapshot | null;
  speedLimitStatus: SpeedLimitStatus;
};

export function useNavigationGpsTracking({
  gpsTrackingEnabled,
  speedLimitMonitorEnabled,
}: UseNavigationGpsTrackingArgs): NavigationGpsTrackingResult {
  const [currentPosition, setCurrentPosition] = useState<NavigationCoordinate | null>(null);
  const [currentSpeedMph, setCurrentSpeedMph] = useState<number | null>(null);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("active");
  const [retryCounter, setRetryCounter] = useState(0);
  const [speedLimitSnapshot, setSpeedLimitSnapshot] = useState<NavigationSpeedLimitSnapshot | null>(
    null
  );
  const [speedLimitStatus, setSpeedLimitStatus] = useState<SpeedLimitStatus>("off");

  const previousPositionRef = useRef<NavigationCoordinate | null>(null);
  const previousPositionTimestampRef = useRef<number | null>(null);
  const previousAcceptedSpeedRef = useRef<number | null>(null);
  const lastGpsUpdateRef = useRef<number>(Date.now());
  const staleAutoRetryFiredRef = useRef(false);
  const lastSpeedLimitLookupRef = useRef<{
    coordinate: NavigationCoordinate;
    fetchedAt: number;
  } | null>(null);

  const retryGps = useCallback(() => {
    setRetryCounter((c) => c + 1);
  }, []);

  useEffect(() => {
    if (!gpsTrackingEnabled) {
      setGpsError("");
      setGpsStatus("active");
      setCurrentPosition(null);
      setCurrentSpeedMph(null);
      setGpsAccuracyMeters(null);
      setSpeedLimitSnapshot(null);
      previousPositionRef.current = null;
      previousPositionTimestampRef.current = null;
      previousAcceptedSpeedRef.current = null;
      return;
    }

    if (!navigator.geolocation) {
      setGpsError("This browser does not expose on-device GPS.");
      setGpsStatus("lost");
      return;
    }

    lastGpsUpdateRef.current = Date.now();

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const nextPosition = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        const nextTimestamp = position.timestamp;
        const nextAccuracyMeters =
          typeof position.coords.accuracy === "number" && Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null;
        const speedFromDevice =
          typeof position.coords.speed === "number" && Number.isFinite(position.coords.speed)
            ? position.coords.speed * 2.23694
            : null;
        const elapsedMs =
          previousPositionTimestampRef.current !== null
            ? nextTimestamp - previousPositionTimestampRef.current
            : null;
        const fallbackSpeed = calculateFallbackSpeedMph(
          previousPositionRef.current,
          previousPositionTimestampRef.current,
          nextPosition,
          nextTimestamp
        );
        const nextSpeed = resolveReliableCurrentSpeedMph({
          speedFromDeviceMph: speedFromDevice,
          fallbackSpeedMph: fallbackSpeed,
          previousSpeedMph: previousAcceptedSpeedRef.current,
          elapsedMs,
          gpsAccuracyMeters: nextAccuracyMeters,
        });

        previousPositionRef.current = nextPosition;
        previousPositionTimestampRef.current = nextTimestamp;
        previousAcceptedSpeedRef.current = nextSpeed;
        lastGpsUpdateRef.current = Date.now();
        staleAutoRetryFiredRef.current = false;
        setCurrentPosition(nextPosition);
        setCurrentSpeedMph(nextSpeed);
        setGpsAccuracyMeters(nextAccuracyMeters);
        setGpsError("");
        setGpsStatus("active");
      },
      (error) => {
        previousAcceptedSpeedRef.current = null;
        setCurrentSpeedMph(null);
        setGpsAccuracyMeters(null);
        if (error.code === 1) {
          setGpsError("Location permission denied. Please allow location access and retry.");
          setGpsStatus("denied");
        } else if (error.code === 3) {
          setGpsError("GPS timed out — signal may be weak.");
          setGpsStatus("stale");
        } else {
          setGpsError(error.message || "Unable to access device location.");
          setGpsStatus("lost");
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    const stalenessInterval = setInterval(() => {
      if (Date.now() - lastGpsUpdateRef.current > GPS_STALE_THRESHOLD_MS) {
        previousAcceptedSpeedRef.current = null;
        setCurrentSpeedMph(null);
        setGpsAccuracyMeters(null);
        setGpsStatus("stale");
        // Auto-retry the watch once per stale episode to recover from transient signal drops
        if (!staleAutoRetryFiredRef.current) {
          staleAutoRetryFiredRef.current = true;
          setRetryCounter((c) => c + 1);
        }
      }
    }, 3_000);

    return () => {
      navigator.geolocation.clearWatch(watchId);
      clearInterval(stalenessInterval);
    };
  }, [gpsTrackingEnabled, retryCounter]);

  useEffect(() => {
    if (!gpsTrackingEnabled || !speedLimitMonitorEnabled) {
      setSpeedLimitSnapshot(null);
      setSpeedLimitStatus("off");
      return;
    }

    if (!currentPosition) {
      setSpeedLimitStatus("waiting");
      return;
    }

    const lastLookup = lastSpeedLimitLookupRef.current;

    if (
      lastLookup &&
      Date.now() - lastLookup.fetchedAt < 30000 &&
      haversineMiles(currentPosition, lastLookup.coordinate) < 0.12
    ) {
      return;
    }

    setSpeedLimitStatus("loading");
    const speedRequest = createTimeoutAbortController(10000);

    fetchNearestSpeedLimit(currentPosition, speedRequest.controller.signal)
      .then((snapshot) => {
        if (!speedRequest.controller.signal.aborted) {
          setSpeedLimitSnapshot(snapshot);
          setSpeedLimitStatus(snapshot ? "available" : "unavailable");
          lastSpeedLimitLookupRef.current = {
            coordinate: currentPosition,
            fetchedAt: Date.now(),
          };
        }
      })
      .catch((error) => {
        if (!speedRequest.controller.signal.aborted && !speedRequest.didTimeout()) {
          if (import.meta.env.DEV) console.error("Speed limit lookup failed:", error);
          setSpeedLimitSnapshot(null);
          setSpeedLimitStatus("unavailable");
        }
      });

    return () => {
      speedRequest.clear();
      speedRequest.controller.abort();
    };
  }, [currentPosition, gpsTrackingEnabled, speedLimitMonitorEnabled]);

  return {
    currentPosition,
    currentSpeedMph,
    gpsAccuracyMeters,
    gpsError,
    gpsStatus,
    retryGps,
    speedLimitSnapshot,
    speedLimitStatus,
  };
}
