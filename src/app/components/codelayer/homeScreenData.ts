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

export const toneClasses: Record<StatItem["tone"], string> = {
  blue: "bg-blue-400/15 text-blue-200",
  green: "bg-emerald-400/15 text-emerald-300",
  purple: "bg-violet-100/70 text-violet-700",
  amber: "bg-amber-400/15 text-amber-300",
};

export const statusClasses: Record<string, string> = {
  pending: "bg-amber-400/15 text-amber-300",
  "in-review": "bg-blue-400/15 text-blue-200",
  active: "bg-emerald-400/15 text-emerald-300",
  completed: "bg-violet-400/15 text-violet-300",
  resolved: "bg-emerald-400/15 text-emerald-300",
};

export const statusClassesLight: Record<string, string> = {
  pending: "bg-amber-50 text-amber-700 border border-amber-200/60",
  "in-review": "bg-blue-50 text-blue-700 border border-blue-200/60",
  active: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
  completed: "bg-violet-50 text-violet-700 border border-violet-200/60",
  resolved: "bg-emerald-50 text-emerald-700 border border-emerald-200/60",
};

export const actionIconTones = [
  "bg-blue-400/15 text-blue-200 shadow-sm",
  "bg-emerald-400/15 text-emerald-300 shadow-sm",
  "bg-amber-400/15 text-amber-300 shadow-sm",
  "bg-violet-100/80 text-violet-700 shadow-sm",
];

export const actionIconTonesLight = [
  "border border-blue-200/70 bg-blue-50 text-blue-700 shadow-[0_6px_16px_rgba(37,99,235,0.12)]",
  "border border-emerald-200/70 bg-emerald-50 text-emerald-700 shadow-[0_6px_16px_rgba(16,185,129,0.10)]",
  "border border-amber-200/70 bg-amber-50 text-amber-700 shadow-[0_6px_16px_rgba(245,158,11,0.10)]",
  "border border-indigo-200/70 bg-indigo-50 text-indigo-700 shadow-[0_6px_16px_rgba(99,102,241,0.10)]",
];

export function buildStats(
  userType: string,
  activeCount: number,
  completedCount: number,
  totalBids: number
): StatItem[] {
  if (userType === "shop") {
    return [
      {
        label: "Open Requests",
        value: activeCount > 0 ? String(activeCount) : "—",
        icon: ClipboardList,
        tone: "blue",
      },
      {
        label: "Active Jobs",
        value: completedCount > 0 ? String(completedCount) : "—",
        icon: Wrench,
        tone: "green",
      },
      {
        label: "Completed Jobs",
        value: completedCount > 0 ? String(completedCount) : "—",
        icon: CircleCheck,
        tone: "purple",
      },
      {
        label: "Bids Submitted",
        value: totalBids > 0 ? String(totalBids) : "—",
        icon: DollarSign,
        tone: "amber",
      },
    ];
  }
  if (userType === "insurer") {
    return [
      {
        label: "Active Claims",
        value: activeCount > 0 ? String(activeCount) : "—",
        icon: FileCheck,
        tone: "blue",
      },
      {
        label: "Claims Resolved",
        value: completedCount > 0 ? String(completedCount) : "—",
        icon: CircleCheck,
        tone: "green",
      },
      {
        label: "Partner Shops",
        value: "—",
        icon: Store,
        tone: "purple",
      },
      {
        label: "Avg Cycle Time",
        value: "—",
        icon: Clock,
        tone: "amber",
      },
    ];
  }
  return [
    {
      label: "Active Requests",
      value: activeCount > 0 ? String(activeCount) : "—",
      icon: ClipboardList,
      tone: "blue",
    },
    {
      label: "Bids Received",
      value: totalBids > 0 ? String(totalBids) : "—",
      icon: DollarSign,
      tone: "green",
    },
    {
      label: "Completed Repairs",
      value: completedCount > 0 ? String(completedCount) : "—",
      icon: CircleCheck,
      tone: "purple",
    },
    {
      label: "Shops Bookmarked",
      value: "—",
      icon: TrendingUp,
      tone: "amber",
    },
  ];
}

interface ActionCallbacks {
  onStartReport: () => void;
  onViewBids?: () => void;
  onConnectInsurance?: () => void;
  onViewLikedShops?: () => void;
  onViewShops?: () => void;
  onViewCoverage?: () => void;
  onViewRequests?: () => void;
  onViewJobs?: () => void;
  onViewCompetitors?: () => void;
  onViewInsurers?: () => void;
  onViewClaims?: () => void;
  onCreateNewClaim?: () => void;
}

export function buildQuickActions(userType: string, callbacks: ActionCallbacks): ActionItem[] {
  if (userType === "shop") {
    return [
      {
        title: "Open Requests",
        description: "Review incoming requests",
        icon: ClipboardList,
        onClick: callbacks.onViewRequests,
      },
      {
        title: "Active Jobs",
        description: "Manage jobs in progress",
        icon: Wrench,
        onClick: callbacks.onViewJobs,
      },
      {
        title: "Shop Directory",
        description: "Browse nearby repair shops",
        icon: Store,
        onClick: callbacks.onViewShops,
      },
    ];
  }
  if (userType === "insurer") {
    return [
      {
        title: "View Claims",
        description: "Review submitted claims",
        icon: FileCheck,
        onClick: callbacks.onViewClaims,
      },
      {
        title: "Create New Claim",
        description: "Start a claim manually",
        icon: FileText,
        onClick: callbacks.onCreateNewClaim,
      },
      {
        title: "Partner Shops",
        description: "Manage repair network",
        icon: Store,
        onClick: callbacks.onViewShops,
      },
    ];
  }
  return [
    {
      title: "New Repair Request",
      description: "Submit a new damage report",
      icon: Camera,
      onClick: callbacks.onStartReport,
    },
    {
      title: "View Bids",
      description: "Compare and review bids",
      icon: FileCheck,
      onClick: callbacks.onViewBids,
    },
    {
      title: "Connect Insurance",
      description: "Add insurance details",
      icon: Shield,
      onClick: callbacks.onConnectInsurance,
    },
    {
      title: "Find Shops",
      description: "Browse smart-matched repair shops",
      icon: Wrench,
      onClick: callbacks.onViewShops || callbacks.onViewLikedShops,
    },
  ];
}

export function buildPrimaryAction(
  userType: string,
  onViewRequests?: () => void,
  onCreateNewClaim?: () => void,
  onStartReport?: () => void
) {
  if (userType === "shop") return { label: "View Requests", onClick: onViewRequests };
  if (userType === "insurer") return { label: "Start New Claim", onClick: onCreateNewClaim };
  return { label: "New Repair Request", onClick: onStartReport };
}
