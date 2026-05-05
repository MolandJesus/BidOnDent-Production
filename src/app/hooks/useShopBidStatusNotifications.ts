/**
 * Shop Bid Status Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for bid UPDATEs via the
 * global all-bids channel. When a customer accepts or rejects
 * a bid owned by this shop:
 *   1. Pushes an in-app notification (toast + feed entry)
 *   2. Calls the optional refetch callback
 *
 * Only active when userType === "shop" and providerUserId exists.
 * Cleans up on unmount.
 */

import { useEffect, useRef } from "react";
import { realtimeBidService } from "../services/realtime/RealtimeBidService";
import { useNotifications } from "../features/notifications";
import type { Bid } from "../types";

interface UseShopBidStatusNotificationsOptions {
  userType: string;
  providerUserId: string | undefined;
  onBidStatusChange?: () => void;
}

export function useShopBidStatusNotifications({
  userType,
  providerUserId,
  onBidStatusChange,
}: UseShopBidStatusNotificationsOptions): void {
  const notifications = useNotifications();
  const onChangeRef = useRef(onBidStatusChange);
  onChangeRef.current = onBidStatusChange;

  useEffect(() => {
    if (userType !== "shop" || !providerUserId) return;

    let mounted = true;
    let currentUnsubscribe: (() => void) | null = null;

    function doSubscribe() {
      // StrictMode-safe: defer subscribe by one microtask + `mounted` short-circuit.
      // See useBidsForReport.ts for full mechanism + KI-057.
      if (!mounted) return;
      currentUnsubscribe = realtimeBidService.subscribeToAllBids(
        undefined, // onNewBid — shops don't need INSERT notifications here
        (bid: Bid) => {
          // Only care about bids this shop submitted
          if (bid.shopId !== providerUserId) return;
          // Only notify for terminal status changes
          if (bid.status !== "accepted" && bid.status !== "rejected") return;

          const amount = bid.amount ? `$${bid.amount.toLocaleString()}` : "Your bid";
          const isAccepted = bid.status === "accepted";

          notifications.push({
            category: "bid",
            title: isAccepted ? "Bid accepted!" : "Bid not selected",
            body: isAccepted
              ? `${amount} was accepted for a repair request. Check your active jobs.`
              : `${amount} was not selected for this repair request.`,
            payload: { bidId: bid.id, reportId: bid.reportId, status: bid.status },
            userId: providerUserId,
            deepLink: isAccepted
              ? { screen: "dashboard" as const }
              : { screen: "bid" as const, bidId: bid.id, reportId: bid.reportId },
            priority: isAccepted ? "high" : "low",
          });

          onChangeRef.current?.();
        }
      );
    }

    queueMicrotask(doSubscribe);

    return () => {
      mounted = false;
      if (currentUnsubscribe) currentUnsubscribe();
    };
  }, [userType, providerUserId, notifications]);
}
