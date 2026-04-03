import { describe, expect, it } from "vitest";

import {
  ATLANTA_QA_DESTINATIONS,
  ATLANTA_QA_NEIGHBORHOODS,
} from "./atlantaQADestinations";

const ATLANTA_QA_KINDS = new Set([
  "restaurant",
  "gas_station",
  "grocery",
  "coffee",
  "landmark",
  "hospital",
  "pharmacy",
  "park",
]);

describe("ATLANTA_QA_DESTINATIONS", () => {
  it("covers all requested Atlanta neighborhoods with three destinations each", () => {
    expect(ATLANTA_QA_DESTINATIONS).toHaveLength(45);
    expect(ATLANTA_QA_NEIGHBORHOODS).toHaveLength(15);
    expect(new Set(ATLANTA_QA_NEIGHBORHOODS).size).toBe(15);

    for (const neighborhood of ATLANTA_QA_NEIGHBORHOODS) {
      const matches = ATLANTA_QA_DESTINATIONS.filter(
        (destination) => destination.neighborhood === neighborhood,
      );
      expect(matches).toHaveLength(3);
    }
  });

  it("keeps ids, coordinates, addresses, and kinds navigation-ready", () => {
    expect(new Set(ATLANTA_QA_DESTINATIONS.map((item) => item.id)).size).toBe(
      ATLANTA_QA_DESTINATIONS.length,
    );

    for (const destination of ATLANTA_QA_DESTINATIONS) {
      expect(destination.id.startsWith("atl-qa-")).toBe(true);
      expect(destination.name.trim().length).toBeGreaterThan(0);
      expect(destination.address.trim().length).toBeGreaterThan(0);
      expect(ATLANTA_QA_KINDS.has(destination.kind)).toBe(true);
      expect(ATLANTA_QA_NEIGHBORHOODS.includes(destination.neighborhood)).toBe(
        true,
      );
      expect(Number.isFinite(destination.coordinates.lat)).toBe(true);
      expect(Number.isFinite(destination.coordinates.lng)).toBe(true);
      expect(destination.coordinates.lat).toBeGreaterThan(33);
      expect(destination.coordinates.lat).toBeLessThan(35);
      expect(destination.coordinates.lng).toBeGreaterThan(-85);
      expect(destination.coordinates.lng).toBeLessThan(-84);
    }
  });

  it("includes both chain and local destinations for realistic QA drives", () => {
    expect(
      ATLANTA_QA_DESTINATIONS.some((destination) => destination.isChain),
    ).toBe(true);
    expect(
      ATLANTA_QA_DESTINATIONS.some((destination) => !destination.isChain),
    ).toBe(true);
    expect(
      ATLANTA_QA_DESTINATIONS.some(
        (destination) => destination.name === "McDonald's",
      ),
    ).toBe(true);
    expect(
      ATLANTA_QA_DESTINATIONS.some(
        (destination) => destination.name === "Piedmont Park",
      ),
    ).toBe(true);
  });
});
