import { Shield } from "lucide-react";
import type { InsuranceCompanyProfile } from "../../services/intelligence/marketIntelligence";

type InsurerConnectFormModalProps = {
  carrier: InsuranceCompanyProfile;
  isLight: boolean;
  primaryColor: string;
  policyNumber: string;
  claimNumber: string;
  onPolicyNumberChange: (value: string) => void;
  onClaimNumberChange: (value: string) => void;
  onConnect: () => void;
  onCancel: () => void;
};

export default function InsurerConnectFormModal({
  carrier,
  isLight,
  primaryColor,
  policyNumber,
  claimNumber,
  onPolicyNumberChange,
  onClaimNumberChange,
  onConnect,
  onCancel,
}: InsurerConnectFormModalProps) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bd-glass-floating rounded-2xl max-w-lg w-full">
        <div className="p-4 sm:p-6">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <h2 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                Connect {carrier.name}
              </h2>
              <p className={`text-sm mt-1 ${isLight ? "text-slate-600" : "text-slate-400"}`}>
                {carrier.description}
              </p>
            </div>
            <div
              className={`rounded-xl px-3 py-2 text-center ${isLight ? "bg-slate-100 text-slate-900" : "bg-slate-900 text-white"}`}
            >
              <p
                className={`text-[11px] uppercase tracking-wide ${isLight ? "text-slate-500" : "text-white/70"}`}
              >
                HQ
              </p>
              <p className="text-xs font-semibold">{carrier.headquarters}</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            <div>
              <label
                className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Policy Number *
              </label>
              <input
                type="text"
                value={policyNumber}
                onChange={(event) => onPolicyNumberChange(event.target.value)}
                className={`w-full px-3 py-3 border rounded-md ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400" : "border-white/[0.12] text-slate-100 placeholder:text-slate-400/60"}`}
                placeholder="POL-123456789"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-1 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Claim Number (Optional)
              </label>
              <input
                type="text"
                value={claimNumber}
                onChange={(event) => onClaimNumberChange(event.target.value)}
                className={`w-full px-3 py-3 border rounded-md ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400" : "border-white/[0.12] text-slate-100 placeholder:text-slate-400/60"}`}
                placeholder="CLM-987654321"
              />
              <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Add this if a claim already exists.
              </p>
            </div>

            <div
              className={`rounded-2xl p-4 border ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.04] border-white/[0.10]"}`}
            >
              <div
                className={`flex items-center gap-2 text-sm font-semibold mb-3 ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                <Shield className="w-4 h-4 text-slate-500" />
                Connection notes
              </div>
              <div className="space-y-2">
                {carrier.accountConnectionNotes.map((note) => (
                  <div
                    key={note}
                    className={`rounded-xl border px-3 py-2 text-sm ${isLight ? "bg-white border-slate-200 text-slate-700" : "bg-white/[0.06] border-white/[0.10] text-slate-300"}`}
                  >
                    {note}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 px-4 py-3 border rounded-md font-medium ${isLight ? "border-slate-200 text-slate-700 hover:bg-slate-50" : "border-white/[0.12] hover:bg-white/[0.04]"}`}
            >
              Cancel
            </button>
            <button
              onClick={onConnect}
              disabled={!policyNumber.trim()}
              className="flex-1 px-4 py-2 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
            >
              Save Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
