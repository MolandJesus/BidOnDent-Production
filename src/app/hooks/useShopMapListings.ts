/**
 * useShopMapListings — L3 hook over L4 buildShopMapListings.
 *
 * Returns the role-aware filtered + sorted shop map listings array
 * for a given userType + filters + origin context. Stable reference
 * via useMemo (recomputed only when one of the underlying inputs
 * changes).
 *
 * Use this from L2 components instead of importing
 * `buildShopMapListings` directly. Closes a slice of KI-108
 * (architectural drift) and a slice of KI-110 (shopMapExperience
 * direct-import coupling).
 *
 * Scope refinement vs OPS_PHASE_8_SCOPE_CONTRACT_2026-05-05.md §1
 * hook 4: the contract's drafted "kitchen sink" return shape
 * (`{ listings, defaultMapCenter, collectionTitle, getActionLabels }`)
 * did not match any actual caller pattern in the 7 named L2
 * surfaces. Caller inventory revealed:
 *   - 3 callers use buildShopMapListings (single call per render)
 *     → this hook fits cleanly
 *   - 2 callers use getRoleCollectionActionLabels inside .map()
 *     loops → hooks-in-loops violation; stay direct
 *   - 1 caller uses getRoleCollectionTitle(userType) — trivial
 *     pure-function lookup; direct import is fine
 *   - 1 caller uses getDefaultMapCenter() — constant getter; direct
 *     import is fine
 *
 * The narrowed Y1 hook shape (`(args) => ShopMapListing[]`) covers
 * the 3 substantial-use callers cleanly. The other 4 callers retain
 * direct imports as documented architectural exceptions.
 *
 * Per Phase 8 selectivity policy (established for useGeoCoordinates
 * + useHaversineDistance + useNavigationVoicePriming): L2 → L4
 * direct imports are acceptable for pure-utility / constant /
 * loop-iteration functions until a future phase relocates them to
 * a pure-utility module.
 */
import { useMemo } from "react";
import {
  buildShopMapListings,
  type ShopMapListing,
} from "../services/intelligence/shopMapExperience";
import type { MarketUserType } from "../services/intelligence/marketIntelligence";

type BuildArgs = Parameters<typeof buildShopMapListings>[0];

/**
 * Args mirror buildShopMapListings exactly. userType is required;
 * other fields are optional with the same defaults as the L4
 * function.
 */
export interface UseShopMapListingsArgs {
  userType: MarketUserType;
  searchQuery?: BuildArgs["searchQuery"];
  vehicles?: BuildArgs["vehicles"];
  reports?: BuildArgs["reports"];
  connectedInsurerIds?: BuildArgs["connectedInsurerIds"];
  filterRating?: BuildArgs["filterRating"];
  filters?: BuildArgs["filters"];
  sortBy?: BuildArgs["sortBy"];
  origin?: BuildArgs["origin"];
  directoryInsurers?: BuildArgs["directoryInsurers"];
  directoryShops?: BuildArgs["directoryShops"];
  viewportBounds?: BuildArgs["viewportBounds"];
}

export function useShopMapListings(args: UseShopMapListingsArgs): ShopMapListing[] {
  return useMemo(
    () => buildShopMapListings(args),
    [
      args.userType,
      args.searchQuery,
      args.vehicles,
      args.reports,
      args.connectedInsurerIds,
      args.filterRating,
      args.filters,
      args.sortBy,
      args.origin,
      args.directoryInsurers,
      args.directoryShops,
      args.viewportBounds,
    ]
  );
}
