/**
 * Notification System — Public API
 *
 * Foundation layer for BidOnDent's unified notification system.
 * Supports in-app feed, toast display, and deep linking.
 *
 * Future: push notifications, Supabase persistence, cross-device sync.
 */

export type {
  NotificationCategory,
  NotificationDeepLink,
  NotificationEvent,
  NotificationToast,
  ToastVariant,
} from "./notificationEventTypes";

export { DEFAULT_TOAST_DURATION_MS, MAX_NOTIFICATION_FEED } from "./notificationEventTypes";

export { useNotificationEvents, type NotificationActions } from "./useNotificationEvents";

export { NotificationProvider, useNotifications } from "./NotificationContext";
