import { CheckCircle, Mail, X } from "lucide-react";
import { useState } from "react";
import type { DashboardAppearanceMode } from "../../../routers/dashboard-router-types";

type HelpModalProps = {
  isOpen: boolean;
  primaryColor: string;
  onClose: () => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function HelpModal({
  isOpen,
  primaryColor,
  onClose,
  appearanceMode = "map-dark",
}: HelpModalProps) {
  const isLight = appearanceMode === "light";
  const [sent, setSent] = useState(false);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div
        className={`bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto${isLight ? " bd-light-surface" : ""}`}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            Help & Support
          </h2>
          <button
            className={`transition-colors ${isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-slate-200"}`}
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div
            className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
          >
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Contact Support
            </h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Mail className={`w-4 h-4 ${isLight ? "text-slate-500" : "text-slate-400"}`} />
                <span className={isLight ? "text-slate-700" : "text-slate-300"}>
                  bidondent@gmail.com
                </span>
              </p>
            </div>
          </div>

          <div
            className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
          >
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              <button
                className={`w-full text-left text-sm hover:underline ${isLight ? "text-blue-600" : "text-blue-400"}`}
              >
                How do I submit a damage report?
              </button>
              <button
                className={`w-full text-left text-sm hover:underline ${isLight ? "text-blue-600" : "text-blue-400"}`}
              >
                How long does it take to receive bids?
              </button>
              <button
                className={`w-full text-left text-sm hover:underline ${isLight ? "text-blue-600" : "text-blue-400"}`}
              >
                Can I cancel my account?
              </button>
              <button
                className={`w-full text-left text-sm hover:underline ${isLight ? "text-blue-600" : "text-blue-400"}`}
              >
                How do I update my payment method?
              </button>
            </div>
          </div>

          <div>
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Send us a message
            </h3>
            <textarea
              placeholder="Describe your issue..."
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400" : "border-white/[0.12] bg-white/[0.04] text-slate-100 placeholder:text-slate-500"}`}
              rows={4}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="bd-glass-control--secondary px-4 py-2" onClick={onClose}>
            Close
          </button>
          <button
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: primaryColor }}
            onClick={() => {
              setSent(true);
              setTimeout(() => {
                setSent(false);
                onClose();
              }, 1500);
            }}
            disabled={sent}
          >
            {sent ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Sent!
              </span>
            ) : (
              "Send Message"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
