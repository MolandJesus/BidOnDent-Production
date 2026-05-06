/**
 * Customer Estimate Response Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for estimate_requests UPDATEs.
 * When a shop responds to a customer's estimate request (status → "responded"):
 *   1. Pushes an in-app notification (toast + feed entry)
 *   2. Calls the provided refetch callback to refresh the estimate list
 *
 * Only active when userType === "customer". Cleans up on unmount.
 */

import { useEffect, useRef } from "react";
import {
  realtimeEstimateService,
  type RealtimeEstimatePayload,
} from "../services/realtime/RealtimeEstimateService";
import { useNotifications } from "../features/notifications";

interface UseCustomerEstimateResponseOptions {
  userType: string;
  onEstimateResponse?: () => void;
}

export function useCustomerEstimateResponseNotifications({
  userType,
  onEstimateResponse,
}: UseCustomerEstimateResponseOptions): void {
  const notifications = useNotifications();
  const onEstimateResponseRef = useRef(onEstimateResponse);
  onEstimateResponseRef.current = onEstimateResponse;

  useEffect(() => {
    if (userType !== "customer") return;

    let mounted = true;
    let unsubscribe: (() => void) | null = null;

    const handleEstimateUpdate = (estimate: RealtimeEstimatePayload) => {
      // Only notify for "responded" status (shop sent pricing back)
      if (estimate.status !== "responded") return;

      const shopLabel = estimate.shopName || "A shop";

      notifications.push({
        category: "estimate",
        title: "Estimate Response Received",
        body: `${shopLabel} responded to your estimate request. Tap to review their pricing.`,
        payload: { estimateId: estimate.id },
        userId: "",
        deepLink: { screen: "dashboard" },
        priority: "high",
      });

      onEstimateResponseRef.current?.();
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
