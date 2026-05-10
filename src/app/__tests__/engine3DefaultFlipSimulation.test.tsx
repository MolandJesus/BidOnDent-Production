/**
 * Engine 3 — sub-pass C default-flip simulation (Pass 245, Phase 3B PREP).
 *
 * What this file is
 * -----------------
 * A *simulation* of the future sub-pass C state, where
 * `MapLibreDashboardMapPreview`'s `autoFit` default flips from
 * `"always"` (Pass 241 baseline) to `"when-no-caller-bounds"`
 * (the doctrinal target). The flip itself is NOT executed in this
 * pass — the renderer's default remains `"always"`. These tests
 * render the component with `autoFit="when-no-caller-bounds"`
 * passed explicitly, which produces the exact same resolved
 * viewport the renderer would produce after the eventual default
 * flip for callers in their current shape.
 *
 * Why this exists
 * ---------------
 * Per the Phase 3B PREP directive (relayed via owner from ChatGPT
 * meta-arbiter), the next architectural risk surface is the
 * default inversion. Before authorization, we need:
 *
 *   1. Proof that the flip is a *no-op* for every audited call
 *      site that has not yet opted into `callerBoundsExplicit`.
 *      That proof is §1 below.
 *   2. Proof that the flip produces the *intended* opt-in
 *      semantics for callers that DO opt into
 *      `callerBoundsExplicit` (e.g. ReportDetailScreen). That
 *      proof is §2 below.
 *   3. A characterization classification of every Engine 3
 *      caller as "safe-to-flip" vs "sensitive-to-flip" vs
 *      "visually-coupled" — driven by whether the caller relies
 *      on implicit fit semantics for its UX. That classification
 *      lives in REF_ENGINE_3_CAMERA_AUTHORITY §12.2.1 (Pass 244
 *      audit AI matrix). This file's tests anchor the
 *      "safe-to-flip" claim with executable assertions.
 *
 * What this file is NOT
 * ---------------------
 * - It does NOT change the renderer's default. The default
 *   `autoFit="always"` ships unchanged. Tests pass `"when-no-
 *   caller-bounds"` explicitly to model the post-flip world.
 * - It does NOT mark any call site safe-to-flip on its own.
 *   The §12.2.1 matrix in REF_ENGINE_3_CAMERA_AUTHORITY is the
 *   authoritative classification; this file pins the runtime
 *   behavior the matrix relies on.
 * - It does NOT introduce new behavior modes. The two new modes
 *   (`"never"`, `"when-no-caller-bounds"`) shipped in Pass 241.
 *   These are characterization tests on top of those modes.
 *
 * Convergence metadata (per Block D / Phase 1 ratification):
 *  1. Runtime paths touched     : test-only (no production runtime
 *                                 path touched).
 *  2. Runtime classes touched   : Preview (declarative test).
 *  3. Tier semantics touched    : Tier B (Engine 3 contract).
 *  4. Motion classes touched    : none.
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : characterization (locks the
 *                                 future-flip behavior surface).
 *  7. Reduced-motion inheritance: unchanged.
 *  8. Hidden-authority risk     : decreased — this file makes the
 *                                 future flip's behavior
 *                                 simulable + assertable BEFORE
 *                                 the flip, removing the "we
 *                                 won't know until we ship it"
 *                                 risk.
 *  9. Continuity guarantees     : unaffected.
 * 10. Rollback semantics        : delete this file. No production
 *                                 behavior reverts.
 *
 * Cross-references
 * ----------------
 * - `docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §12 (Pass
 *   241/242/243 landing log) and §12.2.1 (Pass 244 convergence-
 *   readiness matrix).
 * - `docs/REF_KNOWN_ISSUES.md` KI-181 (hidden-authority migration).
 * - `src/app/components/dashboard/MapLibreDashboardMapPreview.tsx`
 *   (the renderer; default stays `"always"` until sub-pass C).
 * - `src/app/components/dashboard/MapLibreDashboardMapPreview.motion.test.tsx`
 *   §6 (Pass 241 four-branch behavior lock).
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

import {
  createReactMapGlMaplibreStub,
  installPrefersReducedMotion,
} from "../test-utils/mapTestHarness";

const capturedMapProps: Array<Record<string, unknown>> = [];

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

import MapLibreDashboardMapPreview, {
  type ReportPin,
} from "../components/dashboard/MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../components/maps/serviceCoverageMapTypes";

const CALLER_CENTER: [number, number] = [37.78, -122.41];
const CALLER_ZOOM = 11;

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

function makePin(id: string, lat: number, lng: number): ReportPin {
  return { id, lat, lng, label: `Pin ${id}` };
}

function lastMapPropsOrThrow(): Record<string, unknown> {
  if (capturedMapProps.length === 0) {
    throw new Error("Engine 3 stub never received props — did the component fail to mount?");
  }
  return capturedMapProps[capturedMapProps.length - 1];
}

afterEach(cleanup);
beforeEach(() => {
  capturedMapProps.length = 0;
  installPrefersReducedMotion(false);
});

// ---------------------------------------------------------------
// §1. Future default-flip is a no-op for un-opted-in callers.
//
// EVERY production call site as of Pass 243 declares
// `autoFit="always"` (or is owner-dirty). NONE pass
// `callerBoundsExplicit`. The eventual sub-pass C default flip
// will rewrite the renderer signature to:
//
//   autoFit: AutoFitMode = "when-no-caller-bounds"
//   callerBoundsExplicit: boolean = false
//
// For any call site that has NOT been migrated to opt into
// `callerBoundsExplicit`, the post-flip behavior is identical
// to the pre-flip behavior. These tests pin that equivalence.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 245 §1 default-flip is no-op for un-opted-in callers", () => {
  const NY_A = makeShop("nyA", 40.7, -74.0);
  const NY_B = makeShop("nyB", 40.8, -73.9);
  const NY_MID_LAT = (40.7 + 40.8) / 2;
  const NY_MID_LNG = (-74.0 + -73.9) / 2;

  it('post-flip world: 2 shops + no callerBoundsExplicit → fittedView wins (equal to "always")', () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(NY_MID_LAT, 5);
    expect(props.longitude).toBeCloseTo(NY_MID_LNG, 5);
  });

  it("post-flip world: 0 shops + no callerBoundsExplicit → caller wins (no-fit branch unchanged)", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it("post-flip world: 1 shop + no callerBoundsExplicit → caller wins (no-fit branch unchanged)", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
  });

  it("post-flip world: 1 shop + 1 reportPin (combined ≥2) + no callerBoundsExplicit → fittedView wins", () => {
    // Locks the §2.2 fittedView memo's allPoints fallback under
    // the post-flip default. If the flip ever silently changes
    // which fit-points the memo uses, this test fails.
    const pin = makePin("p1", 40.81, -73.91);
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A]}
        reportPins={[pin]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
      />
    );
    const props = lastMapPropsOrThrow();
    // With 1 shop, fittedView memo uses allPoints (shops + pins),
    // which now has 2 entries → fit fires.
    const expectedLat = (40.7 + 40.81) / 2;
    const expectedLng = (-74.0 + -73.91) / 2;
    expect(props.latitude).toBeCloseTo(expectedLat, 5);
    expect(props.longitude).toBeCloseTo(expectedLng, 5);
  });
});

// ---------------------------------------------------------------
// §2. Future default-flip + opted-in caller → caller wins.
//
// The whole point of the flip is to give callers a way to
// declare intentional framing. ReportDetailScreen is the
// canonical sub-pass C migration target (single-report tight
// zoom). These tests pin the opt-in path BEFORE the flip ships.
// ---------------------------------------------------------------

describe("Engine 3 — Pass 245 §2 default-flip + callerBoundsExplicit → caller wins", () => {
  const NY_A = makeShop("nyA", 40.7, -74.0);
  const NY_B = makeShop("nyB", 40.8, -73.9);

  it("post-flip + opted-in caller + 2 shops → caller wins (the ReportDetail target shape)", () => {
    render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
        callerBoundsExplicit
      />
    );
    const props = lastMapPropsOrThrow();
    expect(props.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(props.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
    expect(props.zoom).toBe(CALLER_ZOOM);
  });

  it("post-flip + opted-in caller + dynamic shop change → caller still wins (no late re-fit)", () => {
    // Critical sub-pass C invariant: after a caller opts in,
    // shop-list churn must NOT silently re-introduce fit
    // behavior. Locks the §2.4 useEffect's dependency on
    // effectiveFittedView (not raw fittedView).
    const { rerender } = render(
      <MapLibreDashboardMapPreview
        shops={[NY_A, NY_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
        callerBoundsExplicit
      />
    );
    expect(lastMapPropsOrThrow().latitude).toBeCloseTo(CALLER_CENTER[0], 5);

    const LA_A = makeShop("laA", 34.05, -118.25);
    const LA_B = makeShop("laB", 34.15, -118.35);
    rerender(
      <MapLibreDashboardMapPreview
        shops={[LA_A, LA_B]}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit="when-no-caller-bounds"
        callerBoundsExplicit
      />
    );
    const after = lastMapPropsOrThrow();
    expect(after.latitude).toBeCloseTo(CALLER_CENTER[0], 5);
    expect(after.longitude).toBeCloseTo(CALLER_CENTER[1], 5);
  });
});

// ---------------------------------------------------------------
// §3. Default-flip semantic equivalence with current default.
//
// Locks the strongest claim driving sub-pass C: for every shape
// that today's default `"always"` produces a viewport for, the
// future default `"when-no-caller-bounds"` (with default
// `callerBoundsExplicit=false`) produces the SAME viewport.
// This is the executable form of "the flip is mechanically a
// no-op for un-opted-in callers."
// ---------------------------------------------------------------

describe("Engine 3 — Pass 245 §3 default-flip semantic equivalence (un-opted callers)", () => {
  const NY_A = makeShop("nyA", 40.7, -74.0);
  const NY_B = makeShop("nyB", 40.8, -73.9);

  function renderWith(autoFit: "always" | "when-no-caller-bounds", shops: CoveragePartnerShop[]) {
    capturedMapProps.length = 0;
    render(
      <MapLibreDashboardMapPreview
        shops={shops}
        reportPins={[]}
        center={CALLER_CENTER}
        zoom={CALLER_ZOOM}
        isLight
        autoFit={autoFit}
      />
    );
    return lastMapPropsOrThrow();
  }

  it("0 shops: pre-flip and post-flip resolved viewports are identical", () => {
    const before = renderWith("always", []);
    cleanup();
    const after = renderWith("when-no-caller-bounds", []);
    expect(after.latitude).toBeCloseTo(before.latitude as number, 8);
    expect(after.longitude).toBeCloseTo(before.longitude as number, 8);
    expect(after.zoom).toBe(before.zoom);
  });

  it("1 shop: pre-flip and post-flip resolved viewports are identical", () => {
    const before = renderWith("always", [NY_A]);
    cleanup();
    const after = renderWith("when-no-caller-bounds", [NY_A]);
    expect(after.latitude).toBeCloseTo(before.latitude as number, 8);
    expect(after.longitude).toBeCloseTo(before.longitude as number, 8);
    expect(after.zoom).toBe(before.zoom);
  });

  it("2 shops: pre-flip and post-flip resolved viewports are identical", () => {
    const before = renderWith("always", [NY_A, NY_B]);
    cleanup();
    const after = renderWith("when-no-caller-bounds", [NY_A, NY_B]);
    expect(after.latitude).toBeCloseTo(before.latitude as number, 8);
    expect(after.longitude).toBeCloseTo(before.longitude as number, 8);
    expect(after.zoom).toBe(before.zoom);
  });
});
