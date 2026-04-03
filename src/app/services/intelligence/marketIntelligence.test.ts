import { describe, expect, it } from "vitest";

import {
  buildInsuranceIntelligenceSummary,
  buildInsuranceRecommendations,
  buildShopIntelligenceSummary,
  buildShopRecommendations,
} from "./marketIntelligence";

describe("marketIntelligence", () => {
  it("builds shop recommendations with a top pick and customer-facing intelligence summary", () => {
    const recommendations = buildShopRecommendations({
      userType: "customer",
      searchQuery: "",
      vehicles: [{ make: "Tesla", model: "Model 3", year: 2024 }],
      reports: [
        {
          damageArea: "Front bumper",
          damageType: "dent",
          description: "ADAS sensor issue",
        },
      ],
      connectedInsurerIds: [3],
      filterRating: 4,
      sortBy: "smart-match",
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]?.topPick).toBe(true);
    expect(
      recommendations.every((shop, index) => (index === 0 ? shop.topPick : !shop.topPick)),
    ).toBe(true);
    expect(recommendations[0]?.recommendationScore).toBeGreaterThanOrEqual(
      recommendations[1]?.recommendationScore ?? 0,
    );
    expect(recommendations[0]?.matchReasons.length).toBeGreaterThan(0);

    const summary = buildShopIntelligenceSummary(recommendations, {
      userType: "customer",
      searchQuery: "",
      vehicles: [{ make: "Tesla" }],
      reports: [{ damageType: "dent" }],
      connectedInsurerIds: [3],
    });

    expect(summary.title).toContain("is your smartest current match");
    expect(summary.description.length).toBeGreaterThan(0);
    expect(summary.callouts[0]).toContain("% fit score");
    expect(summary.callouts[1]).toContain("connected insurer preference");
  });

  it("sorts shop recommendations by requested strategy and falls back gracefully when none match", () => {
    const byDistance = buildShopRecommendations({
      userType: "shop",
      searchQuery: "",
      vehicles: [],
      reports: [],
      connectedInsurerIds: [],
      filterRating: 0,
      sortBy: "distance",
    });

    expect(byDistance.length).toBeGreaterThan(1);
    expect(byDistance[0]?.distanceMiles).toBeLessThanOrEqual(byDistance[1]?.distanceMiles ?? Infinity);

    const noMatches = buildShopRecommendations({
      userType: "customer",
      searchQuery: "zzzz impossible query",
      vehicles: [],
      reports: [],
      connectedInsurerIds: [],
      filterRating: 5,
      sortBy: "smart-match",
    });

    expect(noMatches).toEqual([]);
    expect(
      buildShopIntelligenceSummary(noMatches, {
        userType: "customer",
        searchQuery: "zzzz impossible query",
        vehicles: [],
        reports: [],
        connectedInsurerIds: [],
      }),
    ).toEqual({
      title: "No shops matched",
      description:
        "Try broadening the search, switching to Smart Match, or removing the 4.5+ filter.",
      callouts: ["Fallback path: broaden search or sort by distance."],
    });
  });

  it("builds insurer recommendations with connected carriers sorted first and an intelligence summary", () => {
    const recommendations = buildInsuranceRecommendations({
      searchQuery: "digital claims",
      reports: [{ damageType: "ev" }],
      connectedInsurerIds: [3],
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0]?.connected).toBe(true);
    expect(recommendations[0]?.name).toBe("Progressive");
    expect(recommendations[0]?.fitScore).toBeGreaterThanOrEqual(
      recommendations[1]?.fitScore ?? 0,
    );
    expect(recommendations[0]?.connectionReasons.length).toBeGreaterThan(0);

    const summary = buildInsuranceIntelligenceSummary(recommendations);
    expect(summary.title).toContain("is the strongest current carrier match");
    expect(summary.description).toContain("Headquarters:");
    expect(summary.callouts[0]).toContain("% connection fit");
  });

  it("returns the empty-state insurer summary when no carriers match", () => {
    const recommendations = buildInsuranceRecommendations({
      searchQuery: "zzzz impossible insurer",
      reports: [],
      connectedInsurerIds: [],
    });

    expect(recommendations).toEqual([]);
    expect(buildInsuranceIntelligenceSummary(recommendations)).toEqual({
      title: "No insurers matched that search",
      description: "Try a carrier name, claim workflow term, or region instead.",
      callouts: ["Fallback path: show the full carrier directory."],
    });
  });
});
