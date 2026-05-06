import type { ShopSortOption } from "../auth/websiteIdentity";
import type { InsurerBusinessProfile } from "../../types/networkProfiles";
import { SHOPS } from "./marketSeedData";
import { getLocationForShop } from "./shopMapData";
import {
  type DirectoryVehicle,
  type DirectoryReport,
  type RecommendationContext,
  type ShopProfile,
  type ShopRecommendation,
  type InsuranceCompanyProfile,
  type InsuranceRecommendation,
  type IntelligenceSummary,
  type MarketUserType,
  tokenize,
  extractVehicleMakes,
  extractDamageSignals,
  clampScore,
  uniqueTopReasons,
  matchesSearchQuery,
  getConnectedInsurerNames,
  getInsuranceDirectory,
} from "./marketIntelligenceHelpers";

export type {
  MarketUserType,
  DirectoryVehicle,
  DirectoryReport,
  RecommendationContext,
  ShopProfile,
  ShopRecommendation,
  InsuranceCompanyProfile,
  InsuranceRecommendation,
  IntelligenceSummary,
};

export { getInsuranceDirectory };

/**
 * F-24 (KI-099): the shop directory currently sources entirely from
 * `marketSeedShops.ts` (CORE_SHOPS) — fabricated names, ratings, reviews,
 * certifications, and Unsplash photos. Used in the dashboard "Recommended
 * Shops" surface, full map, AI matching, etc. Soft-launch trust risk.
 *
 * This flag drives the `<PreviewDirectoryNotice />` banner shown above
 * recommended-shop surfaces, setting honest user expectations until the
 * full-Supabase-swap (KI-100) is in place. Flip to `false` (or compute
 * from the real-data path's resolved count) when `buildShopRecommendations`
 * queries Supabase `public_partner_shops` directly.
 *
 * The landing-side "Coverage" surface is NOT affected — it already uses
 * `useCoveragePartnerShops` which fetches real Supabase rows + falls back
 * to demo only on DEV / `VITE_ENABLE_MAP_DEMO_FALLBACK=true`.
 */
export const SHOP_DIRECTORY_IS_PREVIEW = true;

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
      `${topRecommendation.fitScore}% match for your repair needs.`,
      topRecommendation.connectionReasons[0],
      `Claims line: ${topRecommendation.claimsPhone}`,
    ],
  };
}
