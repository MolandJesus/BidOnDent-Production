/**
 * Coverage map — lifecycle confidence suite (Pass 255, Coverage
 * Map Confidence Expansion lane).
 *
 * Behavioral-invariant tests for `MapLibreServiceCoverageMap`,
 * the second Tier B host surface (alongside
 * `MapLibreDashboardMapPreview` already pinned by Pass 254). The
 * coverage map is the production map host that drives the
 * dashboard's full-screen / immersive surface and the navigation
 * presentation. Unlike the preview it has no `autoFit` semantics
 * — it is fully caller-driven for viewport — but it composes a
 * heavier reactive surface (counties, partner shops, discovery
 * places, search target, route geometry, follow-location
 * controllers, performance tracking).
 *
 * Design choice — observe at the engine boundary
 * -----------------------------------------------
 * The host's contract with the MapLibre adapter lives at
 * `<MapEngineCanvas>` (engine-side seam established Pass 189
 * sub-pass 2). Mocking that boundary captures every host-resolved
 * prop the engine would consume, without booting WebGL, the
 * imperative viewport controllers, or the GeoJSON layer
 * subcomponents. This isolates *host* lifecycle behavior cleanly
 * from *engine* lifecycle behavior.
 *
 * Sections (10 invariants, owner-specified Pass 255 charter)
 * ----------------------------------------------------------
 *   §1  — mount/unmount churn (2 tests)
 *   §2  — repeated rerender stability
 *   §3  — counties grow/shrink transitions
 *   §4  — partnerShops grow/shrink transitions
 *   §5  — discoveryPlaces continuity
 *   §6  — empty ↔ populated round-trip (no stale residue)
 *   §7  — rapid prop churn (caller-driven viewport)
 *   §8  — layer visibility continuity (interactiveLayerIds)
 *   §9  — repeated import stability
 *   §10 — stable derived viewport semantics
 *
 * Why these tests
 * ---------------
 * Coverage map is the surface where reactive bugs (stale GeoJSON
 * memo keys, controller reset misses, counties leaking into the
 * partnerShops branch, layer-id flicker) historically hide. Prior
 * passes (KI-196, Pass 251 default-param identity, Pass 254
 * preview lifecycle) pinned narrower seams. This file pins host
 * lifecycle behavior end-to-end at the engine boundary.
 *
 * Lane discipline
 * ---------------
 * - NO source files touched. Pure characterization.
 * - All assertions are behavioral invariants (resolved props at
 *   the engine boundary), not implementation snapshots.
 * - autoFit / callerBoundsExplicit / sub-pass C UNTOUCHED.
 * - ShopMapWidget UNTOUCHED.
 * - production Supabase runtime UNCHANGED.
 * - If any test reveals a real semantic defect, STOP and
 *   characterize — do NOT silently fix inside this lane.
 *
 * Convergence metadata
 * --------------------
 *  1. Runtime paths touched     : test-only.
 *  2. Runtime classes touched   : Tier B host (characterization).
 *  3. Tier semantics touched    : Tier B characterization,
 *                                 unchanged.
 *  4. Motion classes touched    : none (all renders use
 *                                 prefers-reduced-motion=false
 *                                 default).
 *  5. Shell hierarchy impact    : none.
 *  6. Authority semantics       : unchanged. Engine-boundary
 *                                 contract observed, not altered.
 *  7. Reduced-motion inheritance: unchanged.
 *  8. Hidden-authority risk     : decreased — host lifecycle
 *                                 behavior now pinned at the
 *                                 engine seam.
 *  9. Continuity guarantees     : unaffected.
 * 10. Rollback semantics        : delete this file.
 *
 * Cross-references
 * ----------------
 * - src/app/components/maps/MapLibreServiceCoverageMap.tsx
 * - src/app/components/maps/engine/MapEngineCanvas.tsx
 * - src/app/__tests__/tierBPreviewLifecycle.test.tsx (Pass 254
 *   companion — Tier B preview)
 * - src/app/__tests__/ki196DefaultParamStability.test.tsx
 *   (Pass 251 default-param identity lock — companion)
 * - docs/REF_MAP_RENDERER_INVENTORY_2026-05-09.md
 * - docs/PLAN_MAP_UNIFICATION_2026-05-08.md §4 Step C.1
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";

import { installPrefersReducedMotion } from "../test-utils/mapTestHarness";

// Capture every props object the host hands down to the engine
// boundary. Tests inspect this array to assert lifecycle
// invariants without booting MapLibre / WebGL.
const capturedCanvasProps: Array<Record<string, unknown>> = [];

vi.mock("../components/maps/engine/MapEngineCanvas", () => ({
  __esModule: true,
  default: (props: Record<string, unknown>) => {
    capturedCanvasProps.push({ ...props });
    return null;
  },
}));

// MapLibre stylesheet side-effect import inside the engine module
// graph would otherwise reach jsdom. Defensive only — the
// MapEngineCanvas mock above already short-circuits the host's
// path to the real engine module.
vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));

import MapLibreServiceCoverageMap from "../components/maps/MapLibreServiceCoverageMap";
import { PARTNER_SHOPS_LAYER_ID } from "../components/maps/MapLibrePartnerShopLayer";
import type {
  CoverageCountyMarker,
  CoveragePartnerShop,
  MapTileMode,
} from "../components/maps/serviceCoverageMapTypes";
import type { NavigationDiscoveryPlace } from "../services/navigation/placeDiscovery";

// ---------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------

const CALLER_CENTER: [number, number] = [37.78, -122.41];
const CALLER_ZOOM = 11;
const TILE_MODE: MapTileMode = "standard";

function makeCounty(name: string, lat: number, lng: number): CoverageCountyMarker {
  return { name, lat, lng } as CoverageCountyMarker;
}

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

function makePlace(id: string, lat: number, lng: number): NavigationDiscoveryPlace {
  return {
    id,
    name: `Place ${id}`,
    lat,
    lng,
  } as NavigationDiscoveryPlace;
}

const NOOP = () => {};

type RenderProps = {
  counties?: CoverageCountyMarker[];
  partnerShops?: CoveragePartnerShop[];
  discoveryPlaces?: NavigationDiscoveryPlace[];
  showReportLayer?: boolean;
  center?: [number, number];
  zoom?: number;
  revision?: number;
};

function renderHost(p: RenderProps = {}) {
  return (
    <MapLibreServiceCoverageMap
      center={p.center ?? CALLER_CENTER}
      zoom={p.zoom ?? CALLER_ZOOM}
      revision={p.revision ?? 0}
      tileMode={TILE_MODE}
      counties={p.counties ?? []}
      partnerShops={p.partnerShops ?? []}
      activeSearchTarget={null}
      radiusMeters={5000}
      radiusMiles="3"
      regionCount={0}
      discoveryPlaces={p.discoveryPlaces ?? []}
      showReportLayer={p.showReportLayer ?? false}
      onTileModeChange={NOOP}
      onCenterActive={NOOP}
      onResetView={NOOP}
    />
  );
}

function lastCanvasOrThrow(): Record<string, unknown> {
  if (capturedCanvasProps.length === 0) {
    throw new Error("Engine boundary stub never received props — did the host fail to mount?");
  }
  return capturedCanvasProps[capturedCanvasProps.length - 1];
}

beforeEach(() => {
  capturedCanvasProps.length = 0;
  installPrefersReducedMotion(false);
});
afterEach(cleanup);

// ---------------------------------------------------------------
// §1. Mount / unmount churn.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §1 mount/unmount churn", () => {
  it("mount → unmount → re-mount produces independent engine invocations without throwing", () => {
    const C1 = makeCounty("San Francisco", 37.78, -122.41);
    const first = render(renderHost({ counties: [C1] }));
    const firstCount = capturedCanvasProps.length;
    expect(firstCount).toBeGreaterThanOrEqual(1);
    first.unmount();

    const beforeRemount = capturedCanvasProps.length;
    render(renderHost({ counties: [C1] }));
    const afterRemount = capturedCanvasProps.length;
    expect(afterRemount).toBeGreaterThan(beforeRemount);
  });

  it("unmount with all-empty data does not throw", () => {
    const view = render(renderHost());
    expect(() => view.unmount()).not.toThrow();
  });
});

// ---------------------------------------------------------------
// §2. Repeated rerender stability.
//
// Re-rendering identical host props must produce engine-boundary
// props whose semantically meaningful fields are stable. The
// captured array grows (each render adds a snapshot) but the
// observed values must not drift.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §2 repeated rerender stability", () => {
  it("identical props across 3 renders yield stable center/zoom/counts", () => {
    const C1 = makeCounty("A", 40.7, -74.0);
    const S1 = makeShop("s1", 40.71, -74.01);
    const view = render(renderHost({ counties: [C1], partnerShops: [S1] }));

    const first = lastCanvasOrThrow();
    const firstCenter = first.center;
    const firstZoom = first.zoom;
    const firstCountyCount = (first.counties as CoverageCountyMarker[]).length;
    const firstShopCount = (first.partnerShops as CoveragePartnerShop[]).length;

    view.rerender(renderHost({ counties: [C1], partnerShops: [S1] }));
    const second = lastCanvasOrThrow();
    expect(second.center).toEqual(firstCenter);
    expect(second.zoom).toBe(firstZoom);
    expect((second.counties as CoverageCountyMarker[]).length).toBe(firstCountyCount);
    expect((second.partnerShops as CoveragePartnerShop[]).length).toBe(firstShopCount);

    view.rerender(renderHost({ counties: [C1], partnerShops: [S1] }));
    const third = lastCanvasOrThrow();
    expect(third.center).toEqual(firstCenter);
    expect(third.zoom).toBe(firstZoom);
    expect((third.counties as CoverageCountyMarker[]).length).toBe(firstCountyCount);
    expect((third.partnerShops as CoveragePartnerShop[]).length).toBe(firstShopCount);
  });
});

// ---------------------------------------------------------------
// §3. Counties grow/shrink transitions.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §3 counties grow/shrink", () => {
  it("0 → 1 → 2 → 1 → 0 counties is reflected at engine boundary each step", () => {
    const A = makeCounty("A", 40.7, -74.0);
    const B = makeCounty("B", 40.8, -73.9);
    const view = render(renderHost({ counties: [] }));
    expect((lastCanvasOrThrow().counties as CoverageCountyMarker[]).length).toBe(0);

    view.rerender(renderHost({ counties: [A] }));
    expect((lastCanvasOrThrow().counties as CoverageCountyMarker[]).length).toBe(1);

    view.rerender(renderHost({ counties: [A, B] }));
    expect((lastCanvasOrThrow().counties as CoverageCountyMarker[]).length).toBe(2);

    view.rerender(renderHost({ counties: [A] }));
    expect((lastCanvasOrThrow().counties as CoverageCountyMarker[]).length).toBe(1);

    view.rerender(renderHost({ counties: [] }));
    expect((lastCanvasOrThrow().counties as CoverageCountyMarker[]).length).toBe(0);
  });
});

// ---------------------------------------------------------------
// §4. PartnerShops grow/shrink transitions.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §4 partnerShops grow/shrink", () => {
  it("0 → 1 → 3 → 1 → 0 partnerShops is reflected at engine boundary each step", () => {
    const S1 = makeShop("s1", 40.7, -74.0);
    const S2 = makeShop("s2", 40.8, -73.9);
    const S3 = makeShop("s3", 40.9, -73.8);
    const view = render(renderHost({ partnerShops: [] }));
    expect((lastCanvasOrThrow().partnerShops as CoveragePartnerShop[]).length).toBe(0);

    view.rerender(renderHost({ partnerShops: [S1] }));
    expect((lastCanvasOrThrow().partnerShops as CoveragePartnerShop[]).length).toBe(1);

    view.rerender(renderHost({ partnerShops: [S1, S2, S3] }));
    expect((lastCanvasOrThrow().partnerShops as CoveragePartnerShop[]).length).toBe(3);

    view.rerender(renderHost({ partnerShops: [S2] }));
    const single = lastCanvasOrThrow().partnerShops as CoveragePartnerShop[];
    expect(single.length).toBe(1);
    expect(single[0].id).toBe("s2");

    view.rerender(renderHost({ partnerShops: [] }));
    expect((lastCanvasOrThrow().partnerShops as CoveragePartnerShop[]).length).toBe(0);
  });
});

// ---------------------------------------------------------------
// §5. discoveryPlaces continuity.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §5 discoveryPlaces continuity", () => {
  it("discoveryPlaces array is preserved through grow/shrink without leaking into other lists", () => {
    const P1 = makePlace("p1", 40.7, -74.0);
    const P2 = makePlace("p2", 40.8, -73.9);
    const view = render(renderHost({ discoveryPlaces: [] }));
    let snap = lastCanvasOrThrow();
    expect((snap.discoveryPlaces as NavigationDiscoveryPlace[]).length).toBe(0);
    expect((snap.counties as CoverageCountyMarker[]).length).toBe(0);
    expect((snap.partnerShops as CoveragePartnerShop[]).length).toBe(0);

    view.rerender(renderHost({ discoveryPlaces: [P1, P2] }));
    snap = lastCanvasOrThrow();
    expect((snap.discoveryPlaces as NavigationDiscoveryPlace[]).length).toBe(2);
    // Sanity: discoveryPlaces grew but counties/shops stayed empty.
    expect((snap.counties as CoverageCountyMarker[]).length).toBe(0);
    expect((snap.partnerShops as CoveragePartnerShop[]).length).toBe(0);

    view.rerender(renderHost({ discoveryPlaces: [P1] }));
    snap = lastCanvasOrThrow();
    expect((snap.discoveryPlaces as NavigationDiscoveryPlace[]).length).toBe(1);
    expect((snap.discoveryPlaces as NavigationDiscoveryPlace[])[0].id).toBe("p1");

    view.rerender(renderHost({ discoveryPlaces: [] }));
    snap = lastCanvasOrThrow();
    expect((snap.discoveryPlaces as NavigationDiscoveryPlace[]).length).toBe(0);
  });
});

// ---------------------------------------------------------------
// §6. Empty ↔ populated round-trip.
//
// A populated render between two empty renders must NOT leave
// stale data behind on the second empty render — every list
// must be empty again at the engine boundary.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §6 empty ↔ populated round-trip", () => {
  it("empty → populated → empty resolves to fully empty at engine boundary", () => {
    const C1 = makeCounty("A", 40.7, -74.0);
    const S1 = makeShop("s1", 40.71, -74.01);
    const P1 = makePlace("p1", 40.72, -74.02);

    const view = render(renderHost());
    let snap = lastCanvasOrThrow();
    expect((snap.counties as CoverageCountyMarker[]).length).toBe(0);
    expect((snap.partnerShops as CoveragePartnerShop[]).length).toBe(0);
    expect((snap.discoveryPlaces as NavigationDiscoveryPlace[]).length).toBe(0);

    view.rerender(renderHost({ counties: [C1], partnerShops: [S1], discoveryPlaces: [P1] }));
    snap = lastCanvasOrThrow();
    expect((snap.counties as CoverageCountyMarker[]).length).toBe(1);
    expect((snap.partnerShops as CoveragePartnerShop[]).length).toBe(1);
    expect((snap.discoveryPlaces as NavigationDiscoveryPlace[]).length).toBe(1);

    view.rerender(renderHost());
    snap = lastCanvasOrThrow();
    expect((snap.counties as CoverageCountyMarker[]).length).toBe(0);
    expect((snap.partnerShops as CoveragePartnerShop[]).length).toBe(0);
    expect((snap.discoveryPlaces as NavigationDiscoveryPlace[]).length).toBe(0);
  });
});

// ---------------------------------------------------------------
// §7. Rapid prop churn — caller-driven viewport.
//
// Coverage map has no autoFit; viewport flows directly from
// caller. Rapidly cycling center/zoom must always reflect the
// most-recent caller intent at the engine boundary.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §7 rapid prop churn", () => {
  it("rapid center/zoom changes always reflect latest caller intent at engine boundary", () => {
    const view = render(renderHost({ center: [10, 20], zoom: 5 }));
    let snap = lastCanvasOrThrow();
    expect(snap.center).toEqual([10, 20]);
    expect(snap.zoom).toBe(5);

    view.rerender(renderHost({ center: [30, 40], zoom: 8 }));
    snap = lastCanvasOrThrow();
    expect(snap.center).toEqual([30, 40]);
    expect(snap.zoom).toBe(8);

    view.rerender(renderHost({ center: [-15, -75], zoom: 3 }));
    snap = lastCanvasOrThrow();
    expect(snap.center).toEqual([-15, -75]);
    expect(snap.zoom).toBe(3);

    view.rerender(renderHost({ center: [0, 0], zoom: 12 }));
    snap = lastCanvasOrThrow();
    expect(snap.center).toEqual([0, 0]);
    expect(snap.zoom).toBe(12);
  });
});

// ---------------------------------------------------------------
// §8. Layer visibility continuity (interactiveLayerIds).
//
// `interactiveLayerIds` is host-derived from
// `presentationMode === "navigation"`, `showReportLayer`, and
// `discoveryPlaces.length`. Verify the host's derivation is
// stable across the relevant transitions.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §8 layer visibility continuity", () => {
  it("interactiveLayerIds always includes partner-shops layer; report + discovery layers gate on inputs", () => {
    // Baseline: no report, no discovery places.
    const view = render(renderHost({ showReportLayer: false, discoveryPlaces: [] }));
    let ids = lastCanvasOrThrow().interactiveLayerIds as string[];
    expect(ids.length).toBe(1);
    expect(ids).toContain(PARTNER_SHOPS_LAYER_ID);

    // Toggle report layer on (no discovery places).
    view.rerender(renderHost({ showReportLayer: true, discoveryPlaces: [] }));
    ids = lastCanvasOrThrow().interactiveLayerIds as string[];
    expect(ids).toContain(PARTNER_SHOPS_LAYER_ID);
    expect(ids.length).toBeGreaterThanOrEqual(2);

    // Add discovery places (report still on).
    const P1 = makePlace("p1", 40.7, -74.0);
    view.rerender(renderHost({ showReportLayer: true, discoveryPlaces: [P1] }));
    ids = lastCanvasOrThrow().interactiveLayerIds as string[];
    expect(ids).toContain(PARTNER_SHOPS_LAYER_ID);
    expect(ids.length).toBeGreaterThanOrEqual(3);

    // Drop discovery + report. Back to baseline.
    view.rerender(renderHost({ showReportLayer: false, discoveryPlaces: [] }));
    ids = lastCanvasOrThrow().interactiveLayerIds as string[];
    expect(ids.length).toBe(1);
    expect(ids).toContain(PARTNER_SHOPS_LAYER_ID);
  });
});

// ---------------------------------------------------------------
// §9. Repeated import stability.
//
// Module identity must be stable across repeated imports. This
// guards against accidental module-graph duplication / re-eval.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §9 repeated import stability", () => {
  it("repeated dynamic import yields identical default export", async () => {
    const a = await import("../components/maps/MapLibreServiceCoverageMap");
    const b = await import("../components/maps/MapLibreServiceCoverageMap");
    expect(a.default).toBe(b.default);
  });
});

// ---------------------------------------------------------------
// §10. Stable derived viewport semantics.
//
// `revision` bumps must NOT alter caller-supplied center/zoom
// values flowing to the engine boundary. The host's job is to
// pass them through unchanged; revision is a controller-side
// signal.
// ---------------------------------------------------------------

describe("coverage map — Pass 255 §10 derived viewport stability under revision bump", () => {
  it("revision bump does not perturb center/zoom passed to engine", () => {
    const view = render(renderHost({ center: [12.34, -56.78], zoom: 9, revision: 0 }));
    const first = lastCanvasOrThrow();
    expect(first.center).toEqual([12.34, -56.78]);
    expect(first.zoom).toBe(9);
    expect(first.revision).toBe(0);

    view.rerender(renderHost({ center: [12.34, -56.78], zoom: 9, revision: 1 }));
    const second = lastCanvasOrThrow();
    expect(second.center).toEqual([12.34, -56.78]);
    expect(second.zoom).toBe(9);
    expect(second.revision).toBe(1);

    view.rerender(renderHost({ center: [12.34, -56.78], zoom: 9, revision: 99 }));
    const third = lastCanvasOrThrow();
    expect(third.center).toEqual([12.34, -56.78]);
    expect(third.zoom).toBe(9);
    expect(third.revision).toBe(99);
  });
});
