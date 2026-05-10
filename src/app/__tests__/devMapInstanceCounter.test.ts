/**
 * Phase 0 (Pass 262) — devMapInstanceCounter contract test.
 *
 * Verifies the dev-mode engine-instance counter:
 *   1. Initializes `window.__bdMapInstanceCount` on first import.
 *   2. Increments `created`/`active` on engine-mount marks.
 *   3. Decrements `active` (and increments `destroyed`) on engine-dispose marks.
 *   4. Is idempotent across hot-reload imports (single PerformanceObserver).
 *
 * Production builds tree-shake the counter; this test runs under
 * `import.meta.env.MODE === "test"` (vitest default), where the
 * counter is active.
 *
 * Refs:
 *   - src/app/utils/devMapInstanceCounter.ts
 *   - docs/REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md §7.2
 *   - docs/PLAN_PMS_EXECUTION_SEQUENCING_2026-05-09.md §3.4
 */

import { describe, it, expect, beforeEach } from "vitest";
import { markEngineMount, markEngineDispose } from "../utils/perfMarks";

// Importing the counter installs the PerformanceObserver subscription.
import "../utils/devMapInstanceCounter";

declare global {
  interface Window {
    __bdMapInstanceCount?: {
      created: number;
      destroyed: number;
      active: number;
    };
  }
}

// Wait for queued PerformanceObserver entries to flush. PerformanceObserver
// fires asynchronously via microtask in jsdom; one Promise.resolve cycle
// is sufficient in practice.
async function flushPerfObserver(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("devMapInstanceCounter (Phase 0 / Pass 262)", () => {
  beforeEach(async () => {
    if (typeof performance !== "undefined" && typeof performance.clearMarks === "function") {
      performance.clearMarks();
    }
    // Reset counts but preserve the patched flag so the observer stays installed.
    if (window.__bdMapInstanceCount) {
      window.__bdMapInstanceCount.created = 0;
      window.__bdMapInstanceCount.destroyed = 0;
      window.__bdMapInstanceCount.active = 0;
    }
    await flushPerfObserver();
  });

  it("installs the counter shape on import", () => {
    expect(window.__bdMapInstanceCount).toBeDefined();
    const counts = window.__bdMapInstanceCount!;
    expect(counts).toMatchObject({
      created: expect.any(Number),
      destroyed: expect.any(Number),
      active: expect.any(Number),
    });
  });

  it("increments created+active when an engine-mount mark fires", async () => {
    markEngineMount("e1:test-mount");
    await flushPerfObserver();
    const counts = window.__bdMapInstanceCount!;
    expect(counts.created).toBe(1);
    expect(counts.active).toBe(1);
    expect(counts.destroyed).toBe(0);
  });

  it("decrements active and increments destroyed on engine-dispose mark", async () => {
    markEngineMount("e1:test-cycle");
    await flushPerfObserver();
    markEngineDispose("e1:test-cycle");
    await flushPerfObserver();
    const counts = window.__bdMapInstanceCount!;
    expect(counts.created).toBe(1);
    expect(counts.destroyed).toBe(1);
    expect(counts.active).toBe(0);
  });

  it("never lets active count go negative (defensive clamp)", async () => {
    // Dispose without a prior mount — should NOT push active below zero.
    markEngineDispose("e1:phantom");
    await flushPerfObserver();
    const counts = window.__bdMapInstanceCount!;
    expect(counts.active).toBeGreaterThanOrEqual(0);
  });

  it("counts multiple Engine 3 instances independently", async () => {
    markEngineMount("e3:instance-1");
    markEngineMount("e3:instance-2");
    markEngineMount("e3:instance-3");
    await flushPerfObserver();
    const counts = window.__bdMapInstanceCount!;
    expect(counts.created).toBe(3);
    expect(counts.active).toBe(3);
  });

  it("re-importing the counter does NOT install duplicate observers", async () => {
    // Second import should be a no-op (idempotent flag check).
    await import("../utils/devMapInstanceCounter");
    markEngineMount("e1:idempotency-check");
    await flushPerfObserver();
    const counts = window.__bdMapInstanceCount!;
    // If duplicate observers existed, created would be 2 not 1.
    expect(counts.created).toBe(1);
  });
});
