import { useCallback, useEffect, useMemo, useState } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import type { MapLayerMouseEvent } from "react-map-gl/maplibre";
import { getAllDamageReports } from "../../services/supabase/reports";
import { zipToCoordinates } from "../../services/supabase/map";
import { ReportDetailDrawer } from "./ReportDetailDrawer";
import type { DamageReport } from "../../services/supabase/types";
import type { MapTheme } from "../../types/mapDomain";

const LAYER_ID = "report-markers-circle";

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
        },
      })),
    }),
    [reportsWithCoordinates]
  );

  const handleClick = useCallback(
    (e: MapLayerMouseEvent) => {
      const features = e.features;
      if (!features?.length) return;
      const reportId = features[0].properties?.id as string;
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
    map.on("click", LAYER_ID, handleClick as unknown as (e: unknown) => void);
    return () => {
      map.off("click", LAYER_ID, handleClick as unknown as (e: unknown) => void);
    };
  }, [mapRef, handleClick]);

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedReport(null);
  };

  return (
    <>
      <Source id="damage-reports" type="geojson" data={geojson}>
        <Layer
          id={LAYER_ID}
          type="circle"
          paint={{
            "circle-radius": 12,
            "circle-color": isDark ? "#f59e0b" : "#d97706",
            "circle-opacity": isDark ? 0.92 : 0.88,
            "circle-stroke-width": 2.5,
            "circle-stroke-color": isDark ? "#fcd34d" : "#92400e",
          }}
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
                <div className="text-sm font-semibold">Damage Report</div>
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
