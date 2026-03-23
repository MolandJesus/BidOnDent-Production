/**
 * Navigation Intelligence — Public API
 *
 * Foundation layer for BidOnDent's deviation detection and reroute system.
 * Re-exports types, detection helpers, reroute decision logic, and hooks.
 */

export type {
  DeviationEvent,
  DeviationPosition,
  DeviationSeverity,
  DeviationType,
  DelayIncreaseEvent,
  NavigationSnapshot,
  OffRouteEvent,
  RouteChangeEvent,
  StoppedEvent,
  UnknownDeviationEvent,
} from "./deviationTypes";

export {
  MAX_DEVIATION_HISTORY,
  OFF_ROUTE_THRESHOLD_MILES,
  STOPPED_SPEED_THRESHOLD_MPH,
} from "./deviationTypes";

export { detectDeviations } from "./detectDeviation";

export {
  useNavigationIntelligence,
  type NavigationIntelligence,
} from "./useNavigationIntelligence";

// ─── Reroute groundwork ─────────────────────────────────────────────

export type { RerouteOrigin, RerouteRequest, RerouteState, RerouteStatus } from "./rerouteTypes";

export { REROUTE_COOLDOWN_MS, REROUTE_MIN_SEVERITY } from "./rerouteTypes";

export { shouldTriggerReroute, type RerouteDecision } from "./shouldTriggerReroute";

export { useNavigationReroute, type NavigationReroute } from "./useNavigationReroute";

// ─── Voice deviation alerts ─────────────────────────────────────────

export { getDeviationPhrase, getReroutePhrase } from "./deviationVoicePhrases";

export {
  useNavigationVoiceAlerts,
  type NavigationVoiceAlerts,
  type VoiceAlertSnapshot,
} from "./useNavigationVoiceAlerts";
// ─── Session lifecycle ──────────────────────────────────────────

export type {
  NavigationSession,
  NavigationSessionActions,
  NavigationSessionEvent,
  NavigationSessionStatus,
  SessionPauseEntry,
  SessionWaypoint,
} from "./sessionTypes";

export { useNavigationSession } from "./useNavigationSession";
export { useNavigationToastBridge } from "./useNavigationToastBridge";
