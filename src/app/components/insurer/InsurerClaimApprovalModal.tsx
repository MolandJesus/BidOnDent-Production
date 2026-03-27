import { type ClaimData } from "./insurerClaimsUtils";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type InsurerClaimApprovalModalProps = {
  selectedClaim: ClaimData;
  approvalAmount: string;
  primaryColor: string;
  onApprovalAmountChange: (value: string) => void;
  onApprove: () => void;
  onCancel: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function InsurerClaimApprovalModal({
  selectedClaim,
  approvalAmount,
  primaryColor,
  onApprovalAmountChange,
  onApprove,
  onCancel,
  appearanceMode = "map-dark",
}: InsurerClaimApprovalModalProps) {
  const isLight = appearanceMode === "light";
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div
        className={`rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden border ${
          isLight ? "bg-white border-slate-200/60 shadow-xl" : "border-blue-300/20"
        }`}
        style={
          isLight
            ? {}
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.95) 0%, rgba(8, 18, 38, 0.92) 100%)",
                boxShadow: "0 20px 60px rgba(3, 10, 24, 0.60)",
              }
        }
      >
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-2 text-slate-100">Review & Approve Claim</h2>
          <p className="text-sm text-blue-100/75 mb-4">
            {selectedClaim.claimNumber} - {selectedClaim.customerName}
          </p>

          <div className="mb-4 p-4 bg-white/5 rounded-xl border border-blue-300/15">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-blue-200/60">Vehicle</p>
                <p className="font-medium text-slate-200">{selectedClaim.vehicle}</p>
              </div>
              <div>
                <p className="text-blue-200/60">Policy #</p>
                <p className="font-medium text-slate-200">{selectedClaim.policyNumber}</p>
              </div>
              <div>
                <p className="text-blue-200/60">Incident Date</p>
                <p className="font-medium text-slate-200">{selectedClaim.incidentDate}</p>
              </div>
              <div>
                <p className="text-blue-200/60">Est. Damage</p>
                <p className="font-medium text-slate-200">
                  ${selectedClaim.estimatedDamage.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}
            >
              Approved Amount
            </label>
            <div className="relative">
              <span
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 font-medium ${
                  isLight ? "text-slate-400" : "text-blue-200/60"
                }`}
              >
                $
              </span>
              <input
                type="number"
                value={approvalAmount}
                onChange={(e) => onApprovalAmountChange(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-3 rounded-xl border text-lg outline-none transition-colors ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60"
                    : "border-blue-300/20 bg-white/[0.08] text-slate-100 placeholder:text-blue-200/40 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20"
                }`}
                step="0.01"
                min="0"
              />
            </div>
            <p className={`text-xs mt-2 ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>
              Adjust the approved amount based on shop bids and policy coverage
            </p>
          </div>

          {selectedClaim.shopBids && selectedClaim.shopBids.length > 0 && (
            <div
              className={`mb-4 p-3 rounded-xl border ${
                isLight ? "bg-blue-50/60 border-blue-200/40" : "bg-blue-500/10 border-blue-400/20"
              }`}
            >
              <p
                className={`text-sm font-medium mb-2 ${isLight ? "text-blue-600" : "text-blue-200"}`}
              >
                Recommended Shops:
              </p>
              <div className="space-y-1">
                {selectedClaim.shopBids.slice(0, 3).map((bid, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className={isLight ? "text-slate-700" : "text-blue-100/80"}>
                      {bid.shopName}
                    </span>
                    <span
                      className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}
                    >
                      ${bid.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className={`flex-1 py-3 min-h-[44px] rounded-xl font-medium transition-colors ${
                isLight
                  ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                  : "text-blue-100/80 bg-white/[0.08] border border-blue-300/15 hover:bg-white/[0.12]"
              }`}
            >
              Cancel
            </button>
            <button
              onClick={onApprove}
              disabled={!approvalAmount || parseFloat(approvalAmount) <= 0}
              className="flex-1 py-3 min-h-[44px] rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
            >
              Approve Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
