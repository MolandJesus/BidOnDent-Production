import { useState } from "react";
import type { ShopOnboardingFormData } from "../../types";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";
import ShopOnboardingStep1 from "./ShopOnboardingStep1";
import ShopOnboardingStep2 from "./ShopOnboardingStep2";
import ShopOnboardingStep3 from "./ShopOnboardingStep3";
import ShopOnboardingStep4 from "./ShopOnboardingStep4";

type ShopOnboardingProps = {
  primaryColor?: string;
  secondaryColor?: string;
  onComplete: (data: ShopOnboardingFormData) => Promise<void> | void;
};

export default function ShopOnboarding({
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  onComplete,
}: ShopOnboardingProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [appearanceMode] = useAppearanceModeCtx();
  const isLight = appearanceMode === "light";
  const [formData, setFormData] = useState<ShopOnboardingFormData>({
    shopName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    website: "",
    hours: "",
    certifications: [],
    specialties: [],
    insurance: false,
    estimates: false,
  });

  const handleNext = () => setStep(step + 1);
  const handleBack = () => setStep(step - 1);

  const handleComplete = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmitError(null);
    try {
      await onComplete(formData);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error completing shop onboarding:", error);
      setSubmitError("We couldn't save the shop profile yet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round((step / 4) * 100);

  return (
    <div className="bd-report-flow min-h-screen">
      {/* Progress Bar */}
      <div
        className={`backdrop-blur-sm border-b ${
          isLight
            ? "bg-[linear-gradient(180deg,rgba(247,232,194,0.86),rgba(232,238,248,0.80))] border-[rgba(140,82,22,0.24)] shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]"
            : "bg-white/[0.04] border-white/[0.08]"
        }`}
      >
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <h1 className={`font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Shop Setup
            </h1>
            <span className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Step {step} of 4
            </span>
          </div>
          <div
            className={`h-2 rounded-full overflow-hidden ${
              isLight ? "bg-slate-200/60" : "bg-white/[0.08]"
            }`}
          >
            <div
              className="h-full transition-all duration-300 rounded-full"
              style={{
                width: `${progress}%`,
                background: `linear-gradient(90deg, ${primaryColor}, ${secondaryColor})`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {step === 1 && (
          <ShopOnboardingStep1
            formData={formData}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isLight={isLight}
            onUpdate={setFormData}
            onNext={handleNext}
          />
        )}
        {step === 2 && (
          <ShopOnboardingStep2
            formData={formData}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isLight={isLight}
            onUpdate={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 3 && (
          <ShopOnboardingStep3
            formData={formData}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            isLight={isLight}
            onUpdate={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 4 && (
          <ShopOnboardingStep4
            formData={formData}
            primaryColor={primaryColor}
            isLight={isLight}
            isSubmitting={isSubmitting}
            submitError={submitError}
            onUpdate={setFormData}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
