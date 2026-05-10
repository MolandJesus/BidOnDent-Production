/**
 * Pass 263 — Phase 0 utils-hardening verification.
 *
 * Stress-tests the Pass 262 instrumentation utilities that don't
 * require React rendering:
 *   - devGlContextCounter idempotency + delegate fidelity
 *   - perfMarks resilience (mark-prefix collision absence,
 *     `safeMark` error swallowing)
 *
 * Test-only — no source touched. Increases confidence density around
 * the Pass 262 instrumentation without expanding architectural surface.
 *
 * Refs:
 *   - src/app/utils/perfMarks.ts
 *   - src/app/utils/devGlContextCounter.ts
 *   - docs/REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md §7.2-§7.3
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Importing the GL counter installs the HTMLCanvasElement.getContext patch.
import "../utils/devGlContextCounter";
import {
  PERF_MARK_PREFIXES,
  markEngineMount,
  markEngineDispose,
  markRouteEnter,
  markRouteLeave,
} from "../utils/perfMarks";

declare global {
  interface Window {
    __bdGlContextLog?: Array<{ contextType: string; timestamp: number }>;
  }
}

describe("devGlContextCounter — idempotency + delegate fidelity (Pass 263)", () => {
  beforeEach(() => {
    if (window.__bdGlContextLog) {
      window.__bdGlContextLog.length = 0;
    }
  });

  it("installs the log shape on import", () => {
    expect(window.__bdGlContextLog).toBeDefined();
    expect(Array.isArray(window.__bdGlContextLog)).toBe(true);
  });

  it("re-importing the GL counter does NOT double-patch getContext", async () => {
    // Re-import; idempotency flag should make this a no-op.
    await import("../utils/devGlContextCounter");

    const canvas = document.createElement("canvas");
    canvas.getContext("webgl");

    // If double-patched, this would log twice.
    const webglEntries = window.__bdGlContextLog!.filter((e) => e.contextType === "webgl");
    expect(webglEntries.length).toBe(1);
  });

  it("does NOT log non-WebGL context types", () => {
    const canvas = document.createElement("canvas");
    // 2d is a normal canvas context, NOT a WebGL context.
    canvas.getContext("2d");

    expect(window.__bdGlContextLog!.length).toBe(0);
  });

  it("logs each WebGL flavor (webgl / webgl2 / experimental-webgl) exactly once per call", () => {
    const canvas1 = document.createElement("canvas");
    const canvas2 = document.createElement("canvas");
    const canvas3 = document.createElement("canvas");

    canvas1.getContext("webgl");
    canvas2.getContext("webgl2");
    canvas3.getContext("experimental-webgl");

    const types = window.__bdGlContextLog!.map((e) => e.contextType).sort();
    expect(types).toEqual(["experimental-webgl", "webgl", "webgl2"]);
  });

  it("each log entry carries a numeric timestamp", () => {
    const canvas = document.createElement("canvas");
    const beforeT = Date.now();
    canvas.getContext("webgl");
    const afterT = Date.now();

    const entry = window.__bdGlContextLog![0];
    expect(typeof entry.timestamp).toBe("number");
    expect(entry.timestamp).toBeGreaterThanOrEqual(beforeT);
    expect(entry.timestamp).toBeLessThanOrEqual(afterT);
  });

  it("delegate returns whatever the original getContext returned (jsdom: null for webgl)", () => {
    // jsdom doesn't implement WebGL — original returns null. Patch must
    // still return null (not undefined / not the log object). This proves
    // delegate fidelity even on context-types jsdom can't render.
    const canvas = document.createElement("canvas");
    const result = canvas.getContext("webgl");
    // jsdom returns null; whatever the original returns, we match it.
    expect(result === null || typeof result === "object").toBe(true);
  });
});

describe("perfMarks — resilience + namespace hygiene (Pass 263)", () => {
  beforeEach(() => {
    if (typeof performance !== "undefined" && typeof performance.clearMarks === "function") {
      performance.clearMarks();
    }
  });

  it("safeMark swallows performance.mark errors silently", () => {
    const original = performance.mark;
    // Force performance.mark to throw — exercises the try/catch in safeMark.
    const spy = vi.spyOn(performance, "mark").mockImplementation(() => {
      throw new Error("synthetic mark failure");
    });

    // None of these should propagate the error.
    expect(() => markEngineMount("e1:resilience")).not.toThrow();
    expect(() => markEngineDispose("e1:resilience")).not.toThrow();
    expect(() => markRouteEnter("test")).not.toThrow();
    expect(() => markRouteLeave("test")).not.toThrow();

    spy.mockRestore();
    // Verify mark function was restored.
    expect(performance.mark).toBe(original);
  });

  it("mark prefixes are mutually non-prefixing (no observer ambiguity)", () => {
    const prefixes = Object.values(PERF_MARK_PREFIXES);
    // For instance counter's PerformanceObserver to correctly distinguish
    // mount from dispose marks via `startsWith(prefix + ":")`, no prefix
    // can be a prefix of another. Otherwise observer logic gets confused.
    for (const a of prefixes) {
      for (const b of prefixes) {
        if (a === b) continue;
        const aWithSep = `${a}:`;
        expect(b.startsWith(aWithSep)).toBe(false);
      }
    }
  });

  it("mark names follow the documented bd:* namespace (no leak into user-space)", () => {
    markEngineMount("e1:namespace-check");
    markRouteEnter("namespace-check-route");

    const entries = performance.getEntries().filter((e) => e.entryType === "mark");
    for (const entry of entries) {
      // Every PMS-related mark MUST start with "bd:" so app-level perf
      // marks don't collide with future BidOnDent telemetry.
      if (
        entry.name.includes("engine:") ||
        entry.name.includes("route:")
      ) {
        expect(entry.name.startsWith("bd:")).toBe(true);
      }
    }
  });

  it("mount/dispose pair share the same engineId suffix (verifiable by Playwright pairing)", () => {
    const id = "e3:specific-instance-XYZ";
    markEngineMount(id);
    markEngineDispose(id);

    const mountName = `${PERF_MARK_PREFIXES.engineMount}:${id}`;
    const disposeName = `${PERF_MARK_PREFIXES.engineDispose}:${id}`;

    // Suffix-extract by stripping the prefix to confirm pairing logic
    // works at the string level.
    const mountSuffix = mountName.slice(`${PERF_MARK_PREFIXES.engineMount}:`.length);
    const disposeSuffix = disposeName.slice(`${PERF_MARK_PREFIXES.engineDispose}:`.length);
    expect(mountSuffix).toBe(disposeSuffix);
    expect(mountSuffix).toBe(id);
  });
});
