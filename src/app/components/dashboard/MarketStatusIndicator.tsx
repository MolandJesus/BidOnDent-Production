import { Activity, Store } from "lucide-react";

interface MarketStatusIndicatorProps {
  nearbyShopCount: number;
  recentBidCount: number;
  isLight?: boolean;
}

/**
 * Compact read-only badge showing live shop count + recent bid activity.
 * Rendered on the customer dashboard map widget.
 */
export default function MarketStatusIndicator({
  nearbyShopCount,
  recentBidCount,
  isLight = false,
}: MarketStatusIndicatorProps) {
  if (nearbyShopCount === 0 && recentBidCount === 0) return null;

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full px-3 py-1.5 text-[11px] font-medium ${
        isLight
          ? "bg-white/85 text-slate-700 border border-slate-200/60"
          : "bg-white/10 text-blue-50 border border-blue-200/18"
      }`}
    >
      {nearbyShopCount > 0 && (
        <span className="inline-flex items-center gap-1">
          <Store className="h-3 w-3" />
          {nearbyShopCount} {nearbyShopCount === 1 ? "shop" : "shops"} nearby
        </span>
      )}
      {nearbyShopCount > 0 && recentBidCount > 0 && (
        <span className={`w-px h-3 ${isLight ? "bg-slate-300" : "bg-blue-200/25"}`} />
      )}
      {recentBidCount > 0 && (
        <span className="inline-flex items-center gap-1">
          <Activity className="h-3 w-3" />
          {recentBidCount} {recentBidCount === 1 ? "bid" : "bids"} active
        </span>
      )}
    </div>
  );
}
