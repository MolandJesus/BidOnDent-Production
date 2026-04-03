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

export type GpsStatus = "acquiring" | "active" | "lost" | "stale" | "denied";
export type SpeedLimitStatus = "off" | "waiting" | "loading" | "available" | "unavailable";

const GPS_STALE_THRESHOLD_MS = 10_000;

type UseNavigationGpsTrackingArgs = {
  gpsTrackingEnabled: boolean;
  speedLimitMonitorEnabled: boolean;
};

export type NavigationGpsTrackingResult = {
  currentPosition: NavigationCoordinate | null;
  currentHeadingDegrees: number | null;
  currentSpeedMph: number | null;
  gpsAccuracyMeters: number | null;
  gpsError: string;
  gpsStatus: GpsStatus;
  retryGps: () => void;
  speedLimitSnapshot: NavigationSpeedLimitSnapshot | null;
  speedLimitStatus: SpeedLimitStatus;
};

/** Calculate bearing (0-360°) from one coordinate to another. */
function calculateBearing(from: NavigationCoordinate, to: NavigationCoordinate): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLng = toRad(to.lng - from.lng);
  const lat1 = toRad(from.lat);
  const lat2 = toRad(to.lat);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((toDeg(Math.atan2(y, x)) % 360) + 360) % 360;
}

export function useNavigationGpsTracking({
  gpsTrackingEnabled,
  speedLimitMonitorEnabled,
}: UseNavigationGpsTrackingArgs): NavigationGpsTrackingResult {
  const [currentPosition, setCurrentPosition] = useState<NavigationCoordinate | null>(null);
  const [currentHeadingDegrees, setCurrentHeadingDegrees] = useState<number | null>(null);
  const [currentSpeedMph, setCurrentSpeedMph] = useState<number | null>(null);
  const [gpsAccuracyMeters, setGpsAccuracyMeters] = useState<number | null>(null);
  const [gpsError, setGpsError] = useState("");
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("acquiring");
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
  const compassHeadingRef = useRef<number | null>(null);
  const lastSpeedLimitLookupRef = useRef<{
    coordinate: NavigationCoordinate;
    fetchedAt: number;
  } | null>(null);

  const retryGps = useCallback(() => {
    setRetryCounter((c) => c + 1);
  }, []);

  // ── Device orientation fallback for heading (compass on mobile) ──
  useEffect(() => {
    if (!gpsTrackingEnabled) {
      compassHeadingRef.current = null;
      return;
    }

    function handleOrientation(e: DeviceOrientationEvent) {
      // webkitCompassHeading is Safari-specific (iOS), alpha is standard
      const heading =
        typeof (e as DeviceOrientationEvent & { webkitCompassHeading?: number })
          .webkitCompassHeading === "number"
          ? (e as DeviceOrientationEvent & { webkitCompassHeading: number }).webkitCompassHeading
          : typeof e.alpha === "number" && e.absolute
            ? (360 - e.alpha) % 360
            : null;

      if (heading !== null && Number.isFinite(heading)) {
        compassHeadingRef.current = heading;
        // Use compass heading when not moving fast enough for position-based bearing
        const speed = previousAcceptedSpeedRef.current;
        if (speed === null || speed <= 2) {
          setCurrentHeadingDegrees(heading);
        }
      }
    }

    window.addEventListener("deviceorientationabsolute", handleOrientation as EventListener);
    window.addEventListener("deviceorientation", handleOrientation);
    return () => {
      window.removeEventListener("deviceorientationabsolute", handleOrientation as EventListener);
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, [gpsTrackingEnabled]);

  useEffect(() => {
    if (!gpsTrackingEnabled) {
      setGpsError("");
      setGpsStatus("acquiring");
      setCurrentPosition(null);
      setCurrentHeadingDegrees(null);
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

        // Calculate heading: prefer device-reported heading, fallback to position delta
        const deviceHeading =
          typeof position.coords.heading === "number" && Number.isFinite(position.coords.heading)
            ? position.coords.heading
            : null;
        const prev = previousPositionRef.current;

        if (deviceHeading !== null && nextSpeed !== null && nextSpeed > 2) {
          // Device GPS reports heading directly (most accurate when moving)
          setCurrentHeadingDegrees(deviceHeading);
        } else if (prev && nextSpeed !== null && nextSpeed > 2) {
          const dist = haversineMiles(prev, nextPosition);
          if (dist > 0.003) {
            setCurrentHeadingDegrees(calculateBearing(prev, nextPosition));
          }
        }
        // When speed <= 2 mph, device orientation effect handles heading via compass

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
        setCurrentHeadingDegrees(null);
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
        setCurrentHeadingDegrees(null);
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
    currentHeadingDegrees,
    currentSpeedMph,
    gpsAccuracyMeters,
    gpsError,
    gpsStatus,
    retryGps,
    speedLimitSnapshot,
    speedLimitStatus,
  };
}
