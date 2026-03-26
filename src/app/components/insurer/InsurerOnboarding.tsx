import { useState } from "react";
import { Check, ArrowRight, Shield, DollarSign, FileText } from "lucide-react";
import { motion } from "motion/react";
import type { InsurerOnboardingFormData } from "../../types";

type InsurerOnboardingProps = {
  primaryColor?: string;
  secondaryColor?: string;
  onComplete: (data: InsurerOnboardingFormData) => Promise<void> | void;
};

export default function InsurerOnboarding({
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  onComplete,
}: InsurerOnboardingProps) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    licenseNumber: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    website: "",
    claimTypes: [] as string[],
    preferredShops: false,
    autoApproval: false,
    maxClaimAmount: "",
  });

  const claimTypeOptions = [
    "Collision",
    "Comprehensive",
    "Liability",
    "Uninsured Motorist",
    "Medical Payments",
    "Personal Injury Protection",
  ];

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter((i) => i !== item);
    } else {
      return [...array, item];
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = async () => {
    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onComplete(formData);
    } catch (error) {
      if (import.meta.env.DEV) console.error("Error completing insurer onboarding:", error);
      window.alert("We couldn't save the insurer profile yet. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const progress = Math.round((step / 3) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#f0f7ff] to-[#e8f0fa]">
      {/* Progress Bar */}
      <div className="bd-glass-panel border-b border-white/20">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-bold text-slate-100">Insurer Setup</h1>
            <span className="text-sm text-slate-500">Step {step} of 3</span>
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
          <div>
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Company Information</h2>
              <p className="text-slate-400 text-center">Tell us about your insurance company</p>
            </div>

            <div className="bd-glass-card rounded-lg p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Company Name *
                </label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3 py-3 border border-white/[0.12] rounded-md"
                  placeholder="SafeDrive Insurance"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Insurance License Number *
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  className="w-full px-3 py-3 border border-white/[0.12] rounded-md"
                  placeholder="INS-123456"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-3 border border-white/[0.12] rounded-md"
                  placeholder="456 Insurance Blvd"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 py-3 border border-white/[0.12] rounded-md"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3 py-3 border border-white/[0.12] rounded-md"
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">ZIP Code *</label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  className="w-full px-3 py-3 border border-white/[0.12] rounded-md"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-3 border border-white/[0.12] rounded-md"
                  placeholder="Phone number (10+ digits)"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3 py-3 border border-white/[0.12] rounded-md"
                  placeholder="https://yourinsurance.com"
                />
              </div>
            </div>

            <motion.button
              onClick={handleNext}
              disabled={
                !formData.companyName ||
                !formData.licenseNumber ||
                !formData.address ||
                !formData.city ||
                !formData.state ||
                !formData.zip ||
                !formData.phone
              }
              className="w-full mt-6 py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0, 61, 130, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                }}
              >
                <FileText className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Claim Types</h2>
              <p className="text-slate-400 text-center">Select the types of claims you handle</p>
            </div>

            <div className="bd-glass-card p-4 sm:p-6">
              <div className="flex flex-wrap gap-2">
                {claimTypeOptions.map((type) => (
                  <button
                    key={type}
                    onClick={() =>
                      setFormData({
                        ...formData,
                        claimTypes: toggleArrayItem(formData.claimTypes, type),
                      })
                    }
                    className={`px-4 py-3 rounded-lg text-sm border transition-colors ${
                      formData.claimTypes.includes(type)
                        ? "bg-blue-100 border-blue-500 text-blue-400"
                        : "bg-white/[0.06] border-white/[0.12] text-slate-300"
                    }`}
                  >
                    {formData.claimTypes.includes(type) && (
                      <Check className="w-4 h-4 inline mr-1" />
                    )}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={handleBack}
                className="flex-1 py-3 px-4 min-h-[44px] rounded-xl font-semibold bd-glass-control--secondary"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                onClick={handleNext}
                disabled={formData.claimTypes.length === 0}
                className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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
        )}

        {step === 3 && (
          <div>
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "#34D399" }}
              >
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Preferences</h2>
              <p className="text-slate-400 text-center">
                Configure your claim handling preferences
              </p>
            </div>

            <div className="bd-glass-card rounded-lg p-4 sm:p-6 space-y-4">
              <label className="flex items-center justify-between p-4 border border-white/[0.10] rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium">Use preferred shop network</p>
                  <p className="text-sm text-slate-400">
                    Direct customers to pre-approved auto body repair shops
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.preferredShops}
                  onChange={(e) => setFormData({ ...formData, preferredShops: e.target.checked })}
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-white/[0.10] rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium">Enable auto-approval</p>
                  <p className="text-sm text-slate-400">
                    Automatically approve claims under a threshold
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.autoApproval}
                  onChange={(e) => setFormData({ ...formData, autoApproval: e.target.checked })}
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </label>

              {formData.autoApproval && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    Auto-approval threshold
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="number"
                      value={formData.maxClaimAmount}
                      onChange={(e) => setFormData({ ...formData, maxClaimAmount: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 border border-white/[0.12] rounded-md"
                      placeholder="5000"
                    />
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Claims under this amount will be auto-approved
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={handleBack}
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 min-h-[44px] rounded-xl font-semibold bd-glass-control--secondary disabled:opacity-60"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                onClick={handleComplete}
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
        )}
      </div>
    </div>
  );
}
