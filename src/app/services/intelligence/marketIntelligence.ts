import type { ShopSortOption } from "../auth/websiteIdentity";
import type { InsurerBusinessProfile } from "../../types/networkProfiles";
import { buildDirectoryInsuranceProfiles, mergeDirectoryEntriesByName } from "./directoryAdapters";
import { INSURERS, SHOPS } from "./marketSeedData";
import { getLocationForShop } from "./shopMapData";

export type MarketUserType = "customer" | "shop" | "insurer";

export interface DirectoryVehicle {
  make?: string;
  model?: string;
  year?: string | number;
}

export interface DirectoryReport {
  damageArea?: string;
  damageAreas?: string[];
  damageType?: string;
  description?: string;
  insurance_company?: string;
}

export interface RecommendationContext {
  userType: MarketUserType;
  searchQuery?: string;
  vehicles?: DirectoryVehicle[];
  reports?: DirectoryReport[];
  connectedInsurerIds?: number[];
}

export interface ShopProfile {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  distanceMiles: number;
  distanceLabel: string;
  certifications: string[];
  specialties: string[];
  supportedVehicleTypes: string[];
  supportedMakes: string[];
  insurerPrograms: string[];
  averagePriceLabel: string;
  averagePriceValue: number;
  completionRate: number;
  responseTimeHours: number;
  responseTimeLabel: string;
  image: string;
  categoryRatings: {
    quality: number;
    service: number;
    timeliness: number;
    value: number;
  };
  capabilityTags: string[];
  serviceArea: string;
  capacityBand: "boutique" | "balanced" | "high-capacity";
  aiSummary: string;
}

export interface ShopRecommendation extends ShopProfile {
  recommendationScore: number;
  insuranceCompatibilityScore: number;
  matchReasons: string[];
  topPick: boolean;
}

export interface InsuranceCompanyProfile {
  id: number;
  name: string;
  description: string;
  headquarters: string;
  claimsPhone: string;
  accountConnectionNotes: string[];
  benefits: string[];
  popular: boolean;
  repairProgramFocus: string[];
  digitalClaimsExperience: "standard" | "strong" | "excellent";
}

export interface InsuranceRecommendation extends InsuranceCompanyProfile {
  fitScore: number;
  connectionReasons: string[];
  connected: boolean;
}

export interface IntelligenceSummary {
  title: string;
  description: string;
  callouts: string[];
}

function tokenize(value?: string) {
  return (value || "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .map((token) => token.trim())
    .filter(Boolean);
}

function extractVehicleMakes(vehicles: DirectoryVehicle[]) {
  return vehicles
    .map((vehicle) => vehicle.make?.trim())
    .filter(Boolean)
    .map((make) => make!.toLowerCase());
}

function extractDamageSignals(reports: DirectoryReport[]) {
  return reports.flatMap((report) => {
    const directDamageAreas = Array.isArray(report.damageAreas) ? report.damageAreas : [];
    const candidateValues = [
      report.damageArea,
      report.damageType,
      report.description,
      ...directDamageAreas,
    ];

    return candidateValues.filter(Boolean).flatMap((value) => tokenize(String(value)));
  });
}

function clampScore(value: number) {
  return Math.max(1, Math.min(100, Math.round(value)));
}

function uniqueTopReasons(reasons: string[]) {
  return [...new Set(reasons)].slice(0, 3);
}

function matchesSearchQuery(tokens: string[], values: string[]) {
  if (tokens.length === 0) {
    return true;
  }

  const haystack = values.join(" ").toLowerCase();
  return tokens.every((token) => haystack.includes(token));
}

function getConnectedInsurerNames(
  connectedInsurerIds: number[],
  directoryInsurers: InsurerBusinessProfile[] = []
) {
  return getInsuranceDirectory(directoryInsurers)
    .filter((insurer) => connectedInsurerIds.includes(insurer.id))
    .map((insurer) => insurer.name);
}

export function getInsuranceDirectory(directoryInsurers: InsurerBusinessProfile[] = []) {
  if (directoryInsurers.length === 0) {
    return INSURERS;
  }

  return mergeDirectoryEntriesByName(INSURERS, buildDirectoryInsuranceProfiles(directoryInsurers));
}

export function getShopDirectory() {
  return SHOPS;
}

export function buildShopRecommendations({
  userType,
  searchQuery = "",
  vehicles = [],
  reports = [],
  connectedInsurerIds = [],
  filterRating = 0,
  sortBy = "smart-match",
}: RecommendationContext & {
  filterRating?: number;
  sortBy?: ShopSortOption;
}): ShopRecommendation[] {
  const searchTokens = tokenize(searchQuery);
  const vehicleMakes = extractVehicleMakes(vehicles);
  const damageSignals = extractDamageSignals(reports);
  const connectedInsurerNames = getConnectedInsurerNames(connectedInsurerIds);

  const recommendations = SHOPS.filter((shop) => {
    if (filterRating > 0 && shop.rating < filterRating) {
      return false;
    }

    return matchesSearchQuery(searchTokens, [
      shop.name,
      ...shop.specialties,
      ...shop.certifications,
      ...shop.capabilityTags,
      ...shop.supportedMakes,
      ...shop.insurerPrograms,
      shop.aiSummary,
      ...((): string[] => {
        const loc = getLocationForShop(shop.id);
        return [loc.city, loc.state, loc.zipCode, loc.address];
      })(),
    ]);
  }).map((shop) => {
    let score = shop.rating * 12 + Math.min(shop.reviews, 200) * 0.08;
    score += Math.max(0, 12 - shop.distanceMiles);
    score += (shop.completionRate - 85) * 0.8;

    const reasons: string[] = [];

    const insurerOverlap = connectedInsurerNames.filter((carrierName) =>
      shop.insurerPrograms.includes(carrierName)
    );
    if (insurerOverlap.length > 0) {
      score += 18;
      reasons.push(`Works well with ${insurerOverlap.slice(0, 2).join(" and ")} claims`);
    }

    const matchingMakes = vehicleMakes.filter((make) =>
      shop.supportedMakes.map((supportedMake) => supportedMake.toLowerCase()).includes(make)
    );
    if (matchingMakes.length > 0) {
      score += 14;
      reasons.push(`Strong fit for ${matchingMakes[0]} repair work`);
    }

    const capabilityMatch = damageSignals.find((signal) =>
      [...shop.specialties, ...shop.capabilityTags]
        .join(" ")
        .toLowerCase()
        .includes(signal.toLowerCase())
    );
    if (capabilityMatch) {
      score += 16;
      reasons.push(`Specialty match for ${capabilityMatch.replace(/-/g, " ")}`);
    }

    if (searchTokens.length > 0) {
      score += 10;
      reasons.push("Matches your current search closely");
    }

    if (userType === "insurer" && shop.insurerPrograms.length >= 3) {
      score += 8;
      reasons.push("Already optimized for insurer-connected workflows");
    }

    if (shop.capacityBand === "high-capacity") {
      score += 4;
      reasons.push("Can absorb higher claim volume without long delays");
    }

    const insuranceCompatibilityScore =
      connectedInsurerIds.length > 0
        ? clampScore(insurerOverlap.length * 28 + shop.rating * 10)
        : 0;

    return {
      ...shop,
      recommendationScore: clampScore(score),
      insuranceCompatibilityScore,
      matchReasons: uniqueTopReasons(
        reasons.length > 0
          ? reasons
          : [
              "Balanced quality, response speed, and repair throughput",
              "Solid default fit when you want a safe all-around option",
            ]
      ),
      topPick: false,
    };
  });

  const sortedRecommendations = [...recommendations].sort((left, right) => {
    if (sortBy === "rating") {
      return right.rating - left.rating;
    }

    if (sortBy === "reviews") {
      return right.reviews - left.reviews;
    }

    if (sortBy === "distance") {
      return left.distanceMiles - right.distanceMiles;
    }

    return right.recommendationScore - left.recommendationScore;
  });

  if (sortedRecommendations[0]) {
    sortedRecommendations[0] = {
      ...sortedRecommendations[0],
      topPick: true,
    };
  }

  return sortedRecommendations;
}

export function buildInsuranceRecommendations({
  searchQuery = "",
  reports = [],
  connectedInsurerIds = [],
  directoryInsurers = [],
}: Pick<RecommendationContext, "searchQuery" | "reports" | "connectedInsurerIds"> & {
  directoryInsurers?: InsurerBusinessProfile[];
}): InsuranceRecommendation[] {
  const searchTokens = tokenize(searchQuery);
  const damageSignals = extractDamageSignals(reports);
  const insurerDirectory = getInsuranceDirectory(directoryInsurers);

  return insurerDirectory
    .filter((insurer) =>
      matchesSearchQuery(searchTokens, [
        insurer.name,
        insurer.description,
        insurer.headquarters,
        ...insurer.benefits,
        ...insurer.repairProgramFocus,
        ...insurer.accountConnectionNotes,
      ])
    )
    .map((insurer) => {
      let fitScore = insurer.popular ? 55 : 48;
      const connectionReasons: string[] = [];

      if (connectedInsurerIds.includes(insurer.id)) {
        fitScore += 24;
        connectionReasons.push("Already connected for this signed-in user");
      }

      if (insurer.digitalClaimsExperience === "excellent") {
        fitScore += 10;
        connectionReasons.push("Strong digital claims workflow");
      } else if (insurer.digitalClaimsExperience === "strong") {
        fitScore += 6;
      }

      const damageSignalMatch = damageSignals.find((signal) =>
        insurer.repairProgramFocus.join(" ").toLowerCase().includes(signal)
      );
      if (damageSignalMatch) {
        fitScore += 12;
        connectionReasons.push(`Relevant for ${damageSignalMatch.replace(/-/g, " ")} claims`);
      }

      if (searchTokens.length > 0) {
        fitScore += 8;
        connectionReasons.push("Matches your current insurer search");
      }

      if (connectionReasons.length === 0) {
        connectionReasons.push("Strong baseline fit for account connection and claims routing");
      }

      return {
        ...insurer,
        fitScore: clampScore(fitScore),
        connectionReasons: uniqueTopReasons(connectionReasons),
        connected: connectedInsurerIds.includes(insurer.id),
      };
    })
    .sort((left, right) => {
      if (left.connected !== right.connected) {
        return left.connected ? -1 : 1;
      }

      return right.fitScore - left.fitScore;
    });
}

export function buildShopIntelligenceSummary(
  recommendations: ShopRecommendation[],
  context: RecommendationContext
): IntelligenceSummary {
  const topRecommendation = recommendations[0];
  const connectedCarrierCount = context.connectedInsurerIds?.length || 0;

  if (!topRecommendation) {
    return {
      title: "No shops matched",
      description:
        "Try broadening the search, switching to Smart Match, or removing the 4.5+ filter.",
      callouts: ["Fallback path: broaden search or sort by distance."],
    };
  }

  return {
    title: `${topRecommendation.name} is your smartest current match`,
    description: topRecommendation.aiSummary,
    callouts: [
      `${topRecommendation.recommendationScore}% fit score driven by quality, specialization, and distance.`,
      connectedCarrierCount > 0
        ? `${connectedCarrierCount} connected insurer preference${connectedCarrierCount > 1 ? "s" : ""} are influencing rankings.`
        : "Rankings are currently leaning on vehicle, damage, quality, and distance signals.",
      topRecommendation.matchReasons[0],
    ],
  };
}

export function buildInsuranceIntelligenceSummary(
  recommendations: InsuranceRecommendation[]
): IntelligenceSummary {
  const topRecommendation = recommendations[0];

  if (!topRecommendation) {
    return {
      title: "No insurers matched that search",
      description: "Try a carrier name, claim workflow term, or region instead.",
      callouts: ["Fallback path: show the full carrier directory."],
    };
  }

  return {
    title: `${topRecommendation.name} is the strongest current carrier match`,
    description: `${topRecommendation.description} Headquarters: ${topRecommendation.headquarters}.`,
    callouts: [
      `${topRecommendation.fitScore}% connection fit for the current search and account context.`,
      topRecommendation.connectionReasons[0],
      `Claims line: ${topRecommendation.claimsPhone}`,
    ],
  };
}
