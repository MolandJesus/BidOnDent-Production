/**
 * Shop Report Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for new damage_reports INSERTs.
 * When a new report arrives:
 *   1. Pushes an in-app notification (toast + feed entry)
 *   2. Calls the provided refetch callback to refresh the report list
 *
 * Only active when userType === "shop". Cleans up on unmount.
 */

import { useEffect, useRef } from "react";
import {
  realtimeReportService,
  type RealtimeReportPayload,
} from "../services/realtime/RealtimeReportService";
import { useNotifications } from "../features/notifications";

interface UseShopReportNotificationsOptions {
  userType: string;
  onNewReport?: () => void;
}

export function useShopReportNotifications({
  userType,
  onNewReport,
}: UseShopReportNotificationsOptions): void {
  const notifications = useNotifications();
  const onNewReportRef = useRef(onNewReport);
  onNewReportRef.current = onNewReport;

  useEffect(() => {
    if (userType !== "shop") return;

    const handleNewReport = (report: RealtimeReportPayload) => {
      const vehicle = [report.vehicleYear, report.vehicleMake, report.vehicleModel]
        .filter(Boolean)
        .join(" ");
      const location = [report.city, report.state].filter(Boolean).join(", ");
      const title = vehicle ? `New repair request: ${vehicle}` : "New repair request submitted";
      const body = location
        ? `${report.damageType || "Dent repair"} in ${location}`
        : report.damageType || "A customer needs dent repair";

      notifications.push({
        category: "report",
        title,
        body,
        payload: { reportId: report.id },
        userId: "",
        deepLink: { screen: "report", reportId: report.id },
        priority: "high",
      });

      onNewReportRef.current?.();
    };

    const unsubscribe = realtimeReportService.subscribe(handleNewReport);

    return () => {
      unsubscribe();
    };
  }, [userType, notifications]);
}
