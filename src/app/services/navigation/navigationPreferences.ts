import type { NavigationGuidanceSettings } from "../../types/navigation";

export const NAVIGATION_PREFERENCES_STORAGE_KEY = "bidondent_navigation_preferences";

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
  if (typeof window === "undefined") {
    return getDefaultNavigationGuidanceSettings();
  }

  try {
    const stored = localStorage.getItem(NAVIGATION_PREFERENCES_STORAGE_KEY);

    if (!stored) {
      return getDefaultNavigationGuidanceSettings();
    }

    const parsed = JSON.parse(stored) as Partial<NavigationGuidanceSettings>;
    const defaults = getDefaultNavigationGuidanceSettings();

    return {
      voiceMode:
        parsed.voiceMode === "full" || parsed.voiceMode === "muted"
          ? parsed.voiceMode
          : parsed.voiceMode === "alerts-only"
            ? "alerts-only"
            : defaults.voiceMode,
      voicePersona: parsed.voicePersona === "british-smooth" ? "british-smooth" : defaults.voicePersona,
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
  } catch (error) {
    console.error("Error loading navigation guidance settings:", error);
    return getDefaultNavigationGuidanceSettings();
  }
}

export function saveNavigationGuidanceSettings(settings: NavigationGuidanceSettings) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    localStorage.setItem(NAVIGATION_PREFERENCES_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error("Error saving navigation guidance settings:", error);
  }
}
