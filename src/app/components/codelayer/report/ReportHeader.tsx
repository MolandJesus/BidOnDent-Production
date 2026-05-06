import { FileText, X } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type ReportHeaderProps = {
  step: number;
  appearanceMode?: DashboardAppearanceMode;
  onCancel: () => void;
  showCancel: boolean;
};

export default function ReportHeader({
  step,
  appearanceMode = "map-dark",
  onCancel,
  showCancel,
}: ReportHeaderProps) {
  const isLightAppearance = appearanceMode === "light";
  const isCompleteStep = step > 5;
  const stepSubtitles: Record<number, string> = {
    1: "Pick the vehicle shops should quote against.",
    2: "Mark the repair zone so bids start in the right place.",
    3: "Place the report on the map for nearby shops.",
    4: "Add clear damage photos to improve estimate quality.",
    5: "Add the final context shops will read before bidding.",
  };
  const headerSubtitle = isCompleteStep
    ? "Your request is live and shops can start reviewing it."
    : stepSubtitles[Math.max(1, Math.min(5, step))];

  return (
    <div className="bd-report-header rounded-t-[2rem] !rounded-b-none px-4 sm:px-5 md:px-6 py-3 sm:py-3.5 flex items-center gap-3">
      <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3">
        <div
          className={`h-9 w-9 sm:h-10 sm:w-10 rounded-2xl flex items-center justify-center shrink-0 ${
            isLightAppearance
              ? "bg-blue-500/12 text-blue-700 border border-blue-300/35"
              : "bg-blue-400/12 text-blue-100 border border-blue-300/20"
          }`}
          style={{
            boxShadow: isLightAppearance
              ? // Pass 28: cream-gold top inset per locked Premium Gold Palette.
                "0 14px 24px rgba(59, 130, 246, 0.10), inset 0 1px 0 rgba(252,240,208,0.8)"
              : "0 18px 28px rgba(2, 6, 23, 0.24), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <FileText className="h-4 w-4 sm:h-[1.15rem] sm:w-[1.15rem]" />
        </div>
        <div className="min-w-0">
          <span className="bd-report-eyebrow mb-1.5 hidden md:inline-flex">Damage Report</span>
          <h1
            className={`font-semibold text-lg sm:text-[1.35rem] leading-tight ${
              isLightAppearance ? "text-slate-800" : "text-slate-100"
            }`}
          >
            Report Damage
          </h1>
          <p
            className={`mt-0.5 text-xs sm:text-sm ${
              isLightAppearance ? "text-slate-500" : "text-blue-100/75"
            }`}
          >
            {headerSubtitle}
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3 shrink-0">
        <div
          className={`bd-report-eyebrow whitespace-nowrap ${
            isCompleteStep
              ? isLightAppearance
                ? "!border-emerald-200 !bg-emerald-50 !text-emerald-700"
                : "!border-emerald-400/30 !bg-emerald-500/10 !text-emerald-200"
              : ""
          }`}
        >
          {isCompleteStep ? (
            "Submitted"
          ) : (
            <>
              <span className="sm:hidden">{step}/5</span>
              <span className="hidden sm:inline">Step {step} of 5</span>
            </>
          )}
        </div>
        {showCancel && (
          <button
            onClick={onCancel}
            aria-label="Cancel report"
            className={`inline-flex min-h-[44px] min-w-[44px] items-center justify-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold transition-colors ${
              isLightAppearance
                ? "text-rose-600 hover:bg-rose-50"
                : "text-rose-200 hover:bg-rose-500/10"
            }`}
          >
            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Cancel</span>
          </button>
        )}
      </div>
    </div>
  );
}
