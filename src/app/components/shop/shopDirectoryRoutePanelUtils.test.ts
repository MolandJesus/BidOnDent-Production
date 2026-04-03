import { describe, expect, it } from "vitest";

import {
  buildRoutePanelLabels,
  buildRoutePanelTheme,
  formatActiveDuration,
} from "./shopDirectoryRoutePanelUtils";
import type { RouteOption } from "../../types/mapDomain";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";

const selectedRoute = {
  id: "fastest",
  label: "Fastest",
  trafficLabel: "Light traffic",
  totalDistanceMiles: 7.4,
  totalDistanceLabel: "7.4 mi",
  estimatedDurationMinutes: 18,
  accentColor: "#2563eb",
  polyline: [],
  instructions: [],
} satisfies RouteOption;

const selectedShop = {
  name: "Precision Dent Atlanta",
} as ShopMapListing;

describe("shopDirectoryRoutePanelUtils", () => {
  describe("formatActiveDuration", () => {
    it("formats short, minute, and hour durations for the guidance panel", () => {
      expect(formatActiveDuration(45)).toBe("45s");
      expect(formatActiveDuration(125)).toBe("2m");
      expect(formatActiveDuration(3725)).toBe("1h 2m");
    });
  });

  describe("buildRoutePanelTheme", () => {
    it("returns light-mode route panel classes", () => {
      const theme = buildRoutePanelTheme(true);

      expect(theme.panelSurface).toContain("bg-white/88");
      expect(theme.liveBadgeClass).toContain("emerald-50");
      expect(theme.arrivedBadgeClass).toContain("emerald-50");
    });

    it("returns dark-mode route panel classes", () => {
      const theme = buildRoutePanelTheme(false);

      expect(theme.panelSurface).toContain("bd-glass-card");
      expect(theme.liveBadgeClass).toContain("emerald-400/12");
      expect(theme.pausedBadgeClass).toContain("amber-400/12");
    });
  });

  describe("buildRoutePanelLabels", () => {
    it("builds live-route labels with guidance defaults and remaining values", () => {
      const theme = buildRoutePanelTheme(false);
      const labels = buildRoutePanelLabels({
        isArrivedMode: false,
        isGuidanceMode: true,
        isLight: false,
        routeError: "",
        usingLiveRoutes: true,
        navigationSessionStatus: "active",
        remainingEtaLabel: "12 min",
        remainingDistanceLabel: "5.1 mi",
        selectedRoute,
        selectedShop,
        routeSummary: {
          title: "Best route to Precision Dent Atlanta",
          description: "Stay on I-75 South for the fastest arrival.",
        },
        theme,
      });

      expect(labels.routeSourceLabel).toBe("Live route");
      expect(labels.sessionBadgeLabel).toBe("Live guidance");
      expect(labels.activeEtaLabel).toBe("12 min");
      expect(labels.activeDistanceLabel).toBe("5.1 mi");
      expect(labels.panelTitle).toBe("Best route to Precision Dent Atlanta");
      expect(labels.panelDescription).toContain("I-75 South");
      expect(labels.routeSourceBadgeClass).toContain("blue-400/12");
      expect(labels.sessionBadgeClass).toBe(theme.liveBadgeClass);
    });

    it("switches to the arrived state and shop-specific completion copy", () => {
      const theme = buildRoutePanelTheme(true);
      const labels = buildRoutePanelLabels({
        isArrivedMode: true,
        isGuidanceMode: true,
        isLight: true,
        routeError: "",
        usingLiveRoutes: true,
        navigationSessionStatus: "paused",
        remainingEtaLabel: "ignored",
        remainingDistanceLabel: "ignored",
        selectedRoute,
        selectedShop,
        routeSummary: {
          title: "Unused title",
          description: "Unused description",
        },
        theme,
      });

      expect(labels.routeSourceLabel).toBe("Trip complete");
      expect(labels.sessionBadgeLabel).toBe("Arrived");
      expect(labels.activeEtaLabel).toBe("Arrived");
      expect(labels.activeDistanceLabel).toBe("Here");
      expect(labels.panelTitle).toBe("Arrived at Precision Dent Atlanta");
      expect(labels.panelDescription).toContain("Navigation completed");
      expect(labels.routeSourceBadgeClass).toBe(theme.arrivedBadgeClass);
      expect(labels.sessionBadgeClass).toBe(theme.arrivedBadgeClass);
    });

    it("falls back to estimated route labels when live data is unavailable or errors", () => {
      const theme = buildRoutePanelTheme(true);
      const labels = buildRoutePanelLabels({
        isArrivedMode: false,
        isGuidanceMode: false,
        isLight: true,
        routeError: "Route service unavailable",
        usingLiveRoutes: false,
        navigationSessionStatus: "paused",
        remainingEtaLabel: null,
        remainingDistanceLabel: null,
        selectedRoute,
        selectedShop: null,
        routeSummary: {
          title: "Fallback route summary",
          description: "Using static geometry while live routing recovers.",
        },
        theme,
      });

      expect(labels.routeSourceLabel).toBe("Route estimate");
      expect(labels.sessionBadgeLabel).toBe("Paused route");
      expect(labels.activeEtaLabel).toBe("18 min");
      expect(labels.activeDistanceLabel).toBe("7.4 mi");
      expect(labels.panelTitle).toBe("Fallback route summary");
      expect(labels.routeSourceBadgeClass).toContain("amber-50");
      expect(labels.sessionBadgeClass).toBe(theme.pausedBadgeClass);
    });
  });
});
