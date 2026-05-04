/**
 * ShopBidModal.tsx — Bid submission modal for shop repair requests.
 *
 * Extracted from ShopRequestsScreen. Full-screen overlay with bid amount,
 * estimated days, description fields, and summary card.
 */
import type { RepairRequest } from "./ShopRequestCard";

type ShopBidModalProps = {
  request: RepairRequest;
  isLight: boolean;
  primaryColor: string;
  bidAmount: string;
  estimatedDays: string;
  bidDescription: string;
  isSubmitting?: boolean;
  error?: string | null;
  onBidAmountChange: (value: string) => void;
  onEstimatedDaysChange: (value: string) => void;
  onBidDescriptionChange: (value: string) => void;
  onSubmit: () => void;
  onClose: () => void;
};

export default function ShopBidModal({
  request,
  isLight,
  primaryColor,
  bidAmount,
  estimatedDays,
  bidDescription,
  isSubmitting = false,
  error,
  onBidAmountChange,
  onEstimatedDaysChange,
  onBidDescriptionChange,
  onSubmit,
  onClose,
}: ShopBidModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
      <div
        className={`rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden border ${isLight ? "bg-white border-slate-200/60 shadow-xl" : "border-blue-300/20"}`}
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
        <div className="p-6">
          <h2 className={`text-xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            Submit Bid
          </h2>
          <p className={`text-sm mb-4 ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>
            {request.vehicle} - {request.damageType}
          </p>

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}
            >
              Bid Amount
            </label>
            <div className="relative">
              <span
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 font-medium ${isLight ? "text-slate-500" : "text-blue-200/60"}`}
              >
                $
              </span>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => onBidAmountChange(e.target.value)}
                placeholder="0.00"
                className={`w-full pl-8 pr-4 py-3 border rounded-xl text-lg outline-none transition-colors ${isLight ? "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(232,238,248,0.92),rgba(247,232,194,0.86))] text-slate-800 placeholder:text-slate-400 focus:border-blue-500/60 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "border-[rgba(96,165,250,0.20)] bg-[linear-gradient(180deg,rgba(15,23,42,0.74),rgba(8,16,33,0.78))] text-slate-100 placeholder:text-blue-200/40 focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 shadow-[inset_0_1px_0_rgba(196,144,65,0.16),inset_0_-1px_0_rgba(140,82,22,0.16)]"}`}
                step="0.01"
                min="0"
              />
            </div>
            <p className={`text-xs mt-2 ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>
              Enter your competitive bid for this repair job
            </p>
          </div>

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}
            >
              Estimated Days to Complete
            </label>
            <input
              type="number"
              value={estimatedDays}
              onChange={(e) => onEstimatedDaysChange(e.target.value)}
              placeholder="e.g. 3"
              className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors ${isLight ? "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(232,238,248,0.92),rgba(247,232,194,0.86))] text-slate-800 placeholder:text-slate-400 focus:border-blue-500/60 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "border-[rgba(96,165,250,0.20)] bg-[linear-gradient(180deg,rgba(15,23,42,0.74),rgba(8,16,33,0.78))] text-slate-100 placeholder:text-blue-200/40 focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 shadow-[inset_0_1px_0_rgba(196,144,65,0.16),inset_0_-1px_0_rgba(140,82,22,0.16)]"}`}
              min="1"
              max="90"
            />
          </div>

          <div className="mb-4">
            <label
              className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}
            >
              Description (optional)
            </label>
            <textarea
              value={bidDescription}
              onChange={(e) => onBidDescriptionChange(e.target.value)}
              placeholder="Describe your repair approach, parts needed, etc."
              className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors resize-none ${isLight ? "border-[rgba(140,82,22,0.26)] bg-[linear-gradient(180deg,rgba(232,238,248,0.92),rgba(247,232,194,0.86))] text-slate-800 placeholder:text-slate-400 focus:border-blue-500/60 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)]" : "border-[rgba(96,165,250,0.20)] bg-[linear-gradient(180deg,rgba(15,23,42,0.74),rgba(8,16,33,0.78))] text-slate-100 placeholder:text-blue-200/40 focus:border-blue-400/60 focus:ring-1 focus:ring-blue-400/30 shadow-[inset_0_1px_0_rgba(196,144,65,0.16),inset_0_-1px_0_rgba(140,82,22,0.16)]"}`}
              rows={3}
              maxLength={500}
            />
          </div>

          <div
            className={`mb-4 p-3 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-blue-300/15"}`}
          >
            <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
              <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Customer:</strong>{" "}
              {request.customerName}
            </p>
            <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
              <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Location:</strong>{" "}
              {request.location}
            </p>
            {request.insuranceClaim && (
              <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                <strong className={isLight ? "text-slate-900" : "text-slate-200"}>
                  Insurance:
                </strong>{" "}
                {request.insuranceCompany}
              </p>
            )}
          </div>

          {error && (
            <p
              className={`text-sm text-center mb-3 ${isLight ? "text-rose-600" : "text-rose-400"}`}
            >
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className={`flex-1 py-3 min-h-[44px] rounded-xl font-medium transition-colors ${isLight ? "text-slate-700 border border-slate-200 hover:bg-slate-50" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={
                isSubmitting ||
                !bidAmount ||
                parseFloat(bidAmount) <= 0 ||
                !estimatedDays ||
                parseInt(estimatedDays, 10) <= 0
              }
              className="bd-dashboard-primary-button flex-1 py-3 min-h-[44px] text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
              }}
            >
              {isSubmitting ? "Submitting..." : "Submit Bid"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
