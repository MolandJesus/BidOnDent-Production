/**
 * Phase 0 (Pass 262) — perfMarks contract test.
 *
 * Verifies the four PMS-related Performance API mark helpers fire
 * with the documented name shape (`bd:engine:mount:<id>` etc.) so
 * the eventual Playwright G2/G4 assertions can rely on stable mark
 * names. Production-safe: the helpers carry no semantic effect
 * beyond emitting the mark.
 *
 * Refs:
 *   - src/app/utils/perfMarks.ts
 *   - docs/REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md §7.4
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §3.4
 */

import { describe, it, expect, beforeEach } from "vitest";
import {
  PERF_MARK_PREFIXES,
  markEngineDispose,
  markEngineMount,
  markRouteEnter,
  markRouteLeave,
} from "../utils/perfMarks";

describe("perfMarks contract (Phase 0 / Pass 262)", () => {
  beforeEach(() => {
    if (typeof performance !== "undefined" && typeof performance.clearMarks === "function") {
      performance.clearMarks();
    }
  });

  it("markEngineMount emits bd:engine:mount:<id>", () => {
    markEngineMount("e1:coverage");
    const entries = performance.getEntriesByName(`${PERF_MARK_PREFIXES.engineMount}:e1:coverage`);
    expect(entries.length).toBe(1);
    expect(entries[0].entryType).toBe("mark");
  });

  it("markEngineDispose emits bd:engine:dispose:<id>", () => {
    markEngineDispose("e2:shop-directory");
    const entries = performance.getEntriesByName(
      `${PERF_MARK_PREFIXES.engineDispose}:e2:shop-directory`
    );
    expect(entries.length).toBe(1);
    expect(entries[0].entryType).toBe("mark");
  });

  it("markRouteEnter emits bd:route:enter:<name>", () => {
    markRouteEnter("hashPage:about");
    const entries = performance.getEntriesByName(
      `${PERF_MARK_PREFIXES.routeEnter}:hashPage:about`
    );
    expect(entries.length).toBe(1);
  });

  it("markRouteLeave emits bd:route:leave:<name>", () => {
    markRouteLeave("hashPage:about");
    const entries = performance.getEntriesByName(
      `${PERF_MARK_PREFIXES.routeLeave}:hashPage:about`
    );
    expect(entries.length).toBe(1);
  });

  it("each mount/dispose pair emits exactly two distinct marks", () => {
    markEngineMount("e3:test-id-A");
    markEngineDispose("e3:test-id-A");
    const mountEntries = performance.getEntriesByName(
      `${PERF_MARK_PREFIXES.engineMount}:e3:test-id-A`
    );
    const disposeEntries = performance.getEntriesByName(
      `${PERF_MARK_PREFIXES.engineDispose}:e3:test-id-A`
    );
    expect(mountEntries.length).toBe(1);
    expect(disposeEntries.length).toBe(1);
    expect(disposeEntries[0].startTime).toBeGreaterThanOrEqual(mountEntries[0].startTime);
  });

  it("multiple Engine 3 instances with distinct ids produce distinct marks", () => {
    markEngineMount("e3:id-A");
    markEngineMount("e3:id-B");
    expect(
      performance.getEntriesByName(`${PERF_MARK_PREFIXES.engineMount}:e3:id-A`).length
    ).toBe(1);
    expect(
      performance.getEntriesByName(`${PERF_MARK_PREFIXES.engineMount}:e3:id-B`).length
    ).toBe(1);
  });

  it("PERF_MARK_PREFIXES constants are stable and namespaced", () => {
    expect(PERF_MARK_PREFIXES.engineMount).toBe("bd:engine:mount");
    expect(PERF_MARK_PREFIXES.engineDispose).toBe("bd:engine:dispose");
    expect(PERF_MARK_PREFIXES.routeEnter).toBe("bd:route:enter");
    expect(PERF_MARK_PREFIXES.routeLeave).toBe("bd:route:leave");
  });
});
