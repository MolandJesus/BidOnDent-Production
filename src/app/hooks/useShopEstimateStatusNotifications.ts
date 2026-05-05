/**
 * Shop Estimate Status Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for estimate_requests UPDATEs.
 * When a customer accepts or declines a shop's estimate:
 *   1. Pushes an in-app notification (toast + feed entry)
 *   2. Calls the provided refetch callback to refresh the estimate inbox
 *
 * Only active when userType === "shop". Cleans up on unmount.
 */

import { useEffect, useRef } from "react";
import {
  realtimeEstimateService,
  type RealtimeEstimatePayload,
} from "../services/realtime/RealtimeEstimateService";
import { useNotifications } from "../features/notifications";

interface UseShopEstimateStatusOptions {
  userType: string;
  onEstimateStatusChange?: () => void;
}

export function useShopEstimateStatusNotifications({
  userType,
  onEstimateStatusChange,
}: UseShopEstimateStatusOptions): void {
  const notifications = useNotifications();
  const onChangeRef = useRef(onEstimateStatusChange);
  onChangeRef.current = onEstimateStatusChange;

  useEffect(() => {
    if (userType !== "shop") return;

    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const handleEstimateUpdate = (estimate: RealtimeEstimatePayload) => {
      if (estimate.status !== "accepted" && estimate.status !== "declined") return;

      const isAccepted = estimate.status === "accepted";
      const descSnippet = estimate.description
        ? ` for "${estimate.description.slice(0, 60)}${estimate.description.length > 60 ? "…" : ""}"`
        : "";

      notifications.push({
        category: "estimate",
        title: isAccepted ? "Estimate Accepted" : "Estimate Declined",
        body: isAccepted
          ? `A customer accepted your estimate${descSnippet}. Prepare for the job!`
          : `A customer declined your estimate${descSnippet}.`,
        payload: { estimateId: estimate.id, status: estimate.status },
        userId: "",
        deepLink: { screen: "estimates" },
        priority: isAccepted ? "high" : "normal",
      });

      onChangeRef.current?.();
    };

    function doSubscribe() {
      // StrictMode-safe: defer subscribe by one microtask + `mounted` short-circuit.
      // See useBidsForReport.ts for full mechanism + KI-057.
      if (!mounted) return;
      unsubscribe = realtimeEstimateService.subscribeToUpdates(handleEstimateUpdate);
    }

    queueMicrotask(doSubscribe);

    return () => {
      mounted = false;
      if (unsubscribe) unsubscribe();
    };
  }, [userType, notifications]);
}
