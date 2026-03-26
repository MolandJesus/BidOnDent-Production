import {
  Camera,
  CircleCheck,
  ClipboardList,
  Clock,
  DollarSign,
  FileCheck,
  FileText,
  Shield,
  Store,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { formatDate, getReportTitle } from "./home-helpers";

export type ActionItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
};

export type StatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "purple" | "amber";
};

type HomeActionHandlers = {
  onStartReport: () => void;
  onViewAllReports: () => void;
  onViewCoverage?: () => void;
  onConnectInsurance?: () => void;
  onViewBids?: () => void;
  onViewRequests?: () => void;
  onViewJobs?: () => void;
  onViewClaims?: () => void;
  onViewShops?: () => void;
  onCreateNewClaim?: () => void;
  onViewCompetitors?: () => void;
  onViewInsurers?: () => void;
};

export const toneClasses: Record<StatItem["tone"], string> = {
  blue: "bg-blue-400/15 text-blue-300",
  green: "bg-emerald-400/15 text-emerald-300",
  purple: "bg-violet-400/15 text-violet-300",
  amber: "bg-amber-400/15 text-amber-300",
};

export const statusClasses: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-300",
  "in-review": "bg-blue-400/15 text-blue-200",
  active: "bg-blue-400/15 text-blue-200",
  completed: "bg-emerald-400/15 text-emerald-300",
  resolved: "bg-emerald-400/15 text-emerald-300",
};

export const actionIconTones = [
  "bg-blue-400/15 text-blue-300",
  "bg-emerald-400/15 text-emerald-300",
  "bg-amber-400/15 text-amber-300",
  "bg-violet-400/15 text-violet-300",
];

export function sortReports(reports: any[]) {
  return [...reports].sort((a, b) => {
    const aTime = new Date(a?.submittedAt ?? 0).getTime();
    const bTime = new Date(b?.submittedAt ?? 0).getTime();
    return bTime - aTime;
  });
}

export function buildStats(userType: string, sortedReports: any[]): StatItem[] {
  const activeCount = sortedReports.filter((report) => {
    const status = String(report?.status ?? "").toLowerCase();
    return status !== "completed" && status !== "resolved";
  }).length;
  const awaitingReviewCount = sortedReports.filter((report) => {
    const status = String(report?.status ?? "").toLowerCase();
    return status === "pending" || status === "in-review";
  }).length;
  const completedCount = sortedReports.filter((report) => {
    const status = String(report?.status ?? "").toLowerCase();
    return status === "completed" || status === "resolved";
  }).length;
  const totalBids = sortedReports.reduce(
    (count, report) => count + (Number(report?.bidsCount) || 0),
    0
  );

  const customerStats: StatItem[] = [
    { label: "Active Requests", value: String(activeCount), icon: ClipboardList, tone: "blue" },
    { label: "Total Bids Received", value: String(totalBids), icon: DollarSign, tone: "green" },
    {
      label: "Completed Repairs",
      value: String(completedCount),
      icon: CircleCheck,
      tone: "purple",
    },
    {
      label: "Awaiting Review",
      value: String(awaitingReviewCount),
      icon: Clock,
      tone: "amber",
    },
  ];

  const shopStats: StatItem[] = [
    { label: "Open Requests", value: String(activeCount), icon: ClipboardList, tone: "blue" },
    {
      label: "Live Opportunities",
      value: String(sortedReports.length),
      icon: Wrench,
      tone: "green",
    },
    {
      label: "Completed Jobs",
      value: String(completedCount),
      icon: CircleCheck,
      tone: "purple",
    },
    {
      label: "Bid Activity",
      value: String(totalBids),
      icon: TrendingUp,
      tone: "amber",
    },
  ];

  const insurerStats: StatItem[] = [
    { label: "Active Claims", value: String(activeCount), icon: FileCheck, tone: "blue" },
    {
      label: "Claims Resolved",
      value: String(completedCount),
      icon: CircleCheck,
      tone: "green",
    },
    { label: "Reports In Queue", value: String(awaitingReviewCount), icon: Store, tone: "purple" },
    { label: "Live Submissions", value: String(sortedReports.length), icon: Clock, tone: "amber" },
  ];

  return userType === "shop" ? shopStats : userType === "insurer" ? insurerStats : customerStats;
}

export function buildQuickActions(userType: string, handlers: HomeActionHandlers): ActionItem[] {
  const customerActions: ActionItem[] = [
    {
      title: "New Repair Request",
      description: "Submit a new damage report",
      icon: Camera,
      onClick: handlers.onStartReport,
    },
    {
      title: "View Bids",
      description: "Compare and review bids",
      icon: FileCheck,
      onClick: handlers.onViewBids,
    },
    {
      title: "Connect Insurance",
      description: "Add insurance details",
      icon: Shield,
      onClick: handlers.onConnectInsurance,
    },
    {
      title: "Coverage Updates",
      description: "Open live coverage and service map",
      icon: Wrench,
      onClick: handlers.onViewCoverage,
    },
  ];

  const shopActions: ActionItem[] = [
    {
      title: "Open Requests",
      description: "Review incoming requests",
      icon: ClipboardList,
      onClick: handlers.onViewRequests,
    },
    {
      title: "Active Jobs",
      description: "Manage jobs in progress",
      icon: Wrench,
      onClick: handlers.onViewJobs,
    },
    {
      title: "Competitors",
      description: "Track market activity",
      icon: TrendingUp,
      onClick: handlers.onViewCompetitors,
    },
    {
      title: "Coverage Map",
      description: "Review active service regions",
      icon: Shield,
      onClick: handlers.onViewCoverage,
    },
  ];

  const insurerActions: ActionItem[] = [
    {
      title: "View Claims",
      description: "Review submitted claims",
      icon: FileCheck,
      onClick: handlers.onViewClaims,
    },
    {
      title: "Create New Claim",
      description: "Start a claim manually",
      icon: FileText,
      onClick: handlers.onCreateNewClaim,
    },
    {
      title: "Partner Shops",
      description: "Manage repair network",
      icon: Store,
      onClick: handlers.onViewShops,
    },
    {
      title: "Network Coverage",
      description: "Review live service regions",
      icon: Shield,
      onClick: handlers.onViewCoverage,
    },
  ];

  return userType === "shop"
    ? shopActions
    : userType === "insurer"
      ? insurerActions
      : customerActions;
}

export function buildPrimaryAction(userType: string, handlers: HomeActionHandlers) {
  if (userType === "shop") {
    return { label: "View Requests", onClick: handlers.onViewRequests };
  }

  if (userType === "insurer") {
    return { label: "Start New Claim", onClick: handlers.onCreateNewClaim };
  }

  return { label: "New Repair Request", onClick: handlers.onStartReport };
}

export function buildActivityItems(userType: string, sortedReports: any[]) {
  return sortedReports.slice(0, 4).map((report) => {
    const status = String(report?.status ?? "pending").toLowerCase();
    const title = getReportTitle(report, userType);

    if (status === "completed" || status === "resolved") {
      return {
        id: report.id,
        label: `${title} marked as completed`,
        time: formatDate(report?.submittedAt),
        icon: CircleCheck,
        tone: "text-emerald-300 bg-emerald-400/15",
      };
    }

    if ((Number(report?.bidsCount) || 0) > 0) {
      return {
        id: report.id,
        label: `New bid activity on ${title}`,
        time: formatDate(report?.submittedAt),
        icon: DollarSign,
        tone: "text-blue-300 bg-blue-400/15",
      };
    }

    return {
      id: report.id,
      label: `${title} is waiting for review`,
      time: formatDate(report?.submittedAt),
      icon: Clock,
      tone: "text-amber-300 bg-amber-400/15",
    };
  });
}
