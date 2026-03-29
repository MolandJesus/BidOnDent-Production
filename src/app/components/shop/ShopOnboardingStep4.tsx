import { Check } from "lucide-react";
import { motion } from "motion/react";
import type { ShopOnboardingFormData } from "../../types";

type ShopOnboardingStep4Props = {
  formData: ShopOnboardingFormData;
  primaryColor: string;
  isSubmitting: boolean;
  submitError?: string | null;
  onUpdate: (data: ShopOnboardingFormData) => void;
  onBack: () => void;
  onComplete: () => void;
};

export default function ShopOnboardingStep4({
  formData,
  primaryColor,
  isSubmitting,
  submitError,
  onUpdate,
  onBack,
  onComplete,
}: ShopOnboardingStep4Props) {
  return (
    <div>
      <div className="mb-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ backgroundColor: "#34D399" }}
        >
          <Check className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Almost Done!</h2>
        <p className="text-slate-600 text-center">Just a few more preferences</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 shadow-sm p-4 sm:p-6 space-y-4">
        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer">
          <div>
            <p className="font-medium">Accept insurance claims</p>
            <p className="text-sm text-slate-600">Work directly with insurance companies</p>
          </div>
          <input
            type="checkbox"
            checked={formData.insurance}
            onChange={(e) => onUpdate({ ...formData, insurance: e.target.checked })}
            className="w-5 h-5"
            style={{ accentColor: primaryColor }}
          />
        </label>

        <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer">
          <div>
            <p className="font-medium">Provide free estimates</p>
            <p className="text-sm text-slate-600">Offer complimentary damage assessments</p>
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
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center disabled:opacity-70"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0, 61, 130, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          {isSubmitting ? "Saving..." : "Complete Setup"}
          <Check className="w-5 h-5 ml-2" />
        </motion.button>
      </div>
    </div>
  );
}
