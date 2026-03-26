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

  return (
    <div
      className={`bd-glass-panel !rounded-none px-3 sm:px-4 md:px-6 py-2.5 sm:py-3.5 flex items-start sm:items-center gap-2.5 ${
        isLightAppearance ? "border-b border-blue-200/35" : "border-b border-blue-300/20"
      }`}
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.94) 0%, rgba(241, 247, 255, 0.92) 100%)"
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.88) 0%, rgba(8, 18, 38, 0.84) 100%)",
        boxShadow: isLightAppearance
          ? "0 4px 18px rgba(37, 99, 235, 0.10)"
          : "0 4px 20px rgba(3, 10, 24, 0.28)",
      }}
    >
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
        <div
          className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center shrink-0 ${
            isLightAppearance
              ? "bg-blue-100 text-blue-700 border border-blue-200"
              : "bg-blue-400/12 text-blue-200 border border-blue-300/25"
          }`}
          style={{ boxShadow: "0 0 12px rgba(59, 130, 246, 0.10)" }}
        >
          <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <h1
            className={`font-semibold text-base sm:text-lg leading-tight ${
              isLightAppearance ? "text-slate-100" : "text-slate-100"
            }`}
          >
            Report Damage
          </h1>
          <p
            className={`text-xs mt-0.5 sm:mt-1 ${
              isLightAppearance ? "text-blue-100/75" : "text-blue-100/75"
            }`}
          >
            Tell us what happened and get bids faster
          </p>
        </div>
      </div>
      <div className="ml-auto flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div
          className={`text-xs sm:text-sm font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${
            isLightAppearance
              ? "text-blue-700 bg-blue-100/80 border border-blue-200"
              : "text-blue-100/85 bg-blue-400/10 border border-blue-300/20"
          }`}
        >
          <span className="sm:hidden">{step}/5</span>
          <span className="hidden sm:inline">Step {step} of 5</span>
        </div>
        {showCancel && (
          <button
            onClick={onCancel}
            className={`text-sm font-medium inline-flex items-center gap-1 ${
              isLightAppearance
                ? "text-rose-600 hover:text-rose-700"
                : "text-rose-300 hover:text-rose-200"
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
