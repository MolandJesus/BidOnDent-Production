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
        className="bd-dashboard-panel bd-dashboard-panel--accent-blue relative overflow-hidden p-5"
      >
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              className="bd-dashboard-secondary-button bd-dashboard-secondary-button--compact flex h-11 w-11 items-center justify-center rounded-lg"
              onClick={onBack}
              aria-label="Go back to dashboard"
            >
              <ArrowLeft className={`h-4 w-4 ${isLight ? "text-blue-600" : "text-blue-100"}`} />
            </button>
          )}
          <div className="flex-1">
            <p className="bd-section-eyebrow mb-1.5">Bid Queue</p>
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
        className="bd-dashboard-panel bd-dashboard-panel--deep p-5 text-center sm:p-6"
      >
        <div className="bd-dashboard-note bd-dashboard-note--deep mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full">
          <Clock className={`h-6 w-6 ${isLight ? "text-blue-500" : "text-blue-200"}`} />
        </div>
        <div className="mb-3 flex justify-center">
          <span
            className={`bd-dashboard-chip px-2.5 py-1 text-[11px] font-medium ${
              isLight ? "bg-white/85 text-blue-700" : "border-blue-200/18 bg-white/10 text-blue-50"
            }`}
          >
            Awaiting responses
          </span>
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
            className="bd-dashboard-primary-button mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
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
