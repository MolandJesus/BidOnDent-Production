/**
 * MapEngineCanvas — Pass 192 contract lock.
 *
 * Mirrors the Pass 186 contract-lock pattern that protected the
 * `useMapEngineGeoJSON` hook boundary during the Pass 189 extraction.
 * Now that `<MapEngineCanvas>` is the engine boundary, the same
 * regression-guard discipline applies before sub-pass 3
 * (`<MapProgramShell>`) starts touching the surrounding chrome host.
 *
 * MapLibre needs WebGL, which jsdom does not provide, so the test
 * mocks the heavy deps (`react-map-gl/maplibre`, the controllers,
 * the layers component) to identifiable stubs. We assert on what we
 * lifted in Pass 189 — the controller mounts, the layers mount, the
 * canvas wrapper className composition, and the prop-passthrough to
 * the layers component.
 *
 * Refs:
 *  - PLAN_MAP_UNIFICATION_2026-05-08.md §4 Step C.1 sub-pass 2 + 3
 *  - Pass 189 commit `9d154645` (engine extraction)
 *  - Pass 186 commit `3d59c5c0` (sibling hook contract lock)
 */

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("react-map-gl/maplibre", () => ({
  __esModule: true,
  default: ({ children }: { children?: React.ReactNode }) => (
    <div data-testid="stub-map">{children}</div>
  ),
  AttributionControl: () => <div data-testid="stub-attribution" />,
  NavigationControl: ({ showCompass }: { showCompass?: boolean }) => (
    <div data-testid="stub-navigation-control" data-show-compass={String(Boolean(showCompass))} />
  ),
}));

vi.mock("maplibre-gl/dist/maplibre-gl.css", () => ({}));
vi.mock("../../../utils/maplibreResizePatch", () => ({}));

vi.mock("../mapLibreControllers", () => ({
  MapLibreViewportController: ({
    revision,
  }: {
    revision: number;
  }) => <div data-testid="stub-viewport-controller" data-revision={String(revision)} />,
  MapLibreFollowLocationController: ({
    enabled,
    guidanceMode,
  }: {
    enabled: boolean;
    guidanceMode: boolean;
  }) => (
    <div
      data-testid="stub-follow-location-controller"
      data-enabled={String(enabled)}
      data-guidance={String(guidanceMode)}
    />
  ),
  MapLibreArrivalCameraEffect: ({ hasArrived }: { hasArrived: boolean }) => (
    <div data-testid="stub-arrival-camera" data-arrived={String(hasArrived)} />
  ),
}));

vi.mock("../MapLibreCoverageMapLayers", () => ({
  __esModule: true,
  default: ({
    tone,
    isNavigationPresentation,
    showReportLayer,
  }: {
    tone: string;
    isNavigationPresentation: boolean;
    showReportLayer: boolean;
  }) => (
    <div
      data-testid="stub-coverage-layers"
      data-tone={tone}
      data-nav-presentation={String(isNavigationPresentation)}
      data-show-report-layer={String(showReportLayer)}
    />
  ),
}));

import MapEngineCanvas, {
  type MapEngineCanvasProps,
} from "./MapEngineCanvas";
import { mapLibreStyles } from "../mapLibreStyles";

afterEach(cleanup);

function defaultProps(overrides: Partial<MapEngineCanvasProps> = {}): MapEngineCanvasProps {
  return {
    mapCanvasClassName: "test-canvas-class",
    mapHeightClassName: "test-height-class",
    center: [40.7128, -74.006],
    zoom: 10,
    mapStyle: mapLibreStyles.roadmap,
    immersiveFullscreen: false,
    interactiveLayerIds: [],
    onZoomStart: () => {},
    onZoomEnd: () => {},
    onMoveStart: () => {},
    onMoveEnd: () => {},
    onZoom: () => {},
    revision: 0,
    followCurrentPosition: false,
    followCurrentPositionRevision: 0,
    guidanceMode: false,
    currentHeadingDegrees: null,
    currentPosition: null,
    hasArrived: false,
    destination: null,
    tone: "light",
    isNavigationPresentation: false,
    showReportLayer: false,
    routeGeoJSON: null,
    routeGeometry: undefined,
    routeFitKey: null,
    counties: [],
    countyGeoJSON: { type: "FeatureCollection", features: [] },
    partnerShops: [],
    selectedShopId: undefined,
    onSelectShop: undefined,
    discoveryPlaces: [],
    selectedDiscoveryPlaceId: undefined,
    onSelectDiscoveryPlace: undefined,
    gpsAccuracyGeoJSON: null,
    gpsPointGeoJSON: null,
    gpsHeadingGeoJSON: null,
    activeSearchTarget: null,
    searchTargetRadiusGeoJSON: null,
    searchTargetPointGeoJSON: null,
    radiusLabelGeoJSON: null,
    ...overrides,
  };
}

describe("MapEngineCanvas (Pass 192 contract lock)", () => {
  it("renders the canvas wrapper, the Map stub, and all four engine children", () => {
    const { getByTestId, container } = render(<MapEngineCanvas {...defaultProps()} />);

    // Map instance + its built-in controls
    expect(getByTestId("stub-map")).toBeTruthy();
    expect(getByTestId("stub-attribution")).toBeTruthy();
    expect(getByTestId("stub-navigation-control")).toBeTruthy();

    // The three viewport / camera controllers lifted in Pass 189
    expect(getByTestId("stub-viewport-controller")).toBeTruthy();
    expect(getByTestId("stub-follow-location-controller")).toBeTruthy();
    expect(getByTestId("stub-arrival-camera")).toBeTruthy();

    // The layers component
    expect(getByTestId("stub-coverage-layers")).toBeTruthy();

    // Wrapper div carries the lifted className composition
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain("coverage-map-canvas");
    expect(wrapper.className).toContain("test-canvas-class");
    expect(wrapper.className).toContain("test-height-class");
  });

  it("forwards immersiveFullscreen into the NavigationControl compass flag", () => {
    const inline = render(<MapEngineCanvas {...defaultProps({ immersiveFullscreen: false })} />);
    expect(inline.getByTestId("stub-navigation-control").getAttribute("data-show-compass")).toBe(
      "false"
    );
    cleanup();

    const fullscreen = render(
      <MapEngineCanvas {...defaultProps({ immersiveFullscreen: true })} />
    );
    expect(
      fullscreen.getByTestId("stub-navigation-control").getAttribute("data-show-compass")
    ).toBe("true");
  });

  it("forwards engine-shape props (revision, guidance flags, tone, layer gating) to the right children", () => {
    const { getByTestId } = render(
      <MapEngineCanvas
        {...defaultProps({
          revision: 7,
          followCurrentPosition: true,
          guidanceMode: true,
          hasArrived: true,
          tone: "dark",
          isNavigationPresentation: true,
          showReportLayer: true,
        })}
      />
    );

    expect(getByTestId("stub-viewport-controller").getAttribute("data-revision")).toBe("7");

    const follow = getByTestId("stub-follow-location-controller");
    expect(follow.getAttribute("data-enabled")).toBe("true");
    expect(follow.getAttribute("data-guidance")).toBe("true");

    expect(getByTestId("stub-arrival-camera").getAttribute("data-arrived")).toBe("true");

    const layers = getByTestId("stub-coverage-layers");
    expect(layers.getAttribute("data-tone")).toBe("dark");
    expect(layers.getAttribute("data-nav-presentation")).toBe("true");
    expect(layers.getAttribute("data-show-report-layer")).toBe("true");
  });
});
