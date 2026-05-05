/**
 * useGeoCoordinates — L3 hook over L4 zipToCoordinates lookup.
 *
 * Returns the lat/lng coordinates for a 5-digit US ZIP code, or null
 * when the ZIP is undefined / invalid / not in the prefix table.
 *
 * Stable reference via useMemo so callers that pass `coords` as a dep
 * to downstream effects/memos don't see spurious invalidations.
 *
 * Use this from L2 components that consume coordinates **once per
 * render** (typical: a single `selectedReport` → coords derivation).
 *
 * Per Phase 8 scope contract §1 hook 1 selectivity: per-list-item
 * call sites (e.g. `reports.map(r => zipToCoordinates(r.zipCode))`)
 * cannot use this hook (hooks-in-loops violation). Those sites keep
 * the direct `zipToCoordinates` import as a documented architectural
 * exception until a future phase relocates `zipToCoordinates` itself
 * to a pure-utility module.
 */
import { useMemo } from "react";
import { zipToCoordinates } from "../services/supabase/map";
import type { Coordinates } from "../services/supabase/map";

export function useGeoCoordinates(zip: string | undefined | null): Coordinates | null {
  return useMemo(() => zipToCoordinates(zip ?? undefined), [zip]);
}
