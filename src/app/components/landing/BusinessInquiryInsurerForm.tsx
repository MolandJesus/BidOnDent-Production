import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { type InsurerForm, formatPhoneNumber } from "./businessInquiryUtils";

type BusinessInquiryInsurerFormProps = {
  insurerForm: InsurerForm;
  isSubmitting: boolean;
  isLightAppearance?: boolean;
  onUpdate: (form: InsurerForm) => void;
  onSubmit: (event: FormEvent) => void;
};

export default function BusinessInquiryInsurerForm({
  insurerForm,
  isSubmitting,
  isLightAppearance,
  onUpdate,
  onSubmit,
}: BusinessInquiryInsurerFormProps) {
  const labelCls = `block text-sm font-medium mb-1 ${isLightAppearance ? "text-blue-100/85" : "text-blue-100/85"}`;
  const inputCls = `w-full h-11 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${isLightAppearance ? "border-blue-300/22 bg-slate-900/18 text-slate-100 placeholder:text-blue-100/35 focus:ring-blue-200/35 focus:border-blue-300" : "border-blue-300/25 bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:ring-blue-200/40 focus:border-blue-300"}`;

  return (
    <form className="grid md:grid-cols-2 gap-4" onSubmit={onSubmit}>
      <div>
        <label className={labelCls}>Company Name*</label>
        <input
          required
          value={insurerForm.companyName}
          onChange={(e) => onUpdate({ ...insurerForm, companyName: e.target.value })}
          placeholder="e.g., Acme Insurance"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Contact Person*</label>
        <input
          required
          value={insurerForm.contactPerson}
          onChange={(e) => onUpdate({ ...insurerForm, contactPerson: e.target.value })}
          placeholder="e.g., Jane Doe"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Email Address*</label>
        <input
          required
          type="email"
          value={insurerForm.email}
          onChange={(e) => onUpdate({ ...insurerForm, email: e.target.value })}
          placeholder="partner@insurance.com"
          className={inputCls}
        />
      </div>
      <div>
        <label className={labelCls}>Phone Number*</label>
        <input
          required
          value={insurerForm.phoneNumber}
          onChange={(e) =>
            onUpdate({ ...insurerForm, phoneNumber: formatPhoneNumber(e.target.value) })
          }
          placeholder="Phone number (10+ digits)"
          className={inputCls}
        />
      </div>
      <div className="md:col-span-2">
        <label className={labelCls}>Partnership Notes (optional)</label>
        <textarea
          value={insurerForm.notes}
          onChange={(e) => onUpdate({ ...insurerForm, notes: e.target.value })}
          placeholder="Tell us about your partnership interests and expectations..."
          className={`w-full min-h-28 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${isLightAppearance ? "border-blue-300/22 bg-slate-900/18 text-slate-100 placeholder:text-blue-100/35 focus:ring-blue-200/35 focus:border-blue-300" : "border-blue-300/25 bg-slate-900/20 text-slate-100 placeholder:text-blue-100/35 focus:ring-blue-200/40 focus:border-blue-300"}`}
        />
      </div>

      <div className="md:col-span-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full md:w-auto px-6 h-11 inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:opacity-60 ${isLightAppearance ? "bd-glass-control" : "bd-glass-control"}`}
        >
          Submit Partnership Request
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
