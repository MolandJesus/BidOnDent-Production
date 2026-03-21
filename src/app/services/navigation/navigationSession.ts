import type { ExternalNavigationSession } from "../../types/navigation";

export const NAVIGATION_SESSION_STORAGE_KEY = "bidondent_navigation_session";

export function loadNavigationSession(): ExternalNavigationSession | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const stored = localStorage.getItem(NAVIGATION_SESSION_STORAGE_KEY);
    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored) as ExternalNavigationSession;
    if (
      !parsed ||
      typeof parsed.provider !== "string" ||
      typeof parsed.destinationName !== "string" ||
      !parsed.destinationCoordinates ||
      typeof parsed.destinationCoordinates.lat !== "number" ||
      typeof parsed.destinationCoordinates.lng !== "number" ||
      typeof parsed.launchedAt !== "string"
    ) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.error("Error loading navigation session:", error);
    return null;
  }
}

export function saveNavigationSession(session: ExternalNavigationSession) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(NAVIGATION_SESSION_STORAGE_KEY, JSON.stringify(session));
  } catch (error) {
    console.error("Error saving navigation session:", error);
  }
}

export function clearNavigationSession() {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.removeItem(NAVIGATION_SESSION_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing navigation session:", error);
  }
}
