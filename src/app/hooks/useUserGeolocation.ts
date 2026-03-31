import { useCallback, useEffect, useRef, useState } from "react";
import type { Coordinates } from "../types/mapDomain";

type GeolocationState = {
  /** User's current coordinates, or null if not yet resolved */
  coords: Coordinates | null;
  /** Whether a geolocation request is in progress */
  isLocating: boolean;
  /** Error message if geolocation failed */
  error: string | null;
  /** Current browser geolocation permission state when detectable */
  permissionState: PermissionState | "unknown" | "unsupported";
  /** Request browser geolocation (shows permission prompt if needed) */
  requestLocation: () => void;
};

const GEO_CACHE_KEY = "bd-user-geolocation";
const GEO_CACHE_MAX_AGE = 10 * 60 * 1000; // 10 minutes

function clearCache() {
  try {
    sessionStorage.removeItem(GEO_CACHE_KEY);
  } catch {
    // sessionStorage unavailable — silently ignore
  }
}

function isValidCachedCoordinates(value: unknown): value is Coordinates {
  if (typeof value !== "object" || value === null) return false;
  const coords = value as Record<string, unknown>;
  return (
    typeof coords.latitude === "number" &&
    Number.isFinite(coords.latitude) &&
    Math.abs(coords.latitude) <= 90 &&
    typeof coords.longitude === "number" &&
    Number.isFinite(coords.longitude) &&
    Math.abs(coords.longitude) <= 180
  );
}

function loadCached(): Coordinates | null {
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const { coords, timestamp } = JSON.parse(raw) as {
      coords: Coordinates;
      timestamp: number;
    };
    if (
      !isValidCachedCoordinates(coords) ||
      typeof timestamp !== "number" ||
      !Number.isFinite(timestamp) ||
      Date.now() - timestamp > GEO_CACHE_MAX_AGE
    ) {
      clearCache();
      return null;
    }
    return coords;
  } catch {
    clearCache();
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

async function readPermissionState(): Promise<PermissionState | "unknown" | "unsupported"> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return "unsupported";
  }

  if (!navigator.permissions) {
    return "unknown";
  }

  try {
    const status = await navigator.permissions.query({ name: "geolocation" });
    return status.state;
  } catch {
    return "unknown";
  }
}

export function useUserGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<Coordinates | null>(loadCached);
  const [isLocating, setIsLocating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionState, setPermissionState] = useState<
    PermissionState | "unknown" | "unsupported"
  >(coords ? "granted" : "unknown");
  const requestedRef = useRef(false);

  const fetchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
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
        setPermissionState("granted");
        saveCache(result);
        setIsLocating(false);
      },
      (err) => {
        const message =
          err.code === err.PERMISSION_DENIED
            ? "Location access is blocked. Enable it in your browser settings, then tap Ask Again."
            : "Unable to determine your location. Tap Ask Again to retry.";
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionState("denied");
        }
        setError(message);
        setIsLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 300_000, timeout: 10_000 }
    );
  }, []);

  // Track permission state and react to browser-level changes.
  useEffect(() => {
    if (!navigator.geolocation) {
      setPermissionState("unsupported");
      return;
    }

    if (!navigator.permissions) {
      return;
    }

    let active = true;
    let statusRef: PermissionStatus | null = null;

    navigator.permissions
      .query({ name: "geolocation" })
      .then((status) => {
        if (!active) {
          return;
        }

        statusRef = status;
        setPermissionState(status.state);
        status.onchange = () => {
          setPermissionState(status.state);
          if (status.state === "granted") {
            fetchPosition();
          }
        };
      })
      .catch(() => {
        if (active) {
          setPermissionState("unknown");
        }
      });

    return () => {
      active = false;
      if (statusRef) {
        statusRef.onchange = null;
      }
    };
  }, [fetchPosition]);

  // On mount, silently probe if permission is already granted.
  useEffect(() => {
    if (coords || requestedRef.current) return;
    requestedRef.current = true;

    readPermissionState()
      .then((state) => {
        setPermissionState(state);
        if (state === "granted") {
          fetchPosition();
        }
      })
      .catch(() => {
        // Permissions API not available — do nothing
      });
  }, [coords, fetchPosition]);

  // If the user changes browser permission settings while the tab is unfocused,
  // refresh state on return and resume the request flow when permission becomes granted.
  useEffect(() => {
    const syncOnFocus = () => {
      void readPermissionState().then((state) => {
        setPermissionState(state);
        if (state === "granted" && !coords) {
          fetchPosition();
        }
      });
    };

    window.addEventListener("focus", syncOnFocus);
    document.addEventListener("visibilitychange", syncOnFocus);

    return () => {
      window.removeEventListener("focus", syncOnFocus);
      document.removeEventListener("visibilitychange", syncOnFocus);
    };
  }, [coords, fetchPosition]);

  return { coords, isLocating, error, permissionState, requestLocation: fetchPosition };
}
