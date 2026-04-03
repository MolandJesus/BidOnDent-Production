import { describe, expect, it } from "vitest";

import type { ShopBusinessProfile } from "../../types/networkProfiles";
import {
  buildApproximateCoordinates,
  buildReasons,
  clampScore,
  extractDamageSignals,
  extractVehicleMakes,
  hashString,
  inferAverageTicketValue,
  inferCapacityBand,
  inferInsurerPrograms,
  inferSupportedMakes,
  toKey,
  tokenize,
  uniqueStrings,
} from "./directoryAdapterUtils";

function createProfile(
  overrides?: Partial<ShopBusinessProfile>,
): ShopBusinessProfile {
  return {
    websiteUserKey: "shop-profile-1",
    businessName: "Atlanta Dent Pros",
    businessAddress: "123 Main St",
    businessCity: "Atlanta",
    businessState: "GA",
    businessZip: "30303",
    businessPhone: "555-0100",
    certifications: ["I-CAR Gold"],
    specialties: ["Paintless dent repair", "ADAS calibration"],
    acceptsInsuranceClaims: true,
    offersEstimates: true,
    insurerPrograms: [],
    supportedMakes: [],
    isAcceptingBids: true,
    isDirectoryVisible: true,
    ...overrides,
  };
}

describe("directoryAdapterUtils", () => {
  it("normalizes keys and tokens for search-friendly matching", () => {
    expect(toKey("  McDonald's  ", "Midtown", "GA")).toBe("mcdonald s midtown ga");
    expect(tokenize("Dent repair + ADAS / calibration")).toEqual([
      "dent",
      "repair",
      "adas",
      "calibration",
    ]);
    expect(uniqueStrings([" Atlanta ", "Atlanta", null, "Buckhead", ""])).toEqual([
      "Atlanta",
      "Buckhead",
    ]);
  });

  it("keeps score/hash helpers deterministic and bounded", () => {
    expect(clampScore(-20)).toBe(1);
    expect(clampScore(55.4)).toBe(55);
    expect(clampScore(140)).toBe(100);
    expect(hashString("atlanta-dent")).toBe(hashString("atlanta-dent"));
    expect(hashString("atlanta-dent")).not.toBe(hashString("buckhead-dent"));
  });

  it("builds approximate coordinates for known and unknown cities without crashing", () => {
    expect(buildApproximateCoordinates("seed-1", "Yonkers", "NY")).toEqual(
      expect.objectContaining({
        latitude: expect.any(Number),
        longitude: expect.any(Number),
      }),
    );

    const fallback = buildApproximateCoordinates("seed-2", "Atlanta", "GA");
    expect(fallback.latitude).toBeGreaterThan(32.6);
    expect(fallback.latitude).toBeLessThan(32.9);
    expect(fallback.longitude).toBeGreaterThan(-96.95);
    expect(fallback.longitude).toBeLessThan(-96.65);
  });

  it("infers capacity, ticket size, makes, and insurer programs from profile signals", () => {
    expect(
      inferCapacityBand(
        createProfile({
          completionRate: 99,
          specialties: ["Luxury bodywork", "ADAS calibration", "Frame repair", "EV repair"],
        }),
      ),
    ).toBe("balanced");

    expect(
      inferCapacityBand(
        createProfile({
          isAcceptingBids: false,
        }),
      ),
    ).toBe("boutique");

    expect(
      inferAverageTicketValue(
        createProfile({
          specialties: ["Luxury refinishing"],
        }),
      ),
    ).toBe(1050);

    expect(
      inferAverageTicketValue(
        createProfile({
          specialties: ["Hail repair", "PDR"],
        }),
      ),
    ).toBe(760);

    expect(
      inferSupportedMakes(
        createProfile({
          specialties: ["Luxury collision"],
        }),
      ),
    ).toEqual(["BMW", "Mercedes-Benz", "Audi", "Porsche"]);

    expect(
      inferSupportedMakes(
        createProfile({
          specialties: ["EV diagnostics", "ADAS calibration"],
        }),
      ),
    ).toEqual(["Tesla", "Rivian", "Hyundai", "Ford"]);

    expect(inferInsurerPrograms(createProfile())).toEqual(["Progressive", "State Farm"]);
  });

  it("extracts vehicle/damage signals and builds concise reasons", () => {
    expect(
      extractVehicleMakes([
        { make: "Ford", model: "F-150", year: 2022 },
        { make: "Tesla", model: "Model 3", year: 2023 },
        { make: "Ford", model: "Mustang", year: 2020 },
      ] as Array<{ make?: string; model?: string; year?: string | number }>),
    ).toEqual(["ford", "tesla"]);

    expect(
      extractDamageSignals([
        {
          damageArea: "Front bumper",
          damageAreas: ["hood", "fender"],
          damageType: "dent",
          description: "ADAS sensor issue",
        },
      ] as Array<{
        damageArea?: string;
        damageAreas?: string[];
        damageType?: string;
        description?: string;
      }>),
    ).toEqual(["front bumper", "dent", "hood", "fender", "adas sensor issue"]);

    const reasons = buildReasons(
      "insurer",
      ["dent", "adas"],
      ["tesla"],
      ["adas", "dent"],
      ["Progressive"],
      createProfile({
        specialties: ["ADAS calibration", "Dent repair"],
        insurerPrograms: ["Progressive", "Geico"],
        supportedMakes: ["Tesla", "Ford"],
        aboutSummary: "ADAS and dent specialists",
      }),
      ["Tesla", "Ford"],
      ["Progressive", "Geico"],
    );

    expect(reasons).toEqual([
      "Already aligned with Progressive workflows",
      "Strong fit for tesla repair demand",
      "Profile coverage matches adas",
    ]);
  });
});
