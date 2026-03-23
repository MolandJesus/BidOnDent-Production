/**
 * Navigation Session Lifecycle — Type Definitions
 *
 * Defines the in-app navigation session state machine:
 *
 *   idle → planning → active → paused → active → ended
 *                  ↘─────────────────────────────↗
 *
 * Complements ExternalNavigationSession (which only tracks launches
 * to third-party nav apps) with a first-party session lifecycle
 * that BidOnDent owns end-to-end.
 */

import type { NavigationCoordinate } from "../../types/navigation";

// ─── Session status ──────────────────────────────────────────────

export type NavigationSessionStatus = "idle" | "planning" | "active" | "paused" | "ended";

// ─── Session origin / destination ────────────────────────────────

export type SessionWaypoint = {
  id: string;
  label: string;
  address?: string;
  coordinate: NavigationCoordinate;
};

// ─── Pause / resume ledger ───────────────────────────────────────

export type SessionPauseEntry = {
  pausedAt: string;
  resumedAt: string | null;
  reason?: "user" | "background" | "signal-loss";
};

// ─── Core session record ─────────────────────────────────────────

export type NavigationSession = {
  /** Unique session identifier. */
  id: string;
  /** Current lifecycle status. */
  status: NavigationSessionStatus;
  /** Where the user is starting from. */
  origin: SessionWaypoint | null;
  /** Where the user is headed. */
  destination: SessionWaypoint | null;
  /** ID of the active route (from routeOptions). */
  activeRouteId: string | null;
  /** ISO timestamp when the session entered "planning". */
  startedAt: string | null;
  /** ISO timestamp when the session entered "active". */
  activatedAt: string | null;
  /** ISO timestamp when the session entered "ended". */
  endedAt: string | null;
  /** Running total of active navigation seconds (excludes pauses). */
  activeSeconds: number;
  /** History of pauses during this session. */
  pauses: SessionPauseEntry[];
};

// ─── State-machine events ────────────────────────────────────────

export type NavigationSessionEvent =
  | { type: "START_PLANNING"; origin: SessionWaypoint | null; destination: SessionWaypoint }
  | { type: "SELECT_ROUTE"; routeId: string }
  | { type: "ACTIVATE" }
  | { type: "PAUSE"; reason?: SessionPauseEntry["reason"] }
  | { type: "RESUME" }
  | { type: "END" }
  | { type: "RESET" };

// ─── Hook return shape ───────────────────────────────────────────

export type NavigationSessionActions = {
  /** Current session state. */
  session: NavigationSession;
  /** Begin planning a navigation to a destination. */
  startPlanning: (origin: SessionWaypoint | null, destination: SessionWaypoint) => void;
  /** Lock in the chosen route. */
  selectRoute: (routeId: string) => void;
  /** Transition from planning → active. */
  activate: () => void;
  /** Pause an active session. */
  pause: (reason?: SessionPauseEntry["reason"]) => void;
  /** Resume a paused session. */
  resume: () => void;
  /** End the session (terminal state). */
  end: () => void;
  /** Reset back to idle (new session). */
  reset: () => void;
  /** True when status is "active" or "paused". */
  isNavigating: boolean;
  /** True when status is "planning", "active", or "paused". */
  hasSession: boolean;
  /** True if session was restored from cloud on mount. */
  restoredFromCloud: boolean;
  /** Most recent cloud sync error message, or null if healthy. */
  syncError: string | null;
};
