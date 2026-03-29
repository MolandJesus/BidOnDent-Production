import type { NavigationCoordinate, NavigationParkedCarLocation } from "../../types/navigation";
import { clearPersistedState, readPersistedState, writePersistedState } from "./persistedState";

export const NAVIGATION_PARKED_CAR_STORAGE_KEY = "bidondent_navigation_parked_car";
const navigationParkedCarStorageVersion = 2;

/** Auto-expire parked car location after 24 hours to limit GPS data persistence. */
const PARKED_CAR_TTL_MS = 24 * 60 * 60 * 1000;

type SaveParkedCarArgs = {
  coordinate: NavigationCoordinate;
  accuracyMeters?: number | null;
  roadName?: string | null;
};

function normalizeCoordinate(value: unknown): NavigationCoordinate | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as { lat?: unknown; lng?: unknown };

  if (
    typeof candidate.lat !== "number" ||
    !Number.isFinite(candidate.lat) ||
    typeof candidate.lng !== "number" ||
    !Number.isFinite(candidate.lng)
  ) {
    return null;
  }

  return {
    lat: Number(candidate.lat.toFixed(6)),
    lng: Number(candidate.lng.toFixed(6)),
  };
}

function normalizeTimestamp(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const timestampMs = Date.parse(value);

  if (Number.isNaN(timestampMs)) {
    return null;
  }

  return new Date(timestampMs).toISOString();
}

function toValidatedParkedCarLocation(raw: unknown): NavigationParkedCarLocation | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const coordinate = normalizeCoordinate(candidate.coordinate);
  const savedAt = normalizeTimestamp(candidate.savedAt);

  if (
    typeof candidate.id !== "string" ||
    candidate.id.trim().length === 0 ||
    typeof candidate.label !== "string" ||
    candidate.label.trim().length === 0 ||
    !coordinate ||
    savedAt === null
  ) {
    return null;
  }

  const accuracyMeters =
    typeof candidate.accuracyMeters === "number" && Number.isFinite(candidate.accuracyMeters)
      ? Math.max(0, Math.round(candidate.accuracyMeters))
      : undefined;

  return {
    id: candidate.id,
    coordinate,
    label: candidate.label,
    accuracyMeters,
    roadName:
      typeof candidate.roadName === "string" && candidate.roadName.trim().length > 0
        ? candidate.roadName
        : undefined,
    savedAt,
  };
}

export function loadParkedCarLocation(): NavigationParkedCarLocation | null {
  const location = readPersistedState<NavigationParkedCarLocation | null>({
    storageKey: NAVIGATION_PARKED_CAR_STORAGE_KEY,
    storageVersion: navigationParkedCarStorageVersion,
    fallback: null,
    validate: (value): value is NavigationParkedCarLocation | null =>
      value === null || toValidatedParkedCarLocation(value) !== null,
    normalize: (value) => {
      if (value === null) {
        return null;
      }

      return toValidatedParkedCarLocation(value);
    },
    migrateLegacy: (legacyValue) => toValidatedParkedCarLocation(legacyValue),
  });

  // Auto-expire stale entries to limit GPS data persistence.
  if (location?.savedAt) {
    const ageMs = Date.now() - Date.parse(location.savedAt);

    if (ageMs > PARKED_CAR_TTL_MS) {
      clearParkedCarLocation();
      return null;
    }
  }

  return location;
}

export function saveParkedCarLocation({
  coordinate,
  accuracyMeters,
  roadName,
}: SaveParkedCarArgs): NavigationParkedCarLocation {
  const parkedCar: NavigationParkedCarLocation = {
    id: `parked-car-${Date.now()}`,
    coordinate,
    label: "Parked Car",
    accuracyMeters: typeof accuracyMeters === "number" ? accuracyMeters : undefined,
    roadName: roadName || undefined,
    savedAt: new Date().toISOString(),
  };

  writePersistedState(
    NAVIGATION_PARKED_CAR_STORAGE_KEY,
    navigationParkedCarStorageVersion,
    parkedCar
  );

  return parkedCar;
}

export function clearParkedCarLocation() {
  clearPersistedState(NAVIGATION_PARKED_CAR_STORAGE_KEY);
}
