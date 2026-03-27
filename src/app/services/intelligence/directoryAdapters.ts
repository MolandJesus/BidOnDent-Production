import type { Coordinates } from "../../types/mapDomain";
import type {
  InsurerBusinessProfile,
  ShopBusinessProfile,
} from "../../types/networkProfiles";
import type {
  DirectoryReport,
  DirectoryVehicle,
  InsuranceCompanyProfile,
  MarketUserType,
  ShopRecommendation,
} from "./marketIntelligence";

const DIRECTORY_SHOP_ID_OFFSET = 10000;
const DIRECTORY_INSURER_ID_OFFSET = 50000;

const CITY_COORDINATE_DIRECTORY: Record<string, Coordinates> = {
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
};

const SHOP_FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1666919643134-d97687c1826c?auto=format&fit=crop&w=800&q=80",
];

function toKey(...values: Array<string | null | undefined>) {
  return values
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function uniqueStrings(values: Array<string | null | undefined>) {
  return [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])];
}

function extractVehicleMakes(vehicles: DirectoryVehicle[]) {
  return uniqueStrings(vehicles.map((vehicle) => vehicle.make)).map((make) => make.toLowerCase());
}

function extractDamageSignals(reports: DirectoryReport[]) {
  return uniqueStrings(
    reports.flatMap((report) => [
      report.damageArea,
      report.damageType,
      ...(Array.isArray(report.damageAreas) ? report.damageAreas : []),
      report.description,
    ])
  ).map((signal) => signal.toLowerCase());
}

function clampScore(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

function hashString(value: string) {
  let hash = 2166136261;

  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return Math.abs(hash >>> 0);
}

function buildApproximateCoordinates(seed: string, city?: string | null, state?: string | null) {
  const cityKey = `${city || ""},${state || ""}`.toLowerCase();
  const anchor = CITY_COORDINATE_DIRECTORY[cityKey] || CITY_COORDINATE_DIRECTORY["dallas,tx"];
  const hash = hashString(seed);
  const latitudeOffset = (((hash % 1000) / 1000) - 0.5) * 0.18;
  const longitudeOffset = ((((Math.floor(hash / 1000) % 1000) / 1000) - 0.5) * 0.24);

  return {
    latitude: anchor.latitude + latitudeOffset,
    longitude: anchor.longitude + longitudeOffset,
  };
}

function inferShopImage(profile: ShopBusinessProfile) {
  if (profile.profileImageUrl) {
    return profile.profileImageUrl;
  }

  const seed = hashString(profile.websiteUserKey || profile.businessName);
  return SHOP_FALLBACK_IMAGES[seed % SHOP_FALLBACK_IMAGES.length];
}

function inferCapacityBand(profile: ShopBusinessProfile) {
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

function inferAverageTicketValue(profile: ShopBusinessProfile) {
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

function inferSupportedMakes(profile: ShopBusinessProfile) {
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

function inferInsurerPrograms(profile: ShopBusinessProfile) {
  if (profile.insurerPrograms.length > 0) {
    return profile.insurerPrograms;
  }

  if (profile.acceptsInsuranceClaims) {
    return ["Progressive", "State Farm"];
  }

  return [];
}

function buildReasons(
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
  const capabilityValues = [...profile.specialties, ...profile.certifications, profile.aboutSummary || ""]
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

export function getDirectoryShopId(profile: ShopBusinessProfile) {
  return DIRECTORY_SHOP_ID_OFFSET + (hashString(profile.websiteUserKey || profile.businessName) % 900000000);
}

export function getDirectoryInsurerId(profile: InsurerBusinessProfile) {
  return DIRECTORY_INSURER_ID_OFFSET + (hashString(profile.websiteUserKey || profile.companyName) % 900000000);
}

export function buildDirectoryShopRecommendations({
  connectedCarrierNames,
  directoryShops,
  filterRating,
  reports,
  searchQuery,
  userType,
  vehicles,
}: {
  connectedCarrierNames: string[];
  directoryShops: ShopBusinessProfile[];
  filterRating: number;
  reports: DirectoryReport[];
  searchQuery: string;
  userType: MarketUserType;
  vehicles: DirectoryVehicle[];
}) {
  const searchTokens = tokenize(searchQuery);
  const vehicleMakes = extractVehicleMakes(vehicles);
  const damageSignals = extractDamageSignals(reports);

  return directoryShops
    .filter((profile) => profile.isDirectoryVisible !== false)
    .map((profile) => {
      const rating = profile.averageRating || 4.6;
      if (filterRating > 0 && rating < filterRating) {
        return null;
      }

      const supportedMakes = inferSupportedMakes(profile);
      const insurerPrograms = inferInsurerPrograms(profile);
      const summary =
        profile.aboutSummary ||
        `${profile.businessName} is a real BidOnDent ${profile.businessCity || "market"} profile with ${profile.specialties.slice(0, 2).join(" and ") || "repair"} coverage.`;
      const searchableValues = [
        profile.businessName,
        profile.businessCity,
        profile.businessState,
        profile.businessZip,
        profile.businessAddress,
        profile.aboutSummary,
        ...profile.specialties,
        ...profile.certifications,
        ...supportedMakes,
        ...insurerPrograms,
      ];

      if (
        searchTokens.length > 0 &&
        !searchTokens.every((token) => searchableValues.join(" ").toLowerCase().includes(token))
      ) {
        return null;
      }

      const reviews = profile.totalReviews || 0;
      const completionRate = profile.completionRate || 95;
      const averageTicketValue = inferAverageTicketValue(profile);
      const responseTimeHours = profile.responseTimeHours || 3;
      const scoreBase =
        rating * 12 +
        Math.min(reviews, 200) * 0.08 +
        (completionRate - 85) * 0.8 +
        (profile.isAcceptingBids ? 4 : 0) +
        (profile.acceptsInsuranceClaims ? 6 : 0);
      const matchingCarriers = connectedCarrierNames.filter((carrierName) =>
        insurerPrograms.map((program) => program.toLowerCase()).includes(carrierName.toLowerCase())
      );
      const matchingMakes = vehicleMakes.filter((make) =>
        supportedMakes.map((supportedMake) => supportedMake.toLowerCase()).includes(make)
      );
      const capabilityValues = [...profile.specialties, ...profile.certifications, summary]
        .join(" ")
        .toLowerCase();
      const capabilityMatch = damageSignals.find((signal) => capabilityValues.includes(signal));
      const searchBonus = searchTokens.length > 0 ? 10 : 0;
      const carrierBonus = matchingCarriers.length > 0 ? 18 : 0;
      const makeBonus = matchingMakes.length > 0 ? 14 : 0;
      const specialtyBonus = capabilityMatch ? 16 : 0;
      const insurerWorkflowBonus = userType === "insurer" && profile.acceptsInsuranceClaims ? 8 : 0;
      const reasons = buildReasons(
        userType,
        searchTokens,
        vehicleMakes,
        damageSignals,
        connectedCarrierNames,
        profile,
        supportedMakes,
        insurerPrograms
      );

      return {
        aiSummary: summary,
        averagePriceLabel: `$${Math.round(averageTicketValue).toLocaleString()}`,
        averagePriceValue: averageTicketValue,
        capabilityTags: uniqueStrings([
          ...profile.specialties,
          ...profile.certifications,
          profile.acceptsInsuranceClaims ? "insurance-claims" : null,
          profile.offersEstimates ? "estimates" : null,
        ]).map((value) => value.toLowerCase().replace(/[^a-z0-9]+/g, "-")),
        capacityBand: inferCapacityBand(profile),
        categoryRatings: {
          quality: Math.min(5, rating + 0.1),
          service: rating,
          timeliness: Math.max(3.9, Math.min(5, 5 - responseTimeHours * 0.08)),
          value: Math.max(4, Math.min(5, 5 - (averageTicketValue - 650) / 900)),
        },
        certifications: profile.certifications,
        completionRate,
        distanceLabel: "Real profile",
        distanceMiles: 4.5,
        id: getDirectoryShopId(profile),
        image: inferShopImage(profile),
        insurerPrograms,
        insuranceCompatibilityScore: clampScore(matchingCarriers.length * 28 + rating * 10),
        matchReasons: reasons,
        name: profile.businessName,
        rating,
        recommendationScore: clampScore(
          scoreBase + searchBonus + carrierBonus + makeBonus + specialtyBonus + insurerWorkflowBonus
        ),
        responseTimeHours,
        responseTimeLabel: responseTimeHours <= 1 ? "< 1 hour" : `< ${responseTimeHours} hours`,
        reviews,
        serviceArea: `${profile.businessCity || "Metro"} ${profile.businessState || ""}`.trim(),
        specialties: profile.specialties,
        supportedMakes,
        supportedVehicleTypes: ["Daily Driver", "SUV", "Fleet"],
        topPick: false,
      } satisfies ShopRecommendation;
    })
    .filter(Boolean) as ShopRecommendation[];
}

export function getShopCoordinates(profile: ShopBusinessProfile) {
  if (typeof profile.geoLatitude === "number" && typeof profile.geoLongitude === "number") {
    return {
      latitude: profile.geoLatitude,
      longitude: profile.geoLongitude,
    };
  }

  return buildApproximateCoordinates(
    profile.websiteUserKey || profile.businessName,
    profile.businessCity,
    profile.businessState
  );
}

export function buildDirectoryInsuranceProfiles(directoryInsurers: InsurerBusinessProfile[]) {
  return directoryInsurers
    .filter((profile) => profile.isDirectoryVisible !== false)
    .map((profile) => {
      const description =
        profile.description ||
        `${profile.companyName} is a real BidOnDent insurer profile with ${profile.claimTypes.slice(0, 2).join(" and ") || "claims"} routing coverage.`;

      return {
        accountConnectionNotes:
          profile.accountConnectionNotes.length > 0
            ? profile.accountConnectionNotes
            : ["Provider-agnostic insurer profile now available for account connection"],
        benefits:
          profile.benefits.length > 0
            ? profile.benefits
            : ["Claims routing", "Repair-network coordination"],
        claimsPhone: profile.companyPhone || "(555) 010-2200",
        description,
        digitalClaimsExperience: profile.digitalClaimsExperience || "standard",
        headquarters: `${profile.companyCity || "White Plains"}, ${profile.companyState || "NY"}`,
        id: getDirectoryInsurerId(profile),
        name: profile.companyName,
        popular: profile.popular,
        repairProgramFocus:
          profile.repairProgramFocus.length > 0 ? profile.repairProgramFocus : profile.claimTypes,
      } satisfies InsuranceCompanyProfile;
    });
}

export function mergeDirectoryEntriesByName<T extends { name: string; id: number }>(
  seededEntries: T[],
  directoryEntries: T[]
) {
  const merged = new Map<string, T>();

  seededEntries.forEach((entry) => {
    merged.set(toKey(entry.name), entry);
  });

  directoryEntries.forEach((entry) => {
    merged.set(toKey(entry.name), entry);
  });

  return [...merged.values()];
}
