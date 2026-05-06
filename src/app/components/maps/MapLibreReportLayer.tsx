import { useCallback, useEffect, useState } from "react";
import { Source, Layer, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { ReportDetailDrawer } from "./ReportDetailDrawer";
import ReportLayerPopup from "./ReportLayerPopup";
import { useReportLayerData } from "../../hooks/useReportLayerData";
import type { DamageReport } from "../../types";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
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
  onPlaceBid?: (report: DamageReport) => void;
  onViewBids?: (reportId: string) => void;
  initialReports?: DamageReport[];
  visible?: boolean;
  statusFilter?: string;
  userType?: MarketUserType;
  focusReportId?: string;
};

export default function MapLibreReportLayer({
  mapTheme = "dark",
  onViewReportDetail,
  onReportCountChange,
  onFindShopsNear,
  onPlaceBid,
  onViewBids,
  initialReports,
  visible = true,
  statusFilter = "all",
  userType = "customer",
  focusReportId,
}: MapLibreReportLayerProps) {
  const isDark = mapTheme === "dark";
  const {
    reports,
    loading,
    fetchError,
    fetchReports,
    bidCounts,
    reportsWithCoordinates,
    filteredReportsWithCoordinates,
    geojson,
  } = useReportLayerData({ initialReports, statusFilter, onReportCountChange });
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Auto-open drawer for focused report (e.g. navigated from dashboard)
  const [focusHandled, setFocusHandled] = useState(false);
  useEffect(() => {
    if (focusHandled || !focusReportId || reports.length === 0) return;
    const target = reports.find((r) => r.id === focusReportId);
    if (target) {
      setSelectedReport(target);
      setFocusHandled(true);
      // Delay drawer to let MapLibre popup settle before Radix sets aria-hidden
      const id = setTimeout(() => {
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
        setDrawerOpen(true);
      }, 150);
      return () => clearTimeout(id);
    }
  }, [focusReportId, reports, focusHandled]);

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
      const reportId = feature.properties?.id;
      if (!reportId) return;
      const entry = reportsWithCoordinates.find((r) => r.report.id === String(reportId));
      if (entry) {
        setSelectedReport(entry.report);
        if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
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

      {/* ── Filtered-empty state (reports exist but filter hides all) ── */}
      {!loading &&
        !fetchError &&
        reports.length > 0 &&
        filteredReportsWithCoordinates.length === 0 && (
          <div className="pointer-events-none absolute left-1/2 top-14 z-20 -translate-x-1/2">
            <div
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md ${
                isDark
                  ? "bg-slate-900/80 text-slate-300"
                  : "border border-[rgba(140,82,22,0.30)] bg-[linear-gradient(180deg,rgba(247,232,194,0.85),rgba(232,238,248,0.80))] text-slate-700 shadow-[0_8px_22px_rgba(140,82,22,0.16),inset_0_1px_0_rgba(252,240,208,0.80)]"
              }`}
            >
              No {statusFilter !== "all" ? statusFilter.replace("-", " ") : ""} reports on map
            </div>
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
              "circle-radius": 13,
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
              "circle-opacity": isDark ? 0.95 : 0.92,
              "circle-stroke-width": 3,
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
        {/* ── Bid count badge background (top-right of pin) ── */}
        <Layer
          id="report-bid-count-bg"
          type="circle"
          filter={["all", ["!", ["has", "point_count"]], [">", ["get", "bidCount"], 0]]}
          paint={
            {
              "circle-radius": 8,
              "circle-color": isDark ? "#3b82f6" : "#2563eb",
              "circle-opacity": 0.95,
              "circle-stroke-width": 1.5,
              "circle-stroke-color": isDark ? "#93c5fd" : "#1d4ed8",
              "circle-translate": [9, -9],
            } as Record<string, unknown>
          }
        />
        {/* ── Bid count badge number ── */}
        <Layer
          id="report-bid-count-text"
          type="symbol"
          filter={["all", ["!", ["has", "point_count"]], [">", ["get", "bidCount"], 0]]}
          layout={
            {
              "text-field": ["to-string", ["get", "bidCount"]],
              "text-size": 10,
              "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
              "text-offset": [0.65, -0.65],
              "text-allow-overlap": true,
              "text-ignore-placement": true,
            } as Record<string, unknown>
          }
          paint={{
            "text-color": "#ffffff",
          }}
        />
      </Source>
      {selectedReport &&
        (() => {
          const popupCoords = reportsWithCoordinates.find(
            (r) => r.report.id === selectedReport.id
          )?.coords;
          if (!popupCoords) return null;
          return (
            <ReportLayerPopup
              report={selectedReport}
              coords={popupCoords}
              isDark={isDark}
              bidCount={selectedReport.id ? bidCounts[selectedReport.id] : undefined}
              onClose={() => {
                setSelectedReport(null);
                setDrawerOpen(false);
              }}
              onOpenDrawer={() => {
                if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
                setDrawerOpen(true);
              }}
            />
          );
        })()}
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
        onPlaceBid={onPlaceBid}
        onViewBids={onViewBids}
        bidCount={selectedReport?.id ? bidCounts[selectedReport.id] : undefined}
      />
    </>
  );
}

export { LAYER_ID as REPORT_MARKERS_LAYER_ID };
