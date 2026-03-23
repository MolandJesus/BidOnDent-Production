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
        value: String(activeCount || 12),
        icon: ClipboardList,
        tone: "blue",
      },
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
  }
  if (userType === "insurer") {
    return [
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
  }
  return [
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
}

interface ActionCallbacks {
  onStartReport: () => void;
  onViewBids?: () => void;
  onConnectInsurance?: () => void;
  onViewLikedShops?: () => void;
  onViewShops?: () => void;
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
        title: "Competitors",
        description: "Track market pricing",
        icon: TrendingUp,
        onClick: callbacks.onViewCompetitors,
      },
      {
        title: "Browse Insurers",
        description: "Explore insurance partners",
        icon: Shield,
        onClick: callbacks.onViewInsurers,
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
      {
        title: "Browse Insurers",
        description: "View carrier directory",
        icon: Shield,
        onClick: callbacks.onViewInsurers,
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
