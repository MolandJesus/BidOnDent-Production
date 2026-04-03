import { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Inbox,
  Clock,
  Search,
  MessageSquare,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "../ui/utils";
import {
  STATUS_LABELS,
  TIMELINE_LABELS,
  timeAgo,
  type ShopEstimateInboxScreenProps,
} from "./shopEstimateInboxHelpers";

export default function ShopEstimateInboxScreen({
  estimateRequests,
  loading = false,
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
  onUpdateStatus,
}: ShopEstimateInboxScreenProps) {
  const isLight = appearanceMode === "light";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "viewed" | "responded" | "declined" | "accepted"
  >("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [responseMessages, setResponseMessages] = useState<Record<string, string>>({});

  const handleAction = async (reqId: string, status: "responded" | "declined") => {
    if (!onUpdateStatus || !reqId) return;
    setUpdatingId(reqId);
    try {
      const msg = status === "responded" ? responseMessages[reqId]?.trim() : undefined;
      await onUpdateStatus(reqId, status, msg);
      if (msg)
        setResponseMessages((prev) => {
          const next = { ...prev };
          delete next[reqId];
          return next;
        });
    } finally {
      setUpdatingId(null);
    }
  };

  const filtered = useMemo(() => {
    return estimateRequests.filter((req) => {
      const matchesSearch =
        !searchQuery ||
        (req.customer_name ?? "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (req.shop_name ?? "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || req.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [estimateRequests, searchQuery, filterStatus]);

  const pendingCount = estimateRequests.filter((r) => r.status === "pending").length;

  const filters = ["all", "pending", "viewed", "responded", "declined", "accepted"] as const;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className={cn(
          "sticky top-0 z-10 border-b",
          isLight ? "border-slate-200/60" : "border-blue-300/15"
        )}
        style={
          isLight
            ? {}
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                boxShadow: "0 4px 24px rgba(3, 10, 24, 0.30)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className={cn("text-2xl font-bold", isLight ? "text-slate-900" : "text-slate-100")}>
              Estimate Requests
            </h1>
            {pendingCount > 0 && (
              <span
                className={cn(
                  "rounded-full px-2.5 py-0.5 text-xs font-bold",
                  isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-300"
                )}
              >
                {pendingCount} new
              </span>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search
              className={cn(
                "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2",
                isLight ? "text-slate-400" : "text-slate-500"
              )}
            />
            <input
              type="text"
              placeholder="Search requests…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={cn(
                "w-full rounded-xl py-2.5 pl-10 pr-3 text-sm outline-none min-h-[44px]",
                isLight
                  ? "bg-slate-100 border border-slate-200 text-slate-900 placeholder:text-slate-400"
                  : "bg-white/5 border border-blue-400/15 text-white placeholder:text-slate-500 focus:border-blue-400/40"
              )}
            />
          </div>

          {/* Filter pills */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {filters.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilterStatus(f)}
                className={cn(
                  "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors min-h-[32px]",
                  filterStatus === f
                    ? isLight
                      ? "text-white"
                      : "bg-blue-500/25 border border-blue-400/40 text-blue-200"
                    : isLight
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      : "bg-white/5 text-slate-400 hover:bg-white/10"
                )}
                style={filterStatus === f && isLight ? { backgroundColor: primaryColor } : {}}
              >
                {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-4 space-y-3">
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <svg className="h-8 w-8 animate-spin text-blue-400" viewBox="0 0 24 24" fill="none">
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                className="opacity-25"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            <p className={cn("mt-3 text-sm", isLight ? "text-slate-500" : "text-slate-400")}>
              Loading estimate requests…
            </p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Inbox
              className={cn("h-12 w-12 mb-3", isLight ? "text-slate-300" : "text-slate-600")}
            />
            <p
              className={cn("text-lg font-semibold", isLight ? "text-slate-700" : "text-slate-300")}
            >
              {estimateRequests.length === 0 ? "No estimate requests yet" : "No matching requests"}
            </p>
            <p className={cn("mt-1 text-sm", isLight ? "text-slate-500" : "text-slate-400")}>
              {estimateRequests.length === 0
                ? "When customers request estimates from your shop, they'll appear here."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        )}

        {!loading &&
          filtered.map((req, i) => {
            const status = STATUS_LABELS[req.status ?? "pending"] ?? STATUS_LABELS.pending;
            const isExpanded = expandedId === req.id;

            return (
              <motion.div
                key={req.id ?? i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03, duration: 0.2 }}
              >
                <button
                  type="button"
                  onClick={() => setExpandedId(isExpanded ? null : (req.id ?? null))}
                  className={cn(
                    "w-full rounded-2xl p-4 text-left transition-colors",
                    isLight
                      ? "bg-white border border-slate-200 hover:border-slate-300 shadow-sm"
                      : "bd-glass-card hover:bg-white/[0.06]"
                  )}
                >
                  {/* Top row: customer + status + time */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            "font-semibold text-sm truncate",
                            isLight ? "text-slate-900" : "text-slate-100"
                          )}
                        >
                          {req.customer_name || "Customer"}
                        </span>
                        <span
                          className={cn(
                            "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                            isLight ? status.color : status.darkColor
                          )}
                        >
                          {status.label}
                        </span>
                      </div>
                      {req.customer_email && (
                        <p
                          className={cn(
                            "mt-0.5 text-xs truncate",
                            isLight ? "text-slate-500" : "text-slate-500"
                          )}
                        >
                          {req.customer_email}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={cn("text-xs", isLight ? "text-slate-400" : "text-slate-500")}
                      >
                        {timeAgo(req.created_at)}
                      </span>
                      <ChevronRight
                        className={cn(
                          "h-4 w-4 transition-transform",
                          isExpanded ? "rotate-90" : "",
                          isLight ? "text-slate-400" : "text-slate-500"
                        )}
                      />
                    </div>
                  </div>

                  {/* Description preview */}
                  <p
                    className={cn(
                      "mt-2 text-sm leading-relaxed",
                      isExpanded ? "" : "line-clamp-2",
                      isLight ? "text-slate-700" : "text-slate-300"
                    )}
                  >
                    {req.description}
                  </p>

                  {/* Timeline badge */}
                  <div className="mt-2.5 flex items-center gap-3">
                    <span
                      className={cn(
                        "flex items-center gap-1 text-xs font-medium",
                        isLight ? "text-slate-500" : "text-slate-400"
                      )}
                    >
                      <Clock className="h-3 w-3" />
                      {TIMELINE_LABELS[req.timeline ?? "flexible"] ?? req.timeline}
                    </span>
                    {req.status === "pending" && (
                      <span
                        className={cn(
                          "flex items-center gap-1 text-xs font-medium",
                          isLight ? "text-amber-600" : "text-amber-400"
                        )}
                      >
                        <MessageSquare className="h-3 w-3" />
                        Awaiting response
                      </span>
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div
                      className={cn(
                        "mt-3 pt-3 border-t text-xs space-y-1.5",
                        isLight ? "border-slate-100" : "border-white/5"
                      )}
                    >
                      {req.created_at && (
                        <p className={isLight ? "text-slate-500" : "text-slate-500"}>
                          Received: {new Date(req.created_at).toLocaleString()}
                        </p>
                      )}
                      {req.customer_email && (
                        <p className={isLight ? "text-slate-500" : "text-slate-500"}>
                          Contact: {req.customer_email}
                        </p>
                      )}

                      {/* Response message + Action buttons — only for pending/viewed */}
                      {onUpdateStatus && (req.status === "pending" || req.status === "viewed") && (
                        <div className="space-y-2 pt-2">
                          <textarea
                            placeholder="Type your response to the customer..."
                            value={responseMessages[req.id!] ?? ""}
                            onChange={(e) =>
                              setResponseMessages((prev) => ({
                                ...prev,
                                [req.id!]: e.target.value,
                              }))
                            }
                            rows={3}
                            className={cn(
                              "w-full rounded-xl px-3 py-2.5 text-sm resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/40",
                              isLight
                                ? "bg-white border border-slate-200 text-slate-800 placeholder:text-slate-400"
                                : "bg-white/5 border border-white/10 text-slate-200 placeholder:text-slate-500"
                            )}
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              disabled={updatingId === req.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(req.id!, "responded");
                              }}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors min-h-[44px]",
                                updatingId === req.id ? "opacity-50 cursor-not-allowed" : "",
                                isLight
                                  ? "bg-green-600 text-white hover:bg-green-700"
                                  : "bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30"
                              )}
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              {updatingId === req.id ? "Updating…" : "Send Response"}
                            </button>
                            <button
                              type="button"
                              disabled={updatingId === req.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleAction(req.id!, "declined");
                              }}
                              className={cn(
                                "flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2.5 text-xs font-semibold transition-colors min-h-[44px]",
                                updatingId === req.id ? "opacity-50 cursor-not-allowed" : "",
                                isLight
                                  ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                  : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                              )}
                            >
                              <XCircle className="h-3.5 w-3.5" />
                              Decline
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Already actioned indicator */}
                      {(req.status === "responded" ||
                        req.status === "declined" ||
                        req.status === "accepted") && (
                        <p
                          className={cn(
                            "pt-1 text-xs font-medium",
                            req.status === "accepted"
                              ? isLight
                                ? "text-emerald-600"
                                : "text-emerald-400"
                              : req.status === "responded"
                                ? isLight
                                  ? "text-green-600"
                                  : "text-green-400"
                                : isLight
                                  ? "text-slate-500"
                                  : "text-slate-500"
                          )}
                        >
                          {req.status === "accepted"
                            ? "✓ Customer accepted your estimate"
                            : req.status === "responded"
                              ? "✓ You responded to this request"
                              : "✗ You declined this request"}
                        </p>
                      )}
                    </div>
                  )}
                </button>
              </motion.div>
            );
          })}
      </div>
    </div>
  );
}
