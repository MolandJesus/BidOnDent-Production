import { ArrowRight, Building, MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { ShopOnboardingFormData } from "../../types";

type ShopOnboardingStep1Props = {
  formData: ShopOnboardingFormData;
  primaryColor: string;
  secondaryColor: string;
  isLight?: boolean;
  onUpdate: (data: ShopOnboardingFormData) => void;
  onNext: () => void;
};

export default function ShopOnboardingStep1({
  formData,
  primaryColor,
  secondaryColor,
  isLight = true,
  onUpdate,
  onNext,
}: ShopOnboardingStep1Props) {
  const handlePhoneChange = (raw: string) => {
    let value = raw.replace(/\D/g, "");
    if (value.length > 10) value = value.slice(0, 10);
    let formatted = "";
    if (value.length > 0) {
      formatted = "(" + value.substring(0, 3);
      if (value.length >= 3) formatted += ") " + value.substring(3, 6);
      if (value.length >= 6) formatted += "-" + value.substring(6, 10);
    }
    onUpdate({ ...formData, phone: formatted || value });
  };

  const labelClass = `block text-sm font-medium mb-1.5 ${isLight ? "text-slate-700" : "text-slate-300"}`;

  return (
    <div>
      <div className="mb-6">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <Building className="w-7 h-7 text-white" />
        </div>
        <h2
          className={`text-2xl font-bold text-center mb-1 ${isLight ? "text-slate-900" : "text-slate-100"}`}
        >
          Shop Information
        </h2>
        <p className={`text-sm text-center ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          Let&apos;s start with the basics
        </p>
      </div>

      <div className="bd-report-section rounded-2xl p-4 sm:p-6 space-y-4">
        <div>
          <label className={labelClass}>Shop Name</label>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) => onUpdate({ ...formData, shopName: e.target.value })}
            className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
            placeholder="Express Auto Body"
          />
        </div>

        <div>
          <label className={labelClass}>Street Address</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onUpdate({ ...formData, address: e.target.value })}
            className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>City</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onUpdate({ ...formData, city: e.target.value })}
              className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
              placeholder="City"
            />
          </div>
          <div>
            <label className={labelClass}>State</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => onUpdate({ ...formData, state: e.target.value })}
              className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
              placeholder="State"
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>ZIP Code</label>
          <input
            type="text"
            value={formData.zip}
            onChange={(e) => onUpdate({ ...formData, zip: e.target.value })}
            className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
            placeholder="12345"
          />
        </div>

        {/* Map integration note */}
        <div className="bd-report-note rounded-xl px-3.5 py-3 flex items-start gap-2.5">
          <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <p className={`text-xs leading-relaxed ${isLight ? "text-slate-600" : "text-slate-300"}`}>
            Your shop location will appear on the BidOnDent coverage map, making it discoverable by
            customers in your area.
          </p>
        </div>

        <div>
          <label className={labelClass}>Phone Number</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
            placeholder="(555) 123-4567"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className={labelClass}>
            Website
            <span className={`ml-1 font-normal ${isLight ? "text-slate-400" : "text-slate-500"}`}>
              (optional)
            </span>
          </label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => onUpdate({ ...formData, website: e.target.value })}
            className="bd-report-input w-full px-4 py-3 min-h-[44px] rounded-xl"
            placeholder="https://yourshop.com"
          />
        </div>
      </div>

      <motion.button
        onClick={onNext}
        disabled={
          !formData.shopName ||
          !formData.address ||
          !formData.city ||
          !formData.state ||
          !formData.zip ||
          !formData.phone
        }
        className="bd-report-primary-button w-full mt-6 py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        style={{
          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
        }}
        whileTap={{ scale: 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        Continue
        <ArrowRight className="w-5 h-5 ml-2" />
      </motion.button>
    </div>
  );
}
