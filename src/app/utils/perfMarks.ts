/**
 * Performance API marks for PMS-related measurement gates.
 *
 * Phase 0 of the PMS preparation lane (Pass 262). Production-safe:
 * `performance.mark` is a near-zero-cost browser API and these helpers
 * carry no semantic effect beyond emitting the mark itself. No state
 * is mutated; no behavior is observable except through Performance API
 * consumers (Playwright assertions, dev counters in `devMapInstanceCounter`).
 *
 * Refs:
 *   - docs/REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md §7.4 (G4 methodology)
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §3 (Phase 0 spec)
 */

const ENGINE_MOUNT_PREFIX = "bd:engine:mount";
const ENGINE_DISPOSE_PREFIX = "bd:engine:dispose";
const ROUTE_ENTER_PREFIX = "bd:route:enter";
const ROUTE_LEAVE_PREFIX = "bd:route:leave";

function safeMark(name: string): void {
  if (typeof performance === "undefined" || typeof performance.mark !== "function") return;
  try {
    performance.mark(name);
  } catch {
    // Swallow — perf marks must never affect runtime semantics.
  }
}

export function markEngineMount(engineId: string): void {
  safeMark(`${ENGINE_MOUNT_PREFIX}:${engineId}`);
}

export function markEngineDispose(engineId: string): void {
  safeMark(`${ENGINE_DISPOSE_PREFIX}:${engineId}`);
}

export function markRouteEnter(routeName: string): void {
  safeMark(`${ROUTE_ENTER_PREFIX}:${routeName}`);
}

export function markRouteLeave(routeName: string): void {
  safeMark(`${ROUTE_LEAVE_PREFIX}:${routeName}`);
}

export const PERF_MARK_PREFIXES = {
  engineMount: ENGINE_MOUNT_PREFIX,
  engineDispose: ENGINE_DISPOSE_PREFIX,
  routeEnter: ROUTE_ENTER_PREFIX,
  routeLeave: ROUTE_LEAVE_PREFIX,
} as const;
