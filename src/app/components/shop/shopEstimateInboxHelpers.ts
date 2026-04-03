import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { EstimateRequest } from "../../services/supabase/estimateRequests";

export type ShopEstimateInboxScreenProps = {
  estimateRequests: EstimateRequest[];
  loading?: boolean;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
  onUpdateStatus?: (
    requestId: string,
    status: "responded" | "declined",
    responseMessage?: string
  ) => Promise<void>;
};

export const STATUS_LABELS: Record<string, { label: string; color: string; darkColor: string }> = {
  pending: {
    label: "New",
    color: "bg-amber-100 text-amber-700",
    darkColor: "bg-amber-500/15 text-amber-300",
  },
  viewed: {
    label: "Viewed",
    color: "bg-sky-100 text-sky-700",
    darkColor: "bg-sky-500/15 text-sky-300",
  },
  responded: {
    label: "Responded",
    color: "bg-green-100 text-green-700",
    darkColor: "bg-green-500/15 text-green-300",
  },
  declined: {
    label: "Declined",
    color: "bg-slate-100 text-slate-600",
    darkColor: "bg-slate-500/15 text-slate-400",
  },
  accepted: {
    label: "Accepted",
    color: "bg-emerald-100 text-emerald-700",
    darkColor: "bg-emerald-500/15 text-emerald-300",
  },
};

export const TIMELINE_LABELS: Record<string, string> = {
  urgent: "ASAP",
  "this-week": "This week",
  flexible: "Flexible",
};

export function timeAgo(dateStr?: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
