import { useEffect } from "react";
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

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        aria-labelledby="payment-modal-title"
        aria-modal="true"
        className={`bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto${isLight ? " bd-light-surface" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            id="payment-modal-title"
          >
            Payment Preview
          </h2>
          <button
            aria-label="Close payment preview"
            className={`transition-colors ${isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-slate-300"}`}
            onClick={onClose}
            type="button"
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
              Billing tools are coming soon
            </p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Saved cards, bank details, and payout setup are not wired in this screen yet.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bd-glass-control--secondary px-4 py-2" onClick={onClose} type="button">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
