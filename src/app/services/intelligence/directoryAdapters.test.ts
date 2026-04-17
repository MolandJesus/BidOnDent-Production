import { describe, expect, it } from "vitest";

import type { CoveragePartnerShop } from "../../components/maps/serviceCoverageMapTypes";
import type { InsurerBusinessProfile, ShopBusinessProfile } from "../../types/networkProfiles";
import {
  buildDirectoryInsuranceProfiles,
  buildDirectoryShopRecommendations,
  convertPartnerShopsToProfiles,
  getDirectoryInsurerId,
  getDirectoryShopId,
  getShopCoordinates,
  mergeDirectoryEntriesByName,
} from "./directoryAdapters";

function createShopProfile(overrides?: Partial<ShopBusinessProfile>): ShopBusinessProfile {
  return {
    websiteUserKey: "shop-1",
    businessName: "Atlanta Dent Lab",
    businessAddress: "123 Main St",
    businessCity: "Yonkers",
    businessState: "NY",
    businessZip: "10701",
    businessPhone: "555-0100",
    certifications: ["I-CAR Gold", "OEM Approved"],
    specialties: ["Dent repair", "ADAS calibration"],
    acceptsInsuranceClaims: true,
    offersEstimates: true,
    insurerPrograms: ["Progressive"],
    supportedMakes: ["Tesla", "Ford"],
    averageRating: 4.8,
    totalReviews: 142,
    isAcceptingBids: true,
    averageTicketValue: 1200,
    responseTimeHours: 2,
    completionRate: 98,
    profileImageUrl: "https://cdn.example.com/shop.png",
    aboutSummary: "ADAS-ready Tesla and Ford repair specialists",
    geoLatitude: null,
    geoLongitude: null,
    isDirectoryVisible: true,
    website: null,
    businessHours: null,
    ...overrides,
  };
}

function createInsurerProfile(overrides?: Partial<InsurerBusinessProfile>): InsurerBusinessProfile {
  return {
    websiteUserKey: "insurer-1",
    companyName: "Peachtree Mutual",
    companyAddress: "1 Market St",
    companyCity: "Atlanta",
    companyState: "GA",
    companyZip: "30303",
    companyPhone: "555-2200",
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

describe("directoryAdapters", () => {
  it("builds deterministic directory ids for shops and insurers", () => {
    const shopProfile = createShopProfile({ websiteUserKey: "stable-shop" });
    const insurerProfile = createInsurerProfile({ websiteUserKey: "stable-insurer" });

    expect(getDirectoryShopId(shopProfile)).toBe(getDirectoryShopId(shopProfile));
    expect(getDirectoryShopId(shopProfile)).toBeGreaterThanOrEqual(10000);

    expect(getDirectoryInsurerId(insurerProfile)).toBe(getDirectoryInsurerId(insurerProfile));
    expect(getDirectoryInsurerId(insurerProfile)).toBeGreaterThanOrEqual(50000);
  });

  it("builds recommendation objects from directory shop profiles with search, carrier, and make matching", () => {
    const recommendations = buildDirectoryShopRecommendations({
      connectedCarrierNames: ["Progressive"],
      directoryShops: [
        createShopProfile(),
        createShopProfile({
          websiteUserKey: "shop-hidden",
          businessName: "Hidden Shop",
          isDirectoryVisible: false,
        }),
      ],
      filterRating: 4.5,
      reports: [
        {
          damageArea: "Front bumper",
          damageType: "dent",
          description: "ADAS sensor issue",
        },
      ],
      searchQuery: "Atlanta Tesla ADAS",
      userType: "insurer",
      vehicles: [{ make: "Tesla", model: "Model 3", year: 2024 }],
    });

    expect(recommendations).toHaveLength(1);
    expect(recommendations[0]).toEqual(
      expect.objectContaining({
        name: "Atlanta Dent Lab",
        topPick: false,
        insurerPrograms: ["Progressive"],
        supportedMakes: ["Tesla", "Ford"],
        recommendationScore: expect.any(Number),
        insuranceCompatibilityScore: expect.any(Number),
        responseTimeLabel: "< 2 hours",
        distanceLabel: "Real profile",
        serviceArea: "Yonkers NY",
      })
    );
    expect(recommendations[0]?.capabilityTags).toEqual(
      expect.arrayContaining(["dent-repair", "adas-calibration", "insurance-claims", "estimates"])
    );
    expect(recommendations[0]?.matchReasons.length).toBeGreaterThan(0);
  });

  it("uses direct geo coordinates when available and falls back to approximate coordinates otherwise", () => {
    expect(
      getShopCoordinates(
        createShopProfile({
          geoLatitude: 33.749,
          geoLongitude: -84.388,
        })
      )
    ).toEqual({
      latitude: 33.749,
      longitude: -84.388,
    });

    const fallback = getShopCoordinates(
      createShopProfile({
        geoLatitude: null,
        geoLongitude: null,
        businessCity: "Unknown City",
        businessState: "GA",
      })
    );

    expect(fallback.latitude).toBeGreaterThan(32.6);
    expect(fallback.latitude).toBeLessThan(32.9);
    expect(fallback.longitude).toBeGreaterThan(-96.95);
    expect(fallback.longitude).toBeLessThan(-96.65);
  });

  it("builds insurer directory profiles with defaults and merges directory entries by normalized name", () => {
    const insurerProfiles = buildDirectoryInsuranceProfiles([createInsurerProfile()]);

    expect(insurerProfiles).toEqual([
      expect.objectContaining({
        name: "Peachtree Mutual",
        claimsPhone: "555-2200",
        headquarters: "Atlanta, GA",
        repairProgramFocus: ["collision", "glass"],
        benefits: ["Claims routing", "Repair-network coordination"],
        accountConnectionNotes: [
          "Provider-agnostic insurer profile now available for account connection",
        ],
      }),
    ]);

    const merged = mergeDirectoryEntriesByName(
      [
        { id: 1, name: "Peachtree Mutual" },
        { id: 2, name: "State Farm" },
      ],
      [{ id: 9, name: "  Peachtree   Mutual " }]
    );

    expect(merged).toEqual([
      { id: 9, name: "  Peachtree   Mutual " },
      { id: 2, name: "State Farm" },
    ]);
  });

  it("converts partner shop map records into directory-ready business profiles", () => {
    const partnerShop: CoveragePartnerShop = {
      id: "partner-1",
      name: "Hudson Body Works",
      countyLabel: "Westchester",
      lat: 40.93,
      lng: -73.89,
      label: "Yonkers, NY",
      addressLine: "500 Riverdale Ave",
      phoneNumber: "555-9988",
      specialties: ["Collision", "Paint"],
      rating: 4.7,
    };

    expect(convertPartnerShopsToProfiles([partnerShop])).toEqual([
      expect.objectContaining({
        id: "partner-1",
        websiteUserKey: "partner-shop-partner-1",
        businessName: "Hudson Body Works",
        businessAddress: "500 Riverdale Ave",
        businessCity: "Yonkers",
        businessState: "NY",
        businessPhone: "555-9988",
        specialties: ["Collision", "Paint"],
        averageRating: 4.7,
        geoLatitude: 40.93,
        geoLongitude: -73.89,
        isDirectoryVisible: true,
      }),
    ]);
  });
});
