import { describe, expect, it } from "vitest";

import {
  ATLANTA_HUB_IMAGES,
  ATLANTA_HUB_SEEDS,
} from "./atlantaTestHubSeedData";

describe("ATLANTA_HUB_SEEDS", () => {
  it("keeps the 24-shop Atlanta seed pack structurally valid", () => {
    expect(ATLANTA_HUB_SEEDS).toHaveLength(24);
    expect(new Set(ATLANTA_HUB_SEEDS.map((seed) => seed.id)).size).toBe(24);

    for (const seed of ATLANTA_HUB_SEEDS) {
      expect(seed.id).toBeGreaterThan(0);
      expect(seed.name.trim().length).toBeGreaterThan(0);
      expect(seed.address.trim().length).toBeGreaterThan(0);
      expect(seed.city.trim().length).toBeGreaterThan(0);
      expect(seed.zipCode).toMatch(/^\d{5}$/);
      expect(Number.isFinite(seed.coordinates.latitude)).toBe(true);
      expect(Number.isFinite(seed.coordinates.longitude)).toBe(true);
      expect(seed.coordinates.latitude).toBeGreaterThan(33);
      expect(seed.coordinates.latitude).toBeLessThan(35);
      expect(seed.coordinates.longitude).toBeGreaterThan(-85);
      expect(seed.coordinates.longitude).toBeLessThan(-84);
      expect(seed.serviceArea.trim().length).toBeGreaterThan(0);
    }
  });

  it("retains usable image options for seeded shop cards", () => {
    expect(ATLANTA_HUB_IMAGES.length).toBeGreaterThanOrEqual(6);

    for (const imageUrl of ATLANTA_HUB_IMAGES) {
      expect(imageUrl).toMatch(/^https:\/\/images\.unsplash\.com\//);
    }
  });
});
