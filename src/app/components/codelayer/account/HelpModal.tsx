import { CheckCircle, Mail, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!isOpen || typeof document === "undefined") {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    setSent(false);

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

  const handleOpenEmailDraft = () => {
    const body = message.trim()
      ? `${message.trim()}\n\n---\nSent from the BidOnDent help modal.`
      : "Hi BidOnDent support,\n\nI need help with:";

    if (typeof window !== "undefined") {
      window.location.href = `mailto:bidondent@gmail.com?subject=${encodeURIComponent("BidOnDent support request")}&body=${encodeURIComponent(body)}`;
    }

    setSent(true);
    window.setTimeout(() => setSent(false), 1500);
  };

  if (!isOpen) return null;

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
        aria-labelledby="help-modal-title"
        aria-modal="true"
        className={`bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto${isLight ? " bd-light-surface" : ""}`}
        onMouseDown={(event) => event.stopPropagation()}
        role="dialog"
      >
        <div className="flex justify-between items-center mb-4">
          <h2
            className={`text-xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}
            id="help-modal-title"
          >
            Help & Support
          </h2>
          <button
            aria-label="Close help and support"
            className={`transition-colors ${isLight ? "text-slate-500 hover:text-slate-700" : "text-slate-400 hover:text-slate-200"}`}
            onClick={onClose}
            type="button"
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
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Direct email is the active support channel right now.
              </p>
            </div>
          </div>

          <div
            className={`border-b pb-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
          >
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Frequently Asked Questions
            </h3>
            <ul
              className={`space-y-2 text-sm list-disc pl-5 ${isLight ? "text-slate-700" : "text-slate-300"}`}
            >
              <li>How do I submit a damage report?</li>
              <li>How long does it take to receive bids?</li>
              <li>Can I cancel my account?</li>
              <li>How do I update my payment method?</li>
            </ul>
            <p className={`mt-2 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Help articles are still being wired. Email support about any of these topics today.
            </p>
          </div>

          <div>
            <h3 className={`font-semibold mb-2 ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              Draft a support email
            </h3>
            <textarea
              placeholder="Describe your issue..."
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              className={`w-full p-2 border rounded ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400" : "border-white/[0.12] bg-white/[0.04] text-slate-100 placeholder:text-slate-500"}`}
              rows={4}
            />
            <p className={`mt-2 text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              This opens your email app with the draft filled in. It does not send from inside
              BidOnDent yet.
            </p>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="bd-glass-control--secondary px-4 py-2" onClick={onClose} type="button">
            Close
          </button>
          <button
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: primaryColor }}
            onClick={handleOpenEmailDraft}
            disabled={sent}
            type="button"
          >
            {sent ? (
              <span className="inline-flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4" /> Draft Opened
              </span>
            ) : (
              "Open Email Draft"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
