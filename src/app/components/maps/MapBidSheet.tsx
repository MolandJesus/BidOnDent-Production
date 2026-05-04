import { useState, useCallback, useMemo } from "react";
import { DollarSign, Clock, FileText, X, Send } from "lucide-react";
import { cn } from "../ui/utils";
import type { DamageReport } from "../../types";

/** Strip non-numeric characters except decimal point, return raw number string */
function sanitizeCurrencyInput(value: string): string {
  const cleaned = value.replace(/[^0-9.]/g, "");
  const parts = cleaned.split(".");
  if (parts.length <= 1) return cleaned;
  return parts[0] + "." + parts.slice(1).join("").slice(0, 2);
}

/** Format a numeric string as currency display (e.g. "1500" → "1,500") */
function formatAmountDisplay(raw: string): string {
  if (!raw || raw === ".") return "";
  const num = parseFloat(raw);
  if (isNaN(num)) return raw;
  const parts = raw.split(".");
  const intPart = Math.floor(Math.abs(num)).toLocaleString("en-US");
  if (parts.length > 1) return intPart + "." + (parts[1] ?? "");
  return intPart;
}

type MapBidSheetProps = {
  report: DamageReport | null;
  onClose: () => void;
  onSubmit: (
    reportId: string,
    bidAmount: number,
    estimatedDays: number,
    description: string
  ) => void;
  isSubmitting?: boolean;
  error?: string | null;
  isDark?: boolean;
};

export default function MapBidSheet({
  report,
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
  isDark = true,
}: MapBidSheetProps) {
  const [rawAmount, setRawAmount] = useState("");
  const [days, setDays] = useState("");
  const [description, setDescription] = useState("");

  const displayAmount = useMemo(() => formatAmountDisplay(rawAmount), [rawAmount]);
  const parsedAmount = rawAmount ? parseFloat(rawAmount) : 0;

  const handleAmountChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setRawAmount(sanitizeCurrencyInput(e.target.value));
  }, []);

  const handleSubmit = useCallback(() => {
    if (!report?.id || !rawAmount || !days) return;
    if (isNaN(parsedAmount) || parsedAmount <= 0) return;
    const parsedDays = parseInt(days, 10);
    if (isNaN(parsedDays) || parsedDays <= 0) return;
    onSubmit(report.id, parsedAmount, parsedDays, description.trim());
  }, [report?.id, rawAmount, parsedAmount, days, description, onSubmit]);

  if (!report) return null;

  const vehicleLabel = report.vehicleInfo?.make
    ? `${report.vehicleInfo?.year || ""} ${report.vehicleInfo.make} ${report.vehicleInfo?.model || ""}`.trim()
    : "Damage Report";
  const canSubmit =
    !isSubmitting &&
    rawAmount !== "" &&
    days !== "" &&
    Number.isFinite(parsedAmount) &&
    parsedAmount > 0 &&
    parseInt(days, 10) > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        role="presentation"
      />

      {/* Sheet */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-t-2xl p-6 pb-[max(2rem,env(safe-area-inset-bottom))]",
          isDark
            ? "bg-gradient-to-b from-slate-900/78 to-blue-950/72 border-t border-blue-400/20 backdrop-blur-xl backdrop-saturate-150 shadow-[0_-32px_90px_-16px_rgba(196,144,65,0.16),0_0_36px_rgba(196,130,45,0.10),0_0_60px_rgba(196,130,45,0.06),inset_0_1px_0_rgba(196,144,65,0.22)]"
            : "bg-gradient-to-b from-sky-50/84 via-blue-50/80 to-slate-50/76 border-t border-[rgba(140,82,22,0.32)] backdrop-blur-xl backdrop-saturate-150 shadow-[0_-28px_80px_-16px_rgba(196,144,65,0.18),0_0_32px_rgba(196,130,45,0.10),0_0_60px_rgba(196,130,45,0.06),inset_0_1px_0_rgba(252,240,208,0.92)]"
        )}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-500/40" />

        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className={cn("text-lg font-bold", isDark ? "text-blue-200" : "text-slate-800")}>
              Place Bid
            </h3>
            <p className={cn("mt-0.5 text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
              {vehicleLabel}
              {report.damageArea ? ` — ${report.damageArea}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              "rounded-full p-2 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center",
              isDark
                ? "text-slate-400 hover:text-white hover:bg-white/10"
                : "text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            )}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div
            className={cn(
              "mb-4 rounded-lg px-3 py-2 text-sm",
              isDark
                ? "bg-red-500/15 text-red-300 border border-red-400/25"
                : "bg-red-50 text-red-700 border border-red-200"
            )}
          >
            {error}
          </div>
        )}

        {/* Form fields */}
        <div className="space-y-4">
          {/* Bid amount */}
          <div>
            <label
              className={cn(
                "mb-1.5 flex items-center gap-1.5 text-sm font-medium",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              <DollarSign className="h-4 w-4" />
              Bid Amount
            </label>
            <div className="relative">
              <span
                className={cn(
                  "absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium",
                  isDark ? "text-slate-400" : "text-slate-500"
                )}
              >
                $
              </span>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={displayAmount}
                onChange={handleAmountChange}
                className={cn(
                  "w-full rounded-xl py-3 pl-8 pr-3 text-sm min-h-[44px] transition-colors outline-none",
                  isDark
                    ? "bg-white/5 border border-blue-400/20 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/8"
                    : "bg-blue-50/80 border border-sky-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-sky-50"
                )}
              />
            </div>
            {parsedAmount > 0 && (
              <p
                className={cn(
                  "mt-1.5 text-xs font-medium",
                  isDark ? "text-blue-300/70" : "text-blue-600/70"
                )}
              >
                Bid: $
                {parsedAmount.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}
              </p>
            )}
          </div>

          {/* Estimated days */}
          <div>
            <label
              className={cn(
                "mb-1.5 flex items-center gap-1.5 text-sm font-medium",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              <Clock className="h-4 w-4" />
              Estimated Days
            </label>
            <input
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              placeholder="e.g. 3"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className={cn(
                "w-full rounded-xl py-3 px-3 text-sm min-h-[44px] transition-colors outline-none",
                isDark
                  ? "bg-white/5 border border-blue-400/20 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/8"
                  : "bg-blue-50/80 border border-sky-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-sky-50"
              )}
            />
          </div>

          {/* Description */}
          <div>
            <label
              className={cn(
                "mb-1.5 flex items-center gap-1.5 text-sm font-medium",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              <FileText className="h-4 w-4" />
              Description{" "}
              <span className={isDark ? "text-slate-500" : "text-slate-400"}>(optional)</span>
            </label>
            <textarea
              placeholder="Describe your repair approach…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                "w-full resize-none rounded-xl py-3 px-3 text-sm transition-colors outline-none",
                isDark
                  ? "bg-white/5 border border-blue-400/20 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/8"
                  : "bg-blue-50/80 border border-sky-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-400 focus:bg-sky-50"
              )}
            />
          </div>
        </div>

        {/* Validation hint */}
        {!canSubmit && !isSubmitting && (rawAmount !== "" || days !== "") && (
          <p
            className={cn(
              "mt-4 text-xs text-center",
              isDark ? "text-amber-400/80" : "text-amber-600"
            )}
          >
            {rawAmount === "" && days === ""
              ? "Enter a bid amount and estimated days"
              : rawAmount === "" || !Number.isFinite(parsedAmount) || parsedAmount <= 0
                ? "Enter a bid amount greater than $0"
                : "Enter estimated days (1 or more)"}
          </p>
        )}

        {/* Submit */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={cn(
            "mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors min-h-[48px]",
            canSubmit
              ? isDark
                ? "bg-blue-500 text-white hover:bg-blue-400 active:bg-blue-600"
                : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800"
              : isDark
                ? "bg-white/5 text-slate-500 cursor-not-allowed"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
          )}
        >
          {isSubmitting ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
                className="opacity-25"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <Send className="h-4 w-4" />
          )}
          {isSubmitting ? "Submitting…" : "Submit Bid"}
        </button>
      </div>
    </div>
  );
}
