/**
 * Pass 264 — verification deepening for Pass 262 instrumentation.
 *
 * Adds genuinely new behavioral signals on top of Passes 262/263:
 *
 *   §1  Route-mark timing-order guarantee
 *       Playwright G4 assertions ("no map re-init on route change")
 *       will rely on `markRouteLeave(X)` having a `startTime` strictly
 *       ≤ `markRouteEnter(Y)`. Pass 263 §2 verified the SEQUENCE but
 *       not the TIMING ORDER — they could in principle interleave or
 *       reorder under jsdom's task scheduling. This pins ordering.
 *
 *   §2  Navigation churn stress (rapid sequential mount/unmount)
 *       Pass 263 covered 2 simultaneous mounts and a single
 *       mount→unmount→remount cycle. This validates the counter under
 *       high-frequency churn (10× rapid cycle within a tick) — surfaces
 *       any observer batching loss or out-of-order dispatch.
 *
 *   §3  Cross-engine concurrent mount (E1 + E2 + E3 together)
 *       Pass 263 §1 covered Engine-3-only multi-instance accounting.
 *       This verifies namespace isolation across DIFFERENT engines:
 *       e1:* / e2:* / e3:* marks coexist without crosstalk, and the
 *       counter sums correctly across engine kinds.
 *
 *   §4  Counter persistence under `performance.clearMarks()`
 *       Playwright tests will likely call `clearMarks()` between
 *       navigation phases. This pins the documented behavior:
 *       clearing marks does NOT reset the counter (counter is the
 *       authoritative running tally; marks are an audit trail).
 *
 * Test-only — no source touched. Each test uses delta-based assertions
 * (Pass 263 pattern) for cross-test contamination resistance.
 *
 * Refs:
 *   - src/app/utils/perfMarks.ts
 *   - src/app/utils/devMapInstanceCounter.ts
 *   - src/app/__tests__/pass262EngineRouteVerification.test.tsx (§263 baseline)
 *   - docs/REF_PMS_PERFORMANCE_BASELINE_2026-05-09.md §7.4 (G4 methodology)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, render, renderHook } from "@testing-library/react";

import { createReactMapGlMaplibreStub } from "../test-utils/mapTestHarness";

vi.mock("react-map-gl/maplibre", async () => createReactMapGlMaplibreStub());
vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("../utils/maplibreResizePatch", () => ({}));

import MapLibreDashboardMapPreview from "../components/dashboard/MapLibreDashboardMapPreview";
import { useHashPage } from "../components/app/AppShell";
import {
  PERF_MARK_PREFIXES,
  markEngineDispose,
  markEngineMount,
} from "../utils/perfMarks";
import "../utils/devMapInstanceCounter";
import type { CoveragePartnerShop } from "../components/maps/serviceCoverageMapTypes";

declare global {
  interface Window {
    __bdMapInstanceCount?: { created: number; destroyed: number; active: number };
  }
}

const SHOPS: CoveragePartnerShop[] = [
  {
    id: "test-shop-A",
    name: "Test Shop A",
    countyLabel: "Test County",
    lat: 37.78,
    lng: -122.41,
    label: "Test Shop A",
    specialties: ["paint"],
    rating: 4.5,
  },
];

async function flushObserver(): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 0));
  await Promise.resolve();
  await Promise.resolve();
}

type CounterSnapshot = { created: number; destroyed: number; active: number };

function snapshotCounter(): CounterSnapshot {
  const c = window.__bdMapInstanceCount;
  return c ? { ...c } : { created: 0, destroyed: 0, active: 0 };
}

function getRouteMarks(): { enter: PerformanceEntry[]; leave: PerformanceEntry[] } {
  const all = performance.getEntriesByType("mark");
  return {
    enter: all.filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.routeEnter}:`)),
    leave: all.filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.routeLeave}:`)),
  };
}

function clearAllMarks(): void {
  if (typeof performance !== "undefined" && typeof performance.clearMarks === "function") {
    performance.clearMarks();
  }
}

function setHash(hash: string): void {
  window.location.hash = hash;
  window.dispatchEvent(new HashChangeEvent("hashchange"));
}

// ────────────────────────────────────────────────────────────────────────────
// §1 — Route-mark timing-order guarantee
// ────────────────────────────────────────────────────────────────────────────

describe("Pass 264 §1 — route-mark timing-order guarantee", () => {
  beforeEach(async () => {
    await flushObserver();
    clearAllMarks();
    window.location.hash = "";
  });

  afterEach(async () => {
    cleanup();
    await flushObserver();
  });

  it("X → Y transition: leave.startTime ≤ enter.startTime", () => {
    window.location.hash = "#/about";
    const { unmount } = renderHook(() => useHashPage());
    clearAllMarks();

    act(() => {
      setHash("#/privacy-policy");
    });

    const { enter, leave } = getRouteMarks();
    expect(leave.length).toBe(1);
    expect(enter.length).toBe(1);
    expect(leave[0].name).toBe(`${PERF_MARK_PREFIXES.routeLeave}:hashPage:about`);
    expect(enter[0].name).toBe(`${PERF_MARK_PREFIXES.routeEnter}:hashPage:privacy-policy`);
    // The critical Playwright invariant: leave precedes enter.
    expect(leave[0].startTime).toBeLessThanOrEqual(enter[0].startTime);

    unmount();
  });

  it("X → null (landing) transition: leave.startTime ≤ enter:landing.startTime", () => {
    window.location.hash = "#/terms-of-service";
    const { unmount } = renderHook(() => useHashPage());
    clearAllMarks();

    act(() => {
      setHash("");
    });

    const { enter, leave } = getRouteMarks();
    expect(leave.length).toBe(1);
    expect(enter.length).toBe(1);
    expect(leave[0].startTime).toBeLessThanOrEqual(enter[0].startTime);

    unmount();
  });

  it("3 successive X→Y→Z transitions produce monotonically non-decreasing startTimes", () => {
    const { unmount } = renderHook(() => useHashPage());

    act(() => {
      setHash("#/about");
    });
    act(() => {
      setHash("#/privacy-policy");
    });
    act(() => {
      setHash("#/terms-of-service");
    });

    const all = performance
      .getEntriesByType("mark")
      .filter(
        (m) =>
          m.name.startsWith(`${PERF_MARK_PREFIXES.routeEnter}:`) ||
          m.name.startsWith(`${PERF_MARK_PREFIXES.routeLeave}:`)
      );

    // Marks must be emitted in monotonically-non-decreasing time order.
    for (let i = 1; i < all.length; i++) {
      expect(all[i].startTime).toBeGreaterThanOrEqual(all[i - 1].startTime);
    }

    unmount();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// §2 — Navigation churn stress (rapid sequential cycles)
// ────────────────────────────────────────────────────────────────────────────

describe("Pass 264 §2 — navigation churn stress", () => {
  beforeEach(async () => {
    await flushObserver();
    clearAllMarks();
    window.location.hash = "";
  });

  afterEach(async () => {
    cleanup();
    await flushObserver();
  });

  it("10 rapid Engine 3 mount→unmount cycles preserve counter invariants", async () => {
    const before = snapshotCounter();
    const CYCLES = 10;

    for (let i = 0; i < CYCLES; i++) {
      const { unmount } = render(
        <MapLibreDashboardMapPreview
          shops={SHOPS}
          center={[37.78, -122.41]}
          zoom={11}
          isLight={true}
          reportPins={[]}
          serviceAreaCircles={[]}
          autoFit="never"
        />
      );
      unmount();
    }
    await flushObserver();

    const after = snapshotCounter();
    // Each cycle: one mount + one dispose. Net active delta: 0.
    expect(after.created - before.created).toBe(CYCLES);
    expect(after.destroyed - before.destroyed).toBe(CYCLES);
    expect(after.active - before.active).toBe(0);
  });

  it("rapid 5-step hash-route burst emits 5 enter + 4 leave marks (final not yet left)", () => {
    const { unmount } = renderHook(() => useHashPage());

    // Each act() call drives one render commit cycle. Real navigation has
    // each hashchange as a separate event-loop tick, so the test must model
    // that — collapsing them into one act() would let React batch the
    // state updates and only the final state would render.
    act(() => setHash("#/about"));
    act(() => setHash("#/privacy-policy"));
    act(() => setHash("#/terms-of-service"));
    act(() => setHash("#/insurer-partnership"));
    act(() => setHash("#/about"));

    const { enter, leave } = getRouteMarks();
    // 5 enters fire (one per transition); 4 leaves fire (every transition
    // except the very first leaves the prior page; the final page hasn't
    // been left yet).
    expect(enter.length).toBe(5);
    expect(leave.length).toBe(4);

    unmount();
  });

  it("synchronously-batched hash changes within a single act() collapse to final-state-only marks", () => {
    // Documents React state-batching behavior under PMS instrumentation:
    // when 5 setHash() calls occur in one synchronous act() block, React
    // batches the state updates and only the final state renders. The
    // previousPageRef tracking therefore sees ONE transition (null→final),
    // not five. This matches React's documented semantics; the
    // separate-act() form above models real navigation correctly.
    const { unmount } = renderHook(() => useHashPage());

    act(() => {
      setHash("#/about");
      setHash("#/privacy-policy");
      setHash("#/terms-of-service");
      setHash("#/insurer-partnership");
      setHash("#/about");
    });

    const { enter, leave } = getRouteMarks();
    // Only the final state ("hashPage:about") commits; previous-state
    // ref starts at null, so just one enter mark fires.
    expect(enter.length).toBe(1);
    expect(enter[0].name).toBe(`${PERF_MARK_PREFIXES.routeEnter}:hashPage:about`);
    expect(leave.length).toBe(0);

    unmount();
  });
});

// ────────────────────────────────────────────────────────────────────────────
// §3 — Cross-engine namespace isolation
// ────────────────────────────────────────────────────────────────────────────

describe("Pass 264 §3 — cross-engine namespace isolation", () => {
  beforeEach(async () => {
    await flushObserver();
    clearAllMarks();
  });

  afterEach(async () => {
    cleanup();
    await flushObserver();
  });

  it("manually-dispatched marks for e1/e2/e3 produce distinct namespaced marks", () => {
    markEngineMount("e1:coverage");
    markEngineMount("e2:shop-directory");
    markEngineMount("e3:test-instance");

    const all = performance
      .getEntriesByType("mark")
      .filter((m) => m.name.startsWith(`${PERF_MARK_PREFIXES.engineMount}:`));

    const names = all.map((m) => m.name).sort();
    expect(names).toEqual([
      `${PERF_MARK_PREFIXES.engineMount}:e1:coverage`,
      `${PERF_MARK_PREFIXES.engineMount}:e2:shop-directory`,
      `${PERF_MARK_PREFIXES.engineMount}:e3:test-instance`,
    ]);

    // Engine ID extraction (everything after the mount prefix + ":") must
    // round-trip cleanly so a Playwright test can pair mount/dispose marks
    // by suffix.
    const ids = all
      .map((m) => m.name.slice(`${PERF_MARK_PREFIXES.engineMount}:`.length))
      .sort();
    expect(ids).toEqual(["e1:coverage", "e2:shop-directory", "e3:test-instance"]);
  });

  it("counter sums correctly across mixed-engine mounts", async () => {
    const before = snapshotCounter();

    markEngineMount("e1:cross-engine-test");
    markEngineMount("e2:cross-engine-test");
    markEngineMount("e3:cross-engine-test");
    await flushObserver();

    const after = snapshotCounter();
    expect(after.created - before.created).toBe(3);
    expect(after.active - before.active).toBe(3);

    // Disposes (one per engine kind).
    markEngineDispose("e1:cross-engine-test");
    markEngineDispose("e2:cross-engine-test");
    markEngineDispose("e3:cross-engine-test");
    await flushObserver();

    const final = snapshotCounter();
    expect(final.created - before.created).toBe(3);
    expect(final.destroyed - before.destroyed).toBe(3);
    expect(final.active - before.active).toBe(0);
  });
});

// ────────────────────────────────────────────────────────────────────────────
// §4 — Counter persistence under performance.clearMarks()
// ────────────────────────────────────────────────────────────────────────────

describe("Pass 264 §4 — counter persistence under clearMarks", () => {
  beforeEach(async () => {
    await flushObserver();
    clearAllMarks();
  });

  it("performance.clearMarks() does NOT reset the counter (counter is authoritative)", async () => {
    const before = snapshotCounter();

    markEngineMount("e1:persistence-check");
    await flushObserver();
    const afterMount = snapshotCounter();
    expect(afterMount.created - before.created).toBe(1);
    expect(afterMount.active - before.active).toBe(1);

    // Playwright tests will call performance.clearMarks() between
    // assertions to keep the entry list clean. The counter must NOT
    // reset — it is the authoritative running tally.
    performance.clearMarks();
    await flushObserver();

    const afterClear = snapshotCounter();
    expect(afterClear.created).toBe(afterMount.created);
    expect(afterClear.active).toBe(afterMount.active);
    expect(afterClear.destroyed).toBe(afterMount.destroyed);

    // Subsequent dispose still decrements correctly.
    markEngineDispose("e1:persistence-check");
    await flushObserver();
    const afterDispose = snapshotCounter();
    expect(afterDispose.destroyed - before.destroyed).toBe(1);
    expect(afterDispose.active - before.active).toBe(0);
  });

  it("clearMarks() clears marks but observer keeps tracking new marks correctly", async () => {
    markEngineMount("e1:pre-clear");
    await flushObserver();
    performance.clearMarks();
    // Marks themselves should be gone.
    const cleared = performance.getEntriesByType("mark");
    expect(cleared.length).toBe(0);

    // New mark after clear should be observable.
    const before = snapshotCounter();
    markEngineMount("e1:post-clear");
    await flushObserver();
    const after = snapshotCounter();
    expect(after.created - before.created).toBe(1);

    // And the new mark IS in the entry list.
    const post = performance
      .getEntriesByType("mark")
      .filter((m) => m.name === `${PERF_MARK_PREFIXES.engineMount}:e1:post-clear`);
    expect(post.length).toBe(1);
  });
});
