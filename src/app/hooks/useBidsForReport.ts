import { useCallback, useEffect, useRef, useState } from "react";
import { getBidsForReport } from "../services/supabase/bids";
import { realtimeBidService } from "../services/realtime/RealtimeBidService";
import { useNotifications } from "../features/notifications/NotificationContext";
import { SEED_DEMO_BIDS } from "../constants";
import type { Bid } from "../types";

interface MappedBid extends Bid {}

type RawBid = Partial<Bid> & Record<string, unknown>;

/** Maps a raw Bid (from edge function or real-time) to the camelCase shape BidsScreen expects. */
function mapBid(bid: unknown, reportId: string): MappedBid {
  const rawBid = bid as RawBid;
  return {
    id: rawBid.id || "",
    reportId:
      rawBid.reportId ||
      (rawBid.report_id as string) ||
      (rawBid.damage_report_id as string) ||
      reportId,
    shopId:
      rawBid.shopId ||
      (rawBid.shop_id as string) ||
      (rawBid.shop_user_id as string) ||
      (rawBid.clerk_shop_user_id as string) ||
      "",
    shopEmail: rawBid.shopEmail || (rawBid.shop_email as string) || "",
    shopName: rawBid.shopName || (rawBid.shop_name as string) || "Auto Shop",
    shopRating: Number(rawBid.shopRating ?? rawBid.shop_rating ?? 0),
    shopReviews: Number(rawBid.shopReviews ?? rawBid.shop_reviews ?? 0),
    amount: Number(rawBid.amount ?? 0),
    estimatedDays: Number(rawBid.estimatedDays ?? rawBid.estimated_days ?? 0),
    shopDistance: rawBid.shopDistance || (rawBid.shop_distance as string) || "Within service area",
    shopLatitude: rawBid.shopLatitude ?? (rawBid.shop_latitude as number | undefined),
    shopLongitude: rawBid.shopLongitude ?? (rawBid.shop_longitude as number | undefined),
    shopPhone: rawBid.shopPhone || (rawBid.shop_phone as string) || undefined,
    shopAddress: rawBid.shopAddress || (rawBid.shop_address as string) || undefined,
    description: rawBid.description || "",
    status:
      rawBid.status === "accepted" || rawBid.status === "rejected" ? rawBid.status : "pending",
    createdAt: rawBid.createdAt || (rawBid.created_at as string) || new Date().toISOString(),
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
  const notifications = useNotifications();

  const fetchBids = useCallback(async () => {
    if (!reportId) {
      setBids([]);
      return;
    }

    // Seed reports get demo bids locally — no Supabase call needed
    const seedBids = SEED_DEMO_BIDS[reportId];
    if (seedBids) {
      setBids(seedBids.map((bid) => mapBid(bid, reportId)));
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
      notifications.showToast({
        message: "Unable to load bids. Please check your connection and try again.",
        variant: "error",
        durationMs: 4000,
        deepLink: null,
      });
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  // Initial fetch
  useEffect(() => {
    fetchBids();
  }, [fetchBids]);

  // Real-time subscription (skip for seed reports — no Supabase rows exist)
  useEffect(() => {
    if (!reportId || SEED_DEMO_BIDS[reportId]) {
      setConnectionStatus("idle");
      return;
    }

    const unsubscribe = realtimeBidService.subscribeToReportBids(
      reportId,
      // onNewBid
      (bid: Bid) => {
        if (reportIdRef.current !== reportId) return;
        const mapped = mapBid(bid, reportId);
        setBids((prev) => {
          if (prev.some((b) => b.id === mapped.id)) return prev;
          return [...prev, mapped];
        });
      },
      // onUpdateBid
      (bid: Bid) => {
        if (reportIdRef.current !== reportId) return;
        const mapped = mapBid(bid, reportId);
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
