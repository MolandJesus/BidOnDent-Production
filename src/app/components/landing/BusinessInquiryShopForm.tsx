import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { type ShopForm, formatPhoneNumber, formatZipCode } from "./businessInquiryUtils";

type BusinessInquiryShopFormProps = {
  shopForm: ShopForm;
  isSubmitting: boolean;
  isLightAppearance?: boolean;
  onUpdate: (form: ShopForm) => void;
  onSubmit: (event: FormEvent) => void;
};

export default function BusinessInquiryShopForm({
  shopForm,
  isSubmitting,
  isLightAppearance,
  onUpdate,
  onSubmit,
}: BusinessInquiryShopFormProps) {
  const labelCls = `block text-sm font-medium mb-1 ${isLightAppearance ? "text-slate-700" : "text-blue-100/85"}`;
  const inputCls = `w-full h-11 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${isLightAppearance ? "border-slate-200/60 bg-white/60 text-slate-800 placeholder:text-slate-400 focus:ring-blue-300/40 focus:border-blue-300" : "border-blue-300/25 bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:ring-blue-200/40 focus:border-blue-300"}`;

  return (
    <form className="grid md:grid-cols-2 gap-4" onSubmit={onSubmit}>
      <div>
        <label className={labelCls}>Shop Name*</label>
        <input
          required
          value={shopForm.shopName}
          onChange={(e) => onUpdate({ ...shopForm, shopName: e.target.value })}
          placeholder="e.g., Smith's Auto Repair"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>DMV Registration#*</label>
        <input
          required
          value={shopForm.dmvRegistrationNumber}
          onChange={(e) => onUpdate({ ...shopForm, dmvRegistrationNumber: e.target.value })}
          placeholder="e.g., NY-405821"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Contact Person*</label>
        <input
          required
          value={shopForm.contactPerson}
          onChange={(e) => onUpdate({ ...shopForm, contactPerson: e.target.value })}
          placeholder="e.g., John Smith"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Email Address*</label>
        <input
          required
          type="email"
          value={shopForm.email}
          onChange={(e) => onUpdate({ ...shopForm, email: e.target.value })}
          placeholder="owner@shop.com"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Phone Number*</label>
        <input
          required
          value={shopForm.phoneNumber}
          onChange={(e) =>
            onUpdate({ ...shopForm, phoneNumber: formatPhoneNumber(e.target.value) })
          }
          placeholder="Phone number (10+ digits)"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Website (optional)</label>
        <input
          value={shopForm.website}
          onChange={(e) => onUpdate({ ...shopForm, website: e.target.value })}
          placeholder="www.example-shop.com"
          className={inputCls}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Street Address*</label>
        <input
          required
          value={shopForm.address}
          onChange={(e) => onUpdate({ ...shopForm, address: e.target.value })}
          placeholder="123 Main Street"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>City*</label>
        <input
          required
          value={shopForm.city}
          onChange={(e) => onUpdate({ ...shopForm, city: e.target.value })}
          placeholder="e.g., New Rochelle"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>State*</label>
        <input
          required
          value={shopForm.state}
          onChange={(e) => onUpdate({ ...shopForm, state: e.target.value.toUpperCase() })}
          placeholder="NY"
          maxLength={2}
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>ZIP Code*</label>
        <input
          required
          value={shopForm.zipCode}
          onChange={(e) => onUpdate({ ...shopForm, zipCode: formatZipCode(e.target.value) })}
          placeholder="10601"
          className={inputCls}
        />
      </div>

      <div className="md:col-span-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full md:w-auto px-6 h-11 inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all disabled:opacity-60 bd-glass-control"
        >
          Submit Shop Application
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
