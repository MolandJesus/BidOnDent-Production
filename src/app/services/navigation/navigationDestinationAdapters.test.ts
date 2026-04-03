import { describe, expect, it } from "vitest";
import {
  addressResultToNavigationDestination,
  discoveryPlaceToNavigationDestination,
  qaDestinationToNavigationDestination,
} from "./navigationDestinationAdapters";

describe("addressResultToNavigationDestination", () => {
  it("converts a Nominatim address result", () => {
    const result = addressResultToNavigationDestination({
      id: "12345",
      label: "123 Peachtree St NE, Atlanta, GA 30309",
      primaryLabel: "123 Peachtree St NE",
      secondaryLabel: "Fulton County, Georgia",
      lat: 33.789,
      lng: -84.384,
      provider: "nominatim",
    });

    expect(result.id).toBe("addr-12345");
    expect(result.name).toBe("123 Peachtree St NE");
    expect(result.lat).toBe(33.789);
    expect(result.lng).toBe(-84.384);
    expect(result.kind).toBe("address");
    expect(result.address).toBe("123 Peachtree St NE, Atlanta, GA 30309");
  });
});

describe("discoveryPlaceToNavigationDestination", () => {
  it("converts an Overpass discovery place", () => {
    const result = discoveryPlaceToNavigationDestination({
      id: "overpass-node-987654",
      label: "Caliber Collision",
      subtitle: "Body Shop · Verified",
      category: "body-shop",
      qualityLabel: "verified",
      qualityScore: 82,
      coordinate: { lat: 33.85, lng: -84.37 },
      distanceMiles: 2.3,
      source: "overpass",
    });

    expect(result.id).toBe("overpass-node-987654");
    expect(result.name).toBe("Caliber Collision");
    expect(result.lat).toBe(33.85);
    expect(result.lng).toBe(-84.37);
    expect(result.kind).toBe("real_place");
    expect(result.address).toBe("Body Shop · Verified");
  });
});

describe("qaDestinationToNavigationDestination", () => {
  it("converts an Atlanta QA destination", () => {
    const result = qaDestinationToNavigationDestination({
      id: "atl-qa-mcdonalds-midtown",
      name: "McDonald's",
      address: "760 Peachtree St NE, Atlanta, GA 30308",
      coordinates: { lat: 33.7726, lng: -84.3831 },
      kind: "restaurant",
      neighborhood: "Midtown",
      isChain: true,
    });

    expect(result.id).toBe("atl-qa-mcdonalds-midtown");
    expect(result.name).toBe("McDonald's");
    expect(result.lat).toBe(33.7726);
    expect(result.lng).toBe(-84.3831);
    expect(result.kind).toBe("qa_seed_destination");
    expect(result.address).toBe("760 Peachtree St NE, Atlanta, GA 30308");
  });
});
