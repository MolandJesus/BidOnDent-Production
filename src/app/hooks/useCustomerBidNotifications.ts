/**
 * Customer Bid Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for new bid INSERTs on the
 * customer's damage reports. When a shop submits a new bid:
 *   1. Pushes an in-app notification (toast + feed entry)
 *   2. Calls the provided refetch callback to refresh bid data
 *
 * Only active when userType === "customer" and reports exist.
 * Cleans up on unmount.
 */

import { useEffect, useRef } from "react";
import { realtimeBidService } from "../services/realtime/RealtimeBidService";
import { useNotifications } from "../features/notifications";
import type { Bid, DamageReport } from "../types";

interface UseCustomerBidNotificationsOptions {
  userType: string;
  reports: DamageReport[];
  onNewBid?: () => void;
}

export function useCustomerBidNotifications({
  userType,
  reports,
  onNewBid,
}: UseCustomerBidNotificationsOptions): void {
  const notifications = useNotifications();
  const onNewBidRef = useRef(onNewBid);
  onNewBidRef.current = onNewBid;

  // Stable report IDs string to avoid re-subscribing every render
  const reportIds = reports
    .map((r) => r.id)
    .filter(Boolean)
    .filter((id) => !id.startsWith("seed-"))
    .sort()
    .join(",");

  useEffect(() => {
    if (userType !== "customer" || !reportIds) return;

    let mounted = true;
    const ids = reportIds.split(",");
    const unsubscribers: (() => void)[] = [];

    function doSubscribe() {
      // StrictMode-safe: defer subscribe by one microtask + `mounted` short-circuit.
      // See useBidsForReport.ts for full mechanism + KI-057.
      if (!mounted) return;
      for (const reportId of ids) {
        const unsub = realtimeBidService.subscribeToReportBids(
          reportId,
          // onNewBid
          (bid: Bid) => {
            const shopName = bid.shopName || "A shop";
            const amount = bid.amount ? `$${bid.amount.toLocaleString()}` : "a bid";

            notifications.push({
              category: "bid",
              title: `New bid from ${shopName}`,
              body: `${shopName} submitted ${amount} for your repair request.`,
              payload: { bidId: bid.id, reportId, shopName: bid.shopName },
              userId: "",
              deepLink: { screen: "bid", bidId: bid.id, reportId },
              priority: "high",
            });

            onNewBidRef.current?.();
          }
        );
        unsubscribers.push(unsub);
      }
    }

    queueMicrotask(doSubscribe);

    return () => {
      mounted = false;
      for (const unsub of unsubscribers) unsub();
    };
  }, [userType, reportIds, notifications]);
}
