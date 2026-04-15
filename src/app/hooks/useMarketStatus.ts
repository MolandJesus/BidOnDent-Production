import { useMemo } from "react";
import type { DamageReport } from "../types";

interface MarketStatus {
  nearbyShopCount: number;
  recentBidCount: number;
}

/**
 * Derives a read-only market-status snapshot from existing data.
 * No new queries, no realtime channels.
 */
export function useMarketStatus(reports: DamageReport[], shopCount: number): MarketStatus {
  return useMemo(() => {
    let bidTotal = 0;
    for (const r of reports) {
      bidTotal += r.bidsCount ?? r.bids?.length ?? 0;
    }
    return { nearbyShopCount: shopCount, recentBidCount: bidTotal };
  }, [reports, shopCount]);
}
