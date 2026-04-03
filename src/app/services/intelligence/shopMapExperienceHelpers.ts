import type { ShopSortOption } from "../auth/websiteIdentity";
import type { Coordinates, MapShopResult, MapViewportBounds, SearchOrigin } from "../../types/mapDomain";
import type { ShopRecommendation } from "./marketIntelligence";
import { calculateDistanceMiles, formatDistanceLabel } from "./shopMapRouting";
import type { ShopLocationRecord } from "./shopMapData";
import type { DirectoryReport, MarketUserType } from "./marketIntelligenceHelpers";

export interface ShopMapListing extends ShopRecommendation {
  mapResult: MapShopResult;
  mapDistanceMiles: number;
  mapDistanceLabel: string;
}

export interface ShopMapFilterCatalog {
  insurerPrograms: string[];
  serviceTypes: string[];
  vehicleTypes: string[];
}

// ── Pure utilities ──────────────────────────────────────────────────

function normalizeValue(value: string) {
  return value.trim().toLowerCase();
}

export function sortValuesByFrequency(values: string[]) {
  const counts = new Map<string, { count: number; value: string }>();

  values.forEach((value) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) {
      return;
    }

    const key = normalizeValue(trimmedValue);
    const existing = counts.get(key);
    if (existing) {
      existing.count += 1;
      return;
    }

    counts.set(key, {
      count: 1,
      value: trimmedValue,
    });
  });

  return [...counts.values()]
    .sort((left, right) => right.count - left.count || left.value.localeCompare(right.value))
    .map((entry) => entry.value);
}

export function matchesSelection(candidates: string[], selections?: string[]) {
  if (!selections || selections.length === 0) {
    return true;
  }

  const normalizedCandidates = candidates.map((candidate) => normalizeValue(candidate));
  return selections.some((selection) => normalizedCandidates.includes(normalizeValue(selection)));
}

export function isWithinViewportBounds(
  coordinates: Coordinates,
  viewportBounds?: MapViewportBounds
) {
  if (!viewportBounds) {
    return true;
  }

  return (
    coordinates.latitude <= viewportBounds.north &&
    coordinates.latitude >= viewportBounds.south &&
    coordinates.longitude <= viewportBounds.east &&
    coordinates.longitude >= viewportBounds.west
  );
}

export function sortListings(listings: ShopMapListing[], sortBy: ShopSortOption) {
  const sortedListings = [...listings];

  sortedListings.sort((left, right) => {
    if (sortBy === "rating") {
      return right.rating - left.rating;
    }

    if (sortBy === "reviews") {
      return right.reviews - left.reviews;
    }

    if (sortBy === "distance") {
      return left.mapDistanceMiles - right.mapDistanceMiles;
    }

    return right.recommendationScore - left.recommendationScore;
  });

  return sortedListings;
}

export function buildMapListingFromRecommendation(
  shop: ShopRecommendation,
  location: ShopLocationRecord,
  origin?: SearchOrigin
) {
  const mapDistanceMiles = origin
    ? calculateDistanceMiles(origin, location.coordinates)
    : shop.distanceMiles;

  const mapResult: MapShopResult = {
    id: shop.id,
    name: shop.name,
    coordinates: location.coordinates,
    address: location.address,
    city: location.city,
    state: location.state,
    zipCode: location.zipCode,
    distanceMiles: mapDistanceMiles,
    rating: shop.rating,
    reviews: shop.reviews,
    image: shop.image,
    certifications: shop.certifications,
    responseTimeHours: shop.responseTimeHours,
    completionRate: shop.completionRate,
    specialties: shop.specialties,
    supportedMakes: shop.supportedMakes,
    insurerPrograms: shop.insurerPrograms,
    aiSummary: shop.aiSummary,
    matchScore: shop.recommendationScore,
    insuranceCompatibilityScore: shop.insuranceCompatibilityScore,
  };

  return {
    ...shop,
    mapResult,
    mapDistanceMiles,
    mapDistanceLabel: formatDistanceLabel(mapDistanceMiles),
  } satisfies ShopMapListing;
}

export function withAdjustedTopPick(listings: ShopMapListing[]) {
  return listings.map((listing, index) => ({
    ...listing,
    topPick: index === 0,
  }));
}

// ── Role-aware highlights ───────────────────────────────────────────

export function buildRoleAwareMapHighlights({
  userType,
  recommendations,
  reports,
  connectedCarrierCount,
}: {
  userType: MarketUserType;
  recommendations: ShopMapListing[];
  reports: DirectoryReport[];
  connectedCarrierCount: number;
}) {
  const topRecommendations = recommendations.slice(0, 3);
  const averageCompletionRate =
    topRecommendations.reduce((total, shop) => total + shop.completionRate, 0) /
      Math.max(topRecommendations.length, 1) || 0;
  const averageTicketValue =
    topRecommendations.reduce((total, shop) => total + shop.averagePriceValue, 0) /
      Math.max(topRecommendations.length, 1) || 0;
  const networkReadyCount = recommendations.filter(
    (shop) => shop.insurerPrograms.length >= 3
  ).length;
  const damageSignalCount = reports.reduce((count, report) => {
    const signalCount =
      (report.damageArea ? 1 : 0) +
      (report.damageType ? 1 : 0) +
      (Array.isArray(report.damageAreas) ? report.damageAreas.length : 0);

    return count + signalCount;
  }, 0);

  if (userType === "shop") {
    return {
      badge: "Competitive market scout",
      title: "Benchmark local players before pricing a job",
      description:
        "Use the map to compare nearby competitors, certification depth, and response speed before you position a bid.",
      metrics: [
        { label: "Top-3 Avg Ticket", value: `$${Math.round(averageTicketValue).toLocaleString()}` },
        { label: "Insurer-Ready Shops", value: String(networkReadyCount) },
      ],
      callouts: [
        "Nearest high-fit shops are clustered across Westchester, Rockland, and Nassau counties.",
        "Luxury, EV, and ADAS capabilities are the clearest differentiation pockets in the current network.",
      ],
      primaryActionLabel: "Track competitor",
      secondaryActionLabel: "Review profile",
    };
  }

  if (userType === "insurer") {
    return {
      badge: "Network recruitment view",
      title: "Compare partner candidates with carrier-aware context",
      description:
        "This map favors shops that already show insurer-program familiarity, strong completion rates, and fast intake behavior.",
      metrics: [
        { label: "Network-Ready", value: String(networkReadyCount) },
        { label: "Avg Completion", value: `${Math.round(averageCompletionRate)}%` },
      ],
      callouts: [
        "Shops with three or more insurer programs should be the fastest shortlist for partner-network expansion.",
        "Use the selected shop card to inspect response speed and program overlap before outreach.",
      ],
      primaryActionLabel: "Shortlist partner",
      secondaryActionLabel: "Review fit",
    };
  }

  return {
    badge: "Customer repair routing",
    title: "Match shops using repair, insurer, and vehicle context",
    description:
      "BidOnDent is blending signed-in repair context, connected insurance preferences, and repair specialties into a map-first search flow.",
    metrics: [
      { label: "Connected Carriers", value: String(connectedCarrierCount) },
      { label: "Damage Signals", value: String(damageSignalCount) },
    ],
    callouts: [
      "Connected insurers lift compatible shops higher when the carrier already works with that repair program.",
      "Pick an origin to compare nearby shops visually before you start collecting or reviewing bids.",
    ],
    primaryActionLabel: "Save for bids",
    secondaryActionLabel: "View fit",
  };
}
