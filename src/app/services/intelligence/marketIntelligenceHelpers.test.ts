import { describe, expect, it } from "vitest";

import type { InsurerBusinessProfile } from "../../types/networkProfiles";
import {
  clampScore,
  extractDamageSignals,
  extractVehicleMakes,
  getConnectedInsurerNames,
  getInsuranceDirectory,
  matchesSearchQuery,
  tokenize,
  uniqueTopReasons,
} from "./marketIntelligenceHelpers";

function createInsurerProfile(
  overrides?: Partial<InsurerBusinessProfile>,
): InsurerBusinessProfile {
  return {
    websiteUserKey: "insurer-1",
    companyName: "Peachtree Mutual",
    companyAddress: "1 Main St",
    companyCity: "Atlanta",
    companyState: "GA",
    companyZip: "30303",
    companyPhone: "555-0100",
    claimTypes: ["collision", "glass"],
    preferredShops: true,
    autoApproval: false,
    repairProgramFocus: [],
    benefits: [],
    accountConnectionNotes: [],
    digitalClaimsExperience: "strong",
    popular: true,
    isDirectoryVisible: true,
    website: null,
    licenseNumber: null,
    licenseState: null,
    description: null,
    profileImageUrl: null,
    ...overrides,
  };
}

describe("marketIntelligenceHelpers", () => {
  it("tokenizes search values and extracts normalized vehicle + damage signals", () => {
    expect(tokenize(" Tesla / ADAS-ready dent repair ")).toEqual([
      "tesla",
      "adas",
      "ready",
      "dent",
      "repair",
    ]);

    expect(
      extractVehicleMakes([
        { make: "Ford", model: "F-150", year: 2020 },
        { make: " Tesla ", model: "Model 3", year: 2024 },
        { model: "Missing make" },
      ]),
    ).toEqual(["ford", "tesla"]);

    expect(
      extractDamageSignals([
        {
          damageArea: "Front bumper",
          damageAreas: ["hood", "fender"],
          damageType: "dent",
          description: "ADAS sensor issue",
        },
      ]),
    ).toEqual(["front", "bumper", "dent", "adas", "sensor", "issue", "hood", "fender"]);
  });

  it("clamps scores, dedupes top reasons, and matches search queries across haystacks", () => {
    expect(clampScore(-50)).toBe(1);
    expect(clampScore(51.2)).toBe(51);
    expect(clampScore(1000)).toBe(100);

    expect(
      uniqueTopReasons([
        "Carrier overlap",
        "ADAS fit",
        "Carrier overlap",
        "Strong rating",
        "Fast response",
      ]),
    ).toEqual(["Carrier overlap", "ADAS fit", "Strong rating"]);

    expect(
      matchesSearchQuery(["tesla", "adas"], [
        "Tesla-certified ADAS collision center",
        "Westchester County",
      ]),
    ).toBe(true);
    expect(matchesSearchQuery(["bmw"], ["Tesla-certified ADAS collision center"])).toBe(false);
    expect(matchesSearchQuery([], ["anything"])).toBe(true);
  });

  it("merges insurer directories and resolves connected insurer names from merged ids", () => {
    const directoryInsurers = [
      createInsurerProfile({
        websiteUserKey: "custom-geico",
        companyName: "Geico",
        companyPhone: "555-2200",
        description: "Custom directory Geico profile",
      }),
      createInsurerProfile({
        websiteUserKey: "custom-peachtree",
        companyName: "Peachtree Mutual",
        companyPhone: "555-3300",
      }),
    ];

    const insuranceDirectory = getInsuranceDirectory(directoryInsurers);

    expect(insuranceDirectory.some((insurer) => insurer.name === "State Farm")).toBe(true);
    expect(
      insuranceDirectory.find((insurer) => insurer.name === "Geico")?.claimsPhone,
    ).toBe("555-2200");
    expect(
      insuranceDirectory.find((insurer) => insurer.name === "Peachtree Mutual")?.claimsPhone,
    ).toBe("555-3300");

    const geicoId = insuranceDirectory.find((insurer) => insurer.name === "Geico")?.id;
    expect(typeof geicoId).toBe("number");
    expect(getConnectedInsurerNames([geicoId as number], directoryInsurers)).toEqual(["Geico"]);
    expect(getConnectedInsurerNames([99999], directoryInsurers)).toEqual([]);
  });
});
