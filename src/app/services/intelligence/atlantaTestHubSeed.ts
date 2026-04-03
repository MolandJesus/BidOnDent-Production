import type { Coordinates, Place } from "../../types/mapDomain";
import type { ShopProfile } from "./marketIntelligence";
import {
  type AtlantaHubFocus,
  type AtlantaHubSeed,
  ATLANTA_HUB_IMAGES,
  ATLANTA_HUB_SEEDS,
} from "./atlantaTestHubSeedData";

export type TestShopLocationRecord = {
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

const FOCUS_PROFILES: Record<
  AtlantaHubFocus,
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

function buildAtlantaTestShop(seed: AtlantaHubSeed, index: number): ShopProfile {
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
    image: ATLANTA_HUB_IMAGES[index % ATLANTA_HUB_IMAGES.length],
    categoryRatings: {
      quality: Number(Math.min(5, rating + 0.1).toFixed(1)),
      service: rating,
      timeliness: Number(Math.min(5, 4.2 + (index % 5) * 0.15).toFixed(1)),
      value: Number(Math.min(5, 4.1 + (index % 4) * 0.2).toFixed(1)),
    },
    capabilityTags: focus.capabilityTags,
    serviceArea: seed.serviceArea,
    capacityBand: focus.capacityBand,
    aiSummary: `${focus.summary} Useful for Atlanta QA route testing around ${seed.city}.`,
  };
}

export const ATLANTA_TEST_SHOP_LOCATIONS: Record<number, TestShopLocationRecord> =
  Object.fromEntries(
    ATLANTA_HUB_SEEDS.map((seed) => [
      seed.id,
      {
        coordinates: seed.coordinates,
        address: seed.address,
        city: seed.city,
        state: "GA",
        zipCode: seed.zipCode,
      },
    ])
  );

export const ATLANTA_TEST_SHOPS: ShopProfile[] = ATLANTA_HUB_SEEDS.map(buildAtlantaTestShop);

export const ATLANTA_SUGGESTED_ORIGINS: Place[] = [
  {
    name: "Atlanta",
    address: "55 Trinity Ave SW",
    city: "Atlanta",
    state: "GA",
    zipCode: "30303",
    latitude: 33.749,
    longitude: -84.388,
    placeId: "atlanta-ga",
  },
  {
    name: "Buckhead",
    address: "3060 Peachtree Rd NW",
    city: "Atlanta",
    state: "GA",
    zipCode: "30305",
    latitude: 33.8392,
    longitude: -84.3794,
    placeId: "buckhead-atlanta-ga",
  },
  {
    name: "Decatur",
    address: "125 Clairemont Ave",
    city: "Decatur",
    state: "GA",
    zipCode: "30030",
    latitude: 33.7748,
    longitude: -84.2963,
    placeId: "decatur-ga",
  },
  {
    name: "Sandy Springs",
    address: "6400 Roswell Rd",
    city: "Sandy Springs",
    state: "GA",
    zipCode: "30328",
    latitude: 33.9304,
    longitude: -84.3733,
    placeId: "sandy-springs-ga",
  },
  {
    name: "Marietta",
    address: "205 Lawrence St NE",
    city: "Marietta",
    state: "GA",
    zipCode: "30060",
    latitude: 33.9526,
    longitude: -84.5499,
    placeId: "marietta-ga",
  },
  {
    name: "Alpharetta",
    address: "2 Park Plaza",
    city: "Alpharetta",
    state: "GA",
    zipCode: "30009",
    latitude: 34.0754,
    longitude: -84.2941,
    placeId: "alpharetta-ga",
  },
];
