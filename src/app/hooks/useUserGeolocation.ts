import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinates } from "../types/mapDomain";

type GeolocationState = {
  /** User's current coordinates, or null if not yet resolved */
  coords: Coordinates | null;
  /** Whether a geolocation request is in progress */
  isLocating: boolean;
  /** Error message if geolocation failed */
  error: string | null;
  /** Request browser geolocation (shows permission prompt if needed) */
  requestLocation: () => void;
};

const GEO_CACHE_KEY = "bd-user-geolocation";
const GEO_CACHE_MAX_AGE = 10 * 60 * 1000; // 10 minutes

function loadCached(): Coordinates | null {
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const { coords, timestamp } = JSON.parse(raw) as {
      coords: Coordinates;
      timestamp: number;
    };
    if (Date.now() - timestamp > GEO_CACHE_MAX_AGE) return null;
    return coords;
  } catch {
    return null;
  }
}

function saveCache(coords: Coordinates) {
  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify({ coords, timestamp: Date.now() }));
  } catch {
    // sessionStorage unavailable — silently ignore
  }
}

export function useUserGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<Coordinates | null>(loadCached);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestedRef = useRef(false);

  const fetchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by this browser.");
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const result: Coordinates = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        setCoords(result);
        saveCache(result);
        setIsLocating(false);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location permission denied. You can select an origin manually."
            : "Unable to determine your location. Please try again.";
        setError(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 300_000, timeout: 10_000 }
    );
  }, []);

  // On mount, silently probe if permission is already granted
  useEffect(() => {
    if (coords || requestedRef.current) return;
    requestedRef.current = true;

    if (!navigator.permissions) return;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((result) => {
        if (result.state === "granted") {
          fetchPosition();
        }
      })
      .catch(() => {
        // Permissions API not available — do nothing
      });
  }, [coords, fetchPosition]);

  return { coords, isLocating, error, requestLocation: fetchPosition };
}
