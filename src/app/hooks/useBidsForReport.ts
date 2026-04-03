import { useCallback, useEffect, useRef, useState } from "react";
import { getBidsForReport } from "../services/supabase/bids";
import { realtimeBidService } from "../services/realtime/RealtimeBidService";
import type { Bid } from "../types";

interface MappedBid extends Bid {}

/** Maps a raw Bid (from edge function or real-time) to the camelCase shape BidsScreen expects. */
function mapBid(bid: Record<string, unknown>, reportId: string): MappedBid {
  return {
    id: (bid.id as string) || "",
    reportId:
      (bid.reportId as string) ||
      (bid.report_id as string) ||
      (bid.damage_report_id as string) ||
      reportId,
    shopId:
      (bid.shopId as string) ||
      (bid.shop_id as string) ||
      (bid.shop_user_id as string) ||
      (bid.clerk_shop_user_id as string) ||
      "",
    shopEmail: (bid.shopEmail as string) || (bid.shop_email as string) || "",
    shopName: (bid.shopName as string) || (bid.shop_name as string) || "Auto Shop",
    shopRating: Number(bid.shopRating ?? bid.shop_rating ?? 0),
    shopReviews: Number(bid.shopReviews ?? bid.shop_reviews ?? 0),
    amount: Number(bid.amount ?? 0),
    estimatedDays: Number(bid.estimatedDays ?? bid.estimated_days ?? 0),
    shopDistance:
      (bid.shopDistance as string) || (bid.shop_distance as string) || "Within service area",
    shopLatitude:
      (bid.shopLatitude as number | undefined) ?? (bid.shop_latitude as number | undefined),
    shopLongitude:
      (bid.shopLongitude as number | undefined) ?? (bid.shop_longitude as number | undefined),
    description: (bid.description as string) || "",
    status:
      bid.status === "accepted" || bid.status === "rejected"
        ? (bid.status as "accepted" | "rejected")
        : "pending",
    createdAt: (bid.createdAt as string) || (bid.created_at as string) || new Date().toISOString(),
  };
}

/**
 * Fetches bids for a specific damage report from Supabase,
 * then subscribes to real-time updates via RealtimeBidService.
 * Returns camelCase-mapped bids ready for BidsScreen consumption.
 */
export function useBidsForReport(reportId?: string | null) {
  const [bids, setBids] = useState<MappedBid[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<
    "connected" | "disconnected" | "error" | "idle"
  >("idle");
  const reportIdRef = useRef(reportId);
  reportIdRef.current = reportId;

  const fetchBids = useCallback(async () => {
    if (!reportId) {
      setBids([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getBidsForReport(reportId);
      const mapped: MappedBid[] = data.map((bid) => mapBid(bid, reportId));
      setBids(mapped);
    } catch (err) {
      if (import.meta.env.DEV) console.error("Failed to fetch bids for report:", err);
      setError("Failed to load bids");
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  // Initial fetch
  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  // Real-time subscription
  useEffect(() => {
    if (!reportId) {
      setConnectionStatus("idle");
      return;
    }

    const unsubscribe = realtimeBidService.subscribeToReportBids(
      reportId,
      // onNewBid
      (bid: Bid) => {
        if (reportIdRef.current !== reportId) return;
        const mapped = mapBid(bid as unknown as Record<string, unknown>, reportId);
        setBids((prev) => {
          if (prev.some((b) => b.id === mapped.id)) return prev;
          return [...prev, mapped];
        });
      },
      // onUpdateBid
      (bid: Bid) => {
        if (reportIdRef.current !== reportId) return;
        const mapped = mapBid(bid as unknown as Record<string, unknown>, reportId);
        setBids((prev) => prev.map((b) => (b.id === mapped.id ? mapped : b)));
      },
      // onDeleteBid
      (bidId: string) => {
        if (reportIdRef.current !== reportId) return;
        setBids((prev) => prev.filter((b) => b.id !== bidId));
      },
      // onConnectionStatus
      (status) => {
        setConnectionStatus(status);
      }
    );

    return () => {
      unsubscribe();
      setConnectionStatus("idle");
    };
  }, [reportId]);

  return { bids, loading, error, refetch: fetchBids, connectionStatus };
}
