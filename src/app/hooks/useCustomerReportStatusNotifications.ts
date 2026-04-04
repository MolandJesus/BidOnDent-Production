/**
 * Customer Report Status Notifications — Real-Time Hook
 *
 * Subscribes to Supabase Realtime for damage report UPDATEs.
 * When a customer's report status changes (e.g. pending → in-review → active):
 *   1. Pushes an in-app notification with status context
 *   2. Calls the optional refetch callback
 *
 * Only active when userType === "customer" and real (non-seed) reports exist.
 * Cleans up on unmount.
 */

import { useEffect, useRef } from "react";
import {
  realtimeReportService,
  type RealtimeReportPayload,
} from "../services/realtime/RealtimeReportService";
import { useNotifications } from "../features/notifications";
import type { DamageReport } from "../types";

interface UseCustomerReportStatusNotificationsOptions {
  userType: string;
  reports: DamageReport[];
  onReportStatusChange?: () => void;
}

const STATUS_LABELS: Record<string, { title: string; body: string }> = {
  "in-review": {
    title: "Report under review",
    body: "A shop is reviewing your repair request.",
  },
  active: {
    title: "Report is active",
    body: "Your repair request has an accepted bid — check your dashboard for details.",
  },
  completed: {
    title: "Repair completed",
    body: "Your repair has been marked as completed.",
  },
  cancelled: {
    title: "Report cancelled",
    body: "Your repair request has been cancelled.",
  },
};

export function useCustomerReportStatusNotifications({
  userType,
  reports,
  onReportStatusChange,
}: UseCustomerReportStatusNotificationsOptions): void {
  const notifications = useNotifications();
  const onChangeRef = useRef(onReportStatusChange);
  onChangeRef.current = onReportStatusChange;

  // Stable set of real (non-seed) report IDs
  const reportIdSet = useRef(new Set<string>());
  reportIdSet.current = new Set(
    reports
      .map((r) => r.id)
      .filter(Boolean)
      .filter((id) => !id.startsWith("seed-"))
  );

  useEffect(() => {
    if (userType !== "customer" || reportIdSet.current.size === 0) return;

    const unsub = realtimeReportService.subscribeToReportUpdates(
      (report: RealtimeReportPayload) => {
        // Only care about this customer's reports
        if (!reportIdSet.current.has(report.id)) return;

        const status = report.status ?? "";
        const labels = STATUS_LABELS[status];
        if (!labels) return; // Don't notify for unknown/unchanged statuses

        const vehicle = [report.vehicleYear, report.vehicleMake, report.vehicleModel]
          .filter(Boolean)
          .join(" ");

        notifications.push({
          category: "report",
          title: labels.title,
          body: vehicle ? `${vehicle} — ${labels.body}` : labels.body,
          payload: { reportId: report.id, status },
          userId: "",
          deepLink: { screen: "report", reportId: report.id },
          priority: status === "active" || status === "completed" ? "high" : "normal",
        });

        onChangeRef.current?.();
      }
    );

    return unsub;
  }, [userType, notifications]);
}
