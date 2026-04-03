/**
 * Notification Events — Domain Types
 *
 * Foundation for BidOnDent's unified notification system.
 * Supports in-app feed, toast, and future push notifications.
 *
 * Deep linking allows any notification to navigate to relevant context:
 *   navigation → resume route
 *   reports    → open damage report
 *   bids       → open shop interaction
 */

// ─── Event types ─────────────────────────────────────────────────

export type NotificationCategory =
  | "navigation"
  | "reroute"
  | "report"
  | "bid"
  | "shop"
  | "insurer"
  | "system";

// ─── Deep link targets ──────────────────────────────────────────

export type NotificationDeepLink =
  | { screen: "navigation"; sessionId: string }
  | { screen: "report"; reportId: string }
  | { screen: "bid"; bidId: string; reportId?: string }
  | { screen: "shop"; shopId: string }
  | { screen: "shop-directory" }
  | { screen: "dashboard" }
  | null;

// ─── Core event model ───────────────────────────────────────────

export interface NotificationEvent {
  /** Unique identifier. */
  id: string;
  /** Category for routing and display. */
  category: NotificationCategory;
  /** Short title (shown in feed header / toast). */
  title: string;
  /** Longer description (shown in feed body). */
  body: string;
  /** Arbitrary structured data for consumers. */
  payload: Record<string, unknown>;
  /** User this notification belongs to. */
  userId: string;
  /** ISO 8601 creation timestamp. */
  createdAt: string;
  /** Whether the user has seen/dismissed this notification. */
  read: boolean;
  /** Optional deep link to navigate to relevant context. */
  deepLink: NotificationDeepLink;
  /** Display priority (higher = more prominent). */
  priority: "low" | "normal" | "high";
}

// ─── Toast config ───────────────────────────────────────────────

export type ToastVariant = "info" | "success" | "warning" | "error";

export interface NotificationToast {
  /** Message to display. */
  message: string;
  /** Visual variant. */
  variant: ToastVariant;
  /** Duration in ms before auto-dismiss (0 = persistent). */
  durationMs: number;
  /** Deep link if user taps/clicks the toast. */
  deepLink: NotificationDeepLink;
}

// ─── Constants ──────────────────────────────────────────────────

export const MAX_NOTIFICATION_FEED = 100;
export const DEFAULT_TOAST_DURATION_MS = 4_000;
