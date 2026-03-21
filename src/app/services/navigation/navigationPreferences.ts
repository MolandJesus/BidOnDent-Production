import type { NavigationGuidanceSettings } from "../../types/navigation";
import { readPersistedState, writePersistedState } from "./persistedState";

export const NAVIGATION_PREFERENCES_STORAGE_KEY = "bidondent_navigation_preferences";
const navigationPreferencesStorageVersion = 2;

export function getDefaultNavigationGuidanceSettings(): NavigationGuidanceSettings {
  return {
    voiceMode: "alerts-only",
    voicePersona: "british-smooth",
    voiceVolumePreset: "normal",
    gpsTrackingEnabled: true,
    speedLimitMonitorEnabled: true,
    addressSearchProvider: "nominatim",
    routeProvider: "osrm-demo",
    speedLimitProvider: "overpass",
  };
}

export function loadNavigationGuidanceSettings(): NavigationGuidanceSettings {
  const defaults = getDefaultNavigationGuidanceSettings();

  const normalizeSettings = (raw: unknown): NavigationGuidanceSettings => {
    const parsed =
      raw && typeof raw === "object" ? (raw as Partial<NavigationGuidanceSettings>) : {};

    return {
      voiceMode:
        parsed.voiceMode === "full" || parsed.voiceMode === "muted"
          ? parsed.voiceMode
          : parsed.voiceMode === "alerts-only"
            ? "alerts-only"
            : defaults.voiceMode,
      voicePersona:
        parsed.voicePersona === "british-smooth" ? "british-smooth" : defaults.voicePersona,
      voiceVolumePreset:
        parsed.voiceVolumePreset === "louder" ||
        parsed.voiceVolumePreset === "normal" ||
        parsed.voiceVolumePreset === "softer"
          ? parsed.voiceVolumePreset
          : defaults.voiceVolumePreset,
      gpsTrackingEnabled:
        typeof parsed.gpsTrackingEnabled === "boolean"
          ? parsed.gpsTrackingEnabled
          : defaults.gpsTrackingEnabled,
      speedLimitMonitorEnabled:
        typeof parsed.speedLimitMonitorEnabled === "boolean"
          ? parsed.speedLimitMonitorEnabled
          : defaults.speedLimitMonitorEnabled,
      addressSearchProvider: defaults.addressSearchProvider,
      routeProvider: defaults.routeProvider,
      speedLimitProvider: defaults.speedLimitProvider,
    };
  };

  return readPersistedState<NavigationGuidanceSettings>({
    storageKey: NAVIGATION_PREFERENCES_STORAGE_KEY,
    storageVersion: navigationPreferencesStorageVersion,
    fallback: defaults,
    validate: (value): value is NavigationGuidanceSettings =>
      Boolean(value) && typeof value === "object",
    normalize: (value) => normalizeSettings(value),
    migrateLegacy: (legacyValue) => normalizeSettings(legacyValue),
  });
}

export function saveNavigationGuidanceSettings(settings: NavigationGuidanceSettings) {
  writePersistedState(
    NAVIGATION_PREFERENCES_STORAGE_KEY,
    navigationPreferencesStorageVersion,
    settings
  );
}
