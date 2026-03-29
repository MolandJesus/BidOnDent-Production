import { CreditCard, X } from "lucide-react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function PaymentModal({
  isOpen,
  onClose,
  appearanceMode = "map-dark",
}: PaymentModalProps) {
  const isLight = appearanceMode === "light";
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto${isLight ? " bd-light-surface" : ""}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            Payment Methods
          </h2>
          <button
            className={`transition-colors ${isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-slate-300"}`}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div
            className={`border rounded-lg p-4 text-center ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.04] border-slate-700/30"}`}
          >
            <CreditCard
              className={`w-8 h-8 mx-auto mb-2 ${isLight ? "text-slate-400" : "text-slate-500"}`}
            />
            <p className={`font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}>
              Payment methods coming soon
            </p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Secure payment integration is in development.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bd-glass-control--secondary px-4 py-2" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
