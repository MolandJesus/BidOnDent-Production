import { useCallback, useEffect, useMemo, useState } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { getAllDamageReports } from "../../services/supabase/reports";
import { zipToCoordinates, geocodeAddress } from "../../services/supabase/map";
import { ReportDetailDrawer } from "./ReportDetailDrawer";
import type { DamageReport } from "../../services/supabase/types";
import type { MapTheme } from "../../types/mapDomain";

const LAYER_ID = "report-markers-circle";
const LABEL_LAYER_ID = "report-markers-label";
const CLUSTER_LAYER_ID = "report-clusters-circle";
const CLUSTER_COUNT_LAYER_ID = "report-clusters-count";

type MapLibreReportLayerProps = {
  mapTheme?: MapTheme;
  onViewReportDetail?: (reportId: string) => void;
  onReportCountChange?: (count: number, loading: boolean) => void;
  onFindShopsNear?: (coords: { lat: number; lng: number }) => void;
  visible?: boolean;
};

export default function MapLibreReportLayer({
  mapTheme = "dark",
  onViewReportDetail,
  onReportCountChange,
  onFindShopsNear,
  visible = true,
}: MapLibreReportLayerProps) {
  const isDark = mapTheme === "dark";
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const fetchReports = useCallback(() => {
    setLoading(true);
    setFetchError(false);
    let isMounted = true;
    getAllDamageReports()
      .then((data) => {
        if (!isMounted) return;
        setReports(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setFetchError(true);
        setReports([]);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  // Notify parent of report count changes
  useEffect(() => {
    onReportCountChange?.(reports.length, loading);
  }, [reports.length, loading, onReportCountChange]);

  // Start with ZIP centroids, then refine with precise geocoding
  const [geocodedCoords, setGeocodedCoords] = useState<Map<string, { lat: number; lng: number }>>(
    new Map()
  );

  useEffect(() => {
    if (reports.length === 0) return;
    let cancelled = false;

    (async () => {
      for (const report of reports) {
        if (cancelled) break;
        if (!report.address && !report.city) continue;
        const coords = await geocodeAddress({
          address: report.address,
          city: report.city,
          state: report.state,
          zip: report.zip_code,
        });
        if (cancelled) break;
        if (coords && report.id) {
          setGeocodedCoords((prev) => {
            const next = new Map(prev);
            next.set(report.id!, coords);
            return next;
          });
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [reports]);

  const reportsWithCoordinates = useMemo(
    () =>
      reports
        .map((report) => {
          // Prefer geocoded address coordinates, fall back to ZIP centroid
          const geocoded = report.id ? geocodedCoords.get(report.id) : undefined;
          const coords = geocoded ?? zipToCoordinates(report.zip_code);
          if (!coords) return null;
          return { report, coords };
        })
        .filter((entry): entry is { report: DamageReport; coords: { lat: number; lng: number } } =>
          Boolean(entry)
        ),
    [reports, geocodedCoords]
  );

  const geojson = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: reportsWithCoordinates.map(({ report, coords }) => ({
        type: "Feature" as const,
        geometry: {
          type: "Point" as const,
          coordinates: [coords.lng, coords.lat],
        },
        properties: {
          id: report.id,
          status: report.status ?? "pending",
          vehicle: `${report.vehicle_year} ${report.vehicle_make} ${report.vehicle_model}`,
          damageType: report.damage_type,
          severity: report.damage_severity,
          zip: report.zip_code ?? "",
        },
      })),
    }),
    [reportsWithCoordinates]
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const features = e.features;
      if (!features?.length) return;
      const feature = features[0];

      // Cluster click → zoom to expand
      if (feature.layer?.id === CLUSTER_LAYER_ID) {
        const clusterId = feature.properties?.cluster_id;
        const source = (
          e.target as unknown as {
            getSource: (id: string) =>
              | {
                  getClusterExpansionZoom: (
                    id: number,
                    cb: (err: unknown, zoom: number) => void
                  ) => void;
                }
              | undefined;
          }
        ).getSource("damage-reports");
        if (source && clusterId != null) {
          source.getClusterExpansionZoom(Number(clusterId), (_err, zoom) => {
            const coords = (feature.geometry as GeoJSON.Point).coordinates;
            e.target.flyTo({ center: [coords[0], coords[1]], zoom: Math.min(zoom, 17) });
          });
        }
        return;
      }

      // Individual report click
      const reportId = feature.properties?.id as string;
      const entry = reportsWithCoordinates.find((r) => r.report.id === reportId);
      if (entry) {
        setSelectedReport(entry.report);
        setDrawerOpen(true);
      }
    },
    [reportsWithCoordinates]
  );

  const { current: mapRef } = useMap();

  useEffect(() => {
    const map = mapRef?.getMap();
    if (!map) return;
    const clickHandler = handleClick as unknown as (e: unknown) => void;
    const cursorEnter = () => {
      map.getCanvas().style.cursor = "pointer";
    };
    const cursorLeave = () => {
      map.getCanvas().style.cursor = "";
    };

    map.on("click", LAYER_ID, clickHandler);
    map.on("click", CLUSTER_LAYER_ID, clickHandler);
    map.on("mouseenter", LAYER_ID, cursorEnter);
    map.on("mouseenter", CLUSTER_LAYER_ID, cursorEnter);
    map.on("mouseleave", LAYER_ID, cursorLeave);
    map.on("mouseleave", CLUSTER_LAYER_ID, cursorLeave);
    return () => {
      map.off("click", LAYER_ID, clickHandler);
      map.off("click", CLUSTER_LAYER_ID, clickHandler);
      map.off("mouseenter", LAYER_ID, cursorEnter);
      map.off("mouseenter", CLUSTER_LAYER_ID, cursorEnter);
      map.off("mouseleave", LAYER_ID, cursorLeave);
      map.off("mouseleave", CLUSTER_LAYER_ID, cursorLeave);
    };
  }, [mapRef, handleClick]);

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedReport(null);
  };

  if (!visible) return null;

  return (
    <>
      {/* ── Report data loading / error indicator ── */}
      {(loading || fetchError) && (
        <div className="pointer-events-none absolute left-1/2 top-14 z-20 -translate-x-1/2">
          {loading && (
            <div className="pointer-events-auto flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1.5 text-xs font-medium text-amber-300 shadow-lg backdrop-blur-md">
              <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  className="opacity-25"
                />
                <path
                  d="M12 2a10 10 0 0 1 10 10"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              Loading reports…
            </div>
          )}
          {fetchError && !loading && (
            <button
              onClick={fetchReports}
              className="pointer-events-auto flex items-center gap-2 rounded-full bg-red-900/80 px-3 py-1.5 text-xs font-medium text-red-200 shadow-lg backdrop-blur-md transition-colors hover:bg-red-800/80"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              Reports failed — tap to retry
            </button>
          )}
        </div>
      )}
      <Source
        id="damage-reports"
        type="geojson"
        data={geojson}
        cluster={true}
        clusterMaxZoom={14}
        clusterRadius={45}
      >
        {/* ── Cluster circles ── */}
        <Layer
          id={CLUSTER_LAYER_ID}
          type="circle"
          filter={["has", "point_count"]}
          paint={{
            "circle-color": isDark ? "#f59e0b" : "#d97706",
            "circle-radius": ["step", ["get", "point_count"], 16, 5, 22, 15, 28],
            "circle-opacity": 0.85,
            "circle-stroke-width": 2.5,
            "circle-stroke-color": isDark ? "#fcd34d" : "#92400e",
          }}
        />
        {/* ── Cluster count label ── */}
        <Layer
          id={CLUSTER_COUNT_LAYER_ID}
          type="symbol"
          filter={["has", "point_count"]}
          layout={{
            "text-field": "{point_count_abbreviated}",
            "text-size": 12,
            "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
            "text-allow-overlap": true,
          }}
          paint={{
            "text-color": isDark ? "#1c1917" : "#ffffff",
          }}
        />
        {/* ── Individual report markers (unclustered) — status-colored ── */}
        <Layer
          id={LAYER_ID}
          type="circle"
          filter={["!", ["has", "point_count"]]}
          paint={
            {
              "circle-radius": 11,
              "circle-color": [
                "match",
                ["get", "status"],
                "in-repair",
                isDark ? "#22c55e" : "#16a34a",
                "approved",
                isDark ? "#22c55e" : "#16a34a",
                "resolved",
                isDark ? "#64748b" : "#475569",
                "completed",
                isDark ? "#64748b" : "#475569",
                isDark ? "#f59e0b" : "#d97706",
              ],
              "circle-opacity": isDark ? 0.92 : 0.88,
              "circle-stroke-width": 2.5,
              "circle-stroke-color": [
                "match",
                ["get", "status"],
                "in-repair",
                isDark ? "#86efac" : "#15803d",
                "approved",
                isDark ? "#86efac" : "#15803d",
                "resolved",
                isDark ? "#94a3b8" : "#334155",
                "completed",
                isDark ? "#94a3b8" : "#334155",
                isDark ? "#fcd34d" : "#92400e",
              ],
            } as Record<string, unknown>
          }
        />
        {/* ── Report inner icon (unclustered) ── */}
        <Layer
          id="report-markers-icon"
          type="symbol"
          filter={["!", ["has", "point_count"]]}
          layout={{
            "text-field": "⚠",
            "text-size": 10,
            "text-allow-overlap": true,
            "text-ignore-placement": true,
          }}
          paint={{
            "text-color": isDark ? "#451a03" : "#ffffff",
            "text-opacity": 0.9,
          }}
        />
        {/* ── Report labels at high zoom (unclustered) ── */}
        <Layer
          id={LABEL_LAYER_ID}
          type="symbol"
          filter={["!", ["has", "point_count"]]}
          minzoom={13}
          layout={
            {
              "text-field": ["get", "vehicle"],
              "text-size": ["interpolate", ["linear"], ["zoom"], 13, 9, 16, 12],
              "text-offset": [0, 1.8],
              "text-anchor": "top",
              "text-max-width": 12,
              "text-allow-overlap": false,
              "text-optional": true,
            } as Record<string, unknown>
          }
          paint={
            {
              "text-color": isDark ? "#fcd34d" : "#92400e",
              "text-halo-color": isDark ? "#0f172a" : "#ffffff",
              "text-halo-width": 1.5,
              "text-opacity": 0.85,
            } as Record<string, unknown>
          }
        />
      </Source>
      {selectedReport
        ? (() => {
            const popupCoords = reportsWithCoordinates.find(
              (r) => r.report.id === selectedReport.id
            )?.coords;
            if (!popupCoords) return null;
            return (
              <Popup
                longitude={popupCoords.lng}
                latitude={popupCoords.lat}
                closeOnClick={false}
                onClose={() => {
                  setSelectedReport(null);
                  setDrawerOpen(false);
                }}
                anchor="bottom"
                offset={16}
              >
                <div className="min-w-[160px] space-y-1 p-1">
                  <div
                    className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}
                  >
                    {selectedReport.vehicle_year} {selectedReport.vehicle_make}{" "}
                    {selectedReport.vehicle_model}
                  </div>
                  <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                    {selectedReport.damage_type} &middot; {selectedReport.damage_severity}
                  </div>
                  {selectedReport.status && (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        selectedReport.status === "in-repair" ||
                        selectedReport.status === "approved"
                          ? isDark
                            ? "bg-green-900/50 text-green-300"
                            : "bg-green-100 text-green-700"
                          : selectedReport.status === "resolved" ||
                              selectedReport.status === "completed"
                            ? isDark
                              ? "bg-slate-700/50 text-slate-300"
                              : "bg-slate-100 text-slate-600"
                            : isDark
                              ? "bg-amber-900/50 text-amber-300"
                              : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {selectedReport.status
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => setDrawerOpen(true)}
                    className={`mt-1.5 inline-flex min-h-[36px] w-full items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors ${
                      isDark
                        ? "border-amber-400/30 bg-amber-600/30 text-amber-100 hover:bg-amber-600/45"
                        : "border-amber-300/60 bg-amber-50 text-amber-700 hover:bg-amber-100"
                    }`}
                  >
                    View Detail
                  </button>
                </div>
              </Popup>
            );
          })()
        : null}
      <ReportDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        report={selectedReport}
        reportCoords={
          selectedReport?.id
            ? (reportsWithCoordinates.find((r) => r.report.id === selectedReport.id)?.coords ??
              null)
            : null
        }
        mapTheme={mapTheme}
        onViewReportDetail={onViewReportDetail}
        onFindShopsNear={onFindShopsNear}
      />
    </>
  );
}

export { LAYER_ID as REPORT_MARKERS_LAYER_ID };
