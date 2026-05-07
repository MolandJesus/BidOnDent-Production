import type { ClaimShop, Policyholder } from "./newClaimData";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export type ClaimFormData = {
  policyNumber: string;
  incidentDate: string;
  damageDescription: string;
  estimatedAmount: string;
  priority: string;
};

type InsurerNewClaimFormProps = {
  selectedCustomer: Policyholder;
  selectedShop: ClaimShop | null;
  claimFormData: ClaimFormData;
  primaryColor: string;
  onUpdate: (data: ClaimFormData) => void;
  onCancel: () => void;
  onSubmit: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function InsurerNewClaimForm({
  selectedCustomer,
  selectedShop,
  claimFormData,
  primaryColor,
  onUpdate,
  onCancel,
  onSubmit,
  appearanceMode = "map-dark",
}: InsurerNewClaimFormProps) {
  const isLight = appearanceMode === "light";
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4 animate-in fade-in duration-200 motion-reduce:animate-none">
      <div
        className={`bd-glass-floating rounded-t-2xl sm:rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-2 sm:zoom-in-95 duration-300 motion-reduce:animate-none${isLight ? " bd-light-surface" : ""}`}
      >
        <div className="p-4 sm:p-6">
          <h2
            className={`text-2xl font-bold mb-4 ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            New Claim Details
          </h2>

          <div
            className={`mb-4 p-4 border rounded-lg ${
              isLight ? "bg-blue-50/60 border-blue-200/50" : "bg-blue-400/10 border-blue-400/20"
            }`}
          >
            <p
              className={`text-sm font-medium mb-1 ${isLight ? "text-blue-700" : "text-blue-200"}`}
            >
              Policyholder
            </p>
            <p className={`font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              {selectedCustomer.name}
            </p>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-blue-200"}`}>
              {selectedCustomer.email}
            </p>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-blue-200"}`}>
              {selectedCustomer.phone}
            </p>
          </div>

          {selectedShop && (
            <div
              className={`mb-4 p-4 border rounded-lg ${
                isLight
                  ? "bg-green-50/60 border-green-200/50"
                  : "bg-green-400/10 border-green-400/20"
              }`}
            >
              <p
                className={`text-sm font-medium mb-1 ${isLight ? "text-green-700" : "text-green-300"}`}
              >
                Assigned Shop
              </p>
              <p className={`font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                {selectedShop.name}
              </p>
              <p className={`text-sm ${isLight ? "text-slate-600" : "text-green-300"}`}>
                {selectedShop.location}
              </p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Policy Number
              </label>
              <input
                type="text"
                value={claimFormData.policyNumber}
                onChange={(e) => onUpdate({ ...claimFormData, policyNumber: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${
                  isLight
                    ? "border-slate-200 bg-[#fffefa] text-slate-800 placeholder:text-slate-400"
                    : "border-blue-300/20 bg-white/[0.08] text-slate-100 placeholder:text-blue-200/40"
                }`}
                placeholder="e.g., POL-2024-0518"
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Incident Date
              </label>
              <input
                type="date"
                value={claimFormData.incidentDate}
                onChange={(e) => onUpdate({ ...claimFormData, incidentDate: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${
                  isLight
                    ? "border-slate-200 bg-[#fffefa] text-slate-800"
                    : "border-blue-300/20 bg-white/[0.08] text-slate-100"
                }`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Damage Description
              </label>
              <textarea
                value={claimFormData.damageDescription}
                onChange={(e) => onUpdate({ ...claimFormData, damageDescription: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${
                  isLight
                    ? "border-slate-200 bg-[#fffefa] text-slate-800 placeholder:text-slate-400"
                    : "border-blue-300/20 bg-white/[0.08] text-slate-100 placeholder:text-blue-200/40"
                }`}
                rows={4}
                placeholder="Describe the damage and incident details..."
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Estimated Amount
              </label>
              <div className="relative">
                <span
                  className={`absolute left-3 top-1/2 transform -translate-y-1/2 font-medium ${
                    isLight ? "text-slate-400" : "text-gray-500"
                  }`}
                >
                  $
                </span>
                <input
                  type="number"
                  value={claimFormData.estimatedAmount}
                  onChange={(e) => onUpdate({ ...claimFormData, estimatedAmount: e.target.value })}
                  className={`w-full pl-8 pr-4 py-2 border rounded-lg ${
                    isLight
                      ? "border-slate-200 bg-[#fffefa] text-slate-800 placeholder:text-slate-400"
                      : "border-blue-300/20 bg-white/[0.08] text-slate-100 placeholder:text-blue-200/40"
                  }`}
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Priority Level
              </label>
              <select
                value={claimFormData.priority}
                onChange={(e) => onUpdate({ ...claimFormData, priority: e.target.value })}
                className={`w-full px-4 py-2 border rounded-lg ${
                  isLight
                    ? "border-slate-200 bg-[#fffefa] text-slate-800"
                    : "border-blue-300/20 bg-white/[0.08] text-slate-100"
                }`}
              >
                <option value="low">Low Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="high">High Priority</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              onClick={onCancel}
              className="flex-1 py-3 rounded-lg font-medium bd-glass-control--secondary"
              type="button"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!claimFormData.policyNumber || !claimFormData.incidentDate}
              className="flex-1 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
              type="button"
            >
              Create Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
