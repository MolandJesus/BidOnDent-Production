/**
 * Pass 265 — pmsInstrumentationHarness contract test.
 *
 * Verifies the shared test-utility module produces correct outputs
 * for the queries and helpers that pass262/263/264 tests now depend
 * on. Pinning the harness contract prevents silent regressions if
 * the module ever changes shape.
 *
 * Refs:
 *   - src/app/test-utils/pmsInstrumentationHarness.ts
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §3
 */

import { describe, it, expect, beforeEach } from "vitest";

import {
  clearAllPmsMarks,
  engineIdFromDisposeMark,
  engineIdFromMountMark,
  flushPmsObserver,
  getEngine3DisposeMarks,
  getEngine3MountMarks,
  getEngineDisposeMarks,
  getEngineMountMarks,
  getRouteMarks,
  setPmsHash,
  snapshotPmsCounter,
  type PmsCounterSnapshot,
} from "../test-utils/pmsInstrumentationHarness";
import {
  PERF_MARK_PREFIXES,
  markEngineDispose,
  markEngineMount,
  markRouteEnter,
  markRouteLeave,
} from "../utils/perfMarks";
import "../utils/devMapInstanceCounter";

describe("Pass 265 — pmsInstrumentationHarness", () => {
  beforeEach(async () => {
    await flushPmsObserver();
    clearAllPmsMarks();
    window.location.hash = "";
  });

  it("snapshotPmsCounter returns a frozen-shape object even when global counter is undefined", () => {
    const snap = snapshotPmsCounter();
    expect(snap).toMatchObject({
      created: expect.any(Number),
      destroyed: expect.any(Number),
      active: expect.any(Number),
    });
    // Snapshot must be a copy — mutating it must not affect the global counter.
    const before = window.__bdMapInstanceCount?.created ?? 0;
    snap.created = 999_999;
    expect(window.__bdMapInstanceCount?.created ?? 0).toBe(before);
  });

  it("getEngineMountMarks(e1|e2|e3) only returns marks for the requested engine prefix", () => {
    markEngineMount("e1:harness-test");
    markEngineMount("e2:harness-test");
    markEngineMount("e3:harness-test");

    const e1 = getEngineMountMarks("e1");
    const e2 = getEngineMountMarks("e2");
    const e3 = getEngineMountMarks("e3");

    expect(e1.length).toBe(1);
    expect(e2.length).toBe(1);
    expect(e3.length).toBe(1);
    expect(e1[0].name).toBe(`${PERF_MARK_PREFIXES.engineMount}:e1:harness-test`);
    expect(e2[0].name).toBe(`${PERF_MARK_PREFIXES.engineMount}:e2:harness-test`);
    expect(e3[0].name).toBe(`${PERF_MARK_PREFIXES.engineMount}:e3:harness-test`);
  });

  it("getEngine3MountMarks is equivalent to getEngineMountMarks('e3')", () => {
    markEngineMount("e3:equivalence-check");
    expect(getEngine3MountMarks().map((m) => m.name)).toEqual(
      getEngineMountMarks("e3").map((m) => m.name)
    );
  });

  it("getEngineDisposeMarks isolates dispose marks from mount marks", () => {
    markEngineMount("e1:dispose-isolation");
    markEngineDispose("e1:dispose-isolation");

    const mounts = getEngineMountMarks("e1");
    const disposes = getEngineDisposeMarks("e1");

    expect(mounts.length).toBe(1);
    expect(disposes.length).toBe(1);
    // Mount mark name must NOT appear in dispose query, and vice versa.
    expect(mounts[0].name).not.toBe(disposes[0].name);
  });

  it("getEngine3DisposeMarks is equivalent to getEngineDisposeMarks('e3')", () => {
    markEngineDispose("e3:dispose-equivalence");
    expect(getEngine3DisposeMarks().map((m) => m.name)).toEqual(
      getEngineDisposeMarks("e3").map((m) => m.name)
    );
  });

  it("getRouteMarks separates enter and leave correctly", () => {
    markRouteEnter("hashPage:harness");
    markRouteLeave("hashPage:harness");

    const { enter, leave } = getRouteMarks();
    expect(enter.length).toBe(1);
    expect(leave.length).toBe(1);
    expect(enter[0].name).toBe(`${PERF_MARK_PREFIXES.routeEnter}:hashPage:harness`);
    expect(leave[0].name).toBe(`${PERF_MARK_PREFIXES.routeLeave}:hashPage:harness`);
  });

  it("engineIdFromMountMark / engineIdFromDisposeMark round-trip cleanly", () => {
    const id = "e3:abc-XYZ-123";
    markEngineMount(id);
    markEngineDispose(id);

    const mountMark = getEngine3MountMarks()[0];
    const disposeMark = getEngine3DisposeMarks()[0];

    expect(engineIdFromMountMark(mountMark.name)).toBe(id);
    expect(engineIdFromDisposeMark(disposeMark.name)).toBe(id);
  });

  it("engineIdFromMountMark passes through unrecognized mark names without crashing", () => {
    // Defensive — should not throw even for malformed input.
    expect(engineIdFromMountMark("totally-unrelated-mark")).toBe("totally-unrelated-mark");
    expect(engineIdFromDisposeMark("not-a-dispose-mark")).toBe("not-a-dispose-mark");
  });

  it("setPmsHash dispatches a hashchange event the document can observe", () => {
    let observedHash: string | null = null;
    const listener = () => {
      observedHash = window.location.hash;
    };
    window.addEventListener("hashchange", listener);

    setPmsHash("#/about");
    expect(observedHash).toBe("#/about");

    window.removeEventListener("hashchange", listener);
  });

  it("clearAllPmsMarks removes all performance marks but does NOT reset counter", async () => {
    const before = snapshotPmsCounter();

    markEngineMount("e1:clear-isolation-check");
    await flushPmsObserver();

    clearAllPmsMarks();
    expect(performance.getEntriesByType("mark").length).toBe(0);

    // Counter persists across the clear (matches Pass 264 §4 invariant).
    const after = snapshotPmsCounter();
    expect(after.created - before.created).toBe(1);
  });

  it("PmsCounterSnapshot type is exported and structurally matches counter", () => {
    const snap: PmsCounterSnapshot = snapshotPmsCounter();
    expect(typeof snap.created).toBe("number");
    expect(typeof snap.destroyed).toBe("number");
    expect(typeof snap.active).toBe("number");
  });
});
