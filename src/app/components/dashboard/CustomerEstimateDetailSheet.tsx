import { CheckCircle2, Clock, MessageSquare, Store, XCircle } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "../ui/sheet";
import type { EstimateRequest } from "../../services/supabase/estimateRequests";

type CustomerEstimateDetailSheetProps = {
  estimate: EstimateRequest | null;
  open: boolean;
  onClose: () => void;
  onAccept: (requestId: string) => void;
  onDecline: (requestId: string) => void;
  loading?: boolean;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: "Pending",
    color: "text-amber-400",
    icon: <Clock className="h-4 w-4 text-amber-400" />,
  },
  viewed: {
    label: "Viewed by shop",
    color: "text-amber-400",
    icon: <Clock className="h-4 w-4 text-amber-400" />,
  },
  responded: {
    label: "Shop responded",
    color: "text-green-400",
    icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
  },
  declined: {
    label: "Declined",
    color: "text-slate-400",
    icon: <XCircle className="h-4 w-4 text-slate-400" />,
  },
  accepted: {
    label: "Accepted",
    color: "text-blue-400",
    icon: <CheckCircle2 className="h-4 w-4 text-blue-400" />,
  },
};

export default function CustomerEstimateDetailSheet({
  estimate,
  open,
  onClose,
  onAccept,
  onDecline,
  loading = false,
}: CustomerEstimateDetailSheetProps) {
  if (!estimate) return null;

  const statusInfo = STATUS_CONFIG[estimate.status] ?? STATUS_CONFIG.pending;
  const canRespond = estimate.status === "responded";
  const formattedDate = estimate.created_at
    ? new Date(estimate.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "";

  return (
    <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
      <SheetContent
        side="bottom"
        className="rounded-t-2xl border-t border-blue-500/20 bg-[#0a1230] max-h-[85vh] overflow-y-auto"
      >
        <SheetHeader className="pb-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-500/15">
              <Store className="h-4.5 w-4.5 text-blue-400" />
            </div>
            <div className="min-w-0 flex-1">
              <SheetTitle className="text-base font-bold text-slate-100 truncate">
                {estimate.shop_name || "Shop Estimate"}
              </SheetTitle>
              <SheetDescription className="text-xs text-slate-400">
                {formattedDate}
              </SheetDescription>
            </div>
            <span className={`flex items-center gap-1.5 text-xs font-medium ${statusInfo.color}`}>
              {statusInfo.icon}
              {statusInfo.label}
            </span>
          </div>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-4 pb-2">
          {/* Original request */}
          <div className="rounded-xl bg-white/[0.04] px-3.5 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-slate-500 mb-1.5">
              Your Request
            </p>
            <p className="text-sm text-slate-200 leading-relaxed">{estimate.description}</p>
            {estimate.timeline && (
              <p className="mt-1.5 text-xs text-slate-400">
                Timeline: <span className="text-slate-300 capitalize">{estimate.timeline}</span>
              </p>
            )}
          </div>

          {/* Shop response */}
          {estimate.response_message && (
            <div className="rounded-xl bg-green-500/[0.06] border border-green-500/15 px-3.5 py-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <MessageSquare className="h-3.5 w-3.5 text-green-400" />
                <p className="text-[11px] font-medium uppercase tracking-wider text-green-400/80">
                  Shop&apos;s Response
                </p>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">{estimate.response_message}</p>
            </div>
          )}

          {/* No response yet */}
          {!estimate.response_message &&
            (estimate.status === "pending" || estimate.status === "viewed") && (
              <div className="rounded-xl bg-white/[0.03] border border-slate-700/40 px-3.5 py-3 text-center">
                <Clock className="h-5 w-5 text-amber-400/60 mx-auto mb-1.5" />
                <p className="text-sm text-slate-400">Waiting for the shop to respond...</p>
              </div>
            )}
        </div>

        {/* Action buttons — only show for responded estimates */}
        {canRespond && (
          <SheetFooter className="flex-row gap-3 border-t border-slate-700/40 pt-4">
            <button
              onClick={() => onDecline(estimate.id)}
              disabled={loading}
              className="flex-1 min-h-[44px] rounded-xl border border-slate-600/40 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-300 transition-colors hover:bg-white/[0.08] active:scale-[0.97] disabled:opacity-50"
            >
              Decline
            </button>
            <button
              onClick={() => onAccept(estimate.id)}
              disabled={loading}
              className="flex-1 min-h-[44px] rounded-xl px-4 py-2.5 text-sm font-bold text-white transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-[0.97] disabled:opacity-50"
              style={{
                background: "linear-gradient(135deg, #003d82 0%, #00a0e9 100%)",
                boxShadow: "0 4px 16px rgba(37, 99, 235, 0.25)",
              }}
            >
              {loading ? "Processing..." : "Accept Estimate"}
            </button>
          </SheetFooter>
        )}

        {/* Already accepted/declined status */}
        {estimate.status === "accepted" && (
          <div className="mx-4 mb-4 rounded-xl bg-blue-500/10 border border-blue-500/20 px-3.5 py-3 text-center">
            <CheckCircle2 className="h-5 w-5 text-blue-400 mx-auto mb-1" />
            <p className="text-sm font-medium text-blue-300">You accepted this estimate</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
