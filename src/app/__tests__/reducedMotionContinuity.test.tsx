/**
 * Reduced-motion continuity — multi-render lifecycle confidence
 * suite (Pass 256, Coverage Map Confidence Expansion lane).
 *
 * Pure characterization. Pass 246 already pinned the
 * (autoFit × prefers-reduced-motion) byte-identity invariant for
 * a *single render*. This file pins continuity of that contract
 * across **preference flips during the session** — the dimension
 * where a stale-cached matchMedia listener or a memoized
 * prefers-reduced-motion check would silently drift.
 *
 * Sections (5 invariants, owner-specified Pass 256 charter)
 * --------------------------------------------------------
 *   §1 — preference flip false → true → false
 *        Resolved viewport identical across the round-trip;
 *        no stale residue from the intermediate "true" state.
 *
 *   §2 — repeated rerenders under live preference flips
 *        With the user toggling reduced-motion between every
 *        rerender, the resolved viewport at every render
 *        matches the no-flip baseline.
 *
 *   §3 — viewport continuity across preference change
 *        Caller-supplied center/zoom that change *and* a
 *        preference flip *at the same time* — the new caller
 *        intent must win, the preference change must NOT
 *        leak into the resolved viewport.
 *
 *   §4 — no stale motion residue at engine boundary
 *        Coverage map host's engine-boundary props are
 *        independent of the prefers-reduced-motion preference
 *        (preference is consumed at the layer/animation level,
 *        not the host-prop level). Verify that flipping the
 *        preference does not perturb the props the host hands
 *        to MapEngineCanvas.
 *
 *   §5 — stable semantic outputs across a long flip sequence
 *        false→true→true→false→true→false: every reduced
 *        snapshot equals the baseline. Pinning long-sequence
 *        stability (n > 3) catches off-by-one accumulation
 *        bugs that short sequences miss.
 *
 * Why these tests
 * ---------------
 * Reduced-motion is a runtime preference: users can toggle it
 * mid-session (system settings or browser dev tools). The
 * existing Pass 246 lock asserts identity at fixed preference
 * states; this file asserts identity *across* preference
 * transitions. Without this, a regression that introduces
 * preference-dependent host-side viewport behavior could pass
 * Pass 246 (which only sees the steady-state output at a fixed
 * preference) but break Pass 256 (which observes transitions).
 *
 * Coverage:
 *   - Tier B preview (MapLibreDashboardMapPreview) — §1, §2, §3, §5
 *   - Tier B host (MapLibreServiceCoverageMap) — §4
 *
 * Lane discipline
 * ---------------
 * - NO source files touched. Pure characterization.
 * - NO motion-semantics changes.
 * - NO timing changes.
 * - NO animation abstractions introduced.
 * - NO "fixes" to preference handling.
 * - All assertions are behavioral invariants, not
 *   implementation-detail snapshots.
 * - autoFit / callerBoundsExplicit defaults UNTOUCHED.
 * - If any test reveals a real semantic defect, STOP and
 *   characterize — do NOT silently fix inside this lane.
 *
 * Convergence metadata
 * --------------------
 *  1. Runtime paths touched     : test-only.
 *  2. Runtime classes touched   : Tier B preview + host
 *                                 (characterization).
 *  3. Tier semantics touched    : Tier B characterization,
 *                                 unchanged.
 *  4. Motion classes touched    : none. Reduced-motion observed,
 *                                 not altered.
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : unchanged.
 *  7. Reduced-motion inheritance: pinned across preference
 *                                 transitions (decreased risk).
 *  8. Hidden-authority risk     : decreased — preference-flip
 *                                 stability now pinned.
 *  9. Continuity guarantees     : strengthened — multi-render
 *                                 reduced-motion continuity
 *                                 invariants now characterized.
 * 10. Rollback semantics        : delete this file.
 *
 * Cross-references
 * ----------------
 * - src/app/__tests__/engine3ReducedMotionAutoFitInteraction.test.tsx
 *   (Pass 246 single-render byte-identity lock — companion)
 * - src/app/__tests__/tierBPreviewLifecycle.test.tsx
 *   (Pass 254 lifecycle companion)
 * - src/app/__tests__/coverageMapLifecycle.test.tsx
 *   (Pass 255 host lifecycle companion)
 * - docs/LAW_ANIMATION_AND_ATMOSPHERE.md (mandatory
 *   prefers-reduced-motion contract)
 * - docs/REF_MAP_MOTION_CONTRACT_2026-05-09.md §4
 *   (reduced-motion inheritance rule)
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

import {
  createReactMapGlMaplibreStub,
  installPrefersReducedMotion,
} from "../test-utils/mapTestHarness";

// ---------------------------------------------------------------
// Capture buffers — preview side (Map stub) and host side
// (MapEngineCanvas stub). Used selectively per section.
// ---------------------------------------------------------------

const capturedMapProps: Array<Record<string, unknown>> = [];
const capturedCanvasProps: Array<Record<string, unknown>> = [];

vi.mock("react-map-gl/maplibre", async () => {
  const stub = createReactMapGlMaplibreStub();
  return {
    ...stub,
    default: (props: Record<string, unknown>) => {
      capturedMapProps.push({ ...props });
      return stub.default(props as never);
    },
  };
});
vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("../utils/maplibreResizePatch", () => ({}));

vi.mock("../components/maps/engine/MapEngineCanvas", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    capturedCanvasProps.push({ ...props });
    return null;
  },
}));

import MapLibreDashboardMapPreview from "../components/dashboard/MapLibreDashboardMapPreview";
import MapLibreServiceCoverageMap from "../components/maps/MapLibreServiceCoverageMap";
import type {
  CoverageCountyMarker,
  CoveragePartnerShop,
  MapTileMode,
} from "../components/maps/serviceCoverageMapTypes";

// ---------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------

const CALLER_CENTER: [number, number] = [37.78, -122.41];
const CALLER_ZOOM = 11;
const TILE_MODE: MapTileMode = "standard";

function makeShop(id: string, lat: number, lng: number): CoveragePartnerShop {
  return {
    id,
    name: `Shop ${id}`,
    countyLabel: "San Francisco",
    lat,
    lng,
    label: `Shop ${id}`,
    specialties: ["paint"],
    rating: 4.5,
  };
}

const NOOP = () => {};

function lastPreviewProps(): Record<string, unknown> {
  if (capturedMapProps.length === 0) {
    throw new Error("Preview stub never received props.");
  }
  return capturedMapProps[capturedMapProps.length - 1];
}

function lastCanvasProps(): Record<string, unknown> {
  if (capturedCanvasProps.length === 0) {
    throw new Error("Engine boundary stub never received props.");
  }
  return capturedCanvasProps[capturedCanvasProps.length - 1];
}

beforeEach(() => {
  capturedMapProps.length = 0;
  capturedCanvasProps.length = 0;
});
afterEach(cleanup);

// ---------------------------------------------------------------
// §1. Preference flip false → true → false (preview).
// ---------------------------------------------------------------

describe("reduced-motion continuity — Pass 256 §1 flip false→true→false (preview)", () => {
  it("resolved viewport is identical across the round-trip", () => {
    const SF_A = makeShop("a", 37.78, -122.41);
    const SF_B = makeShop("b", 37.79, -122.4);

    installPrefersReducedMotion(false);
    const view = render(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const baseline = lastPreviewProps();
    const baselineLat = baseline.latitude;
    const baselineLng = baseline.longitude;

    // Flip preference → re-render. matchMedia returns reduce=true
    // for any new query inside the component, but the captured
    // engine-boundary props must remain identical.
    installPrefersReducedMotion(true);
    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const reducedSnap = lastPreviewProps();
    expect(reducedSnap.latitude).toBe(baselineLat);
    expect(reducedSnap.longitude).toBe(baselineLng);

    // Flip back to false — must equal baseline (no stale residue).
    installPrefersReducedMotion(false);
    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const finalSnap = lastPreviewProps();
    expect(finalSnap.latitude).toBe(baselineLat);
    expect(finalSnap.longitude).toBe(baselineLng);
  });
});

// ---------------------------------------------------------------
// §2. Repeated rerenders under live preference flips (preview).
// ---------------------------------------------------------------

describe("reduced-motion continuity — Pass 256 §2 every-render flip stability (preview)", () => {
  it("resolved viewport at every render matches the no-flip baseline", () => {
    const SF_A = makeShop("a", 37.78, -122.41);
    const SF_B = makeShop("b", 37.79, -122.4);

    installPrefersReducedMotion(false);
    const view = render(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const baselineLat = lastPreviewProps().latitude;
    const baselineLng = lastPreviewProps().longitude;

    for (let i = 0; i < 5; i++) {
      installPrefersReducedMotion(i % 2 === 0);
      view.rerender(
        <MapLibreDashboardMapPreview
          shops={[SF_A, SF_B]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight
          autoFit="always"
        />
      );
      const snap = lastPreviewProps();
      expect(snap.latitude).toBe(baselineLat);
      expect(snap.longitude).toBe(baselineLng);
    }
  });
});

// ---------------------------------------------------------------
// §3. Caller intent change concurrent with preference flip
// (preview, autoFit=never).
// ---------------------------------------------------------------

describe("reduced-motion continuity — Pass 256 §3 caller-change ⊕ preference-flip (preview)", () => {
  it("new caller intent wins; preference change does NOT perturb resolved viewport", () => {
    installPrefersReducedMotion(false);
    const view = render(
      <MapLibreDashboardMapPreview shops={[]} center={[10, 20]} zoom={5} isLight autoFit="never" />
    );
    let snap = lastPreviewProps();
    expect(snap.latitude).toBeCloseTo(10, 5);
    expect(snap.longitude).toBeCloseTo(20, 5);
    expect(snap.zoom).toBe(5);

    // Concurrent: caller changes center/zoom AND preference flips on.
    installPrefersReducedMotion(true);
    view.rerender(
      <MapLibreDashboardMapPreview shops={[]} center={[30, 40]} zoom={8} isLight autoFit="never" />
    );
    snap = lastPreviewProps();
    expect(snap.latitude).toBeCloseTo(30, 5);
    expect(snap.longitude).toBeCloseTo(40, 5);
    expect(snap.zoom).toBe(8);

    // Concurrent again: caller changes AND preference flips off.
    installPrefersReducedMotion(false);
    view.rerender(
      <MapLibreDashboardMapPreview
        shops={[]}
        center={[-15, -75]}
        zoom={3}
        isLight
        autoFit="never"
      />
    );
    snap = lastPreviewProps();
    expect(snap.latitude).toBeCloseTo(-15, 5);
    expect(snap.longitude).toBeCloseTo(-75, 5);
    expect(snap.zoom).toBe(3);
  });
});

// ---------------------------------------------------------------
// §4. Coverage host engine-boundary props are independent of the
// prefers-reduced-motion preference.
//
// The host's contract with MapEngineCanvas is data + viewport;
// motion/animation is a layer-side concern. Verify the host's
// engine-boundary props are byte-stable across preference flips.
// ---------------------------------------------------------------

describe("reduced-motion continuity — Pass 256 §4 host engine-boundary independence", () => {
  it("engine-boundary props identical across preference flips at the host", () => {
    const C1: CoverageCountyMarker = { name: "A", lat: 40.7, lng: -74.0 } as CoverageCountyMarker;
    const S1 = makeShop("s1", 40.71, -74.01);

    installPrefersReducedMotion(false);
    const view = render(
      <MapLibreServiceCoverageMap
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        revision={0}
        tileMode={TILE_MODE}
        counties={[C1]}
        partnerShops={[S1]}
        activeSearchTarget={null}
        radiusMeters={5000}
        radiusMiles="3"
        regionCount={1}
        onTileModeChange={NOOP}
        onCenterActive={NOOP}
        onResetView={NOOP}
      />
    );
    const baseline = lastCanvasProps();

    installPrefersReducedMotion(true);
    view.rerender(
      <MapLibreServiceCoverageMap
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        revision={0}
        tileMode={TILE_MODE}
        counties={[C1]}
        partnerShops={[S1]}
        activeSearchTarget={null}
        radiusMeters={5000}
        radiusMiles="3"
        regionCount={1}
        onTileModeChange={NOOP}
        onCenterActive={NOOP}
        onResetView={NOOP}
      />
    );
    const reducedSnap = lastCanvasProps();

    // Center, zoom, counties length, partnerShops length, tone all stable.
    expect(reducedSnap.center).toEqual(baseline.center);
    expect(reducedSnap.zoom).toBe(baseline.zoom);
    expect((reducedSnap.counties as CoverageCountyMarker[]).length).toBe(
      (baseline.counties as CoverageCountyMarker[]).length
    );
    expect((reducedSnap.partnerShops as CoveragePartnerShop[]).length).toBe(
      (baseline.partnerShops as CoveragePartnerShop[]).length
    );
    expect(reducedSnap.tone).toBe(baseline.tone);
  });
});

// ---------------------------------------------------------------
// §5. Long flip sequence — 6 transitions (preview).
// ---------------------------------------------------------------

describe("reduced-motion continuity — Pass 256 §5 long flip sequence (preview)", () => {
  it("baseline holds across 6-transition sequence false→true→true→false→true→false", () => {
    const SF_A = makeShop("a", 37.78, -122.41);
    const SF_B = makeShop("b", 37.79, -122.4);

    installPrefersReducedMotion(false);
    const view = render(
      <MapLibreDashboardMapPreview
        shops={[SF_A, SF_B]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="always"
      />
    );
    const baselineLat = lastPreviewProps().latitude;
    const baselineLng = lastPreviewProps().longitude;

    const sequence = [true, true, false, true, false];
    for (const reduce of sequence) {
      installPrefersReducedMotion(reduce);
      view.rerender(
        <MapLibreDashboardMapPreview
          shops={[SF_A, SF_B]}
          center={CALLER_CENTER}
          zoom={CALLER_ZOOM}
          isLight
          autoFit="always"
        />
      );
      const snap = lastPreviewProps();
      expect(snap.latitude).toBe(baselineLat);
      expect(snap.longitude).toBe(baselineLng);
    }
  });
});
