/**
 * Tests for formatVehicleLabel — Pass 209.
 *
 * Pure transform. Covers:
 *   - Year + make + model concatenation
 *   - Duplicate-make suppression for tightly-prefixed model names (Mazda6 case)
 *   - Tolerance for null/undefined/empty fields
 *   - Year coercion from number
 *   - Whitespace normalization
 */
import { describe, expect, it } from "vitest";

import { formatVehicleLabel } from "./formatVehicleLabel";

describe("formatVehicleLabel", () => {
  it("renders a clean Year Make Model label", () => {
    expect(formatVehicleLabel({ year: "2020", make: "Honda", model: "Civic" })).toBe(
      "2020 Honda Civic"
    );
  });

  it("coerces numeric year", () => {
    expect(formatVehicleLabel({ year: 2018, make: "Toyota", model: "Camry" })).toBe(
      "2018 Toyota Camry"
    );
  });

  it("drops the standalone make field when model already starts with make + space", () => {
    // Output is "2014 Honda Civic" (not "2014 Honda Honda Civic"). The function
    // suppresses the duplicate make slot but preserves the model string verbatim.
    expect(formatVehicleLabel({ year: "2014", make: "Honda", model: "Honda Civic" })).toBe(
      "2014 Honda Civic"
    );
  });

  it("drops duplicated make when model is tightly prefixed (Mazda6 case — KI-124 #2)", () => {
    expect(formatVehicleLabel({ year: "2014", make: "Mazda", model: "Mazda6" })).toBe("2014 Mazda6");
  });

  it("drops duplicated make when model exactly equals make (case-insensitive)", () => {
    expect(formatVehicleLabel({ year: "2020", make: "BMW", model: "bmw" })).toBe("2020 bmw");
  });

  it("does NOT drop make when model only shares a partial prefix shorter than make", () => {
    // "BMW" make + "BM W3" model — model does not start with "bmw " or equal "bmw"
    expect(formatVehicleLabel({ year: "2020", make: "BMW", model: "BM W3" })).toBe("2020 BMW BM W3");
  });

  it("tolerates null/undefined fields without crashing", () => {
    expect(formatVehicleLabel({})).toBe("");
    expect(formatVehicleLabel({ year: null, make: null, model: null })).toBe("");
    expect(formatVehicleLabel({ make: "Honda" })).toBe("Honda");
    expect(formatVehicleLabel({ year: "2020", model: "Civic" })).toBe("2020 Civic");
  });

  it("collapses interior whitespace and trims", () => {
    expect(formatVehicleLabel({ year: "  2020  ", make: "  Honda  ", model: "  Civic  " })).toBe(
      "2020 Honda Civic"
    );
  });
});
