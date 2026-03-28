import { useCallback, useEffect, useState } from "react";
import { getBidsForReport } from "../services/supabase/bids";
import type { Bid } from "../types";

interface MappedBid extends Bid {}

/**
 * Fetches bids for a specific damage report from Supabase.
 * Returns camelCase-mapped bids ready for BidsScreen consumption.
 */
export function useBidsForReport(reportId?: string | null) {
  const [bids, setBids] = useState<MappedBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBids = useCallback(async () => {
    if (!reportId) {
      setBids([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getBidsForReport(reportId);

      const mapped: MappedBid[] = data.map((bid) => ({
        id: bid.id || "",
        reportId: bid.report_id || bid.damage_report_id || reportId,
        shopId: bid.shop_id || bid.shop_user_id || bid.clerk_shop_user_id || "",
        shopEmail: bid.shop_email || "",
        shopName: bid.shop_name || "Auto Shop",
        shopRating: Number(bid.shop_rating || 0),
        shopReviews: Number(bid.shop_reviews || 0),
        amount: Number(bid.amount || 0),
        estimatedDays: Number(bid.estimated_days || 0),
        shopDistance: bid.shop_distance || "Within service area",
        shopLatitude: bid.shop_latitude ?? undefined,
        shopLongitude: bid.shop_longitude ?? undefined,
        description: bid.description || "",
        status: bid.status === "accepted" || bid.status === "rejected" ? bid.status : "pending",
        createdAt: bid.created_at || new Date().toISOString(),
      }));

      setBids(mapped);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Failed to fetch bids for report:", err);
      setError("Failed to load bids");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  return { bids, loading, error, refetch: fetchBids };
}
