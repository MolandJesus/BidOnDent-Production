import { AlertTriangle, ChevronRight, FileText, Loader2, MessageSquareQuote } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type StepDescriptionProps = {
  primaryColor: string;
  appearanceMode?: DashboardAppearanceMode;
  description: string;
  incident: string;
  onDescriptionChange: (value: string) => void;
  onIncidentChange: (value: string) => void;
  onBack: () => void;
  onContinue: () => void;
  isSubmitting?: boolean;
  submitError?: string | null;
};

export default function StepDescription({
  primaryColor,
  appearanceMode = "map-dark",
  description,
  incident,
  onDescriptionChange,
  onIncidentChange,
  onBack,
  onContinue,
  isSubmitting = false,
  submitError = null,
}: StepDescriptionProps) {
  const isLightAppearance = appearanceMode === "light";
  const isDescriptionValid = description.trim().length >= 10;

  return (
    <div
      className="px-4 md:px-6 py-4 md:py-4 bd-glass-card rounded-2xl"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, rgba(255, 255, 255, 0.96) 0%, rgba(242, 248, 255, 0.94) 100%)"
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
        borderColor: isLightAppearance ? "rgba(191, 219, 254, 0.8)" : "rgba(96, 165, 250, 0.22)",
      }}
    >
      <h2
        className={`text-2xl font-bold mb-1 ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
      >
        Describe the damage
      </h2>
      <p className={`mb-6 ${isLightAppearance ? "text-slate-600" : "text-blue-100/80"}`}>
        The better your details, the better your bids will be.
      </p>

      <div className="mb-6">
        <label
          htmlFor="description"
          className={`text-sm font-medium mb-1.5 inline-flex items-center gap-1.5 ${
            isLightAppearance ? "text-slate-700" : "text-blue-100/85"
          }`}
        >
          <FileText className="w-4 h-4" />
          Damage details <span className="text-rose-500">*</span>
        </label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className={`w-full px-3.5 py-2.5 border rounded-xl outline-none transition-all ${
            isLightAppearance
              ? "bg-white text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              : "bg-slate-900/20 text-slate-100 focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300"
          } ${
            description.length > 0 && !isDescriptionValid
              ? "border-amber-300"
              : isLightAppearance
                ? "border-blue-200"
                : "border-blue-300/25"
          }`}
          placeholder="Front bumper has a dent on the passenger side and paint scratches near the corner..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        ></textarea>
        {description.length > 0 && !isDescriptionValid && (
          <p className="text-xs text-amber-600 mt-1">
            Please add at least 10 characters to help shops understand the damage.
          </p>
        )}
      </div>

      <div className="mb-8">
        <label
          htmlFor="incident"
          className={`text-sm font-medium mb-1.5 inline-flex items-center gap-1.5 ${
            isLightAppearance ? "text-slate-700" : "text-blue-100/85"
          }`}
        >
          <MessageSquareQuote className="w-4 h-4" />
          What happened? (Optional)
        </label>
        <textarea
          id="incident"
          name="incident"
          rows={3}
          className={`w-full px-3.5 py-2.5 border rounded-xl outline-none transition-all ${
            isLightAppearance
              ? "border-blue-200 bg-white text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-400"
              : "border-blue-300/25 bg-slate-900/20 text-slate-100 focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300"
          }`}
          placeholder="I was backing out in a parking lot and clipped a pole..."
          value={incident}
          onChange={(e) => onIncidentChange(e.target.value)}
        ></textarea>
      </div>

      {submitError && (
        <div className="mb-4 p-3 rounded-xl border border-rose-400/30 bg-rose-500/10 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-200 mt-0.5 shrink-0" />
          <p className="text-sm text-rose-200">{submitError}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className={`flex-1 py-3 px-4 min-h-[44px] border rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isLightAppearance
              ? "border-blue-200/70 text-slate-700 hover:bg-blue-50/40"
              : "border-blue-300/25 text-blue-100 hover:bg-blue-400/12"
          }`}
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-medium inline-flex items-center justify-center gap-2 hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
            boxShadow: "0 4px 20px rgba(37, 99, 235, 0.25), 0 0 28px rgba(59, 130, 246, 0.08)",
          }}
          disabled={!isDescriptionValid || isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting…
            </>
          ) : (
            <>
              Submit Report
              <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
