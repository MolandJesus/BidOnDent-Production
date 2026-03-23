import type { MarketUserType } from "./marketIntelligence";
import type { MapSessionMemory } from "../../types/mapDomain";

export type RoleShopCollectionKey =
  | "customerSavedShopIds"
  | "shopWatchlistIds"
  | "insurerShortlistIds";

export function getRoleCollectionKey(userType: MarketUserType): RoleShopCollectionKey {
  if (userType === "shop") {
    return "shopWatchlistIds";
  }

  if (userType === "insurer") {
    return "insurerShortlistIds";
  }

  return "customerSavedShopIds";
}

export function getRoleCollectionTitle(userType: MarketUserType) {
  if (userType === "shop") {
    return "Competitor watchlist";
  }

  if (userType === "insurer") {
    return "Partner shortlist";
  }

  return "Saved shops";
}

export function getRoleCollectionActionLabels(userType: MarketUserType, isCollected: boolean) {
  if (userType === "shop") {
    return isCollected
      ? { primary: "Remove from watchlist", sectionCta: "Watched competitor" }
      : { primary: "Track competitor", sectionCta: "Add competitor" };
  }

  if (userType === "insurer") {
    return isCollected
      ? { primary: "Remove from shortlist", sectionCta: "Shortlisted partner" }
      : { primary: "Shortlist partner", sectionCta: "Add partner" };
  }

  return isCollected
    ? { primary: "Remove saved shop", sectionCta: "Saved for bids" }
    : { primary: "Save for bids", sectionCta: "Save shop" };
}

export function getRoleCollectionShopIds(
  userType: MarketUserType,
  mapSession?: MapSessionMemory | null
) {
  if (!mapSession) {
    return [];
  }

  return mapSession[getRoleCollectionKey(userType)] || [];
}

export function toggleRoleCollectionShopId(currentIds: number[], shopId: number) {
  if (currentIds.includes(shopId)) {
    return currentIds.filter((id) => id !== shopId);
  }

  return [...currentIds, shopId];
}
