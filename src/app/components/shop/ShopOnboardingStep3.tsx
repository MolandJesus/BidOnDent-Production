import { ArrowRight, Award, Check } from "lucide-react";
import { motion } from "motion/react";
import type { ShopOnboardingFormData } from "../../types";

const certificationOptions = [
  "ASE Certified",
  "I-CAR Gold Class",
  "Tesla Certified",
  "BMW Certified",
  "Mercedes Certified",
  "AAA Approved",
  "Porsche Approved",
];

const specialtyOptions = [
  "Collision Repair",
  "Paintless Dent Removal",
  "Frame Straightening",
  "Custom Paint",
  "Luxury Vehicles",
  "Insurance Claims",
  "Fleet Services",
];

function toggleArrayItem(array: string[], item: string) {
  return array.includes(item) ? array.filter((i) => i !== item) : [...array, item];
}

type ShopOnboardingStep3Props = {
  formData: ShopOnboardingFormData;
  primaryColor: string;
  secondaryColor: string;
  isLight?: boolean;
  onUpdate: (data: ShopOnboardingFormData) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function ShopOnboardingStep3({
  formData,
  primaryColor,
  secondaryColor,
  isLight = true,
  onUpdate,
  onNext,
  onBack,
}: ShopOnboardingStep3Props) {
  return (
    <div>
      <div className="mb-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <Award className="w-8 h-8 text-white" />
        </div>
        <h2
          className={`text-2xl font-bold text-center mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}
        >
          Certifications
        </h2>
        <p className={`text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          Select your certifications and specialties
        </p>
      </div>

      <div className="bd-report-section rounded-2xl p-4 sm:p-6 space-y-6">
        <div>
          <label
            className={`block text-sm font-medium mb-3 ${isLight ? "text-slate-700" : "text-slate-300"}`}
          >
            Certifications
          </label>
          <div className="flex flex-wrap gap-2">
            {certificationOptions.map((cert) => (
              <button
                key={cert}
                onClick={() =>
                  onUpdate({
                    ...formData,
                    certifications: toggleArrayItem(formData.certifications, cert),
                  })
                }
                className={`px-3 py-2 rounded-xl text-sm border transition-colors min-h-[44px] ${
                  formData.certifications.includes(cert)
                    ? isLight
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-blue-400/15 border-blue-500/60 text-blue-200"
                    : isLight
                      ? "bg-white/60 border-slate-200/60 text-slate-700 hover:bg-slate-50"
                      : "bd-glass-control--utility"
                }`}
              >
                {formData.certifications.includes(cert) && (
                  <Check className="w-4 h-4 inline mr-1" />
                )}
                {cert}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-medium mb-3 ${isLight ? "text-slate-700" : "text-slate-300"}`}
          >
            Specialties
          </label>
          <div className="flex flex-wrap gap-2">
            {specialtyOptions.map((specialty) => (
              <button
                key={specialty}
                onClick={() =>
                  onUpdate({
                    ...formData,
                    specialties: toggleArrayItem(formData.specialties, specialty),
                  })
                }
                className={`px-3 py-2 rounded-xl text-sm border transition-colors min-h-[44px] ${
                  formData.specialties.includes(specialty)
                    ? isLight
                      ? "bg-blue-50 border-blue-300 text-blue-700"
                      : "bg-blue-400/15 border-blue-500/60 text-blue-200"
                    : isLight
                      ? "bg-white/60 border-slate-200/60 text-slate-700 hover:bg-slate-50"
                      : "bd-glass-control--utility"
                }`}
              >
                {formData.specialties.includes(specialty) && (
                  <Check className="w-4 h-4 inline mr-1" />
                )}
                {specialty}
              </button>
            ))}
          </div>
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
