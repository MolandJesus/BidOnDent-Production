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
      <div className={`bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto${isLight ? " bd-light-surface" : ""}`}>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment Methods</h2>
          <button
            className={`transition-colors ${isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-slate-300"}`}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div
            className={`border rounded-lg p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.04] border-slate-700/30"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Expires 12/25
                  </p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:underline">Remove</button>
            </div>
          </div>

          <div
            className={`border rounded-lg p-4 ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.04] border-slate-700/30"}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-slate-400" />
                <div>
                  <p className="font-medium">•••• •••• •••• 1234</p>
                  <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                    Expires 08/26
                  </p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:underline">Remove</button>
            </div>
          </div>

          <button
            className={`bd-glass-control--utility w-full py-3 border-2 border-dashed rounded-lg ${isLight ? "border-slate-300/60" : "border-white/[0.10]/60"}`}
            onClick={() => alert("Add new payment method clicked!")}
          >
            + Add New Payment Method
          </button>
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
