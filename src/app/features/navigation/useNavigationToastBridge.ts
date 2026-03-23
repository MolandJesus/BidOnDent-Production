/**
 * Navigation → Toast Bridge Hook
 *
 * Watches navigation session status transitions and deviation events,
 * emitting toast notifications through the unified notification system.
 *
 * Keeps useNavigationSession and useNotifications decoupled —
 * this bridge hook runs at the consumer level (ShopDirectoryScreen).
 */

import { useEffect, useRef } from "react";
import type { DeviationEvent } from "./deviationTypes";
import type { NavigationSession } from "./sessionTypes";
import type { NotificationActions } from "../notifications/useNotificationEvents";

type SessionStatus = NavigationSession["status"];

/** Toast messages for session status transitions. */
const SESSION_TOAST_MAP: Partial<Record<SessionStatus, { title: string; body: string }>> = {
  active: { title: "Navigation started", body: "Follow the route to your destination." },
  paused: { title: "Navigation paused", body: "Resume when you're ready to continue." },
  ended: { title: "Navigation ended", body: "You've completed your route." },
};

/** Toast messages for deviation events. */
const DEVIATION_TOAST_MAP: Record<DeviationEvent["type"], { title: string; body: string }> = {
  route_change: { title: "Route updated", body: "A new route has been calculated." },
  off_route: { title: "Off route", body: "You've left the planned route." },
  stopped: { title: "Stopped detected", body: "Vehicle appears to be stopped." },
  delay_increase: { title: "Delay detected", body: "Travel time has increased." },
  unknown: { title: "Navigation event", body: "An unexpected event occurred." },
};

export function useNavigationToastBridge(
  session: NavigationSession,
  latestDeviation: DeviationEvent | null,
  notifications: NotificationActions,
  restoredFromCloud?: boolean,
  syncError?: string | null
): void {
  const prevStatusRef = useRef<SessionStatus>(session.status);
  const prevDeviationRef = useRef<DeviationEvent | null>(null);
  const restoredToastedRef = useRef(false);
  const prevSyncErrorRef = useRef<string | null>(null);

  // Watch session status transitions
  useEffect(() => {
    const prev = prevStatusRef.current;
    const next = session.status;
    prevStatusRef.current = next;

    if (prev === next) return;

    const toast = SESSION_TOAST_MAP[next];
    if (!toast) return;

    // Special case: resumed from paused → active
    const title = prev === "paused" && next === "active" ? "Navigation resumed" : toast.title;
    const body =
      prev === "paused" && next === "active" ? "Continuing to your destination." : toast.body;

    notifications.push({
      category: "navigation",
      title,
      body,
      payload: { sessionId: session.id, transition: `${prev}→${next}` },
      userId: "",
      deepLink: { screen: "navigation", sessionId: session.id },
      priority: "normal",
    });
  }, [session.status, session.id, notifications]);

  // Watch deviation events
  useEffect(() => {
    if (!latestDeviation || latestDeviation === prevDeviationRef.current) return;
    prevDeviationRef.current = latestDeviation;

    const toast = DEVIATION_TOAST_MAP[latestDeviation.type];
    if (!toast) return;

    notifications.push({
      category: latestDeviation.type === "off_route" ? "reroute" : "navigation",
      title: toast.title,
      body: toast.body,
      payload: { deviationType: latestDeviation.type, timestamp: latestDeviation.timestamp },
      userId: "",
      deepLink: null,
      priority: latestDeviation.type === "off_route" ? "high" : "normal",
    });
  }, [latestDeviation, notifications]);

  // Calm toast when session restored from cloud
  useEffect(() => {
    if (restoredFromCloud && !restoredToastedRef.current) {
      restoredToastedRef.current = true;
      notifications.showToast({
        message: "Previous session restored",
        variant: "info",
        durationMs: 3000,
        deepLink: null,
      });
    }
  }, [restoredFromCloud, notifications]);

  // Surface sync errors calmly (only on new errors)
  useEffect(() => {
    if (syncError && syncError !== prevSyncErrorRef.current) {
      notifications.showToast({
        message: "Session saved locally — cloud sync will retry",
        variant: "warning",
        durationMs: 4000,
        deepLink: null,
      });
    }
    prevSyncErrorRef.current = syncError ?? null;
  }, [syncError, notifications]);
}
