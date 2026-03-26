import { ArrowRight, Building, MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { ShopOnboardingFormData } from "../../types";

type ShopOnboardingStep1Props = {
  formData: ShopOnboardingFormData;
  primaryColor: string;
  secondaryColor: string;
  onUpdate: (data: ShopOnboardingFormData) => void;
  onNext: () => void;
};

export default function ShopOnboardingStep1({
  formData,
  primaryColor,
  secondaryColor,
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

  return (
    <div>
      <div className="mb-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
          }}
        >
          <Building className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-2">Shop Information</h2>
        <p className="text-gray-600 text-center">Let's start with the basics</p>
      </div>

      <div className="bd-glass-card p-4 sm:p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Shop Name *</label>
          <input
            type="text"
            value={formData.shopName}
            onChange={(e) => onUpdate({ ...formData, shopName: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-md"
            placeholder="Express Auto Body"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
          <input
            type="text"
            value={formData.address}
            onChange={(e) => onUpdate({ ...formData, address: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-md"
            placeholder="123 Main St"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
            <input
              type="text"
              value={formData.city}
              onChange={(e) => onUpdate({ ...formData, city: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-md"
              placeholder="City"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
            <input
              type="text"
              value={formData.state}
              onChange={(e) => onUpdate({ ...formData, state: e.target.value })}
              className="w-full px-3 py-3 border border-gray-300 rounded-md"
              placeholder="State"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
          <input
            type="text"
            value={formData.zip}
            onChange={(e) => onUpdate({ ...formData, zip: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-md"
            placeholder="12345"
          />
        </div>

        {/* Map integration note */}
        <div className="flex items-start gap-2.5 rounded-xl bg-blue-400/10 border border-blue-400/20 px-3.5 py-3">
          <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-600 leading-relaxed">
            Your shop location will appear on the BidOnDent coverage map, making it discoverable by customers in your area.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 rounded-md"
            placeholder="Phone number"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Website (Optional)</label>
          <input
            type="url"
            value={formData.website}
            onChange={(e) => onUpdate({ ...formData, website: e.target.value })}
            className="w-full px-3 py-3 border border-gray-300 rounded-md"
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
  );
}
