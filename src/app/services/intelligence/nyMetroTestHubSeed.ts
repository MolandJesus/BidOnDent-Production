import type { Coordinates, Place } from "../../types/mapDomain";
import type { ShopProfile } from "./marketIntelligence";
import {
  type NYMetroHubFocus,
  type NYMetroHubSeed,
  NY_METRO_HUB_IMAGES,
  NY_METRO_HUB_SEEDS,
} from "./nyMetroTestHubSeedData";

export type TestShopLocationRecord = {
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

const FOCUS_PROFILES: Record<
  NYMetroHubFocus,
  Pick<
    ShopProfile,
    | "certifications"
    | "specialties"
    | "supportedVehicleTypes"
    | "supportedMakes"
    | "insurerPrograms"
    | "capabilityTags"
  > & { summary: string; capacityBand: ShopProfile["capacityBand"] }
> = {
  claims: {
    certifications: ["I-CAR Gold Class", "DRP Claims Ready"],
    specialties: ["Insurance Claims", "Collision Repair", "Fast Intake"],
    supportedVehicleTypes: ["Daily Driver", "SUV", "Fleet"],
    supportedMakes: ["Toyota", "Honda", "Ford", "Chevrolet"],
    insurerPrograms: ["State Farm", "Geico", "Progressive"],
    capabilityTags: ["claim-friendly", "fast-intake", "network-shop"],
    summary: "Reliable claims-first hub with strong intake speed and insurer familiarity.",
    capacityBand: "high-capacity",
  },
  collision: {
    certifications: ["ASE Certified", "I-CAR Platinum"],
    specialties: ["Collision Repair", "Frame Straightening", "Structural Repair"],
    supportedVehicleTypes: ["Daily Driver", "SUV", "Truck"],
    supportedMakes: ["Ford", "Toyota", "Honda", "Nissan"],
    insurerPrograms: ["State Farm", "Allstate", "Liberty Mutual"],
    capabilityTags: ["collision", "frame", "structural"],
    summary: "Balanced collision hub built for dependable metro-area turn times.",
    capacityBand: "balanced",
  },
  luxury: {
    certifications: ["BMW Certified", "Mercedes Certified", "Aluminum Repair"],
    specialties: ["Luxury Vehicle Repair", "Concierge Pickup", "Custom Paint"],
    supportedVehicleTypes: ["Luxury", "EV", "SUV"],
    supportedMakes: ["BMW", "Mercedes-Benz", "Audi", "Tesla"],
    insurerPrograms: ["Progressive", "Chubb", "Nationwide"],
    capabilityTags: ["luxury", "premium-paint", "concierge"],
    summary: "Premium option for upscale brands where finish quality and handoff matter.",
    capacityBand: "boutique",
  },
  pdr: {
    certifications: ["PDR Nation Member", "I-CAR Gold Class"],
    specialties: ["Paintless Dent Removal", "Hail Damage", "Mobile Estimates"],
    supportedVehicleTypes: ["Daily Driver", "Truck", "SUV"],
    supportedMakes: ["Toyota", "Ford", "Ram", "Hyundai"],
    insurerPrograms: ["State Farm", "Farmers Insurance", "Geico"],
    capabilityTags: ["pdr", "hail", "mobile-estimate"],
    summary: "Fast dent and hail specialist suited for neighborhood-volume work.",
    capacityBand: "high-capacity",
  },
  ev: {
    certifications: ["Tesla Certified", "ADAS Calibration Lab", "EV Safety"],
    specialties: ["EV Structural Repair", "Sensor Calibration", "Battery Safety Checks"],
    supportedVehicleTypes: ["EV", "Luxury", "Fleet"],
    supportedMakes: ["Tesla", "Rivian", "Hyundai", "Lucid"],
    insurerPrograms: ["Progressive", "USAA", "Allstate"],
    capabilityTags: ["ev", "adas", "calibration"],
    summary: "Technical fit for EV repair and modern sensor-heavy vehicles.",
    capacityBand: "balanced",
  },
  fleet: {
    certifications: ["Commercial Fleet Partner", "ASE Certified"],
    specialties: ["Fleet Repair", "Heavy-Duty Collision", "Commercial Claims"],
    supportedVehicleTypes: ["Fleet", "Commercial", "Truck"],
    supportedMakes: ["Ford", "Chevrolet", "Ram", "Freightliner"],
    insurerPrograms: ["Nationwide", "Liberty Mutual", "Travelers"],
    capabilityTags: ["fleet", "commercial", "high-capacity"],
    summary: "High-throughput fleet hub built for vans, trucks, and commercial downtime recovery.",
    capacityBand: "high-capacity",
  },
  refinish: {
    certifications: ["BASF Refinish Certified", "Hunter Alignment Certified"],
    specialties: ["Refinish Blending", "Bumper Work", "Wheel Alignment"],
    supportedVehicleTypes: ["Daily Driver", "SUV", "Luxury"],
    supportedMakes: ["Subaru", "Honda", "Toyota", "BMW"],
    insurerPrograms: ["Geico", "Allstate", "Liberty Mutual"],
    capabilityTags: ["refinish", "alignment", "supplemental"],
    summary: "Useful finish-and-supplement shop for claims that need paint and alignment cleanup.",
    capacityBand: "balanced",
  },
  hail: {
    certifications: ["PDR Nation Member", "Catastrophe Response Ready"],
    specialties: ["Hail Damage", "Storm Repair", "Paintless Dent Removal"],
    supportedVehicleTypes: ["Daily Driver", "SUV", "Truck"],
    supportedMakes: ["Ford", "Chevrolet", "Toyota", "Jeep"],
    insurerPrograms: ["State Farm", "Nationwide", "Farmers Insurance"],
    capabilityTags: ["hail", "storm-response", "pdr"],
    summary: "Storm-response focused hub designed for spike-volume dent events.",
    capacityBand: "high-capacity",
  },
};

function buildNYMetroTestShop(seed: NYMetroHubSeed, index: number): ShopProfile {
  const focus = FOCUS_PROFILES[seed.focus];
  const rating = Number((4.3 + (index % 6) * 0.1).toFixed(1));
  const reviews = 68 + index * 13;
  const distanceMiles = Number((1.8 + (index % 8) * 0.85).toFixed(1));
  const completionRate = 93 + (index % 6);
  const responseTimeHours = 1 + (index % 4);
  const averagePriceValue = 690 + index * 28;

  return {
    id: seed.id,
    name: seed.name,
    rating,
    reviews,
    distanceMiles,
    distanceLabel: `${distanceMiles.toFixed(1)} miles`,
    certifications: focus.certifications,
    specialties: focus.specialties,
    supportedVehicleTypes: focus.supportedVehicleTypes,
    supportedMakes: focus.supportedMakes,
    insurerPrograms: focus.insurerPrograms,
    averagePriceLabel: `$${averagePriceValue}`,
    averagePriceValue,
    completionRate,
    responseTimeHours,
    responseTimeLabel: `< ${responseTimeHours} hour${responseTimeHours === 1 ? "" : "s"}`,
    image: NY_METRO_HUB_IMAGES[index % NY_METRO_HUB_IMAGES.length],
    categoryRatings: {
      quality: Number(Math.min(5, rating + 0.1).toFixed(1)),
      service: rating,
      timeliness: Number(Math.min(5, 4.2 + (index % 5) * 0.15).toFixed(1)),
      value: Number(Math.min(5, 4.1 + (index % 4) * 0.2).toFixed(1)),
    },
    capabilityTags: focus.capabilityTags,
    serviceArea: seed.serviceArea,
    capacityBand: focus.capacityBand,
    aiSummary: `${focus.summary} Useful for NY metro QA route testing around ${seed.city}.`,
  };
}

export const NY_METRO_TEST_SHOP_LOCATIONS: Record<number, TestShopLocationRecord> =
  Object.fromEntries(
    NY_METRO_HUB_SEEDS.map((seed) => [
      seed.id,
      {
        coordinates: seed.coordinates,
        address: seed.address,
        city: seed.city,
        state: "NY",
        zipCode: seed.zipCode,
      },
    ])
  );

export const NY_METRO_TEST_SHOPS: ShopProfile[] = NY_METRO_HUB_SEEDS.map(buildNYMetroTestShop);

export const NY_METRO_SUGGESTED_ORIGINS: Place[] = [
  {
    name: "White Plains",
    address: "55 Court St",
    city: "White Plains",
    state: "NY",
    zipCode: "10601",
    latitude: 41.034,
    longitude: -73.763,
    placeId: "white-plains-ny",
  },
  {
    name: "Yonkers",
    address: "975 Central Park Ave",
    city: "Yonkers",
    state: "NY",
    zipCode: "10704",
    latitude: 40.937,
    longitude: -73.892,
    placeId: "yonkers-ny",
  },
  {
    name: "Poughkeepsie",
    address: "250 Main Mall",
    city: "Poughkeepsie",
    state: "NY",
    zipCode: "12601",
    latitude: 41.694,
    longitude: -73.921,
    placeId: "poughkeepsie-ny",
  },
  {
    name: "Garden City",
    address: "100 Seventh St",
    city: "Garden City",
    state: "NY",
    zipCode: "11530",
    latitude: 40.727,
    longitude: -73.634,
    placeId: "garden-city-ny",
  },
  {
    name: "Newburgh",
    address: "15 Liberty St",
    city: "Newburgh",
    state: "NY",
    zipCode: "12550",
    latitude: 41.503,
    longitude: -74.01,
    placeId: "newburgh-ny",
  },
  {
    name: "Nyack",
    address: "80 Main St",
    city: "Nyack",
    state: "NY",
    zipCode: "10960",
    latitude: 41.091,
    longitude: -73.919,
    placeId: "nyack-ny",
  },
];
