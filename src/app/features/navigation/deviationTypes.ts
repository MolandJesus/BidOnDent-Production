/**
 * Deviation Detection — Domain Types
 *
 * A deviation is a meaningful change from expected behavior or route context.
 * These types form the foundation for BidOnDent's navigation intelligence layer.
 *
 * DeviationEvent is a discriminated union keyed on `type`. Each variant
 * carries strictly typed metadata so consumers can narrow safely:
 *
 *   if (event.type === "off_route") {
 *     console.log(event.metadata.distanceMiles); // ← typed
 *   }
 */

/** Classification of what kind of deviation was detected. */
export type DeviationType = "route_change" | "off_route" | "stopped" | "delay_increase" | "unknown";

/** How urgent/significant the deviation is. */
export type DeviationSeverity = "low" | "medium" | "high";

/** Lat/lng position used within deviation metadata. */
export interface DeviationPosition {
  latitude: number;
  longitude: number;
}

/* ------------------------------------------------------------------ */
/*  Shared event fields                                                */
/* ------------------------------------------------------------------ */

/** Fields common to every deviation event variant. */
interface DeviationEventBase {
  /** Unique identifier for this event (ISO timestamp + type slug). */
  id: string;
  /** Urgency level. */
  severity: DeviationSeverity;
  /** ISO 8601 timestamp of when the deviation was detected. */
  timestamp: string;
  /** Human-readable description of what happened. */
  description: string;
}

/* ------------------------------------------------------------------ */
/*  Per-type event variants                                            */
/* ------------------------------------------------------------------ */

/** The active route changed to a different route ID. */
export interface RouteChangeEvent extends DeviationEventBase {
  type: "route_change";
  metadata: {
    previousRouteId: string;
    currentRouteId: string;
  };
}

/** User has deviated from the active route polyline. */
export interface OffRouteEvent extends DeviationEventBase {
  type: "off_route";
  metadata: {
    distanceMiles: number;
    position: DeviationPosition;
  };
}

/** User appears to have stopped moving. */
export interface StoppedEvent extends DeviationEventBase {
  type: "stopped";
  metadata: {
    speedMph: number;
    position: DeviationPosition | null;
  };
}

/** Estimated arrival time increased significantly. */
export interface DelayIncreaseEvent extends DeviationEventBase {
  type: "delay_increase";
  metadata: {
    previousDuration: number;
    currentDuration: number;
    increaseMinutes: number;
    routeId: string;
  };
}

/** Catch-all for unrecognized deviation signals. */
export interface UnknownDeviationEvent extends DeviationEventBase {
  type: "unknown";
  metadata: Record<string, unknown>;
}

/* ------------------------------------------------------------------ */
/*  Discriminated union                                                */
/* ------------------------------------------------------------------ */

/**
 * A single detected deviation event.
 *
 * Discriminated on `type` — narrow to access typed metadata.
 */
export type DeviationEvent =
  | RouteChangeEvent
  | OffRouteEvent
  | StoppedEvent
  | DelayIncreaseEvent
  | UnknownDeviationEvent;

/**
 * Snapshot of navigation state at a single point in time.
 * Used as input to deviation detection so the detector can compare
 * two consecutive snapshots without reaching into external state.
 */
export interface NavigationSnapshot {
  /** Currently selected route ID (e.g. "fastest", "balanced", "local"). */
  routeId: string | null;
  /** Expected duration of the active route in minutes. */
  estimatedDurationMinutes: number | null;
  /** User's current position, if GPS is active. */
  currentPosition: { latitude: number; longitude: number } | null;
  /** User's current speed in mph, if GPS is active. */
  currentSpeedMph: number | null;
  /** Route polyline coordinates for off-route distance checks. */
  routePolyline: Array<{ latitude: number; longitude: number }>;
  /** ISO timestamp of when this snapshot was taken. */
  capturedAt: string;
}

/** Maximum number of recent deviation events to retain. */
export const MAX_DEVIATION_HISTORY = 20;

/** Speed threshold (mph) below which the user is considered stopped. */
export const STOPPED_SPEED_THRESHOLD_MPH = 2;

/**
 * Minimum distance from route polyline (in miles) before
 * flagging an off-route deviation.
 */
export const OFF_ROUTE_THRESHOLD_MILES = 0.3;
