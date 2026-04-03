import type { CoveragePartnerShop } from "../../components/maps/serviceCoverageMapTypes";
import type { InsurerBusinessProfile, ShopBusinessProfile } from "../../types/networkProfiles";
import type {
  DirectoryReport,
  DirectoryVehicle,
  InsuranceCompanyProfile,
  MarketUserType,
  ShopRecommendation,
} from "./marketIntelligence";
import {
  DIRECTORY_SHOP_ID_OFFSET,
  DIRECTORY_INSURER_ID_OFFSET,
  toKey,
  tokenize,
  uniqueStrings,
  clampScore,
  hashString,
  buildApproximateCoordinates,
  inferShopImage,
  inferCapacityBand,
  inferAverageTicketValue,
  inferSupportedMakes,
  inferInsurerPrograms,
} from "./directoryAdapterUtils";

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

export function getDirectoryShopId(profile: ShopBusinessProfile) {
  return (
    DIRECTORY_SHOP_ID_OFFSET +
    (hashString(profile.websiteUserKey || profile.businessName) % 900000000)
  );
}

export function getDirectoryInsurerId(profile: InsurerBusinessProfile) {
  return (
    DIRECTORY_INSURER_ID_OFFSET +
    (hashString(profile.websiteUserKey || profile.companyName) % 900000000)
  );
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
        insuranceCompatibilityScore:
          connectedCarrierNames.length > 0
            ? clampScore(matchingCarriers.length * 28 + rating * 10)
            : 0,
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

export function convertPartnerShopsToProfiles(
  partnerShops: CoveragePartnerShop[]
): ShopBusinessProfile[] {
  return partnerShops.map((shop) => ({
    id: shop.id,
    websiteUserKey: `partner-shop-${shop.id || shop.name}`,
    businessName: shop.name,
    businessAddress: shop.addressLine || "",
    businessCity: shop.label?.split(",")[0]?.trim() || "",
    businessState: shop.label?.split(",")[1]?.trim() || "NY",
    businessZip: "",
    businessPhone: shop.phoneNumber || "",
    certifications: [],
    specialties: shop.specialties,
    acceptsInsuranceClaims: true,
    offersEstimates: true,
    insurerPrograms: [],
    supportedMakes: [],
    averageRating: shop.rating,
    totalReviews: null,
    isAcceptingBids: true,
    averageTicketValue: null,
    responseTimeHours: null,
    completionRate: null,
    profileImageUrl: null,
    aboutSummary: null,
    geoLatitude: shop.lat,
    geoLongitude: shop.lng,
    isDirectoryVisible: true,
    website: null,
    businessHours: null,
  }));
}
