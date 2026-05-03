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
  const statToneClasses = [
    "bd-dashboard-section--accent-blue",
    "bd-dashboard-section--deep",
    "bd-dashboard-section--accent-blue",
  ];

  const stats =
    bidCount <= 1
      ? [
          { label: "Bid Amount", value: `$${lowestPrice.toLocaleString()}` },
          { label: "Fastest Timeline", value: `${fastestBidDays}-${fastestBidDays + 1} days` },
        ]
      : [
          { label: "Lowest Bid", value: `$${lowestPrice.toLocaleString()}` },
          { label: "Average Quote", value: `$${averagePrice.toLocaleString()}` },
          { label: "Fastest Timeline", value: `${fastestBidDays}-${fastestBidDays + 1} days` },
        ];

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bd-dashboard-panel bd-dashboard-panel--accent-blue relative overflow-hidden p-4 md:p-5"
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
      <div className="flex items-start gap-3 sm:items-center">
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
          <p className="bd-section-eyebrow mb-1.5">Bid Comparison</p>
          <h1
            className={`text-xl font-semibold sm:text-2xl ${isLight ? "text-slate-800" : "text-slate-100"}`}
          >
            Repair Bids
          </h1>
          <p className={isLight ? "text-slate-500" : "text-blue-100/80"}>
            {bidCount} bid{bidCount === 1 ? "" : "s"} for {vehicleLabel}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2 md:hidden">
            <div className="bd-dashboard-chip rounded-full px-2.5 py-1 text-xs font-medium">
              <Sparkles className="h-3.5 w-3.5" />
              Compare first
            </div>
            <div
              className={`bd-dashboard-chip rounded-full px-2.5 py-1 text-xs font-medium ${
                isLight
                  ? "border border-blue-200/55 bg-blue-50/85 text-blue-700"
                  : "border-blue-200/18 bg-white/10 text-blue-50"
              }`}
            >
              {bidCount} offers
            </div>
          </div>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          <div className="bd-dashboard-chip items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            Compare before accepting
          </div>
          <div
            className={`bd-dashboard-chip rounded-full px-3 py-1.5 text-sm font-medium ${
              isLight
                ? "border border-blue-200/55 bg-blue-50/85 text-blue-700"
                : "border-blue-200/18 bg-white/10 text-blue-50"
            }`}
          >
            {bidCount} offers
          </div>
        </div>
      </div>

      <div
        className={`mt-4 grid grid-cols-1 gap-2.5 ${stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
      >
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={`bd-dashboard-section rounded-xl px-3 py-2.5 ${
              statToneClasses[index % statToneClasses.length]
            }`}
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
