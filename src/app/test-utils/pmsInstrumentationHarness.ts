/**
 * PMS instrumentation test harness — shared utilities for tests
 * that interact with Pass 262 instrumentation (perfMarks helpers,
 * dev counter PerformanceObserver, AppShell route marks).
 *
 * Pass 265 — extraction from the duplicated helper bodies that grew
 * across pass262UtilsHardening, pass262EngineRouteVerification, and
 * pass264StressAndTimingOrder. Three-file duplication is past the
 * threshold where shared canon prevents drift.
 *
 * This module is test-only — it has no production export path and
 * does not run in production builds (vitest + jsdom only).
 *
 * Usage pattern (delta-based assertions, the Pass 263 fix for
 * cross-test contamination from the persistent PerformanceObserver):
 *
 *   import {
 *     flushPmsObserver,
 *     snapshotPmsCounter,
 *     getEngine3MountMarks,
 *   } from "../test-utils/pmsInstrumentationHarness";
 *
 *   beforeEach(async () => {
 *     await flushPmsObserver();
 *     clearAllPmsMarks();
 *     window.location.hash = "";   // if using useHashPage
 *   });
 *
 *   it("...", async () => {
 *     const before = snapshotPmsCounter();
 *     // ... mount/unmount components, trigger marks
 *     await flushPmsObserver();
 *     const after = snapshotPmsCounter();
 *     expect(after.created - before.created).toBe(N);
 *   });
 *
 * Refs:
 *   - src/app/utils/perfMarks.ts (the production-side helpers)
 *   - src/app/utils/devMapInstanceCounter.ts (the observer this harness queries)
 *   - docs/REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md §7 (methodology)
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §3 (Phase 0 spec)
 */

import { PERF_MARK_PREFIXES } from "../utils/perfMarks";

// ────────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────────

export type PmsCounterSnapshot = {
  created: number;
  destroyed: number;
  active: number;
};

declare global {
  interface Window {
    __bdMapInstanceCount?: PmsCounterSnapshot;
    __bdGlContextLog?: Array<{ contextType: string; timestamp: number }>;
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Observer flush
// ────────────────────────────────────────────────────────────────────────────

/**
 * Drain the PerformanceObserver microtask + macrotask queues so any
 * pending mount/dispose callbacks have applied to the counter before
 * a test reads it.
 *
 * Two cycles handle the typical scheduling order between
 * `setTimeout(0)` (macrotask) and `Promise.resolve()` (microtask),
 * which can vary by jsdom version.
 */
export async function flushPmsObserver(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
  await Promise.resolve();
}

// ────────────────────────────────────────────────────────────────────────────
// Counter snapshot (delta-assertion pattern)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Snapshot the dev instance counter. Use this BEFORE and AFTER a test
 * action and compare deltas — never assert absolute values, since the
 * PerformanceObserver subscription persists across tests.
 */
export function snapshotPmsCounter(): PmsCounterSnapshot {
  const c = window.__bdMapInstanceCount;
  return c ? { ...c } : { created: 0, destroyed: 0, active: 0 };
}

// ────────────────────────────────────────────────────────────────────────────
// Mark queries
// ────────────────────────────────────────────────────────────────────────────

export function getEngine3MountMarks(): PerformanceEntry[] {
  return performance
    .getEntriesByType("mark")
    .filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.engineMount}:e3:`));
}

export function getEngine3DisposeMarks(): PerformanceEntry[] {
  return performance
    .getEntriesByType("mark")
    .filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.engineDispose}:e3:`));
}

export function getEngineMountMarks(enginePrefix: "e1" | "e2" | "e3"): PerformanceEntry[] {
  return performance
    .getEntriesByType("mark")
    .filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.engineMount}:${enginePrefix}:`));
}

export function getEngineDisposeMarks(enginePrefix: "e1" | "e2" | "e3"): PerformanceEntry[] {
  return performance
    .getEntriesByType("mark")
    .filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.engineDispose}:${enginePrefix}:`));
}

export function getRouteMarks(): { enter: PerformanceEntry[]; leave: PerformanceEntry[] } {
  const all = performance.getEntriesByType("mark");
  return {
    enter: all.filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.routeEnter}:`)),
    leave: all.filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.routeLeave}:`)),
  };
}

// ────────────────────────────────────────────────────────────────────────────
// State reset
// ────────────────────────────────────────────────────────────────────────────

/**
 * Clear all `performance.mark()` entries. Note: this does NOT reset
 * the counter — counter is the authoritative running tally per Pass
 * 264 §4. Pair with delta assertions, never absolute counts.
 */
export function clearAllPmsMarks(): void {
  if (typeof performance !== "undefined" && typeof performance.clearMarks === "function") {
    performance.clearMarks();
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Hash route helper (for tests using AppShell.useHashPage)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Set a hash and explicitly dispatch the `hashchange` event. jsdom's
 * native hashchange dispatch is unreliable across versions; this
 * guarantees the listener fires.
 *
 * For tests that depend on `useHashPage` initialization, set
 * `window.location.hash = ""` in beforeEach to prevent residual hash
 * state from earlier tests leaking into `previousPageRef`. (Lesson
 * documented during Pass 264 — two test failures traced to this.)
 */
export function setPmsHash(hash: string): void {
  window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

// ────────────────────────────────────────────────────────────────────────────
// Engine ID extraction (for mount/dispose pairing in Playwright)
// ────────────────────────────────────────────────────────────────────────────

/**
 * Extract the engineId suffix from a mount mark name. Inverse of
 * `markEngineMount(engineId)`. Used to pair mount marks to dispose
 * marks by suffix in test assertions.
 */
export function engineIdFromMountMark(name: string): string {
  const prefix = `${PERF_MARK_PREFIXES.engineMount}:`;
  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
}

export function engineIdFromDisposeMark(name: string): string {
  const prefix = `${PERF_MARK_PREFIXES.engineDispose}:`;
  return name.startsWith(prefix) ? name.slice(prefix.length) : name;
}
