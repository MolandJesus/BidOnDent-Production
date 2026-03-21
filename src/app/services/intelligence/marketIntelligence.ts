import type { ShopSortOption } from "../auth/websiteIdentity";
import type { InsurerBusinessProfile } from "../../types/networkProfiles";
import {
  buildDirectoryInsuranceProfiles,
  mergeDirectoryEntriesByName,
} from "./directoryAdapters";

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

const SHOPS: ShopProfile[] = [
  {
    id: 1,
    name: "Express Auto Body",
    rating: 4.8,
    reviews: 124,
    distanceMiles: 2.4,
    distanceLabel: "2.4 miles",
    certifications: ["ASE Certified", "I-CAR Gold Class"],
    specialties: ["Collision Repair", "Paintless Dent Removal", "Insurance Claims"],
    supportedVehicleTypes: ["Daily Driver", "Fleet", "SUV"],
    supportedMakes: ["Toyota", "Honda", "Ford", "Chevrolet"],
    insurerPrograms: ["State Farm", "Geico", "Progressive"],
    averagePriceLabel: "$850",
    averagePriceValue: 850,
    completionRate: 98,
    responseTimeHours: 2,
    responseTimeLabel: "< 2 hours",
    image:
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80",
    categoryRatings: {
      quality: 4.9,
      service: 4.7,
      timeliness: 4.8,
      value: 4.6,
    },
    capabilityTags: ["collision", "pdr", "insurance-approved", "fast-intake"],
    serviceArea: "Central city + inner suburbs",
    capacityBand: "balanced",
    aiSummary: "Strong all-around collision shop with quick intake and broad insurer familiarity.",
  },
  {
    id: 2,
    name: "Premium Collision Center",
    rating: 4.7,
    reviews: 91,
    distanceMiles: 3.8,
    distanceLabel: "3.8 miles",
    certifications: ["Tesla Certified", "BMW Certified", "Aluminum Repair"],
    specialties: ["Luxury Vehicle Repair", "Frame Straightening", "ADAS Calibration"],
    supportedVehicleTypes: ["Luxury", "EV", "SUV"],
    supportedMakes: ["Tesla", "BMW", "Mercedes-Benz", "Audi"],
    insurerPrograms: ["Progressive", "Allstate", "Liberty Mutual"],
    averagePriceLabel: "$925",
    averagePriceValue: 925,
    completionRate: 95,
    responseTimeHours: 3,
    responseTimeLabel: "< 3 hours",
    image:
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80",
    categoryRatings: {
      quality: 4.8,
      service: 4.6,
      timeliness: 4.5,
      value: 4.4,
    },
    capabilityTags: ["luxury", "ev", "adas", "frame"],
    serviceArea: "Metro-wide",
    capacityBand: "balanced",
    aiSummary: "Best fit for premium brands, EV work, and structural repairs that need calibration.",
  },
  {
    id: 3,
    name: "Value Auto Repair",
    rating: 4.3,
    reviews: 67,
    distanceMiles: 1.5,
    distanceLabel: "1.5 miles",
    certifications: ["AAA Approved"],
    specialties: ["Budget Repairs", "Insurance Claims", "Bumper Work"],
    supportedVehicleTypes: ["Daily Driver", "Compact", "Sedan"],
    supportedMakes: ["Toyota", "Honda", "Nissan", "Hyundai"],
    insurerPrograms: ["Geico", "State Farm"],
    averagePriceLabel: "$675",
    averagePriceValue: 675,
    completionRate: 92,
    responseTimeHours: 4,
    responseTimeLabel: "< 4 hours",
    image:
      "https://images.unsplash.com/photo-1666919643134-d97687c1826c?auto=format&fit=crop&w=800&q=80",
    categoryRatings: {
      quality: 4.1,
      service: 4.3,
      timeliness: 4.0,
      value: 4.7,
    },
    capabilityTags: ["budget", "claim-friendly", "daily-driver"],
    serviceArea: "North side neighborhoods",
    capacityBand: "high-capacity",
    aiSummary: "Good budget-oriented match when price sensitivity matters more than boutique service.",
  },
  {
    id: 4,
    name: "Elite Auto Works",
    rating: 4.9,
    reviews: 203,
    distanceMiles: 5.2,
    distanceLabel: "5.2 miles",
    certifications: ["Mercedes Certified", "Porsche Approved", "Jaguar Land Rover Authorized"],
    specialties: ["Exotic Cars", "Custom Paint", "Concierge Pickup"],
    supportedVehicleTypes: ["Luxury", "Exotic", "Collector"],
    supportedMakes: ["Porsche", "Mercedes-Benz", "Ferrari", "Lamborghini"],
    insurerPrograms: ["Chubb", "Progressive", "Nationwide"],
    averagePriceLabel: "$1,250",
    averagePriceValue: 1250,
    completionRate: 99,
    responseTimeHours: 1,
    responseTimeLabel: "< 1 hour",
    image:
      "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=800&q=80",
    categoryRatings: {
      quality: 5.0,
      service: 4.9,
      timeliness: 4.8,
      value: 4.5,
    },
    capabilityTags: ["luxury", "exotic", "concierge", "premium-paint"],
    serviceArea: "Regional luxury corridor",
    capacityBand: "boutique",
    aiSummary: "High-touch option for luxury and exotic vehicles where finish quality matters most.",
  },
  {
    id: 5,
    name: "Metro ADAS & EV Center",
    rating: 4.8,
    reviews: 88,
    distanceMiles: 4.1,
    distanceLabel: "4.1 miles",
    certifications: ["Rivian Certified", "Tesla Certified", "ADAS Calibration Lab"],
    specialties: ["EV Structural Repair", "Sensor Calibration", "Battery Safety Checks"],
    supportedVehicleTypes: ["EV", "Luxury", "Fleet"],
    supportedMakes: ["Tesla", "Rivian", "Lucid", "Hyundai"],
    insurerPrograms: ["Progressive", "USAA", "Allstate"],
    averagePriceLabel: "$1,050",
    averagePriceValue: 1050,
    completionRate: 96,
    responseTimeHours: 2,
    responseTimeLabel: "< 2 hours",
    image:
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=800&q=80",
    categoryRatings: {
      quality: 4.9,
      service: 4.6,
      timeliness: 4.7,
      value: 4.3,
    },
    capabilityTags: ["ev", "adas", "calibration", "structural"],
    serviceArea: "Metro + airport corridor",
    capacityBand: "balanced",
    aiSummary: "Best technical fit for EV repairs, sensor recalibration, and modern vehicle electronics.",
  },
  {
    id: 6,
    name: "Hail & Dent Rescue",
    rating: 4.6,
    reviews: 149,
    distanceMiles: 3.2,
    distanceLabel: "3.2 miles",
    certifications: ["PDR Nation Member", "I-CAR Platinum Individual"],
    specialties: ["Hail Damage", "Paintless Dent Removal", "Mobile Estimates"],
    supportedVehicleTypes: ["Daily Driver", "Truck", "SUV"],
    supportedMakes: ["Ford", "Chevrolet", "Toyota", "Ram"],
    insurerPrograms: ["State Farm", "Farmers Insurance", "Nationwide"],
    averagePriceLabel: "$720",
    averagePriceValue: 720,
    completionRate: 97,
    responseTimeHours: 1,
    responseTimeLabel: "< 1 hour",
    image:
      "https://images.unsplash.com/photo-1486496572940-2bb2341fdbdf?auto=format&fit=crop&w=800&q=80",
    categoryRatings: {
      quality: 4.7,
      service: 4.8,
      timeliness: 4.9,
      value: 4.6,
    },
    capabilityTags: ["hail", "pdr", "mobile-estimate", "fast-turn"],
    serviceArea: "County-wide storm response",
    capacityBand: "high-capacity",
    aiSummary: "Fastest hail and dent specialist, especially strong when volume spikes after storms.",
  },
  {
    id: 7,
    name: "Fleet & Commercial Bodyworks",
    rating: 4.5,
    reviews: 75,
    distanceMiles: 6.5,
    distanceLabel: "6.5 miles",
    certifications: ["ASE Certified", "Commercial Fleet Partner"],
    specialties: ["Fleet Repair", "Heavy-Duty Collision", "Box Truck Body Work"],
    supportedVehicleTypes: ["Fleet", "Commercial", "Truck"],
    supportedMakes: ["Ford", "Chevrolet", "Ram", "Freightliner"],
    insurerPrograms: ["Nationwide", "Liberty Mutual", "Travelers"],
    averagePriceLabel: "$1,180",
    averagePriceValue: 1180,
    completionRate: 94,
    responseTimeHours: 2,
    responseTimeLabel: "< 2 hours",
    image:
      "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=800&q=80",
    categoryRatings: {
      quality: 4.6,
      service: 4.4,
      timeliness: 4.5,
      value: 4.4,
    },
    capabilityTags: ["fleet", "commercial", "truck", "high-capacity"],
    serviceArea: "Industrial belt + regional routes",
    capacityBand: "high-capacity",
    aiSummary: "Best operational fit for fleets, work trucks, and insurers managing commercial volume.",
  },
  {
    id: 8,
    name: "Glass, Alignment & Refinish Hub",
    rating: 4.4,
    reviews: 112,
    distanceMiles: 2.8,
    distanceLabel: "2.8 miles",
    certifications: ["Safelite Partner", "Hunter Alignment Certified"],
    specialties: ["Auto Glass", "Wheel Alignment", "Refinish Blending"],
    supportedVehicleTypes: ["Daily Driver", "SUV", "Luxury"],
    supportedMakes: ["Toyota", "Honda", "Subaru", "BMW"],
    insurerPrograms: ["Geico", "Allstate", "Liberty Mutual"],
    averagePriceLabel: "$790",
    averagePriceValue: 790,
    completionRate: 93,
    responseTimeHours: 3,
    responseTimeLabel: "< 3 hours",
    image:
      "https://images.unsplash.com/photo-1486006920555-c77dcf18193c?auto=format&fit=crop&w=800&q=80",
    categoryRatings: {
      quality: 4.4,
      service: 4.5,
      timeliness: 4.6,
      value: 4.3,
    },
    capabilityTags: ["glass", "alignment", "refinish", "supplemental"],
    serviceArea: "City ring + nearby commuter towns",
    capacityBand: "balanced",
    aiSummary: "Useful specialist for glass, alignment, and finish work paired with collision claims.",
  },
];

const INSURERS: InsuranceCompanyProfile[] = [
  {
    id: 1,
    name: "State Farm",
    description: "America's largest auto insurer with broad direct-repair relationships.",
    headquarters: "Bloomington, Illinois",
    claimsPhone: "800-SF-CLAIM",
    accountConnectionNotes: [
      "Strong fit when customers want established DRP-style repair routing.",
      "Often useful for claim-status updates and preferred-network introductions.",
    ],
    benefits: ["Direct claim filing", "Repair network depth", "Strong catastrophe handling"],
    popular: true,
    repairProgramFocus: ["collision", "hail", "network-shops"],
    digitalClaimsExperience: "strong",
  },
  {
    id: 2,
    name: "Geico",
    description: "Digital-first carrier with high-volume auto claims and strong consumer familiarity.",
    headquarters: "Chevy Chase, Maryland",
    claimsPhone: "800-841-3000",
    accountConnectionNotes: [
      "Works well for fast consumer claim intake and self-service account lookup.",
      "Useful where price-conscious customers want a familiar carrier workflow.",
    ],
    benefits: ["Fast processing", "Mobile app support", "Wide brand familiarity"],
    popular: true,
    repairProgramFocus: ["collision", "glass", "consumer-self-service"],
    digitalClaimsExperience: "excellent",
  },
  {
    id: 3,
    name: "Progressive",
    description: "Carrier with strong digital claims tooling and broad repair program coverage.",
    headquarters: "Mayfield Village, Ohio",
    claimsPhone: "800-776-4737",
    accountConnectionNotes: [
      "Useful when pairing claims with modern estimate and photo-submission workflows.",
      "Often a strong fit for EV and ADAS-heavy claims in a digital journey.",
    ],
    benefits: ["Photo estimates", "Digital claim workflow", "Broad program participation"],
    popular: true,
    repairProgramFocus: ["ev", "collision", "digital-claims"],
    digitalClaimsExperience: "excellent",
  },
  {
    id: 4,
    name: "Allstate",
    description: "Large national carrier with familiar claims workflows and consumer trust.",
    headquarters: "Northbrook, Illinois",
    claimsPhone: "800-255-7828",
    accountConnectionNotes: [
      "Good general-purpose insurer connection for mainstream personal auto claims.",
      "Often appropriate when customers want guided support over pure self-service.",
    ],
    benefits: ["New car replacement", "Claims support", "Broad market recognition"],
    popular: true,
    repairProgramFocus: ["collision", "consumer-support", "network-routing"],
    digitalClaimsExperience: "strong",
  },
  {
    id: 5,
    name: "USAA",
    description: "High-trust insurer serving military members and families with strong service marks.",
    headquarters: "San Antonio, Texas",
    claimsPhone: "800-531-8722",
    accountConnectionNotes: [
      "Best used when the member relationship and service quality matter more than sheer volume.",
      "Strong fit for users who expect careful claims communication and support.",
    ],
    benefits: ["Military member focus", "High service trust", "Strong support reputation"],
    popular: false,
    repairProgramFocus: ["member-service", "ev", "collision"],
    digitalClaimsExperience: "strong",
  },
  {
    id: 6,
    name: "Liberty Mutual",
    description: "Carrier with flexible coverage and useful commercial and consumer repair relationships.",
    headquarters: "Boston, Massachusetts",
    claimsPhone: "800-225-2467",
    accountConnectionNotes: [
      "Good when the workflow needs both personal-auto and commercial flexibility.",
      "Can be valuable in mixed fleet and consumer account environments.",
    ],
    benefits: ["Flexible coverage", "Commercial crossover", "Broad repair use cases"],
    popular: false,
    repairProgramFocus: ["fleet", "collision", "mixed-accounts"],
    digitalClaimsExperience: "strong",
  },
  {
    id: 7,
    name: "Farmers Insurance",
    description: "Established national insurer with strong catastrophe and hail relevance in many regions.",
    headquarters: "Woodland Hills, California",
    claimsPhone: "800-435-7764",
    accountConnectionNotes: [
      "Useful when hail and storm-related repair flows need stronger insurer alignment.",
      "Can support claim journeys where regional agent relationships matter.",
    ],
    benefits: ["Storm claim strength", "Agent-backed service", "Flexible support options"],
    popular: false,
    repairProgramFocus: ["hail", "storm-response", "agent-support"],
    digitalClaimsExperience: "standard",
  },
  {
    id: 8,
    name: "Nationwide",
    description: "National carrier with strong repair-network familiarity and commercial usefulness.",
    headquarters: "Columbus, Ohio",
    claimsPhone: "800-421-3535",
    accountConnectionNotes: [
      "Good fit when insurers and shops need clearer partner-shop visibility.",
      "Often useful for commercial and multi-vehicle operational workflows.",
    ],
    benefits: ["Partner network support", "Commercial relevance", "Broad claims familiarity"],
    popular: false,
    repairProgramFocus: ["network-shops", "commercial", "multi-vehicle"],
    digitalClaimsExperience: "strong",
  },
];

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

    return candidateValues
      .filter(Boolean)
      .flatMap((value) => tokenize(String(value)));
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

    const insuranceCompatibilityScore = clampScore(insurerOverlap.length * 28 + shop.rating * 10);

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

  return insurerDirectory.filter((insurer) =>
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
      title: "No shops matched that filter",
      description: "Try loosening the rating filter or using a broader shop category.",
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
