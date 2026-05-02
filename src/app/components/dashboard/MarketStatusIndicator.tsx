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
          ? "bg-white/88 text-slate-700 border border-blue-200/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.82),0_2px_8px_rgba(59,130,246,0.06)]"
          : "bg-white/10 text-blue-50 border border-blue-300/22 shadow-[inset_0_1px_0_rgba(147,197,253,0.10),0_2px_10px_rgba(37,99,235,0.10)]"
      }`}
    >
      {nearbyShopCount > 0 && (
        <span className="inline-flex items-center gap-1">
          <Store className="h-3 w-3" />
          {nearbyShopCount} {nearbyShopCount === 1 ? "shop" : "shops"} nearby
        </span>
      )}
      {nearbyShopCount > 0 && recentBidCount > 0 && (
        <span className={`w-px h-3 ${isLight ? "bg-blue-300/40" : "bg-blue-200/25"}`} />
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
