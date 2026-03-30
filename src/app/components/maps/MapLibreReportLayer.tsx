import { useCallback, useEffect, useMemo, useState } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { getAllDamageReports } from "../../services/supabase/reports";
import { zipToCoordinates } from "../../services/supabase/map";
import { ReportDetailDrawer } from "./ReportDetailDrawer";
import type { DamageReport } from "../../services/supabase/types";
import type { MapTheme } from "../../types/mapDomain";

const LAYER_ID = "report-markers-circle";
const CLUSTER_LAYER_ID = "report-clusters-circle";
const CLUSTER_COUNT_LAYER_ID = "report-clusters-count";

type MapLibreReportLayerProps = {
  mapTheme?: MapTheme;
  onViewReportDetail?: (reportId: string) => void;
};

export default function MapLibreReportLayer({
  mapTheme = "dark",
  onViewReportDetail,
}: MapLibreReportLayerProps) {
  const isDark = mapTheme === "dark";
  const [reports, setReports] = useState<DamageReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;
    getAllDamageReports()
      .then((data) => {
        if (!isMounted) return;
        setReports(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (!isMounted) return;
        setReports([]);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const reportsWithCoordinates = useMemo(
    () =>
      reports
        .map((report) => {
          const coords = zipToCoordinates(report.zip_code);
          if (!coords) return null;
          return { report, coords };
        })
        .filter((entry): entry is { report: DamageReport; coords: { lat: number; lng: number } } =>
          Boolean(entry)
        ),
    [reports]
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

  return (
    <>
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
              "circle-radius": 12,
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
                  <div className="text-sm font-semibold text-slate-900">
                    {selectedReport.vehicle_year} {selectedReport.vehicle_make}{" "}
                    {selectedReport.vehicle_model}
                  </div>
                  <div className="text-xs text-slate-600">
                    {selectedReport.damage_type} &middot; {selectedReport.damage_severity}
                  </div>
                  {selectedReport.status && (
                    <span
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
                        selectedReport.status === "in-repair" ||
                        selectedReport.status === "approved"
                          ? "bg-green-100 text-green-700"
                          : selectedReport.status === "resolved" ||
                              selectedReport.status === "completed"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {selectedReport.status
                        .replace(/-/g, " ")
                        .replace(/\b\w/g, (c) => c.toUpperCase())}
                    </span>
                  )}
                </div>
              </Popup>
            );
          })()
        : null}
      <ReportDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        report={selectedReport}
        mapTheme={mapTheme}
        onViewReportDetail={onViewReportDetail}
      />
    </>
  );
}

export { LAYER_ID as REPORT_MARKERS_LAYER_ID };
