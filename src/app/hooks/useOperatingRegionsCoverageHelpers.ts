/**
 * useOperatingRegionsCoverageHelpers — pure derivation functions
 * extracted from `useOperatingRegionsCoverage.ts` to bring it under
 * the 500-LOC L3 hard limit (KI-109 split).
 *
 * Every function here is a **pure transformation** — no React state,
 * no effects, no hooks. The main hook wraps them in `useMemo` for
 * stable references.
 */
import { haversineMiles, zipToCoordinates } from "../services/supabase/map";
import type {
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
} from "../components/maps/serviceCoverageMapTypes";
import { isTargetInsideNyServiceRegion } from "../components/landing/coverageData";

type CoverageLookup = ReturnType<
  typeof import("../components/landing/coverageData").resolveCoverageLookup
>;

/**
 * Derives the ZIP-based search target for the coverage map. Returns
 * null when the ZIP is too short to resolve coordinates, or when
 * neither the lookup table nor the fallback prefix-coordinate table
 * yields valid lat/lng.
 */
export function resolveZipSearchTarget(
  lookup: CoverageLookup,
  normalizedZip: string
): CoverageSearchTarget | null {
  if (normalizedZip.length < 5) return null;

  const fallbackCoordinates = zipToCoordinates(normalizedZip);
  const lat = lookup?.lat ?? fallbackCoordinates?.lat;
  const lng = lookup?.lng ?? fallbackCoordinates?.lng;

  if (typeof lat !== "number" || typeof lng !== "number") {
    return null;
  }

  return {
    lat,
    lng,
    county: lookup?.county || "Regional coverage",
    label: `ZIP ${normalizedZip}`,
    source: "zip",
  };
}

/**
 * Derives the ZIP-based map-focus target. Differs from
 * `resolveZipSearchTarget` in that it works for shorter zips (3+
 * digits) using only the lookup table — never the fallback prefix
 * coordinates — because partial-ZIP focus shouldn't snap to a
 * potentially-wrong area.
 */
export function resolveZipMapTarget(
  lookup: CoverageLookup,
  normalizedZip: string
): CoverageSearchTarget | null {
  if (!lookup) return null;

  return {
    lat: lookup.lat,
    lng: lookup.lng,
    county: lookup.county,
    label: normalizedZip.length >= 5 ? `ZIP ${normalizedZip}` : `${normalizedZip} area`,
    source: "zip",
  };
}

/**
 * Picks the appropriate fallback search target based on the active
 * origin mode. Used by the navigation experience as a backstop when
 * its own active-origin target isn't yet resolved.
 */
export function selectFallbackSearchTarget(
  activeOriginMode: "zip" | "geolocation" | "address",
  currentLocationTarget: CoverageSearchTarget | null,
  manualSearchTarget: CoverageSearchTarget | null,
  zipSearchTarget: CoverageSearchTarget | null
): CoverageSearchTarget | null {
  if (activeOriginMode === "geolocation") return currentLocationTarget;
  if (activeOriginMode === "address") return manualSearchTarget;
  return zipSearchTarget;
}

/**
 * Picks the map-focus target — prefers the live list-search target,
 * falls back to the per-mode targets when the list view doesn't
 * have an active origin yet.
 */
export function selectMapFocusTarget(
  listSearchTarget: CoverageSearchTarget | null,
  activeOriginMode: "zip" | "geolocation" | "address",
  currentLocationTarget: CoverageSearchTarget | null,
  manualSearchTarget: CoverageSearchTarget | null,
  zipMapTarget: CoverageSearchTarget | null
): CoverageSearchTarget | null {
  if (listSearchTarget) return listSearchTarget;

  if (activeOriginMode === "geolocation") return currentLocationTarget;
  if (activeOriginMode === "address") return manualSearchTarget;
  return zipMapTarget;
}

/**
 * Returns true only when there's an active origin AND that origin
 * sits more than 60mi from every NY county center. ZIP origins
 * still respect their lookup result so the existing in-coverage
 * messaging keeps working for known NY ZIPs.
 *
 * (Phase 2 honesty fix 2026-05-03 P2 — replaces the prior
 * `Boolean(listSearchTarget) && !hasCoverageSignal` heuristic that
 * incorrectly flagged NY users using live GPS as outside the
 * service region.)
 */
export function resolveIsOutsideServiceRegion(
  listSearchTarget: CoverageSearchTarget | null,
  activeOriginMode: "zip" | "geolocation" | "address",
  hasCoverageSignal: boolean
): boolean {
  if (!listSearchTarget) return false;
  if (activeOriginMode === "zip" && hasCoverageSignal) return false;
  return !isTargetInsideNyServiceRegion(listSearchTarget.lat, listSearchTarget.lng);
}

/**
 * Computes the nearby-shops list relative to the active list-search
 * target. Filtered by the user-selected radius, sorted by distance,
 * truncated to top 6.
 */
export function computeNearbyShops(
  listSearchTarget: CoverageSearchTarget | null,
  mapPartnerShops: CoveragePartnerShop[],
  radiusMiles: string
): CoverageNearbyShop[] {
  if (!listSearchTarget) return [];

  return mapPartnerShops
    .map((shop) => {
      const distanceMiles = haversineMiles(
        { lat: listSearchTarget.lat, lng: listSearchTarget.lng },
        { lat: shop.lat, lng: shop.lng }
      );
      return {
        ...shop,
        distanceMiles,
      };
    })
    .filter((shop) => shop.distanceMiles <= Number(radiusMiles))
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, 6);
}
