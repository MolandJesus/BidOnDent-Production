import type {
  NavigationCoordinate,
  NavigationParkedCarLocation,
} from "../../types/navigation";

export const NAVIGATION_PARKED_CAR_STORAGE_KEY = "bidondent_navigation_parked_car";

type SaveParkedCarArgs = {
  coordinate: NavigationCoordinate;
  accuracyMeters?: number | null;
  roadName?: string | null;
};

export function loadParkedCarLocation(): NavigationParkedCarLocation | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(NAVIGATION_PARKED_CAR_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as NavigationParkedCarLocation;

    if (
      !parsed ||
      typeof parsed.id !== "string" ||
      typeof parsed.label !== "string" ||
      !parsed.coordinate ||
      typeof parsed.coordinate.lat !== "number" ||
      typeof parsed.coordinate.lng !== "number" ||
      typeof parsed.savedAt !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error loading parked car location:", error);
    return null;
  }
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

  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(NAVIGATION_PARKED_CAR_STORAGE_KEY, JSON.stringify(parkedCar));
    } catch (error) {
      console.error("Error saving parked car location:", error);
    }
  }

  return parkedCar;
}

export function clearParkedCarLocation() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(NAVIGATION_PARKED_CAR_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing parked car location:", error);
  }
}
