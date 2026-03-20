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
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

export const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  "in-review": "bg-blue-100 text-blue-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

export const actionIconTones = [
  "bg-blue-50 text-blue-600",
  "bg-emerald-50 text-emerald-600",
  "bg-amber-50 text-amber-600",
  "bg-violet-50 text-violet-600",
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
      label: "Money Saved",
      value: `$${(totalBids * 150).toLocaleString()}`,
      icon: TrendingUp,
      tone: "amber",
    },
  ];

  const shopStats: StatItem[] = [
    { label: "Open Requests", value: String(activeCount || 12), icon: ClipboardList, tone: "blue" },
    {
      label: "Active Jobs",
      value: String(Math.max(3, completedCount)),
      icon: Wrench,
      tone: "green",
    },
    {
      label: "Completed Jobs",
      value: String(Math.max(completedCount, 6)),
      icon: CircleCheck,
      tone: "purple",
    },
    {
      label: "Potential Revenue",
      value: `$${(Math.max(totalBids, 8) * 400).toLocaleString()}`,
      icon: DollarSign,
      tone: "amber",
    },
  ];

  const insurerStats: StatItem[] = [
    { label: "Active Claims", value: String(activeCount || 18), icon: FileCheck, tone: "blue" },
    {
      label: "Claims Resolved",
      value: String(Math.max(completedCount, 9)),
      icon: CircleCheck,
      tone: "green",
    },
    { label: "Partner Shops", value: "24", icon: Store, tone: "purple" },
    { label: "Avg Cycle Time", value: "2.8d", icon: Clock, tone: "amber" },
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
      description: "View service area and support info",
      icon: Wrench,
      onClick: handlers.onViewAllReports,
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
      title: "Browse Insurers",
      description: "Explore insurance partners",
      icon: Shield,
      onClick: handlers.onViewInsurers,
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
      title: "Browse Insurers",
      description: "View carrier directory",
      icon: Shield,
      onClick: handlers.onViewInsurers,
    },
  ];

  return userType === "shop" ? shopActions : userType === "insurer" ? insurerActions : customerActions;
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
        tone: "text-emerald-600 bg-emerald-50",
      };
    }

    if ((Number(report?.bidsCount) || 0) > 0) {
      return {
        id: report.id,
        label: `New bid activity on ${title}`,
        time: formatDate(report?.submittedAt),
        icon: DollarSign,
        tone: "text-blue-600 bg-blue-50",
      };
    }

    return {
      id: report.id,
      label: `${title} is waiting for review`,
      time: formatDate(report?.submittedAt),
      icon: Clock,
      tone: "text-amber-600 bg-amber-50",
    };
  });
}
