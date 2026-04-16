import { ArrowRight, Clock } from "lucide-react";
import { motion } from "motion/react";
import type { ShopOnboardingFormData } from "../../types";

type ShopOnboardingStep2Props = {
  formData: ShopOnboardingFormData;
  primaryColor: string;
  secondaryColor: string;
  isLight?: boolean;
  onUpdate: (data: ShopOnboardingFormData) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function ShopOnboardingStep2({
  formData,
  primaryColor,
  secondaryColor,
  isLight = true,
  onUpdate,
  onNext,
  onBack,
}: ShopOnboardingStep2Props) {
  return (
    <div>
      <div className="mb-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h2
          className={`text-2xl font-bold text-center mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}
        >
          Business Hours
        </h2>
        <p className={`text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          When are you open for business?
        </p>
      </div>

      <div className="bd-report-section rounded-2xl p-4 sm:p-6 space-y-4">
        <div>
          <label
            className={`block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`}
          >
            Business Hours
          </label>
          <input
            type="text"
            value={formData.hours}
            onChange={(e) => onUpdate({ ...formData, hours: e.target.value })}
            className={`bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl ${isLight ? "text-slate-800" : "text-slate-100"}`}
            placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-3PM"
          />
          <p className={`text-xs mt-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}>
            You can edit this later in your profile
          </p>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <motion.button
          onClick={onBack}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl font-semibold bd-glass-control--secondary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          Back
        </motion.button>
        <motion.button
          onClick={onNext}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
          whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0, 61, 130, 0.3)" }}
          whileTap={{ scale: 0.98 }}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </motion.button>
      </div>
    </div>
  );
}
