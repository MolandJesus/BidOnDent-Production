import type {
  NavigationCoordinate,
  NavigationSavedLocation,
  NavigationSavedLocationCategory,
} from "../../types/navigation";
import { readPersistedState, writePersistedState } from "./persistedState";

export const NAVIGATION_SAVED_LOCATIONS_STORAGE_KEY = "bidondent_navigation_saved_locations";
const navigationSavedLocationsStorageVersion = 2;
const MAX_RECENT_LOCATIONS = 6;

type CreateSavedLocationArgs = {
  label: string;
  subtitle?: string;
  category: NavigationSavedLocationCategory;
  coordinate: NavigationCoordinate;
};

function normalizeSavedLocations(locations: NavigationSavedLocation[]): NavigationSavedLocation[] {
  const deduplicated = new Map<string, NavigationSavedLocation>();

  locations.forEach((location) => {
    const key =
      location.category === "recent"
        ? `${location.label.toLowerCase()}:${location.coordinate.lat.toFixed(5)},${location.coordinate.lng.toFixed(5)}`
        : location.id;
    deduplicated.set(key, location);
  });

  const normalized = Array.from(deduplicated.values()).sort((left, right) => {
    const leftTimestamp = new Date(left.lastUsedAt || left.createdAt).getTime();
    const rightTimestamp = new Date(right.lastUsedAt || right.createdAt).getTime();
    return rightTimestamp - leftTimestamp;
  });

  const recentLocations = normalized
    .filter((location) => location.category === "recent")
    .slice(0, MAX_RECENT_LOCATIONS);
  const pinnedLocations = normalized.filter((location) => location.category !== "recent");

  return [...pinnedLocations, ...recentLocations];
}

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

function isSavedLocationCategory(value: unknown): value is NavigationSavedLocationCategory {
  return (
    value === "home" ||
    value === "work" ||
    value === "saved" ||
    value === "recent" ||
    value === "parked-car"
  );
}

function toValidatedSavedLocation(raw: unknown): NavigationSavedLocation | null {
  if (!raw || typeof raw !== "object") {
    return null;
  }

  const candidate = raw as Record<string, unknown>;
  const coordinate = normalizeCoordinate(candidate.coordinate);
  const createdAt = normalizeTimestamp(candidate.createdAt);
  const lastUsedAt =
    candidate.lastUsedAt === undefined
      ? undefined
      : normalizeTimestamp(candidate.lastUsedAt) || undefined;

  if (
    typeof candidate.id !== "string" ||
    candidate.id.trim().length === 0 ||
    typeof candidate.label !== "string" ||
    candidate.label.trim().length === 0 ||
    !isSavedLocationCategory(candidate.category) ||
    !coordinate ||
    createdAt === null
  ) {
    return null;
  }

  return {
    id: candidate.id,
    label: candidate.label,
    subtitle:
      typeof candidate.subtitle === "string" && candidate.subtitle.trim().length > 0
        ? candidate.subtitle
        : undefined,
    category: candidate.category,
    coordinate,
    createdAt,
    lastUsedAt,
  };
}

function sanitizeSavedLocations(raw: unknown): NavigationSavedLocation[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return normalizeSavedLocations(
    raw
      .map((location) => toValidatedSavedLocation(location))
      .filter((location): location is NavigationSavedLocation => Boolean(location))
  );
}

function persistSavedLocations(locations: NavigationSavedLocation[]) {
  writePersistedState(
    NAVIGATION_SAVED_LOCATIONS_STORAGE_KEY,
    navigationSavedLocationsStorageVersion,
    normalizeSavedLocations(locations)
  );
}

export function createNavigationSavedLocation({
  label,
  subtitle,
  category,
  coordinate,
}: CreateSavedLocationArgs): NavigationSavedLocation {
  const timestamp = new Date().toISOString();

  return {
    id: `${category}-${coordinate.lat.toFixed(5)}-${coordinate.lng.toFixed(5)}-${Date.now()}`,
    label,
    subtitle,
    category,
    coordinate,
    createdAt: timestamp,
    lastUsedAt: timestamp,
  };
}

export function loadSavedNavigationLocations(): NavigationSavedLocation[] {
  return readPersistedState<NavigationSavedLocation[]>({
    storageKey: NAVIGATION_SAVED_LOCATIONS_STORAGE_KEY,
    storageVersion: navigationSavedLocationsStorageVersion,
    fallback: [],
    validate: (value): value is NavigationSavedLocation[] => Array.isArray(value),
    normalize: (value) => sanitizeSavedLocations(value),
    migrateLegacy: (legacyValue) => sanitizeSavedLocations(legacyValue),
  });
}

export function upsertSavedNavigationLocation(location: NavigationSavedLocation) {
  const current = loadSavedNavigationLocations();
  const nonMatching = current.filter((entry) => entry.id !== location.id);
  persistSavedLocations([location, ...nonMatching]);
}

export function addSavedNavigationLocation(args: CreateSavedLocationArgs) {
  const location = createNavigationSavedLocation(args);
  upsertSavedNavigationLocation(location);
  return location;
}

export function markRecentNavigationLocation(args: {
  label: string;
  subtitle?: string;
  coordinate: NavigationCoordinate;
}) {
  const current = loadSavedNavigationLocations();
  const now = new Date().toISOString();
  const existingRecent = current.find(
    (location) =>
      location.category === "recent" &&
      location.label.toLowerCase() === args.label.toLowerCase() &&
      location.coordinate.lat.toFixed(5) === args.coordinate.lat.toFixed(5) &&
      location.coordinate.lng.toFixed(5) === args.coordinate.lng.toFixed(5)
  );

  if (existingRecent) {
    persistSavedLocations(
      current.map((location) =>
        location.id === existingRecent.id ? { ...location, lastUsedAt: now } : location
      )
    );
    return;
  }

  persistSavedLocations([
    createNavigationSavedLocation({
      label: args.label,
      subtitle: args.subtitle,
      category: "recent",
      coordinate: args.coordinate,
    }),
    ...current,
  ]);
}

export function touchSavedNavigationLocation(id: string) {
  const current = loadSavedNavigationLocations();
  persistSavedLocations(
    current.map((location) =>
      location.id === id ? { ...location, lastUsedAt: new Date().toISOString() } : location
    )
  );
}

export function removeSavedNavigationLocation(id: string) {
  const current = loadSavedNavigationLocations();
  persistSavedLocations(current.filter((location) => location.id !== id));
}
