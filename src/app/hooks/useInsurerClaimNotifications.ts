/**
 * Insurer Claim Status Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for damage_reports UPDATEs.
 * When a claim the insurer has visibility on changes status
 * (claim_status field updated), pushes an in-app notification.
 *
 * Claims are stored as damage_reports with claim decision fields.
 * Only active when userType === "insurer".
 * Cleans up on unmount.
 */

import { useEffect, useRef } from "react";
import {
  realtimeReportService,
  type RealtimeReportPayload,
} from "../services/realtime/RealtimeReportService";
import { useNotifications } from "../features/notifications";

interface UseInsurerClaimNotificationsOptions {
  userType: string;
  onClaimStatusChange?: () => void;
}

export function useInsurerClaimNotifications({
  userType,
  onClaimStatusChange,
}: UseInsurerClaimNotificationsOptions): void {
  const notifications = useNotifications();
  const onChangeRef = useRef(onClaimStatusChange);
  onChangeRef.current = onClaimStatusChange;

  useEffect(() => {
    if (userType !== "insurer") return;

    const unsub = realtimeReportService.subscribeToReportUpdates(
      (report: RealtimeReportPayload) => {
        // We get ALL report updates — for insurers, all are relevant claims
        const status = report.status ?? "";

        // Only notify for meaningful claim-lifecycle transitions
        const isClaimEvent =
          status === "in-review" || status === "completed" || status === "cancelled";

        if (!isClaimEvent) return;

        const vehicle = [report.vehicleYear, report.vehicleMake, report.vehicleModel]
          .filter(Boolean)
          .join(" ");

        const title =
          status === "completed"
            ? "Claim resolved"
            : status === "in-review"
              ? "Claim under review"
              : "Claim cancelled";

        const body =
          status === "completed"
            ? vehicle
              ? `${vehicle} — claim has been resolved.`
              : "A claim has been resolved."
            : status === "in-review"
              ? vehicle
                ? `${vehicle} — claim is being reviewed.`
                : "A claim is being reviewed."
              : vehicle
                ? `${vehicle} — claim was cancelled.`
                : "A claim was cancelled.";

        notifications.push({
          category: "report",
          title,
          body,
          payload: { reportId: report.id, status },
          userId: "",
          deepLink: { screen: "report", reportId: report.id },
          priority: status === "completed" ? "high" : "normal",
        });

        onChangeRef.current?.();
      }
    );

    return unsub;
  }, [userType, notifications]);
}
