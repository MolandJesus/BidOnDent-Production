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
    <div className="bd-report-step px-4 md:px-6 py-5 md:py-6">
      <span className="bd-report-eyebrow mb-3">
        <FileText className="w-3.5 h-3.5" />
        Final details
      </span>
      <h2
        className={`text-2xl font-bold mb-1 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
      >
        Describe the damage
      </h2>
      <p className={`mb-6 ${isLightAppearance ? "text-slate-500" : "text-blue-100/80"}`}>
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
          className={`bd-report-input w-full px-4 py-3 rounded-xl outline-none ${
            isLightAppearance ? "text-slate-900" : "text-slate-100"
          } ${description.length > 0 && !isDescriptionValid ? "border-amber-400" : ""}`}
          placeholder="Front bumper has a dent on the passenger side and paint scratches near the corner..."
          value={description}
          onChange={(e) => onDescriptionChange(e.target.value)}
        ></textarea>
        {description.length > 0 && !isDescriptionValid && (
          <p className={`text-xs mt-1 ${isLightAppearance ? "text-amber-600" : "text-amber-400"}`}>
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
          className={`bd-report-input w-full px-4 py-3 rounded-xl outline-none ${
            isLightAppearance ? "text-slate-900" : "text-slate-100"
          }`}
          placeholder="I was backing out in a parking lot and clipped a pole..."
          value={incident}
          onChange={(e) => onIncidentChange(e.target.value)}
        ></textarea>
      </div>

      {submitError && (
        <div
          className={`mb-4 p-3 rounded-xl border flex items-start gap-2.5 ${
            isLightAppearance
              ? "border-rose-200 bg-rose-50 text-rose-700"
              : "border-rose-400/30 bg-rose-500/10 text-rose-200"
          }`}
        >
          <AlertTriangle
            className={`w-4 h-4 mt-0.5 shrink-0 ${isLightAppearance ? "text-rose-500" : "text-rose-300"}`}
          />
          <p className="text-sm">{submitError}</p>
        </div>
      )}

      <div className="flex space-x-3">
        <button
          type="button"
          onClick={onBack}
          disabled={isSubmitting}
          className="bd-report-secondary-button flex-1 py-3 px-4 min-h-[44px] rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="bd-report-primary-button flex-1 py-3 px-4 min-h-[44px] rounded-2xl text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
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
