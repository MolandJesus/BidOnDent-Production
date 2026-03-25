import type { FormEvent } from "react";
import { Send } from "lucide-react";
import { type InsurerForm, formatPhoneNumber } from "./businessInquiryUtils";

type BusinessInquiryInsurerFormProps = {
  insurerForm: InsurerForm;
  isSubmitting: boolean;
  onUpdate: (form: InsurerForm) => void;
  onSubmit: (event: FormEvent) => void;
};

export default function BusinessInquiryInsurerForm({
  insurerForm,
  isSubmitting,
  onUpdate,
  onSubmit,
}: BusinessInquiryInsurerFormProps) {
  return (
    <form className="grid md:grid-cols-2 gap-4" onSubmit={onSubmit}>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Company Name*</label>
        <input
          required
          value={insurerForm.companyName}
          onChange={(e) => onUpdate({ ...insurerForm, companyName: e.target.value })}
          placeholder="e.g., Acme Insurance"
          className="w-full h-11 px-3 border border-slate-200/80 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person*</label>
        <input
          required
          value={insurerForm.contactPerson}
          onChange={(e) => onUpdate({ ...insurerForm, contactPerson: e.target.value })}
          placeholder="e.g., Jane Doe"
          className="w-full h-11 px-3 border border-slate-200/80 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Email Address*</label>
        <input
          required
          type="email"
          value={insurerForm.email}
          onChange={(e) => onUpdate({ ...insurerForm, email: e.target.value })}
          placeholder="partner@insurance.com"
          className="w-full h-11 px-3 border border-slate-200/80 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number*</label>
        <input
          required
          value={insurerForm.phoneNumber}
          onChange={(e) =>
            onUpdate({ ...insurerForm, phoneNumber: formatPhoneNumber(e.target.value) })
          }
          placeholder="Phone number (10+ digits)"
          className="w-full h-11 px-3 border border-slate-200/80 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
        />
      </div>
      <div className="md:col-span-2">
        <label className="block text-sm font-medium text-slate-700 mb-1">
          Partnership Notes (optional)
        </label>
        <textarea
          value={insurerForm.notes}
          onChange={(e) => onUpdate({ ...insurerForm, notes: e.target.value })}
          placeholder="Tell us about your partnership interests and expectations..."
          className="w-full min-h-28 px-3 py-2 border border-slate-200/80 rounded-lg bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition-colors"
        />
      </div>

      <div className="md:col-span-2 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="bd-glass-control w-full md:w-auto px-6 h-11 inline-flex items-center justify-center gap-2 disabled:opacity-60"
        >
          Submit Partnership Request
          <Send className="w-4 h-4" />
        </button>
      </div>
    </form>
  );
}
