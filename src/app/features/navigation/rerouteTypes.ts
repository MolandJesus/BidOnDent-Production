/**
 * Reroute — Domain Types
 *
 * Types and constants that define the reroute action path.
 * Reroute is the system's response to meaningful off-route deviation.
 *
 * This is groundwork — defines when reroute can happen, what a reroute
 * request looks like, and what states the reroute lifecycle passes through.
 * Full automatic rerouting builds on this later.
 */

import type { DeviationEvent } from "./deviationTypes";

/* ------------------------------------------------------------------ */
/*  Reroute lifecycle                                                  */
/* ------------------------------------------------------------------ */

/**
 * Where the reroute lifecycle currently sits.
 *
 * idle       → no reroute in progress, no recent trigger
 * eligible   → conditions met, reroute can be offered
 * pending    → user or system has requested a reroute, awaiting confirmation
 * completed  → reroute was accepted and applied
 * cooldown   → recent reroute completed; suppress repeat triggers
 */
export type RerouteStatus = "idle" | "eligible" | "pending" | "completed" | "cooldown";

/**
 * Who initiated the reroute.
 *
 * user_requested   → tapped "Review route" in the off-route prompt
 * system_suggested → system determined reroute is advisable (future)
 * auto             → auto-reroute triggered by high-severity off-route
 */
export type RerouteOrigin = "user_requested" | "system_suggested" | "auto";

/* ------------------------------------------------------------------ */
/*  Reroute request                                                    */
/* ------------------------------------------------------------------ */

/** A single reroute request with its originating context. */
export interface RerouteRequest {
  /** Unique identifier (ISO timestamp). */
  id: string;
  /** Who initiated this request. */
  origin: RerouteOrigin;
  /** The deviation event that made reroute eligible. */
  triggerEvent: DeviationEvent;
  /** The route ID that was active when reroute was triggered. */
  previousRouteId: string;
  /** ISO timestamp of when the request was created. */
  requestedAt: string;
}

/* ------------------------------------------------------------------ */
/*  Reroute state                                                      */
/* ------------------------------------------------------------------ */

/** Full reroute state — consumed by the orchestration hook. */
export interface RerouteState {
  /** Current lifecycle position. */
  status: RerouteStatus;
  /** The active reroute request, if any. */
  activeRequest: RerouteRequest | null;
  /** ISO timestamp of the last completed reroute (for cooldown). */
  lastCompletedAt: string | null;
  /** How many reroutes have been completed this session. */
  completedCount: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

/**
 * After a reroute is completed, suppress new triggers for this duration.
 * Prevents noisy re-triggering when the user is settling onto a new route.
 */
export const REROUTE_COOLDOWN_MS = 60_000; // 1 minute

/**
 * Minimum deviation severity that qualifies for reroute.
 * "low" deviations (e.g. briefly stopped) do not trigger reroute.
 */
export const REROUTE_MIN_SEVERITY: DeviationEvent["severity"] = "medium";
