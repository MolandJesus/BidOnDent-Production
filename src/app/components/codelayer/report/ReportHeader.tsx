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
  const headerSubtitle = isCompleteStep
    ? "Your request is live and shops can start reviewing it."
    : "Tell us what happened and get bids faster";

  return (
    <div className="bd-report-header !rounded-none px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex items-start sm:items-center gap-3">
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div
          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 ${
            isLightAppearance
              ? "bg-blue-500/12 text-blue-700 border border-blue-300/35"
              : "bg-blue-400/12 text-blue-100 border border-blue-300/20"
          }`}
          style={{
            boxShadow: isLightAppearance
              ? "0 14px 24px rgba(59, 130, 246, 0.10), inset 0 1px 0 rgba(255,255,255,0.8)"
              : "0 18px 28px rgba(2, 6, 23, 0.24), inset 0 1px 0 rgba(255,255,255,0.08)",
          }}
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <span className="bd-report-eyebrow mb-2 hidden sm:inline-flex">Smart intake flow</span>
          <h1
            className={`font-semibold text-base sm:text-lg leading-tight ${
              isLightAppearance ? "text-slate-800" : "text-slate-100"
            }`}
          >
            Report Damage
          </h1>
          <p
            className={`text-xs mt-0.5 sm:mt-1 ${
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
            className={`rounded-full px-3 py-2 text-sm font-semibold inline-flex items-center gap-1.5 transition-colors ${
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
