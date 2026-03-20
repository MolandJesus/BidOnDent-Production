import type { NavigationDiscoveryRole } from "./placeDiscovery";

const NAVIGATION_DISCOVERY_ROLE_STORAGE_KEY = "bidondent_navigation_discovery_role";

export function loadNavigationDiscoveryRole(): NavigationDiscoveryRole {
  if (typeof window === "undefined") {
    return "customer";
  }

  try {
    const stored = localStorage.getItem(NAVIGATION_DISCOVERY_ROLE_STORAGE_KEY);
    return stored === "insurer" || stored === "shop" ? stored : "customer";
  } catch (error) {
    console.error("Error loading navigation discovery role:", error);
    return "customer";
  }
}

export function saveNavigationDiscoveryRole(role: NavigationDiscoveryRole) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(NAVIGATION_DISCOVERY_ROLE_STORAGE_KEY, role);
  } catch (error) {
    console.error("Error saving navigation discovery role:", error);
  }
}
