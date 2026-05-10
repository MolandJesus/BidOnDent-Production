import { useMemo } from "react";
import { DollarSign, Clock, CheckCircle2, XCircle } from "lucide-react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { Bid } from "../../types";

type ShopBidsSummaryProps = {
  bids: Bid[];
  appearanceMode?: DashboardAppearanceMode;
  onViewJobs?: () => void;
};

export default function ShopBidsSummary({
  bids,
  appearanceMode = "map-dark",
  onViewJobs,
}: ShopBidsSummaryProps) {
  const isLight = appearanceMode === "light";

  const { pending, accepted, rejected, recentBids } = useMemo(() => {
    let p = 0;
    let a = 0;
    let r = 0;
    for (const b of bids) {
      if (b.status === "pending") p++;
      else if (b.status === "accepted") a++;
      else if (b.status === "rejected") r++;
    }
    const sorted = [...bids].sort((x, y) => {
      const xd = Date.parse(x.createdAt || "");
      const yd = Date.parse(y.createdAt || "");
      return yd - xd;
    });
    return { pending: p, accepted: a, rejected: r, recentBids: sorted.slice(0, 3) };
  }, [bids]);

  if (bids.length === 0) return null;

  const statusBadges: Array<{
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bgColor: string;
  }> = [
    {
      label: "Pending",
      count: pending,
      icon: Clock,
      color: isLight ? "text-amber-600" : "text-amber-400",
      bgColor: isLight ? "bg-amber-50" : "bg-amber-500/10",
    },
    {
      label: "Accepted",
      count: accepted,
      icon: CheckCircle2,
      color: isLight ? "text-green-600" : "text-green-400",
      bgColor: isLight ? "bg-green-50" : "bg-green-500/10",
    },
    {
      label: "Rejected",
      count: rejected,
      icon: XCircle,
      color: isLight ? "text-slate-500" : "text-slate-400",
      bgColor: isLight ? "bg-slate-50" : "bg-slate-500/10",
    },
  ];

  return (
    <section
      className={`bd-glass-card overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-400 motion-reduce:animate-none${isLight ? " bd-light-surface" : ""}`}
      style={
        isLight
          ? {
              borderColor: "rgba(148, 163, 184, 0.22)",
              boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
            }
          : {
              borderColor: "rgba(96, 165, 250, 0.16)",
              boxShadow: "0 4px 20px rgba(3, 10, 24, 0.35)",
            }
      }
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2 md:px-5">
        <div className="flex items-center gap-2">
          <DollarSign className={`w-4 h-4 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
          <h3 className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}>
            My Submitted Bids
          </h3>
          <span
            className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${isLight ? "bg-blue-50 text-blue-600" : "bg-blue-500/15 text-blue-300"}`}
          >
            {bids.length}
          </span>
        </div>
        {onViewJobs && (
          <button
            type="button"
            onClick={onViewJobs}
            className={`text-xs font-medium transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${isLight ? "text-blue-600 hover:text-blue-700" : "text-blue-400 hover:text-blue-300"}`}
          >
            View Jobs →
          </button>
        )}
      </div>

      {/* Status badges row */}
      <div className="flex gap-2 px-4 pb-3 md:px-5">
        {statusBadges.map((badge) => (
          <div
            key={badge.label}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${badge.bgColor}`}
          >
            <badge.icon className={`w-3.5 h-3.5 ${badge.color}`} />
            <span className={`text-xs font-medium ${badge.color}`}>
              {badge.count} {badge.label}
            </span>
          </div>
        ))}
      </div>

      {/* Recent bids list */}
      {recentBids.length > 0 && (
        <div className={`border-t ${isLight ? "border-slate-100" : "border-white/5"}`}>
          {recentBids.map((bid, index) => {
            const statusColor =
              bid.status === "accepted"
                ? isLight
                  ? "text-green-600"
                  : "text-green-400"
                : bid.status === "rejected"
                  ? isLight
                    ? "text-slate-400"
                    : "text-slate-500"
                  : isLight
                    ? "text-amber-600"
                    : "text-amber-400";

            return (
              <div
                key={bid.id || index}
                className={`flex items-center justify-between px-4 py-2.5 md:px-5 ${
                  index < recentBids.length - 1
                    ? isLight
                      ? "border-b border-slate-50"
                      : "border-b border-white/5"
                    : ""
                }`}
              >
                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span
                    className={`text-sm font-medium truncate ${isLight ? "text-slate-700" : "text-slate-200"}`}
                  >
                    ${bid.amount.toLocaleString()}
                    <span
                      className={`text-xs ml-1 ${isLight ? "text-slate-400" : "text-slate-500"}`}
                    >
                      · {bid.estimatedDays}d
                    </span>
                  </span>
                  {bid.description && (
                    <span
                      className={`text-xs truncate ${isLight ? "text-slate-400" : "text-slate-500"}`}
                    >
                      {bid.description}
                    </span>
                  )}
                </div>
                <span className={`text-xs font-medium capitalize shrink-0 ml-2 ${statusColor}`}>
                  {bid.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
