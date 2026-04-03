import { describe, expect, it } from "vitest";

import { computeGuidanceStyles } from "./shopDirectoryGuidanceCardHelpers";

describe("shopDirectoryGuidanceCardHelpers", () => {
  it("builds dark live-guidance styles with active GPS and overspeed details", () => {
    const styles = computeGuidanceStyles(
      true,
      false,
      undefined,
      true,
      "active",
      "active",
      undefined,
      40,
      35,
    );

    expect(styles.glassPanel).toContain("bg-slate-950/82");
    expect(styles.routeSourceLabel).toBe("Live route");
    expect(styles.routeSourceBadge).toContain("blue-400/12");
    expect(styles.gpsBadge).toContain("emerald-400/12");
    expect(styles.gpsLabel).toBe("GPS");
    expect(styles.speedLimitDetail).toBe("+5 over 35");
    expect(styles.isOverSpeedLimit).toBe(true);
    expect(styles.showGpsRecovery).toBe(false);
    expect(styles.gpsRecoveryMessage).toBeNull();
  });

  it("builds arrived styles that suppress GPS recovery even if GPS is lost", () => {
    const styles = computeGuidanceStyles(
      false,
      true,
      undefined,
      true,
      "paused",
      "lost",
      undefined,
      0,
      30,
    );

    expect(styles.routeSourceLabel).toBe("Trip complete");
    expect(styles.routeSourceBadge).toContain("emerald-50");
    expect(styles.gpsLabel).toBe("GPS lost");
    expect(styles.speedLimitDetail).toBe("Limit 30");
    expect(styles.isOverSpeedLimit).toBe(false);
    expect(styles.showGpsRecovery).toBe(false);
    expect(styles.gpsRecoveryMessage).toBeNull();
  });

  it("shows stale GPS recovery messaging and route-estimate styling when routing errors occur", () => {
    const styles = computeGuidanceStyles(
      false,
      false,
      "Live routing temporarily unavailable",
      false,
      "paused",
      "stale",
      "Move to an open area for a clearer GPS lock.",
      22,
      35,
    );

    expect(styles.routeSourceLabel).toBe("Route estimate");
    expect(styles.routeSourceBadge).toContain("amber-50");
    expect(styles.gpsBadge).toContain("amber-50");
    expect(styles.gpsLabel).toBe("GPS weak");
    expect(styles.speedLimitDetail).toBe("13 below 35");
    expect(styles.showGpsRecovery).toBe(true);
    expect(styles.gpsRecoveryMessage).toBe("Move to an open area for a clearer GPS lock.");
    expect(styles.gpsRecoveryPanel).toContain("amber-50");
    expect(styles.gpsRecoveryButton).toContain("amber-100");
  });

  it("uses lost-GPS recovery styles and default messaging when no GPS error is provided", () => {
    const styles = computeGuidanceStyles(
      true,
      false,
      undefined,
      false,
      "active",
      "lost",
      undefined,
      null,
      null,
    );

    expect(styles.routeSourceLabel).toBe("Estimated route");
    expect(styles.routeSourceBadge).toContain("white/[0.05]");
    expect(styles.gpsBadge).toContain("red-400/12");
    expect(styles.gpsLabel).toBe("GPS lost");
    expect(styles.speedLimitDetail).toBeNull();
    expect(styles.showGpsRecovery).toBe(true);
    expect(styles.gpsRecoveryMessage).toBe(
      "GPS signal lost — turn-by-turn position may be outdated.",
    );
    expect(styles.gpsRecoveryPanel).toContain("red-500/10");
    expect(styles.gpsRecoveryButton).toContain("bg-white/10");
  });
});
