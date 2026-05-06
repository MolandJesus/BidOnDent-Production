import { useState } from "react";
import { XCircle } from "lucide-react";
import { type ClaimData } from "./insurerClaimsUtils";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type InsurerClaimDenialModalProps = {
  selectedClaim: ClaimData;
  primaryColor: string;
  onDeny: (reason: string) => void;
  onCancel: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

const DENIAL_REASONS = [
  "Insufficient documentation",
  "Outside policy coverage",
  "Pre-existing damage",
  "Policy lapsed or inactive",
  "Claim exceeds coverage limit",
];

export default function InsurerClaimDenialModal({
  selectedClaim,
  onDeny,
  onCancel,
  appearanceMode = "map-dark",
}: InsurerClaimDenialModalProps) {
  const isLight = appearanceMode === "light";
  const [selectedReason, setSelectedReason] = useState("");
  const [customReason, setCustomReason] = useState("");

  const finalReason = selectedReason === "custom" ? customReason : selectedReason;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div
        className={`rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden border ${
          isLight ? "bg-[#fffefa] border-slate-200/60 shadow-xl" : "border-blue-300/20"
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
          <div className="flex items-center gap-2 mb-2">
            <XCircle className="w-5 h-5 text-rose-400" />
            <h2 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Deny Claim
            </h2>
          </div>
          <p className={`text-sm mb-4 ${isLight ? "text-slate-500" : "text-blue-100/75"}`}>
            {selectedClaim.claimNumber} — {selectedClaim.customerName}
          </p>

          <div
            className={`mb-4 p-4 rounded-xl border ${
              isLight ? "bg-blue-50/60 border-blue-200/40" : "bg-white/5 border-blue-300/15"
            }`}
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className={isLight ? "text-slate-500" : "text-blue-200/60"}>Vehicle</p>
                <p className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  {selectedClaim.vehicle}
                </p>
              </div>
              <div>
                <p className={isLight ? "text-slate-500" : "text-blue-200/60"}>Est. Damage</p>
                <p className={`font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>
                  ${selectedClaim.estimatedDamage.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}
            >
              Reason for denial
            </label>
            <div className="space-y-2">
              {DENIAL_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  onClick={() => setSelectedReason(reason)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                    selectedReason === reason
                      ? isLight
                        ? "border-rose-400 bg-rose-50 text-rose-700"
                        : "border-rose-400/40 bg-rose-500/15 text-rose-200"
                      : isLight
                        ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                        : "border-blue-300/15 text-blue-100/80 hover:bg-white/[0.06]"
                  }`}
                >
                  {reason}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setSelectedReason("custom")}
                className={`w-full text-left px-3 py-2.5 rounded-xl border text-sm transition-colors ${
                  selectedReason === "custom"
                    ? isLight
                      ? "border-rose-400 bg-rose-50 text-rose-700"
                      : "border-rose-400/40 bg-rose-500/15 text-rose-200"
                    : isLight
                      ? "border-slate-200 text-slate-700 hover:bg-slate-50"
                      : "border-blue-300/15 text-blue-100/80 hover:bg-white/[0.06]"
                }`}
              >
                Other reason…
              </button>
            </div>
            {selectedReason === "custom" && (
              <textarea
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Describe the reason for denial…"
                rows={3}
                className={`w-full mt-2 px-3 py-2.5 rounded-xl border text-sm outline-none transition-colors resize-none ${
                  isLight
                    ? "border-slate-200 bg-[#fffefa] text-slate-800 placeholder:text-slate-400 focus:border-rose-400/60"
                    : "border-blue-300/20 bg-white/[0.08] text-slate-100 placeholder:text-blue-200/40 focus:border-rose-400/40"
                }`}
              />
            )}
          </div>

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
              onClick={() => onDeny(finalReason)}
              disabled={!finalReason.trim()}
              className="bd-dashboard-primary-button flex-1 py-3 min-h-[44px] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-rose-600 to-rose-500"
            >
              Deny Claim
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
