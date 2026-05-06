import { Route } from "lucide-react";

type MapPaneLegendProps = {
  isDark: boolean;
  showSavedPlaces?: boolean;
  onToggleSavedPlaces?: () => void;
  showReports?: boolean;
  onToggleReports?: () => void;
  reportCount?: number | null;
  showRoutes?: boolean;
  onToggleRoutes?: () => void;
  reportStatusFilter?: string;
  onReportStatusFilterChange?: (status: string) => void;
  density?: "default" | "compact";
};

export default function MapPaneLegendPanel({
  isDark,
  showSavedPlaces,
  onToggleSavedPlaces,
  showReports,
  onToggleReports,
  reportCount,
  showRoutes,
  onToggleRoutes,
  reportStatusFilter = "all",
  onReportStatusFilterChange,
  density = "default",
}: MapPaneLegendProps) {
  const isCompactDensity = density === "compact";
  // Pass 12 #5 — legend card + status filter chip bar migrated to canonical
  // bd-glass-card--map utility (theme.css). The bd utility carries the locked
  // Pass 11 #3/#4 grammar across light + dark and keeps both the legend wrap
  // and the chip bar visually identical to the rest of the map chrome
  // (Coverage sidebar, Coverage bottom strip, ShopDirectory route preview).
  // Only the text color is kept here so chip text contrast is preserved.
  const legendCardText = isDark ? "text-white" : "text-slate-700";
  const topPickDot = isDark
    ? "border border-white/70 bg-slate-900 shadow-[0_0_0_1px_rgba(148,163,184,0.45)]"
    : "border border-slate-400 bg-slate-900";

  return (
    <>
      <div
        className={`bd-glass-card--map ${isCompactDensity ? "rounded-lg px-1.5 py-1 text-[8px] @xl:px-1.5 @xl:py-1 @xl:text-[8px] @3xl:px-2 @3xl:text-[9px]" : "rounded-xl px-2 py-1 text-[9px] @xl:px-2.5 @xl:py-1.5 @xl:text-[10px] @3xl:px-3 @3xl:py-2 @3xl:text-[11px]"} ${legendCardText}`}
      >
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-orange-500" />
            Origin
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-600" />
            Selected
          </span>
          <span className="inline-flex items-center gap-1">
            <span className={`inline-block h-2.5 w-2.5 rounded-full ${topPickDot}`} />
            Top pick
          </span>
          {onToggleReports ? (
            <button
              type="button"
              onClick={onToggleReports}
              aria-label={showReports ? "Hide reports" : "Show reports"}
              aria-pressed={showReports}
              className={`inline-flex items-center gap-1 rounded transition-opacity ${
                isCompactDensity ? "min-h-[30px] px-1" : "min-h-[44px] px-1.5 -mx-1"
              } ${showReports ? "opacity-100" : "opacity-40"}`}
              title={showReports ? "Hide reports" : "Show reports"}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Reports
              {reportCount != null && (
                <span className="ml-0.5 text-[9px] opacity-60">({reportCount})</span>
              )}
            </button>
          ) : (
            <span className="inline-flex items-center gap-1">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-500" />
              Reports
              {reportCount != null && (
                <span className="ml-0.5 text-[9px] opacity-60">({reportCount})</span>
              )}
            </span>
          )}
          {onToggleSavedPlaces && (
            <button
              type="button"
              onClick={onToggleSavedPlaces}
              aria-label={showSavedPlaces ? "Hide saved places" : "Show saved places"}
              aria-pressed={showSavedPlaces}
              className={`inline-flex items-center gap-1 rounded transition-opacity ${
                isCompactDensity ? "min-h-[30px] px-1" : "min-h-[44px] px-1.5 -mx-1"
              } ${showSavedPlaces ? "opacity-100" : "opacity-40"}`}
              title={showSavedPlaces ? "Hide saved places" : "Show saved places"}
            >
              <span className="inline-block h-2 w-2 rounded-full bg-blue-600 opacity-40" />
              Saved
            </button>
          )}
          {onToggleRoutes ? (
            <button
              type="button"
              onClick={onToggleRoutes}
              aria-label={showRoutes ? "Hide routes" : "Show routes"}
              aria-pressed={showRoutes}
              className={`inline-flex items-center gap-1 rounded transition-opacity ${
                isCompactDensity ? "min-h-[30px] px-1" : "min-h-[44px] px-1.5 -mx-1"
              } ${showRoutes ? "opacity-100" : "opacity-40"}`}
              title={showRoutes ? "Hide routes" : "Show routes"}
            >
              <span
                className="inline-block h-2.5 w-4 rounded border border-current opacity-50"
                style={{ borderStyle: "dashed" }}
              />
              Routes
            </button>
          ) : (
            <span className="inline-flex items-center gap-1">
              <span
                className="inline-block h-2.5 w-4 rounded border border-current opacity-50"
                style={{ borderStyle: "dashed" }}
              />
              Routes
            </span>
          )}
        </div>
      </div>

      {/* ── Report status filter chips ── */}
      {showReports && onReportStatusFilterChange && (
        <div
          className={`bd-glass-card--map pointer-events-auto flex flex-wrap ${isCompactDensity ? "gap-0.5 rounded-lg px-1.5 py-1" : "gap-1 rounded-xl px-2 py-1.5"} ${legendCardText}`}
        >
          {(
            [
              { key: "all", label: "All", color: "bg-amber-500" },
              { key: "pending", label: "Pending", color: "bg-amber-500" },
              { key: "approved", label: "Approved", color: "bg-green-500" },
              { key: "in-repair", label: "In Repair", color: "bg-green-500" },
              { key: "resolved", label: "Resolved", color: "bg-slate-500" },
              { key: "completed", label: "Done", color: "bg-slate-500" },
            ] as const
          ).map(({ key, label, color }) => (
            <button
              key={key}
              type="button"
              onClick={() => onReportStatusFilterChange(key)}
              className={`pointer-events-auto inline-flex items-center gap-1 rounded-lg font-semibold uppercase tracking-wide transition-all ${
                isCompactDensity
                  ? "min-h-[30px] px-1.5 py-1 text-[8px]"
                  : "min-h-[44px] px-2 py-1 text-[10px]"
              } ${
                reportStatusFilter === key
                  ? isDark
                    ? "bg-white/15 text-white"
                    : "bg-slate-800/10 text-slate-800"
                  : isDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <span className={`inline-block h-1.5 w-1.5 rounded-full ${color}`} />
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}
