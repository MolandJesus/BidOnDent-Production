/**
 * useHaversineDistance — L3 hook over L4 haversineMiles math.
 *
 * Returns the great-circle distance in miles between two Coordinates,
 * or null when either input is null/undefined. Stable reference via
 * useMemo (recomputed only when input lat/lng changes).
 *
 * Use this from L2 components that need a **single distance per
 * render** (e.g. live navigation distance to next step).
 *
 * Per Phase 8 scope contract §1 hook 2 selectivity: per-list-item
 * call sites (e.g. `shops.map(s => haversineMiles(origin, s))`)
 * cannot use this hook (hooks-in-loops violation). Those sites keep
 * the direct `haversineMiles` import as a documented architectural
 * exception until a future phase relocates `haversineMiles` itself
 * to a pure-utility module.
 */
import { useMemo } from "react";
import { haversineMiles } from "../services/supabase/map";
import type { Coordinates } from "../services/supabase/map";

export function useHaversineDistance(
  from: Coordinates | null | undefined,
  to: Coordinates | null | undefined
): number | null {
  return useMemo(() => {
    if (!from || !to) return null;
    return haversineMiles(from, to);
  }, [from?.lat, from?.lng, to?.lat, to?.lng]);
}
