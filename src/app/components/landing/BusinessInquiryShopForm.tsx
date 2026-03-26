import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { type ShopForm, formatPhoneNumber, formatZipCode } from "./businessInquiryUtils";

type BusinessInquiryShopFormProps = {
  shopForm: ShopForm;
  isSubmitting: boolean;
  onUpdate: (form: ShopForm) => void;
  onSubmit: (event: FormEvent) => void;
};

export default function BusinessInquiryShopForm({
  shopForm,
  isSubmitting,
  onUpdate,
  onSubmit,
}: BusinessInquiryShopFormProps) {
  return (
    <form className="grid md:grid-cols-2 gap-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">Shop Name*</label>
        <input
          required
          value={shopForm.shopName}
          onChange={(e) => onUpdate({ ...shopForm, shopName: e.target.value })}
          placeholder="e.g., Smith's Auto Repair"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">
          DMV Registration#*
        </label>
        <input
          required
          value={shopForm.dmvRegistrationNumber}
          onChange={(e) => onUpdate({ ...shopForm, dmvRegistrationNumber: e.target.value })}
          placeholder="e.g., NY-405821"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">Contact Person*</label>
        <input
          required
          value={shopForm.contactPerson}
          onChange={(e) => onUpdate({ ...shopForm, contactPerson: e.target.value })}
          placeholder="e.g., John Smith"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">Email Address*</label>
        <input
          required
          type="email"
          value={shopForm.email}
          onChange={(e) => onUpdate({ ...shopForm, email: e.target.value })}
          placeholder="owner@shop.com"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">Phone Number*</label>
        <input
          required
          value={shopForm.phoneNumber}
          onChange={(e) =>
            onUpdate({ ...shopForm, phoneNumber: formatPhoneNumber(e.target.value) })
          }
          placeholder="Phone number (10+ digits)"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">
          Website (optional)
        </label>
        <input
          value={shopForm.website}
          onChange={(e) => onUpdate({ ...shopForm, website: e.target.value })}
          placeholder="www.example-shop.com"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-blue-100/85 mb-1">Street Address*</label>
        <input
          required
          value={shopForm.address}
          onChange={(e) => onUpdate({ ...shopForm, address: e.target.value })}
          placeholder="123 Main Street"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">City*</label>
        <input
          required
          value={shopForm.city}
          onChange={(e) => onUpdate({ ...shopForm, city: e.target.value })}
          placeholder="e.g., New Rochelle"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">State*</label>
        <input
          required
          value={shopForm.state}
          onChange={(e) => onUpdate({ ...shopForm, state: e.target.value.toUpperCase() })}
          placeholder="NY"
          maxLength={2}
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-blue-100/85 mb-1">ZIP Code*</label>
        <input
          required
          value={shopForm.zipCode}
          onChange={(e) => onUpdate({ ...shopForm, zipCode: formatZipCode(e.target.value) })}
          placeholder="10601"
          className="w-full h-11 px-3 border border-blue-300/25 rounded-lg bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:outline-none focus:ring-2 focus:ring-blue-200/40 focus:border-blue-300 transition-colors"
        />
      </div>

      <div className="md:col-span-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bd-glass-control w-full md:w-auto px-6 h-11 inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          Submit Shop Application
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
