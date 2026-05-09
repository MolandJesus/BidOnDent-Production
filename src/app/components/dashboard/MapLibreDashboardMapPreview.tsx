// Must run before any Map instantiation — patches resize crash
import "../../utils/maplibreResizePatch";

import Map, { Source, Layer, Popup } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { mapLibreStyles } from "../maps/mapLibreStyles";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import type { MapLayerMouseEvent, ViewState } from "react-map-gl/maplibre";
import { circleToPolygon } from "../../utils/geoCircle";

export type ReportPin = { id: string; lat: number; lng: number; label: string };
export type ServiceAreaCircle = { lat: number; lng: number; radiusMiles: number };

/**
 * Pass 251 (KI-196 hardening) — module-scope empty-array singletons.
 *
 * The renderer previously used inline `[]` literals as defaults
 * for `reportPins` and `serviceAreaCircles`. Inline defaults
 * produce a fresh array identity on every render when a caller
 * omits the prop, which churns downstream `useMemo` dependency
 * comparisons and (for `reportPins`) propagates into the
 * `useEffect` that calls `setViewState`, causing the latent
 * render-loop hazard documented in KI-196 / KI-181 §12.3.
 *
 * Production callers always pass these props explicitly today
 * (verified Pass 242 audit + Pass 250 caller-side scan), so
 * these singletons are defensive only — zero behavior change
 * for any existing call site, but eliminates the latent loop
 * for any future caller that omits.
 *
 * Exported for test-side identity assertions.
 */
export const EMPTY_REPORT_PINS: ReportPin[] = Object.freeze([] as ReportPin[]) as ReportPin[];
export const EMPTY_SERVICE_AREA_CIRCLES: ServiceAreaCircle[] = Object.freeze(
  [] as ServiceAreaCircle[]
) as ServiceAreaCircle[];

/**
 * Pass 241 (Phase 3A sub-pass A) — explicit camera-authority surface.
 *
 * Engine 3's auto-fit (the `fittedView` memo derived from shops/pins)
 * was previously a hidden-authority surface (KI-181): when ≥2 shops
 * existed, the renderer silently overrode caller-supplied
 * `center`/`zoom`. This prop makes that authority caller-visible
 * WITHOUT changing default behavior.
 *
 * Modes:
 *  - "always"                — fit whenever ≥2 fit-points exist.
 *                              This is the default and matches the
 *                              pre-Pass-241 implicit behavior
 *                              exactly. KI-181 baseline preserved.
 *  - "never"                 — ignore `fittedView`. Caller-supplied
 *                              `center`/`zoom` always win. Use this
 *                              when the caller has an intentional
 *                              framing (e.g. single-report focus).
 *  - "when-no-caller-bounds" — fit only if the caller has NOT
 *                              signalled explicit bounds via the
 *                              companion `callerBoundsExplicit`
 *                              prop. When `callerBoundsExplicit ===
 *                              true`, behaves like `"never"`.
 *                              Otherwise behaves like `"always"`.
 *                              This is the doctrinal target default
 *                              for sub-pass C (NOT flipped here).
 *
 * Sub-pass A authority discipline (per
 * `docs/REF_ENGINE_3_CAMERA_AUTHORITY_2026-05-09.md` §5.3):
 *   - Default MUST stay `"always"` to preserve every Phase 1 surface.
 *   - No call-site changes in this pass (those are sub-pass B).
 *   - No default flip in this pass (that is sub-pass C).
 *   - "Preview owns no camera" remains intact: this prop selects
 *     between caller props and the existing `fittedView` memo;
 *     no imperative camera APIs are introduced. The Pass 236
 *     source-level guards continue to enforce that absence.
 */
export type AutoFitMode = "always" | "when-no-caller-bounds" | "never";

type MapLibreDashboardMapPreviewProps = {
  shops: CoveragePartnerShop[];
  reportPins?: ReportPin[];
  serviceAreaCircles?: ServiceAreaCircle[];
  center: [number, number];
  zoom: number;
  isLight: boolean;
  onShopClick?: (shop: CoveragePartnerShop) => void;
  onReportPinClick?: (pin: ReportPin) => void;
  onMapClick?: () => void;
  /**
   * Pass 241 — explicit auto-fit authority. Default `"always"`
   * preserves the pre-Pass-241 implicit-fit behavior (KI-181
   * baseline). See `AutoFitMode` for full mode semantics.
   */
  autoFit?: AutoFitMode;
  /**
   * Pass 241 — companion signal consulted ONLY when
   * `autoFit === "when-no-caller-bounds"`. When `true`, the caller
   * declares that `center`/`zoom` are intentional bounds the
   * renderer must not override. Ignored under `"always"` and
   * `"never"`. Default `false` (preserves implicit-fit behavior
   * under the "when-no-caller-bounds" mode for callers who have
   * not yet been audited).
   */
  callerBoundsExplicit?: boolean;
};

export default function MapLibreDashboardMapPreview({
  shops,
  reportPins = EMPTY_REPORT_PINS,
  serviceAreaCircles = EMPTY_SERVICE_AREA_CIRCLES,
  center,
  zoom,
  isLight,
  onShopClick,
  onReportPinClick,
  onMapClick,
  autoFit = "always",
  callerBoundsExplicit = false,
}: MapLibreDashboardMapPreviewProps) {
  const mapId = useId();
  const mapStyle = isLight ? mapLibreStyles.roadmap : mapLibreStyles.night;

  /* ── Auto-fit: compute center+zoom from all pins when 2+ exist ── */
  const allPoints = useMemo(() => {
    const pts: { lat: number; lng: number }[] = [];
    shops.forEach((s) => pts.push({ lat: s.lat, lng: s.lng }));
    reportPins.forEach((p) => pts.push({ lat: p.lat, lng: p.lng }));
    return pts;
  }, [shops, reportPins]);

  const fittedView = useMemo(() => {
    // Fit viewport to shops only — report pins outside coverage area should not
    // pull the viewport away from the service region.
    const fitPoints = shops.length >= 2 ? shops : allPoints;
    if (fitPoints.length < 2) return null;
    let minLat = Infinity,
      maxLat = -Infinity,
      minLng = Infinity,
      maxLng = -Infinity;
    for (const p of fitPoints) {
      if (p.lat < minLat) minLat = p.lat;
      if (p.lat > maxLat) maxLat = p.lat;
      if (p.lng < minLng) minLng = p.lng;
      if (p.lng > maxLng) maxLng = p.lng;
    }
    const cLat = (minLat + maxLat) / 2;
    const cLng = (minLng + maxLng) / 2;
    const latSpan = Math.max(maxLat - minLat, 0.005);
    const lngSpan = Math.max(maxLng - minLng, 0.005);
    const span = Math.max(latSpan, lngSpan);
    // Approximate zoom from geographic span (log2 scale with padding)
    const z = Math.min(14, Math.max(3, Math.floor(8.5 - Math.log2(span))));
    return { latitude: cLat, longitude: cLng, zoom: z };
  }, [shops, allPoints]);

  /* Pass 241 — explicit autoFit authority gate.
   * `effectiveFittedView` collapses the new (autoFit, callerBoundsExplicit)
   * authority surface back into the pre-existing single nullable
   * `fittedView`-shaped value the consumer below already knows how
   * to handle. This keeps the consumer (`useState` initializer +
   * `useEffect`) untouched in shape — only the value flowing into
   * it carries the new authority semantics. Defaults
   * (`autoFit="always"`, `callerBoundsExplicit=false`) yield
   * `effectiveFittedView === fittedView`, preserving KI-181
   * baseline behavior exactly. */
  const effectiveFittedView = useMemo(() => {
    if (autoFit === "never") return null;
    if (autoFit === "when-no-caller-bounds" && callerBoundsExplicit) return null;
    return fittedView;
  }, [autoFit, callerBoundsExplicit, fittedView]);

  /* Controlled viewport — responds when parent changes center/zoom */
  const [viewState, setViewState] = useState<Pick<ViewState, "longitude" | "latitude" | "zoom">>({
    longitude: effectiveFittedView?.longitude ?? center[1],
    latitude: effectiveFittedView?.latitude ?? center[0],
    zoom: effectiveFittedView?.zoom ?? zoom,
  });

  useEffect(() => {
    if (effectiveFittedView) {
      setViewState(effectiveFittedView);
    } else {
      setViewState({ longitude: center[1], latitude: center[0], zoom });
    }
  }, [center, zoom, effectiveFittedView]);

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: shops.map((shop) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [shop.lng, shop.lat] },
        properties: { id: `${shop.id || shop.name}`, name: shop.name },
      })),
    }),
    [shops]
  );

  const reportGeojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: reportPins.map((pin) => ({
        type: "Feature" as const,
        geometry: { type: "Point" as const, coordinates: [pin.lng, pin.lat] },
        properties: { id: pin.id, label: pin.label || "" },
      })),
    }),
    [reportPins]
  );

  const serviceAreaGeojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: serviceAreaCircles.map((c) => circleToPolygon(c.lat, c.lng, c.radiusMiles)),
    }),
    [serviceAreaCircles]
  );

  const [tooltip, setTooltip] = useState<{
    lat: number;
    lng: number;
    label: string;
  } | null>(null);

  const handleMapClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (e.features?.length) {
        const layerId = e.features[0].layer?.id;
        if (layerId === "dashboard-reports-circle") {
          const pinId = e.features[0].properties?.id as string;
          const pin = reportPins.find((p) => p.id === pinId);
          if (pin) {
            setTooltip({ lat: pin.lat, lng: pin.lng, label: pin.label || "Report" });
            onReportPinClick?.(pin);
            return;
          }
        }
        const shopId = e.features[0].properties?.id as string;
        const shop = shops.find((s) => `${s.id || s.name}` === shopId);
        if (shop) {
          setTooltip({ lat: shop.lat, lng: shop.lng, label: shop.name });
          onShopClick?.(shop);
          return;
        }
      }
      setTooltip(null);
      onMapClick?.();
    },
    [shops, reportPins, onShopClick, onReportPinClick, onMapClick]
  );

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer">
      <Map
        id={`dashboard-preview-${mapId}`}
        {...viewState}
        onMove={(e) => setViewState(e.viewState)}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        attributionControl={false}
        scrollZoom={false}
        dragPan={false}
        dragRotate={false}
        doubleClickZoom={false}
        touchZoomRotate={false}
        keyboard={false}
        interactiveLayerIds={[
          "dashboard-shops-circle",
          ...(reportPins.length > 0 ? ["dashboard-reports-circle"] : []),
        ]}
        onClick={handleMapClick}
      >
        {serviceAreaCircles.length > 0 && (
          <Source id="dashboard-service-areas" type="geojson" data={serviceAreaGeojson}>
            <Layer
              id="dashboard-service-area-fill"
              type="fill"
              paint={{
                "fill-color": "#2563eb",
                "fill-opacity": 0.1,
              }}
            />
            <Layer
              id="dashboard-service-area-border"
              type="line"
              paint={{
                "line-color": "#3b82f6",
                "line-width": 1.5,
                "line-opacity": 0.5,
                "line-dasharray": [3, 2],
              }}
            />
          </Source>
        )}

        <Source id="dashboard-shops" type="geojson" data={geojson}>
          <Layer
            id="dashboard-shops-circle"
            type="circle"
            paint={{
              "circle-radius": 7,
              "circle-color": "#2563eb",
              "circle-stroke-color": "#3b82f6",
              "circle-stroke-width": 2,
              "circle-opacity": 0.85,
            }}
          />
        </Source>

        {reportPins.length > 0 && (
          <Source id="dashboard-reports" type="geojson" data={reportGeojson}>
            <Layer
              id="dashboard-reports-circle"
              type="circle"
              paint={{
                "circle-radius": 8,
                "circle-color": "#f59e0b",
                "circle-stroke-color": "#fbbf24",
                "circle-stroke-width": 2.5,
                "circle-opacity": 0.9,
              }}
            />
          </Source>
        )}

        {tooltip && (
          <Popup
            longitude={tooltip.lng}
            latitude={tooltip.lat}
            anchor="bottom"
            closeButton={false}
            closeOnClick={false}
            offset={12}
            className="bd-map-tooltip"
          >
            <span
              className="animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none"
              style={{
                display: "block",
                maxWidth: 180,
                padding: "4px 10px",
                fontSize: 12,
                fontWeight: 600,
                lineHeight: 1.3,
                color: isLight ? "#1e293b" : "#f1f5f9",
                background: isLight ? "rgba(238,247,255,0.94)" : "rgba(15,23,42,0.92)",
                borderRadius: 8,
                backdropFilter: "blur(8px)",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {tooltip.label}
            </span>
          </Popup>
        )}
      </Map>

      {/* Subtle vignette overlay to blend edges */}
      <div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          boxShadow: isLight
            ? "inset 0 0 30px rgba(248, 250, 252, 0.5)"
            : "inset 0 0 40px rgba(8, 18, 38, 0.6)",
        }}
      />
    </div>
  );
}
