import { CircleMarker } from "react-leaflet";
import { useEffect, useMemo, useState } from "react";
import { getAllDamageReports } from "../../services/supabase/reports";
import { zipToCoordinates } from "../../services/supabase/map";
import { ReportDetailDrawer } from "./ReportDetailDrawer";
import type { DamageReport } from "../../services/supabase/types";

const REPORT_MARKER_STYLE_ID = "bd-report-marker-style";
const REPORT_MARKER_CLASS = "bd-report-marker";

export default function MapReportMarkers() {
  useEffect(() => {
    if (typeof document === "undefined") return;
    if (document.getElementById(REPORT_MARKER_STYLE_ID)) return;

    const style = document.createElement("style");
    style.id = REPORT_MARKER_STYLE_ID;
    style.innerHTML = `
      .${REPORT_MARKER_CLASS} {
        filter: drop-shadow(0 0 12px #60a5fa) drop-shadow(0 0 24px rgba(59, 130, 246, 0.45));
        animation: bd-report-pulse 1.6s infinite cubic-bezier(0.4, 0, 0.6, 1);
      }

      @keyframes bd-report-pulse {
        0% { transform: scale(1); opacity: 1; }
        60% { transform: scale(1.16); opacity: 0.76; }
        100% { transform: scale(1); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }, []);

  const [reports, setReports] = useState<DamageReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    let isMounted = true;

    getAllDamageReports().then((data) => {
      if (!isMounted) return;
      setReports(Array.isArray(data) ? data : []);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleMarkerClick = (report: DamageReport) => {
    setSelectedReport(report);
    setDrawerOpen(true);
  };

  const handleDrawerChange = (open: boolean) => {
    setDrawerOpen(open);
    if (!open) setSelectedReport(null);
  };

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

  return (
    <>
      {reportsWithCoordinates.map(({ report, coords }) => (
        <CircleMarker
          key={report.id}
          center={[coords.lat, coords.lng]}
          radius={11}
          pathOptions={{
            color: "#93c5fd",
            fillColor: "#2563eb",
            fillOpacity: 0.92,
            weight: 3,
            className: REPORT_MARKER_CLASS,
          }}
          eventHandlers={{
            click: () => handleMarkerClick(report),
          }}
        />
      ))}
      <ReportDetailDrawer
        open={drawerOpen}
        onOpenChange={handleDrawerChange}
        report={selectedReport}
      />
    </>
  );
}
