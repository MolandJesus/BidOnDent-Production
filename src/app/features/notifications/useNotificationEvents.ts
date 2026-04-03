/**
 * Notification Events — React Hook
 *
 * In-memory notification feed with toast support.
 * Designed for in-app notification consumption — future versions
 * can integrate with push notification services and Supabase persistence.
 */

import { useCallback, useRef, useState } from "react";
import type {
  NotificationEvent,
  NotificationToast,
  NotificationDeepLink,
  NotificationCategory,
} from "./notificationEventTypes";
import { MAX_NOTIFICATION_FEED, DEFAULT_TOAST_DURATION_MS } from "./notificationEventTypes";

export interface NotificationActions {
  /** All notifications, newest first. */
  events: NotificationEvent[];
  /** Current toast (if any). */
  activeToast: NotificationToast | null;
  /** Number of unread notifications. */
  unreadCount: number;
  /** Push a new notification event. */
  push: (event: Omit<NotificationEvent, "id" | "createdAt" | "read">) => void;
  /** Mark a specific notification as read. */
  markRead: (eventId: string) => void;
  /** Mark all notifications as read. */
  markAllRead: () => void;
  /** Dismiss the active toast. */
  dismissToast: () => void;
  /** Show a toast directly (without creating a feed event). */
  showToast: (toast: NotificationToast) => void;
  /** Clear all notifications. */
  clear: () => void;
  /** Register a deep link navigation handler (called by AppContent). */
  setDeepLinkHandler: (handler: ((deepLink: NotificationDeepLink) => void) | null) => void;
  /** Navigate via deep link (used by toast click). */
  navigateDeepLink: (deepLink: NotificationDeepLink) => void;
}

let notificationIdCounter = 0;

function createNotificationId(): string {
  notificationIdCounter += 1;
  return `notify-${Date.now()}-${notificationIdCounter}`;
}

/** Categories that show a toast when pushed. */
const TOAST_CATEGORIES: Set<NotificationCategory> = new Set([
  "navigation",
  "reroute",
  "bid",
  "system",
]);

export function useNotificationEvents(): NotificationActions {
  const [events, setEvents] = useState<NotificationEvent[]>([]);
  const [activeToast, setActiveToast] = useState<NotificationToast | null>(null);
  const deepLinkHandlerRef = useRef<((deepLink: NotificationDeepLink) => void) | null>(null);

  const push = useCallback((partial: Omit<NotificationEvent, "id" | "createdAt" | "read">) => {
    const event: NotificationEvent = {
      ...partial,
      id: createNotificationId(),
      createdAt: new Date().toISOString(),
      read: false,
    };

    setEvents((prev) => [event, ...prev].slice(0, MAX_NOTIFICATION_FEED));

    // Auto-show toast for high-signal categories
    if (TOAST_CATEGORIES.has(event.category) || event.priority === "high") {
      setActiveToast({
        message: event.title,
        variant: event.priority === "high" ? "warning" : "info",
        durationMs: DEFAULT_TOAST_DURATION_MS,
        deepLink: event.deepLink,
      });
    }
  }, []);

  const markRead = useCallback((eventId: string) => {
    setEvents((prev) => prev.map((e) => (e.id === eventId ? { ...e, read: true } : e)));
  }, []);

  const markAllRead = useCallback(() => {
    setEvents((prev) => prev.map((e) => ({ ...e, read: true })));
  }, []);

  const dismissToast = useCallback(() => setActiveToast(null), []);
  const showToast = useCallback((toast: NotificationToast) => setActiveToast(toast), []);
  const clear = useCallback(() => setEvents([]), []);

  const setDeepLinkHandler = useCallback(
    (handler: ((deepLink: NotificationDeepLink) => void) | null) => {
      deepLinkHandlerRef.current = handler;
    },
    []
  );

  const navigateDeepLink = useCallback((deepLink: NotificationDeepLink) => {
    if (deepLink && deepLinkHandlerRef.current) {
      deepLinkHandlerRef.current(deepLink);
    }
  }, []);

  const unreadCount = events.filter((e) => !e.read).length;

  return {
    events,
    activeToast,
    unreadCount,
    push,
    markRead,
    markAllRead,
    dismissToast,
    showToast,
    clear,
    setDeepLinkHandler,
    navigateDeepLink,
  };
}

// Re-export deep link type for consumers
export type { NotificationDeepLink };
