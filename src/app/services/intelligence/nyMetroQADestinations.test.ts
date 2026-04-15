import { describe, expect, it } from "vitest";

import { NY_METRO_QA_DESTINATIONS, NY_METRO_QA_NEIGHBORHOODS } from "./nyMetroQADestinations";

const NY_METRO_QA_KINDS = new Set([
  "restaurant",
  "gas_station",
  "grocery",
  "coffee",
  "landmark",
  "hospital",
  "pharmacy",
  "park",
]);
const NY_METRO_QA_NEIGHBORHOOD_SET = new Set<string>(NY_METRO_QA_NEIGHBORHOODS);

describe("NY_METRO_QA_DESTINATIONS", () => {
  it("covers all requested NY metro neighborhoods with three destinations each", () => {
    expect(NY_METRO_QA_DESTINATIONS).toHaveLength(45);
    expect(NY_METRO_QA_NEIGHBORHOODS).toHaveLength(15);
    expect(new Set(NY_METRO_QA_NEIGHBORHOODS).size).toBe(15);

    for (const neighborhood of NY_METRO_QA_NEIGHBORHOODS) {
      const matches = NY_METRO_QA_DESTINATIONS.filter(
        (destination) => destination.neighborhood === neighborhood
      );
      expect(matches).toHaveLength(3);
    }
  });

  it("keeps ids, coordinates, addresses, and kinds navigation-ready", () => {
    expect(new Set(NY_METRO_QA_DESTINATIONS.map((item) => item.id)).size).toBe(
      NY_METRO_QA_DESTINATIONS.length
    );

    for (const destination of NY_METRO_QA_DESTINATIONS) {
      expect(destination.id.startsWith("ny-qa-")).toBe(true);
      expect(destination.name.trim().length).toBeGreaterThan(0);
      expect(destination.address.trim().length).toBeGreaterThan(0);
      expect(NY_METRO_QA_KINDS.has(destination.kind)).toBe(true);
      expect(NY_METRO_QA_NEIGHBORHOOD_SET.has(destination.neighborhood)).toBe(true);
      expect(Number.isFinite(destination.coordinates.lat)).toBe(true);
      expect(Number.isFinite(destination.coordinates.lng)).toBe(true);
      expect(destination.coordinates.lat).toBeGreaterThan(40);
      expect(destination.coordinates.lat).toBeLessThan(42);
      expect(destination.coordinates.lng).toBeGreaterThan(-75);
      expect(destination.coordinates.lng).toBeLessThan(-73);
    }
  });
});
