import type { NavigationDiscoveryRole } from "./placeDiscovery";
import { readPersistedState, writePersistedState } from "./persistedState";

const NAVIGATION_DISCOVERY_ROLE_STORAGE_KEY = "bidondent_navigation_discovery_role";
const navigationDiscoveryRoleStorageVersion = 2;

function normalizeDiscoveryRole(value: unknown): NavigationDiscoveryRole {
  return value === "insurer" || value === "shop" ? value : "customer";
}

export function loadNavigationDiscoveryRole(): NavigationDiscoveryRole {
  return readPersistedState<NavigationDiscoveryRole>({
    storageKey: NAVIGATION_DISCOVERY_ROLE_STORAGE_KEY,
    storageVersion: navigationDiscoveryRoleStorageVersion,
    fallback: "customer",
    validate: (value): value is NavigationDiscoveryRole =>
      value === "customer" || value === "insurer" || value === "shop",
    normalize: (value) => normalizeDiscoveryRole(value),
    migrateLegacy: (legacyValue) => normalizeDiscoveryRole(legacyValue),
  });
}

export function saveNavigationDiscoveryRole(role: NavigationDiscoveryRole) {
  writePersistedState(
    NAVIGATION_DISCOVERY_ROLE_STORAGE_KEY,
    navigationDiscoveryRoleStorageVersion,
    normalizeDiscoveryRole(role)
  );
}
