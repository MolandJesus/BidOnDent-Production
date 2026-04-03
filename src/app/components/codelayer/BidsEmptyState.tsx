import { motion } from "motion/react";
import { ArrowLeft, Clock } from "lucide-react";

type BidsEmptyStateProps = {
  isLight: boolean;
  userType: "customer" | "shop" | "insurer";
  primaryColor: string;
  onBack?: () => void;
  onStartReport?: () => void;
};

export default function BidsEmptyState({
  isLight,
  userType,
  primaryColor,
  onBack,
  onStartReport,
}: BidsEmptyStateProps) {
  return (
    <div className="pb-20 px-4 md:px-6 py-4 md:py-5 space-y-4">
      <motion.section
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative overflow-hidden bd-glass-card p-5${isLight ? " bd-light-surface" : ""}`}
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.88) 100%)"
            : "linear-gradient(180deg, rgba(11, 23, 47, 0.86) 0%, rgba(8, 18, 38, 0.82) 100%)",
          borderColor: isLight ? "rgba(148,163,184,0.30)" : "rgba(96, 165, 250, 0.24)",
        }}
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              className={`h-11 w-11 flex items-center justify-center rounded-xl transition-colors ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
              onClick={onBack}
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className={`w-5 h-5 ${isLight ? "text-blue-600" : "text-blue-100"}`} />
            </button>
          )}
          <div className="flex-1">
            <h1
              className={`font-semibold text-2xl ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              Repair Bids
            </h1>
            <p className={isLight ? "text-slate-500" : "text-blue-100/80"}>
              {userType === "shop"
                ? "No active bids from your shop yet."
                : userType === "insurer"
                  ? "No bids on connected claims yet."
                  : "No live bids have been submitted for your reports yet."}
            </p>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className={`bd-glass-card p-5 sm:p-6 text-center${isLight ? " bd-light-surface" : ""}`}
        style={{
          background: isLight
            ? "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(241,245,249,0.84) 100%)"
            : "linear-gradient(180deg, rgba(11, 23, 47, 0.80) 0%, rgba(8, 18, 38, 0.76) 100%)",
          borderColor: isLight ? "rgba(148,163,184,0.25)" : "rgba(96, 165, 250, 0.20)",
        }}
      >
        <div
          className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full border ${
            isLight ? "bg-blue-50 border-blue-200/50" : "bg-blue-400/15 border-blue-300/20"
          }`}
        >
          <Clock className={`h-6 w-6 ${isLight ? "text-blue-500" : "text-blue-200"}`} />
        </div>
        <h2 className={`text-lg font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
          {userType === "shop"
            ? "No bids placed yet"
            : userType === "insurer"
              ? "No claims with active bids"
              : "Waiting for shop responses"}
        </h2>
        <p
          className={`mt-2 text-sm leading-relaxed max-w-sm mx-auto ${isLight ? "text-slate-500" : "text-blue-100/80"}`}
        >
          {userType === "shop"
            ? "When customers submit damage reports near your shop, you'll see them here and can send competitive bids."
            : userType === "insurer"
              ? "Bids on claims connected to your network will appear here for review."
              : "Once you submit a damage report, nearby shops will review it and send competitive bids. Most shops respond within 24 hours."}
        </p>
        {userType === "customer" && onStartReport && (
          <button
            onClick={onStartReport}
            className="mt-4 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 min-h-[44px] text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)`,
            }}
          >
            Submit a Report
          </button>
        )}
      </motion.section>
    </div>
  );
}
