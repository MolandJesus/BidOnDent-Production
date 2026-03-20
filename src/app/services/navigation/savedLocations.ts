import type {
  NavigationCoordinate,
  NavigationSavedLocation,
  NavigationSavedLocationCategory,
} from "../../types/navigation";

export const NAVIGATION_SAVED_LOCATIONS_STORAGE_KEY = "bidondent_navigation_saved_locations";
const MAX_RECENT_LOCATIONS = 6;

type CreateSavedLocationArgs = {
  label: string;
  subtitle?: string;
  category: NavigationSavedLocationCategory;
  coordinate: NavigationCoordinate;
};

function normalizeSavedLocations(
  locations: NavigationSavedLocation[]
): NavigationSavedLocation[] {
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

function persistSavedLocations(locations: NavigationSavedLocation[]) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(
      NAVIGATION_SAVED_LOCATIONS_STORAGE_KEY,
      JSON.stringify(normalizeSavedLocations(locations))
    );
  } catch (error) {
    console.error("Error saving navigation saved locations:", error);
  }
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
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(NAVIGATION_SAVED_LOCATIONS_STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored) as NavigationSavedLocation[];

    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeSavedLocations(
      parsed.filter(
        (location) =>
          location &&
          typeof location.id === "string" &&
          typeof location.label === "string" &&
          typeof location.category === "string" &&
          location.coordinate &&
          typeof location.coordinate.lat === "number" &&
          typeof location.coordinate.lng === "number" &&
          typeof location.createdAt === "string"
      )
    );
  } catch (error) {
    console.error("Error loading navigation saved locations:", error);
    return [];
  }
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
