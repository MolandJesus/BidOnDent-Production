/**
 * ReportLayerPopup — Map popup for a selected damage report pin.
 * Extracted from MapLibreReportLayer to enforce file-size limits.
 */
import { Popup } from "react-map-gl/maplibre";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import type { DamageReport } from "../../types";

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
      <div className="min-w-[160px] space-y-1 p-1 animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none">
        <div
          className="text-[10px] font-semibold uppercase tracking-wider"
          style={{ color: isDark ? "rgba(253, 220, 160, 0.92)" : "rgba(110, 70, 18, 1)" }}
        >
          Your Report
        </div>
        {Array.isArray(report.photos) && report.photos.length > 0 && (
          <ImageWithFallback
            src={report.photos[0]}
            alt="Damage"
            className="h-16 w-full rounded-md object-cover"
          />
        )}
        <div className={`text-sm font-semibold ${isDark ? "text-slate-100" : "text-slate-900"}`}>
          {[report.vehicleInfo?.year, report.vehicleInfo?.make, report.vehicleInfo?.model]
            .filter(Boolean)
            .join(" ") || "Damage Report"}
        </div>
        {(report.damageType || report.damageSeverity) && (
          <div className={`text-xs ${isDark ? "text-slate-400" : "text-slate-600"}`}>
            {[report.damageType, report.damageSeverity].filter(Boolean).join(" · ")}
          </div>
        )}
        {report.status && (
          <span
            className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${
              report.status === "active"
                ? isDark
                  ? "bg-green-900/50 text-green-300"
                  : "bg-green-100 text-green-700"
                : report.status === "resolved" || report.status === "completed"
                  ? isDark
                    ? "bg-slate-700/50 text-slate-300"
                    : "bg-slate-100 text-slate-600"
                  : "bd-status--warn"
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
          onClick={(e) => {
            (e.currentTarget as HTMLButtonElement).blur();
            onOpenDrawer();
          }}
          className="bd-button--warn mt-1.5 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border px-3 py-1.5 text-xs font-semibold"
        >
          View Detail
        </button>
      </div>
    </Popup>
  );
}
