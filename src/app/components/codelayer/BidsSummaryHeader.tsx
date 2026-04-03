import { motion } from "motion/react";
import { ArrowLeft, Sparkles } from "lucide-react";

type BidsSummaryHeaderProps = {
  isLight: boolean;
  bidCount: number;
  vehicleLabel: string;
  lowestPrice: number;
  averagePrice: number;
  fastestBidDays: number;
  onBack?: () => void;
};

export default function BidsSummaryHeader({
  isLight,
  bidCount,
  vehicleLabel,
  lowestPrice,
  averagePrice,
  fastestBidDays,
  onBack,
}: BidsSummaryHeaderProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="relative overflow-hidden bd-glass-card p-4 md:p-5"
      style={{
        background: isLight
          ? "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(241,245,249,0.88) 100%)"
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.84) 0%, rgba(8, 18, 38, 0.80) 100%)",
        borderColor: isLight ? "rgba(148,163,184,0.30)" : "rgba(96, 165, 250, 0.24)",
      }}
    >
      <div
        className="pointer-events-none absolute -top-10 -right-10 h-36 w-36 rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(37,99,235,0.08) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full"
        style={{
          background: isLight
            ? "radial-gradient(circle, rgba(99,102,241,0.06) 0%, transparent 70%)"
            : "radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)",
        }}
      />
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
          <h1 className={`font-semibold text-2xl ${isLight ? "text-slate-800" : "text-slate-100"}`}>
            Repair Bids
          </h1>
          <p className={isLight ? "text-slate-500" : "text-blue-100/80"}>
            {bidCount} bid{bidCount === 1 ? "" : "s"} for {vehicleLabel}
          </p>
        </div>
        <div
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border ${
            isLight
              ? "bg-blue-50 text-blue-700 border-blue-200/50"
              : "bg-blue-400/12 text-blue-100 border-blue-300/20"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Compare before accepting
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {(
          [
            { label: "Lowest Bid", value: `$${lowestPrice.toLocaleString()}` },
            { label: "Average Quote", value: `$${averagePrice.toLocaleString()}` },
            { label: "Fastest Timeline", value: `${fastestBidDays}-${fastestBidDays + 1} days` },
          ] as const
        ).map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl px-3 py-2.5 border ${
              isLight ? "bg-white/70 border-slate-200/50" : "bg-slate-900/25 border-blue-300/18"
            }`}
            style={isLight ? {} : { boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }}
          >
            <p
              className={`text-xs uppercase tracking-wide ${isLight ? "text-slate-500" : "text-blue-200/70"}`}
            >
              {stat.label}
            </p>
            <p
              className={`mt-1 text-xl font-bold tabular-nums ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>
    </motion.section>
  );
}
