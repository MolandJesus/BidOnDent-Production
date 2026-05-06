import { Check } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import type { ShopOnboardingFormData } from "../../types";

type ShopOnboardingStep4Props = {
  formData: ShopOnboardingFormData;
  primaryColor: string;
  isLight?: boolean;
  isSubmitting: boolean;
  submitError?: string | null;
  onUpdate: (data: ShopOnboardingFormData) => void;
  onBack: () => void;
  onComplete: () => void;
};

export default function ShopOnboardingStep4({
  formData,
  primaryColor,
  isLight = true,
  isSubmitting,
  submitError,
  onUpdate,
  onBack,
  onComplete,
}: ShopOnboardingStep4Props) {
  const reduceMotion = useReducedMotion();

  return (
    <div>
      <div className="mb-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "#34D399" }}
        >
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2
          className={`text-2xl font-bold text-center mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}
        >
          Almost Done!
        </h2>
        <p className={`text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          Just a few more preferences
        </p>
      </div>

      <div className="bd-report-section rounded-2xl p-4 sm:p-6 space-y-4">
        <label
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border ${
            isLight
              ? "border-[rgba(140,82,22,0.22)] bg-[linear-gradient(180deg,rgba(238,247,255,0.78),rgba(219,234,254,0.70))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]"
              : "border-white/[0.08] bg-white/[0.04]"
          }`}
        >
          <div>
            <p className={`font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Accept insurance claims
            </p>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Work directly with insurance companies
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.insurance}
            onChange={(e) => onUpdate({ ...formData, insurance: e.target.checked })}
            className="w-5 h-5"
            style={{ accentColor: primaryColor }}
          />
        </label>

        <label
          className={`flex items-center justify-between p-4 rounded-xl cursor-pointer border ${
            isLight
              ? "border-[rgba(140,82,22,0.22)] bg-[linear-gradient(180deg,rgba(238,247,255,0.78),rgba(219,234,254,0.70))] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]"
              : "border-white/[0.08] bg-white/[0.04]"
          }`}
        >
          <div>
            <p className={`font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Provide free estimates
            </p>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Offer complimentary damage assessments
            </p>
          </div>
          <input
            type="checkbox"
            checked={formData.estimates}
            onChange={(e) => onUpdate({ ...formData, estimates: e.target.checked })}
            className="w-5 h-5"
            style={{ accentColor: primaryColor }}
          />
        </label>
      </div>

      {submitError && <p className="text-sm text-rose-600 text-center mt-2">{submitError}</p>}

      <div className="flex gap-3 mt-6">
        <motion.button
          onClick={onBack}
          disabled={isSubmitting}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl font-semibold bd-glass-control--secondary disabled:opacity-60"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={onComplete}
          disabled={isSubmitting}
          className="bd-dashboard-primary-button flex-1 py-3 px-4 min-h-[44px] text-white font-semibold flex items-center justify-center disabled:opacity-70"
          style={{ background: primaryColor }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.3, delay: 0.15 }}
        >
          {isSubmitting ? "Saving..." : "Complete Setup"}
          <Check className="w-5 h-5 ml-2" />
        </motion.button>
      </div>
    </div>
  );
}
