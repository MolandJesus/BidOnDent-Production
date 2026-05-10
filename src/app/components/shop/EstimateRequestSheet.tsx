import { useState, useCallback } from "react";
import { Clock, FileText, MapPin, Send, X } from "lucide-react";
import { cn } from "@/platform-core/cn";
import type { ShopMapListing } from "../../services/intelligence/shopMapExperience";

type EstimateRequestSheetProps = {
  shop: ShopMapListing | null;
  onClose: () => void;
  onSubmit: (shopId: number, description: string, timeline: string) => void;
  isSubmitting?: boolean;
  error?: string | null;
  isDark?: boolean;
};

const TIMELINE_OPTIONS = [
  { value: "urgent", label: "ASAP" },
  { value: "this-week", label: "This week" },
  { value: "flexible", label: "Flexible" },
] as const;

export default function EstimateRequestSheet({
  shop,
  onClose,
  onSubmit,
  isSubmitting = false,
  error,
  isDark = true,
}: EstimateRequestSheetProps) {
  const [description, setDescription] = useState("");
  const [timeline, setTimeline] = useState<string>("flexible");

  const handleSubmit = useCallback(() => {
    if (!shop || !description.trim()) return;
    onSubmit(shop.id, description.trim(), timeline);
  }, [shop, description, timeline, onSubmit]);

  if (!shop) return null;

  const canSubmit = !isSubmitting && description.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200 motion-reduce:animate-none"
        onClick={onClose}
        role="presentation"
      />

      {/* Sheet */}
      <div
        className={cn(
          "relative z-10 w-full max-w-lg rounded-t-2xl p-6 pb-[max(2rem,env(safe-area-inset-bottom))] animate-in slide-in-from-bottom-4 duration-300 motion-reduce:animate-none",
          isDark
            ? "bg-[linear-gradient(180deg,rgba(15,23,42,0.92),rgba(8,16,33,0.94))] border-t border-[rgba(96,165,250,0.20)] shadow-[inset_0_1px_0_rgba(196,144,65,0.22),inset_0_-1px_0_rgba(140,82,22,0.20),0_0_0_1px_rgba(96,165,250,0.16),0_-22px_56px_rgba(2,6,23,0.46),0_0_56px_rgba(196,130,45,0.14)]"
            : "bg-[linear-gradient(180deg,rgba(247,232,194,0.94),rgba(232,238,248,0.90))] border-t border-[rgba(140,82,22,0.30)] shadow-[inset_0_1px_0_rgba(252,240,208,0.85),0_-18px_46px_rgba(15,23,42,0.14),0_0_0_1px_rgba(140,82,22,0.18)]"
        )}
      >
        {/* Drag handle */}
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-slate-500/40" />

        {/* Header */}
        <div className="mb-5 flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <h3 className={cn("text-lg font-bold", isDark ? "text-blue-200" : "text-slate-800")}>
              Request Estimate
            </h3>
            <div className="mt-1 flex items-center gap-1.5">
              <MapPin
                className={cn("h-3.5 w-3.5 shrink-0", isDark ? "text-slate-400" : "text-slate-500")}
              />
              <p className={cn("truncate text-sm", isDark ? "text-slate-400" : "text-slate-500")}>
                {shop.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close estimate request"
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
          {/* Description */}
          <div>
            <label
              className={cn(
                "mb-1.5 flex items-center gap-1.5 text-sm font-medium",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              <FileText className="h-4 w-4" />
              Describe the damage
            </label>
            <textarea
              placeholder="e.g. Rear bumper dent from parking lot, paint scratched on driver side door…"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className={cn(
                "w-full resize-none rounded-xl py-3 px-3 text-sm transition-colors outline-none",
                isDark
                  ? "bg-white/5 border border-blue-400/20 text-white placeholder:text-slate-500 focus:border-blue-400/50 focus:bg-white/8"
                  : "bg-[linear-gradient(180deg,rgba(232,238,248,0.86),rgba(247,232,194,0.80))] border border-[rgba(140,82,22,0.26)] text-slate-900 placeholder:text-slate-400 shadow-[inset_0_1px_0_rgba(252,240,208,0.78)] focus:border-blue-500 focus:bg-[linear-gradient(180deg,rgba(232,238,248,0.94),rgba(247,232,194,0.88))]"
              )}
            />
          </div>

          {/* Timeline */}
          <div>
            <label
              className={cn(
                "mb-1.5 flex items-center gap-1.5 text-sm font-medium",
                isDark ? "text-slate-300" : "text-slate-600"
              )}
            >
              <Clock className="h-4 w-4" />
              Preferred timeline
            </label>
            <div className="flex gap-2">
              {TIMELINE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setTimeline(opt.value)}
                  className={cn(
                    "flex-1 rounded-xl py-2.5 text-sm font-semibold transition-colors min-h-[44px]",
                    timeline === opt.value
                      ? isDark
                        ? "bg-blue-500/25 border border-blue-400/40 text-blue-200"
                        : "bg-blue-50 border border-blue-400/40 text-blue-700"
                      : isDark
                        ? "bg-white/5 border border-blue-400/15 text-slate-400 hover:bg-white/8"
                        : "bg-slate-50 border border-slate-200 text-slate-500 hover:bg-slate-100"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
        <button
          type="button"
          disabled={!canSubmit}
          onClick={handleSubmit}
          className={cn(
            "mt-5 flex w-full items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-colors min-h-[48px]",
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
          {isSubmitting ? "Sending…" : "Request Estimate"}
        </button>
      </div>
    </div>
  );
}
