import { haversineMiles } from "../supabase/map";
import type { NavigationCoordinate } from "../../types/navigation";
import { runWithProviderHealth } from "./providerHealth";
import {
  buildDiscoveryQualitySnapshot,
  persistDiscoveryQualitySnapshot,
  scorePlaceQuality,
  toQualityLabel,
} from "./placeDiscoveryQuality";
import {
  type OverpassElement,
  buildOverpassQuery,
  resolveCoordinate,
  resolveCategory,
  buildSubtitle,
  dedupePlaces,
  applyCategoryDiversity,
} from "./placeDiscoveryHelpers";

// Backward-compatible re-exports — consumers importing from this file keep working
export { buildDiscoveryQualitySnapshot };
export {
  getLatestDiscoveryQualitySnapshot,
  sanitizeDiscoveryQualitySnapshotFromRaw,
} from "./placeDiscoveryQuality";
export type { DiscoveryQualitySnapshot } from "./placeDiscoveryQuality";

export type NavigationDiscoveryRole = "customer" | "insurer" | "shop";
export type NavigationDiscoveryCategory =
  | "body-shop"
  | "insurance"
  | "fuel"
  | "rental"
  | "supplier";

export type NavigationDiscoveryPlace = {
  id: string;
  label: string;
  subtitle: string;
  category: NavigationDiscoveryCategory;
  qualityLabel: "verified" | "standard" | "limited";
  qualityScore: number;
  coordinate: NavigationCoordinate;
  distanceMiles: number;
  source: "overpass";
  phoneNumber?: string;
  website?: string;
};

type FetchNearbyDiscoveryPlacesArgs = {
  center: NavigationCoordinate;
  role: NavigationDiscoveryRole;
  radiusMiles: number;
  signal?: AbortSignal;
};

export async function fetchNearbyDiscoveryPlaces({
  center,
  role,
  radiusMiles,
  signal,
}: FetchNearbyDiscoveryPlacesArgs): Promise<NavigationDiscoveryPlace[]> {
  const isProduction = typeof import.meta !== "undefined" && Boolean(import.meta.env.PROD);
  const minimumQualityScore = isProduction ? 55 : 0;
  const radiusMeters = Math.max(1500, Math.min(Math.round(radiusMiles * 1609.34), 16000));
  const response = await runWithProviderHealth("overpass-discovery", () =>
    fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
      },
      body: `data=${encodeURIComponent(buildOverpassQuery(center, radiusMeters, role))}`,
      signal,
    })
  );

  if (!response.ok) {
    throw new Error("Live place discovery is temporarily unavailable.");
  }

  const payload = (await response.json()) as { elements?: OverpassElement[] };
  const elements = payload.elements || [];
  let rejectedMissingCoordinateCount = 0;
  let rejectedMissingCategoryCount = 0;
  let rejectedMissingLabelCount = 0;
  let rejectedBelowQualityThresholdCount = 0;

  const acceptedPlaces: NavigationDiscoveryPlace[] = [];

  for (const element of elements) {
    const coordinate = resolveCoordinate(element);
    if (!coordinate) {
      rejectedMissingCoordinateCount += 1;
      continue;
    }

    const category = resolveCategory(element.tags, role);
    if (!category) {
      rejectedMissingCategoryCount += 1;
      continue;
    }

    const label = element.tags?.name || element.tags?.brand || element.tags?.operator;
    if (!label) {
      rejectedMissingLabelCount += 1;
      continue;
    }

    const distanceMiles = haversineMiles(center, coordinate);
    const qualityScore = scorePlaceQuality(element.tags, distanceMiles);

    if (qualityScore < minimumQualityScore) {
      rejectedBelowQualityThresholdCount += 1;
      continue;
    }

    acceptedPlaces.push({
      id: `${element.type}-${element.id}`,
      label,
      subtitle: buildSubtitle(element.tags, category),
      category,
      qualityLabel: toQualityLabel(qualityScore),
      qualityScore,
      coordinate,
      distanceMiles,
      source: "overpass" as const,
      phoneNumber: element.tags?.phone || element.tags?.["contact:phone"],
      website: element.tags?.website || element.tags?.["contact:website"],
    });
  }

  const rankedPlaces = acceptedPlaces.sort((left, right) => {
    // Quality-weighted sort: combine distance rank and quality score so nearby
    // high-quality results beat distant low-quality ones, while not burying
    // good results just because they are a mile further away.
    const leftRank = left.distanceMiles - left.qualityScore * 0.04;
    const rightRank = right.distanceMiles - right.qualityScore * 0.04;
    return leftRank - rightRank;
  });

  const dedupeResult = dedupePlaces(rankedPlaces);
  const diversityResult = applyCategoryDiversity(dedupeResult.places, role);
  const finalPlaces = diversityResult.places;

  persistDiscoveryQualitySnapshot(
    buildDiscoveryQualitySnapshot({
      role,
      radiusMiles,
      sourceElementCount: elements.length,
      acceptedPlaces: finalPlaces,
      rejectedMissingCoordinateCount,
      rejectedMissingCategoryCount,
      rejectedMissingLabelCount,
      rejectedBelowQualityThresholdCount,
      dedupedCount: dedupeResult.dedupedCount,
      trimmedByCategoryDiversityCount: diversityResult.trimmedCount,
      minimumQualityScore,
    })
  );

  return finalPlaces;
}
