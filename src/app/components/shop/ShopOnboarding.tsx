import { useState } from "react";
import type { ShopOnboardingFormData } from "../../types";
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
    try {
      await onComplete(formData);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error completing shop onboarding:", error);
      window.alert("We couldn't save the shop profile yet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round((step / 4) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] to-[#e8f0fa]">
      {/* Progress Bar */}
      <div className="bd-glass-panel border-b border-white/20">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-bold text-slate-100">Shop Setup</h1>
            <span className="text-sm text-slate-500">Step {step} of 4</span>
          </div>
          <div className="h-2 bg-slate-200/60 rounded-full overflow-hidden">
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
            onUpdate={setFormData}
            onNext={handleNext}
          />
        )}
        {step === 2 && (
          <ShopOnboardingStep2
            formData={formData}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
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
            onUpdate={setFormData}
            onNext={handleNext}
            onBack={handleBack}
          />
        )}
        {step === 4 && (
          <ShopOnboardingStep4
            formData={formData}
            primaryColor={primaryColor}
            isSubmitting={isSubmitting}
            onUpdate={setFormData}
            onBack={handleBack}
            onComplete={handleComplete}
          />
        )}
      </div>
    </div>
  );
}
