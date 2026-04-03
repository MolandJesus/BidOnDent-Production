/**
 * ReportLayerPopup — Map popup for a selected damage report pin.
 * Extracted from MapLibreReportLayer to enforce file-size limits.
 */
import { Popup } from "react-map-gl/maplibre";
import type { DamageReport } from "../../services/supabase/types";

type ReportLayerPopupProps = {
  report: DamageReport;
  coords: { lat: number; lng: number };
  isDark: boolean;
  bidCount?: number;
  onClose: () => void;
  onOpenDrawer: () => void;
};

export default function ReportLayerPopup({
  report,
  coords,
  isDark,
  bidCount,
  onClose,
  onOpenDrawer,
}: ReportLayerPopupProps) {
  return (
    <Popup
      longitude={coords.lng}
      latitude={coords.lat}
      closeOnClick={false}
      onClose={onClose}
      anchor="bottom"
      offset={16}
    >
      <div className="min-w-[160px] space-y-1 p-1">
        <div
          className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? "text-amber-400/80" : "text-amber-600"}`}
        >
          Your Report
        </div>
        {Array.isArray(report.photo_urls) && report.photo_urls.length > 0 && (
          <img
            src={report.photo_urls[0]}
            alt="Damage"
            className="h-16 w-full rounded-md object-cover"
          />
        )}
        <div className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          {[report.vehicle_year, report.vehicle_make, report.vehicle_model]
            .filter(Boolean)
            .join(" ") || "Damage Report"}
        </div>
        {(report.damage_type || report.damage_severity) && (
          <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {[report.damage_type, report.damage_severity].filter(Boolean).join(" · ")}
          </div>
        )}
        {report.status && (
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
              report.status === "in-repair" || report.status === "approved"
                ? isDark
                  ? "bg-green-900/50 text-green-300"
                  : "bg-green-100 text-green-700"
                : report.status === "resolved" || report.status === "completed"
                  ? isDark
                    ? "bg-slate-700/50 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                  : isDark
                    ? "bg-amber-900/50 text-amber-300"
                    : "bg-amber-100 text-amber-700"
            }`}
          >
            {report.status.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </span>
        )}
        {bidCount != null && (
          <span
            className={`mt-1 ml-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
              bidCount > 0
                ? isDark
                  ? "bg-blue-900/50 text-blue-300"
                  : "bg-blue-100 text-blue-700"
                : isDark
                  ? "bg-slate-700/50 text-slate-400"
                  : "bg-slate-100 text-slate-500"
            }`}
          >
            {bidCount > 0 ? `${bidCount} bid${bidCount === 1 ? "" : "s"}` : "No bids"}
          </span>
        )}
        <button
          type="button"
          onClick={onOpenDrawer}
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
}
