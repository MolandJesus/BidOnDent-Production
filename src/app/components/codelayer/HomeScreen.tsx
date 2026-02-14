import {
  ArrowRight,
  Calendar,
  Camera,
  ChevronRight,
  CircleCheck,
  ClipboardList,
  Clock,
  DollarSign,
  Eye,
  FileCheck,
  FileText,
  Shield,
  Store,
  TrendingUp,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { formatDate, formatStatus, getReportTitle, getReportDescription } from "./home-helpers";

type HomeScreenProps = {
  userType: string;
  userInfo?: {
    name?: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
  onStartReport: () => void;
  onViewAllReports: () => void;
  onOpenReport?: (reportId: string) => void;
  onConnectInsurance?: () => void;
  onViewLikedShops?: () => void;
  onViewBids?: () => void;
  onViewRequests?: () => void;
  onViewJobs?: () => void;
  onViewClaims?: () => void;
  onViewShops?: () => void;
  onCreateNewClaim?: () => void;
  onViewCompetitors?: () => void;
  onViewInsurers?: () => void;
  onEnterDemoMode?: () => void;
  demoMode?: boolean;
  originalAccountType?: string;
  onExitDemoMode?: () => void;
  reports?: any[];
};

type ActionItem = {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick?: () => void;
};

type StatItem = {
  label: string;
  value: string;
  icon: LucideIcon;
  tone: "blue" | "green" | "purple" | "amber";
};

const toneClasses: Record<StatItem["tone"], string> = {
  blue: "bg-blue-50 text-blue-600",
  green: "bg-emerald-50 text-emerald-600",
  purple: "bg-violet-50 text-violet-600",
  amber: "bg-amber-50 text-amber-600",
};

const statusClasses: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  "in-review": "bg-blue-100 text-blue-700",
  active: "bg-blue-100 text-blue-700",
  completed: "bg-emerald-100 text-emerald-700",
  resolved: "bg-emerald-100 text-emerald-700",
};

export default function HomeScreen({
  userType = "customer",
  userInfo,
  primaryColor = "#0056b3",
  secondaryColor = "#00a0e9",
  onStartReport,
  onViewAllReports,
  onOpenReport,
  onConnectInsurance,
  onViewLikedShops,
  onViewBids,
  onViewRequests,
  onViewJobs,
  onViewClaims,
  onViewShops,
  onCreateNewClaim,
  onViewCompetitors,
  onViewInsurers,
  onEnterDemoMode,
  demoMode,
  originalAccountType,
  onExitDemoMode,
  reports = [],
}: HomeScreenProps) {
  const firstName = userInfo?.name?.trim()?.split(" ")[0] || "there";
  const safeReports = Array.isArray(reports) ? reports : [];
  const sortedReports = [...safeReports].sort((a, b) => {
    const aTime = new Date(a?.submittedAt ?? 0).getTime();
    const bTime = new Date(b?.submittedAt ?? 0).getTime();
    return bTime - aTime;
  });

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

  const stats =
    userType === "shop" ? shopStats : userType === "insurer" ? insurerStats : customerStats;

  const customerActions: ActionItem[] = [
    {
      title: "New Repair Request",
      description: "Submit a new damage report",
      icon: Camera,
      onClick: onStartReport,
    },
    {
      title: "View Bids",
      description: "Compare and review bids",
      icon: FileCheck,
      onClick: onViewBids,
    },
    {
      title: "Connect Insurance",
      description: "Add insurance details",
      icon: Shield,
      onClick: onConnectInsurance,
    },
    {
      title: "Find Shops",
      description: "Browse trusted repair shops",
      icon: Wrench,
      onClick: onViewLikedShops,
    },
  ];

  const shopActions: ActionItem[] = [
    {
      title: "Open Requests",
      description: "Review incoming requests",
      icon: ClipboardList,
      onClick: onViewRequests,
    },
    {
      title: "Active Jobs",
      description: "Manage jobs in progress",
      icon: Wrench,
      onClick: onViewJobs,
    },
    {
      title: "Competitors",
      description: "Track market pricing",
      icon: TrendingUp,
      onClick: onViewCompetitors,
    },
    {
      title: "Browse Insurers",
      description: "Explore insurance partners",
      icon: Shield,
      onClick: onViewInsurers,
    },
  ];

  const insurerActions: ActionItem[] = [
    {
      title: "View Claims",
      description: "Review submitted claims",
      icon: FileCheck,
      onClick: onViewClaims,
    },
    {
      title: "Create New Claim",
      description: "Start a claim manually",
      icon: FileText,
      onClick: onCreateNewClaim,
    },
    {
      title: "Partner Shops",
      description: "Manage repair network",
      icon: Store,
      onClick: onViewShops,
    },
    {
      title: "Browse Insurers",
      description: "View carrier directory",
      icon: Shield,
      onClick: onViewInsurers,
    },
  ];

  const quickActions =
    userType === "shop" ? shopActions : userType === "insurer" ? insurerActions : customerActions;

  const primaryAction =
    userType === "shop"
      ? { label: "View Requests", onClick: onViewRequests }
      : userType === "insurer"
        ? { label: "Start New Claim", onClick: onCreateNewClaim }
        : { label: "New Repair Request", onClick: onStartReport };

  const listHeader = userType === "insurer" ? "Recent Claims" : "Recent Repair Requests";
  const listViewAllAction = userType === "insurer" ? onViewClaims : onViewAllReports;

  const activityItems = sortedReports.slice(0, 4).map((report) => {
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

  const actionIconTones = [
    "bg-blue-50 text-blue-600",
    "bg-emerald-50 text-emerald-600",
    "bg-amber-50 text-amber-600",
    "bg-violet-50 text-violet-600",
  ];

  return (
    <div className="space-y-5 pb-20 md:pb-10">
      <section className="px-1 md:px-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-semibold tracking-tight text-slate-900">
              Welcome back, {firstName}!
            </h1>
            <p className="text-slate-500 mt-1 text-base md:text-xl leading-tight md:max-w-3xl">
              {userType === "customer" && "Here is what is happening with your repairs"}
              {userType === "shop" && "Track incoming requests and active repairs"}
              {userType === "insurer" && "Monitor claims and partner shop performance"}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-white font-medium shadow-sm hover:shadow-md transition-all"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {primaryAction.label}
              <ArrowRight className="w-4 h-4" />
            </button>

            {demoMode && onExitDemoMode && userType !== originalAccountType && (
              <button
                onClick={onExitDemoMode}
                className="px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              >
                Exit Demo View
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item, index) => {
          const Icon = item.icon;
          const delta = index + 1;

          return (
            <article
              key={item.label}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm min-h-[158px]"
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${toneClasses[item.tone]}`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-sm font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  +{delta}
                </span>
              </div>
              <p className="text-4xl font-semibold text-slate-900 leading-none mb-2">
                {item.value}
              </p>
              <p className="text-slate-500 text-lg">{item.label}</p>
            </article>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 space-y-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-semibold text-slate-900">{listHeader}</h2>
              <button
                onClick={listViewAllAction}
                className="text-sm font-medium text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {sortedReports.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-300 p-6 bg-slate-50">
                <p className="font-medium text-slate-900 mb-1">No activity yet</p>
                <p className="text-slate-600 text-sm">
                  {userType === "customer" && "Submit your first report to start receiving bids."}
                  {userType === "shop" && "New customer requests will appear here."}
                  {userType === "insurer" && "Submitted claims will appear here for review."}
                </p>
              </div>
            )}

            {sortedReports.length > 0 && (
              <div className="space-y-3">
                {sortedReports.slice(0, 4).map((report) => {
                  const status = String(report?.status ?? "pending").toLowerCase();
                  const statusClass = statusClasses[status] ?? "bg-slate-100 text-slate-700";
                  const title = getReportTitle(report, userType);
                  const description = getReportDescription(report, userType);
                  const hasPhoto = Array.isArray(report?.photos) && report.photos.length > 0;
                  const canOpenReport = Boolean(onOpenReport && report?.id);

                  return (
                    <article
                      key={report.id}
                      className={`rounded-xl border border-slate-200 p-4 bg-white transition-shadow ${
                        canOpenReport ? "hover:shadow-md cursor-pointer" : ""
                      }`}
                      onClick={canOpenReport ? () => onOpenReport?.(String(report.id)) : undefined}
                      role={canOpenReport ? "button" : undefined}
                      tabIndex={canOpenReport ? 0 : undefined}
                      onKeyDown={
                        canOpenReport
                          ? (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                onOpenReport?.(String(report.id));
                              }
                            }
                          : undefined
                      }
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          {hasPhoto ? (
                            <ImageWithFallback
                              src={report.photos[0]}
                              alt="Damage report"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                              <Camera className="w-7 h-7" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="text-xl font-semibold text-slate-900 truncate">
                              {title}
                            </h3>
                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusClass}`}
                            >
                              {formatStatus(status)}
                            </span>
                          </div>
                          <p className="text-slate-600 mt-1 line-clamp-2">{description}</p>

                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-slate-500">
                            <span className="inline-flex items-center gap-1.5">
                              <Calendar className="w-4 h-4" />
                              {formatDate(report?.submittedAt)}
                            </span>
                            {userType !== "insurer" && (
                              <span className="inline-flex items-center gap-1.5">
                                <DollarSign className="w-4 h-4" />
                                {Number(report?.bidsCount || 0)} bids received
                              </span>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-slate-400 mt-7 flex-shrink-0" />
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside className="xl:col-span-4 space-y-5">
          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-2 gap-3">
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                const isDisabled = !action.onClick;
                const iconTone = actionIconTones[index % actionIconTones.length];

                return (
                  <button
                    key={action.title}
                    onClick={action.onClick}
                    disabled={isDisabled}
                    className={`text-left rounded-xl border p-4 transition-all ${
                      isDisabled
                        ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                        : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm"
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${iconTone}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-semibold text-slate-900">{action.title}</h3>
                    <p className="text-sm text-slate-600 mt-1">{action.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
            {activityItems.length === 0 && (
              <p className="text-slate-600 text-sm">No recent activity to show yet.</p>
            )}
            {activityItems.length > 0 && (
              <div className="space-y-3">
                {activityItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.id} className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${item.tone}`}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-slate-900 leading-snug">{item.label}</p>
                        <p className="text-sm text-slate-500 mt-1">{item.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section
            className="rounded-2xl p-5 text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Eye className="w-5 h-5" />
              <h3 className="text-xl font-semibold">Pro Tip</h3>
            </div>
            <p className="text-white/90 text-sm">
              Compare at least 3 bids before selecting a shop. Review warranty terms and timeline to
              avoid surprises.
            </p>
          </section>
        </aside>
      </section>
    </div>
  );
}
