/**
 * Shop Estimate Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for new estimate_requests INSERTs.
 * When a new estimate request arrives:
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

interface UseShopEstimateNotificationsOptions {
  userType: string;
  onNewEstimate?: () => void;
}

export function useShopEstimateNotifications({
  userType,
  onNewEstimate,
}: UseShopEstimateNotificationsOptions): void {
  const notifications = useNotifications();
  const onNewEstimateRef = useRef(onNewEstimate);
  onNewEstimateRef.current = onNewEstimate;

  useEffect(() => {
    if (userType !== "shop") return;

    const handleNewEstimate = (estimate: RealtimeEstimatePayload) => {
      const timeline =
        estimate.timeline === "urgent"
          ? "ASAP"
          : estimate.timeline === "this-week"
            ? "This week"
            : "Flexible";

      notifications.push({
        category: "estimate",
        title: "New Estimate Request",
        body: estimate.description
          ? `${estimate.description.slice(0, 80)}${estimate.description.length > 80 ? "…" : ""} — Timeline: ${timeline}`
          : `A customer requested an estimate. Timeline: ${timeline}`,
        payload: { estimateId: estimate.id },
        userId: "",
        deepLink: { screen: "estimates" },
        priority: "high",
      });

      onNewEstimateRef.current?.();
    };

    const unsubscribe = realtimeEstimateService.subscribe(handleNewEstimate);

    return () => {
      unsubscribe();
    };
  }, [userType, notifications]);
}
