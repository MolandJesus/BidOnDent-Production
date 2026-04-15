import type { Bid, DamageReport } from "../../types";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export type BidsScreenProps = {
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
  onBack?: () => void;
  onStartReport?: () => void;
  onViewShopDirectory?: () => void;
  userType?: "customer" | "shop" | "insurer";
  bids?: Bid[];
  bidsLoading?: boolean;
  reports?: DamageReport[];
  onAcceptBid?: (details: {
    bidId: string;
    shopId?: string;
    shopName: string;
    price: number;
    timeframe: string;
    reportId?: string;
  }) => void;
  onRejectBid?: (details: { bidId: string; shopName: string }) => void;
};

export type FilterType = "all" | "lowest" | "fastest" | "rating";

export const FILTERS: Array<{ id: FilterType; label: string }> = [
  { id: "all", label: "All Bids" },
  { id: "lowest", label: "Lowest Price" },
  { id: "fastest", label: "Fastest" },
  { id: "rating", label: "Highest Rated" },
];

export function transformBid(bid: Bid, index: number) {
  return {
    id: bid.id || `bid-${index}`,
    shopId: bid.shopId,
    reportId: bid.reportId,
    shopName: bid.shopName || "Auto Shop",
    shopEmail: bid.shopEmail,
    shopPhone: bid.shopPhone,
    shopAddress: bid.shopAddress,
    rating: Number(bid.shopRating || 0),
    reviews: Number(bid.shopReviews || 0),
    price: Number(bid.amount || 0),
    estimatedDays: Number(bid.estimatedDays || 0),
    timeframe: bid.estimatedDays
      ? `${bid.estimatedDays}-${bid.estimatedDays + 1} days`
      : "Timeline pending",
    distance: bid.shopDistance || "Within service area",
    warranty: "Scope shared after acceptance",
    description: bid.description || "Bid details will be confirmed with the shop after selection.",
    image: "",
    status: bid.status || "pending",
    shopLatitude: bid.shopLatitude ?? null,
    shopLongitude: bid.shopLongitude ?? null,
  };
}
