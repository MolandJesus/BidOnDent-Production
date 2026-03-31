import type { Coordinates, Place } from "../../types/mapDomain";
import type { ShopProfile } from "./marketIntelligence";

export type TestShopLocationRecord = {
  coordinates: Coordinates;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

type AtlantaHubFocus =
  | "collision"
  | "luxury"
  | "pdr"
  | "ev"
  | "fleet"
  | "refinish"
  | "hail"
  | "claims";

type AtlantaHubSeed = {
  id: number;
  name: string;
  address: string;
  city: string;
  zipCode: string;
  coordinates: Coordinates;
  focus: AtlantaHubFocus;
  serviceArea: string;
};

const ATLANTA_HUB_IMAGES = [
  "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1666919643134-d97687c1826c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
];

const ATLANTA_HUB_SEEDS: AtlantaHubSeed[] = [
  {
    id: 101,
    name: "Downtown Atlanta Dent Center",
    address: "55 Trinity Ave SW",
    city: "Atlanta",
    zipCode: "30303",
    coordinates: { latitude: 33.749, longitude: -84.388 },
    focus: "claims",
    serviceArea: "Downtown core + Grady corridor",
  },
  {
    id: 102,
    name: "Midtown Precision Collision",
    address: "950 Peachtree St NE",
    city: "Atlanta",
    zipCode: "30309",
    coordinates: { latitude: 33.7825, longitude: -84.3875 },
    focus: "collision",
    serviceArea: "Midtown + Piedmont Park beltline",
  },
  {
    id: 103,
    name: "Buckhead Luxury Bodyworks",
    address: "3060 Peachtree Rd NW",
    city: "Atlanta",
    zipCode: "30305",
    coordinates: { latitude: 33.8392, longitude: -84.3794 },
    focus: "luxury",
    serviceArea: "Buckhead + Lenox luxury corridor",
  },
  {
    id: 104,
    name: "Old Fourth Ward PDR Studio",
    address: "680 North Ave NE",
    city: "Atlanta",
    zipCode: "30308",
    coordinates: { latitude: 33.7681, longitude: -84.3687 },
    focus: "pdr",
    serviceArea: "O4W + Inman Park",
  },
  {
    id: 105,
    name: "West End Claims Repair Hub",
    address: "1075 Lee St SW",
    city: "Atlanta",
    zipCode: "30310",
    coordinates: { latitude: 33.7457, longitude: -84.4128 },
    focus: "claims",
    serviceArea: "West End + Adair Park",
  },
  {
    id: 106,
    name: "East Atlanta Frame & Paint",
    address: "1300 Glenwood Ave SE",
    city: "Atlanta",
    zipCode: "30316",
    coordinates: { latitude: 33.7413, longitude: -84.3459 },
    focus: "refinish",
    serviceArea: "East Atlanta + Grant Park",
  },
  {
    id: 107,
    name: "Decatur ADAS & EV Center",
    address: "125 Clairemont Ave",
    city: "Decatur",
    zipCode: "30030",
    coordinates: { latitude: 33.7748, longitude: -84.2963 },
    focus: "ev",
    serviceArea: "Decatur + DeKalb urban core",
  },
  {
    id: 108,
    name: "Sandy Springs Direct Repair",
    address: "6400 Roswell Rd",
    city: "Sandy Springs",
    zipCode: "30328",
    coordinates: { latitude: 33.9304, longitude: -84.3733 },
    focus: "collision",
    serviceArea: "Sandy Springs + North Springs",
  },
  {
    id: 109,
    name: "Brookhaven Express Auto Body",
    address: "3911 Peachtree Rd NE",
    city: "Brookhaven",
    zipCode: "30319",
    coordinates: { latitude: 33.8601, longitude: -84.3394 },
    focus: "claims",
    serviceArea: "Brookhaven + Chastain",
  },
  {
    id: 110,
    name: "Chamblee Calibration Garage",
    address: "5200 Peachtree Blvd",
    city: "Chamblee",
    zipCode: "30341",
    coordinates: { latitude: 33.8925, longitude: -84.2988 },
    focus: "ev",
    serviceArea: "Chamblee + Buford Highway",
  },
  {
    id: 111,
    name: "Doraville Fleet & Commercial",
    address: "5800 Buford Hwy NE",
    city: "Doraville",
    zipCode: "30340",
    coordinates: { latitude: 33.9029, longitude: -84.28 },
    focus: "fleet",
    serviceArea: "Doraville + I-285 logistics belt",
  },
  {
    id: 112,
    name: "Tucker Dent & Glass Hub",
    address: "2325 Main St",
    city: "Tucker",
    zipCode: "30084",
    coordinates: { latitude: 33.8545, longitude: -84.2171 },
    focus: "pdr",
    serviceArea: "Tucker + Northlake",
  },
  {
    id: 113,
    name: "Stone Mountain Storm Repair",
    address: "875 Main St",
    city: "Stone Mountain",
    zipCode: "30083",
    coordinates: { latitude: 33.8082, longitude: -84.1702 },
    focus: "hail",
    serviceArea: "Stone Mountain + east DeKalb",
  },
  {
    id: 114,
    name: "College Park Quick Intake Collision",
    address: "3717 Main St",
    city: "College Park",
    zipCode: "30337",
    coordinates: { latitude: 33.6534, longitude: -84.4494 },
    focus: "collision",
    serviceArea: "College Park + airport south",
  },
  {
    id: 115,
    name: "Hapeville Airport Corridor Auto Body",
    address: "620 N Central Ave",
    city: "Hapeville",
    zipCode: "30354",
    coordinates: { latitude: 33.6596, longitude: -84.4107 },
    focus: "claims",
    serviceArea: "Hapeville + airport loop",
  },
  {
    id: 116,
    name: "East Point Claims Concierge",
    address: "2793 Main St",
    city: "East Point",
    zipCode: "30344",
    coordinates: { latitude: 33.6796, longitude: -84.4394 },
    focus: "claims",
    serviceArea: "East Point + Camp Creek",
  },
  {
    id: 117,
    name: "Smyrna Refinish Works",
    address: "1275 Spring Rd SE",
    city: "Smyrna",
    zipCode: "30080",
    coordinates: { latitude: 33.883, longitude: -84.5144 },
    focus: "refinish",
    serviceArea: "Smyrna + Vinings",
  },
  {
    id: 118,
    name: "Marietta Frame & Dent Lab",
    address: "205 Lawrence St NE",
    city: "Marietta",
    zipCode: "30060",
    coordinates: { latitude: 33.9526, longitude: -84.5499 },
    focus: "collision",
    serviceArea: "Marietta square + south Cobb",
  },
  {
    id: 119,
    name: "Kennesaw Collision Network",
    address: "2829 Cherokee St NW",
    city: "Kennesaw",
    zipCode: "30144",
    coordinates: { latitude: 34.0234, longitude: -84.6155 },
    focus: "fleet",
    serviceArea: "Kennesaw + I-75 northbound",
  },
  {
    id: 120,
    name: "Roswell Premium Repair House",
    address: "38 Hill St",
    city: "Roswell",
    zipCode: "30075",
    coordinates: { latitude: 34.0232, longitude: -84.3616 },
    focus: "luxury",
    serviceArea: "Roswell + Crabapple",
  },
  {
    id: 121,
    name: "Alpharetta EV & Sensor Center",
    address: "2 Park Plaza",
    city: "Alpharetta",
    zipCode: "30009",
    coordinates: { latitude: 34.0754, longitude: -84.2941 },
    focus: "ev",
    serviceArea: "Alpharetta + Avalon tech corridor",
  },
  {
    id: 122,
    name: "Johns Creek Family Auto Body",
    address: "11360 Lakefield Dr",
    city: "Johns Creek",
    zipCode: "30097",
    coordinates: { latitude: 34.0289, longitude: -84.1986 },
    focus: "claims",
    serviceArea: "Johns Creek + Medlock Bridge",
  },
  {
    id: 123,
    name: "Duluth Claims Ready Collision",
    address: "3167 Main St",
    city: "Duluth",
    zipCode: "30096",
    coordinates: { latitude: 34.0029, longitude: -84.1446 },
    focus: "collision",
    serviceArea: "Duluth + Gwinnett spine",
  },
  {
    id: 124,
    name: "Peachtree Corners Mobility Repair",
    address: "310 Technology Pkwy",
    city: "Peachtree Corners",
    zipCode: "30092",
    coordinates: { latitude: 33.9699, longitude: -84.2215 },
    focus: "ev",
    serviceArea: "Peachtree Corners + Norcross tech campuses",
  },
];

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
