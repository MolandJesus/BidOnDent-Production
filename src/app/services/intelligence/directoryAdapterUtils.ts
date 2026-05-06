import type { Coordinates } from "../../types/mapDomain";
import type { ShopBusinessProfile } from "../../types/networkProfiles";
import type { DirectoryReport, DirectoryVehicle, MarketUserType } from "./marketIntelligence";

export const DIRECTORY_SHOP_ID_OFFSET = 10000;
export const DIRECTORY_INSURER_ID_OFFSET = 50000;

export const CITY_COORDINATE_DIRECTORY: Record<string, Coordinates> = {
  // NY coverage area — Westchester, Rockland, Dutchess, Nassau, Orange, Putnam
  "yonkers,ny": { latitude: 40.9312, longitude: -73.8988 },
  "white plains,ny": { latitude: 41.0534, longitude: -73.7629 },
  "new rochelle,ny": { latitude: 40.9115, longitude: -73.7826 },
  "mount vernon,ny": { latitude: 40.9126, longitude: -73.8371 },
  "spring valley,ny": { latitude: 41.1132, longitude: -74.0447 },
  "nanuet,ny": { latitude: 41.0937, longitude: -74.0135 },
  "nyack,ny": { latitude: 41.0909, longitude: -73.9179 },
  "poughkeepsie,ny": { latitude: 41.7004, longitude: -73.9209 },
  "beacon,ny": { latitude: 41.5034, longitude: -73.9696 },
  "fishkill,ny": { latitude: 41.5359, longitude: -73.8996 },
  "hempstead,ny": { latitude: 40.7062, longitude: -73.618 },
  "garden city,ny": { latitude: 40.7268, longitude: -73.6332 },
  "mineola,ny": { latitude: 40.7495, longitude: -73.6407 },
  "middletown,ny": { latitude: 41.445, longitude: -74.4229 },
  "newburgh,ny": { latitude: 41.5034, longitude: -74.0104 },
  "carmel,ny": { latitude: 41.4298, longitude: -73.6824 },
  "brewster,ny": { latitude: 41.3951, longitude: -73.6182 },
  // Pass 13b (2026-05-06) — extended coverage. Cross-checked against the
  // NY metro test hub seed (nyMetroTestHubSeedData.ts) so every seeded
  // city resolves to known coords instead of falling through to the
  // default White Plains anchor. Coordinates from the seed entries.
  "tarrytown,ny": { latitude: 41.076, longitude: -73.859 },
  "mount kisco,ny": { latitude: 41.209, longitude: -73.724 },
  "great neck,ny": { latitude: 40.801, longitude: -73.728 },
  "cold spring,ny": { latitude: 41.417, longitude: -73.958 },
  "scarsdale,ny": { latitude: 41.005, longitude: -73.787 },
  "mamaroneck,ny": { latitude: 40.949, longitude: -73.734 },
  "rye,ny": { latitude: 40.981, longitude: -73.683 },
  "haverstraw,ny": { latitude: 41.198, longitude: -73.968 },
  "rhinebeck,ny": { latitude: 41.927, longitude: -73.913 },
};

// KI-118 (2026-05-06) — anchor moved from Dallas, TX (32.7767, -96.797) to
// White Plains, NY. BidOnDent's launch region is the NY metro per
// LAW_PROJECT_RULES.md; shops without a matching entry in
// CITY_COORDINATE_DIRECTORY were previously placed in Texas, producing
// route distances of 700–1500 mi for in-frame NY-area destinations on the
// dashboard ROUTE card. White Plains is the geographic center of the
// locked NY metro directory (already a directory entry on its own).
const DEFAULT_COORDINATE_ANCHOR: Coordinates = {
  latitude: 41.0534,
  longitude: -73.7629,
};

const SHOP_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1666919643134-d97687c1826c?auto=format&fit=crop&w=800&q=80",
];

export function toKey(...values: Array<string | null | undefined>) {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

export function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

export function clampScore(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

export function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

export function buildApproximateCoordinates(
  seed: string,
  city?: string | null,
  state?: string | null
) {
  const cityKey = `${city || ""},${state || ""}`.toLowerCase();
  const anchor = CITY_COORDINATE_DIRECTORY[cityKey] || DEFAULT_COORDINATE_ANCHOR;
  const hash = hashString(seed);
  const latitudeOffset = ((hash % 1000) / 1000 - 0.5) * 0.18;
  const longitudeOffset = ((Math.floor(hash / 1000) % 1000) / 1000 - 0.5) * 0.24;

  return {
    latitude: anchor.latitude + latitudeOffset,
    longitude: anchor.longitude + longitudeOffset,
  };
}

export function inferShopImage(profile: ShopBusinessProfile) {
  if (profile.profileImageUrl) {
    return profile.profileImageUrl;
  }

  const seed = hashString(profile.websiteUserKey || profile.businessName);
  return SHOP_FALLBACK_IMAGES[seed % SHOP_FALLBACK_IMAGES.length];
}

export function inferCapacityBand(profile: ShopBusinessProfile) {
  if (!profile.isAcceptingBids) {
    return "boutique" as const;
  }

  if ((profile.completionRate || 0) >= 97 || (profile.specialties?.length || 0) >= 4) {
    return "balanced" as const;
  }

  if ((profile.totalReviews || 0) >= 120) {
    return "high-capacity" as const;
  }

  return "balanced" as const;
}

export function inferAverageTicketValue(profile: ShopBusinessProfile) {
  if (typeof profile.averageTicketValue === "number" && profile.averageTicketValue > 0) {
    return profile.averageTicketValue;
  }

  if (profile.specialties.some((specialty) => /luxury|ev|adas|frame/i.test(specialty))) {
    return 1050;
  }

  if (profile.specialties.some((specialty) => /hail|dent|pdr/i.test(specialty))) {
    return 760;
  }

  return 890;
}

export function inferSupportedMakes(profile: ShopBusinessProfile) {
  if (profile.supportedMakes.length > 0) {
    return profile.supportedMakes;
  }

  if (profile.specialties.some((specialty) => /luxury|exotic/i.test(specialty))) {
    return ["BMW", "Mercedes-Benz", "Audi", "Porsche"];
  }

  if (profile.specialties.some((specialty) => /ev|adas/i.test(specialty))) {
    return ["Tesla", "Rivian", "Hyundai", "Ford"];
  }

  return ["Toyota", "Honda", "Ford", "Chevrolet"];
}

export function inferInsurerPrograms(profile: ShopBusinessProfile) {
  if (profile.insurerPrograms.length > 0) {
    return profile.insurerPrograms;
  }

  if (profile.acceptsInsuranceClaims) {
    return ["Progressive", "State Farm"];
  }

  return [];
}

export function extractVehicleMakes(vehicles: DirectoryVehicle[]) {
  return uniqueStrings(vehicles.map((vehicle) => vehicle.make)).map((make) => make.toLowerCase());
}

export function extractDamageSignals(reports: DirectoryReport[]) {
  return uniqueStrings(
    reports.flatMap((report) => [
      report.damageArea,
      report.damageType,
      ...(Array.isArray(report.damageAreas) ? report.damageAreas : []),
      report.description,
    ])
  ).map((signal) => signal.toLowerCase());
}

export function buildReasons(
  userType: MarketUserType,
  searchTokens: string[],
  vehicleMakes: string[],
  damageSignals: string[],
  connectedCarrierNames: string[],
  profile: ShopBusinessProfile,
  supportedMakes: string[],
  insurerPrograms: string[]
) {
  const reasons: string[] = [];
  const matchingMakes = vehicleMakes.filter((make) =>
    supportedMakes.map((supportedMake) => supportedMake.toLowerCase()).includes(make)
  );
  const matchingCarriers = connectedCarrierNames.filter((carrierName) =>
    insurerPrograms.map((program) => program.toLowerCase()).includes(carrierName.toLowerCase())
  );
  const capabilityValues = [
    ...profile.specialties,
    ...profile.certifications,
    profile.aboutSummary || "",
  ]
    .join(" ")
    .toLowerCase();
  const capabilityMatch = damageSignals.find((signal) => capabilityValues.includes(signal));

  if (matchingCarriers.length > 0) {
    reasons.push(`Already aligned with ${matchingCarriers.slice(0, 2).join(" and ")} workflows`);
  }

  if (matchingMakes.length > 0) {
    reasons.push(`Strong fit for ${matchingMakes[0]} repair demand`);
  }

  if (capabilityMatch) {
    reasons.push(`Profile coverage matches ${capabilityMatch.replace(/-/g, " ")}`);
  }

  if (searchTokens.length > 0) {
    reasons.push("Matches the current directory search");
  }

  if (userType === "insurer" && profile.acceptsInsuranceClaims) {
    reasons.push("Already set up for insurer-facing intake");
  }

  if (reasons.length === 0) {
    reasons.push("Real profile data is now enriching this directory listing");
  }

  return reasons.slice(0, 3);
}
