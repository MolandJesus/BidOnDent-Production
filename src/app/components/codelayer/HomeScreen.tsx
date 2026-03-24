import { ArrowRight, CircleCheck, Clock, DollarSign, type LucideIcon } from "lucide-react";
import { formatDate, getReportTitle } from "./home-helpers";
import CustomerMapWidget from "../dashboard/CustomerMapWidget";
import ShopMapWidget from "../dashboard/ShopMapWidget";
import InsurerMapWidget from "../dashboard/InsurerMapWidget";
import {
  type StatItem,
  toneClasses,
  buildStats,
  buildQuickActions,
  buildPrimaryAction,
} from "./homeScreenData";
import { HomeOnboardingCard, HomeReportsList, HomeSidebar } from "./HomeScreenSections";

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
  const isNewUser = safeReports.length === 0;
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

  const stats = buildStats(userType, activeCount, completedCount, totalBids);

  const quickActions = buildQuickActions(userType, {
    onStartReport,
    onViewBids,
    onConnectInsurance,
    onViewLikedShops,
    onViewShops,
    onViewRequests,
    onViewJobs,
    onViewCompetitors,
    onViewInsurers,
    onViewClaims,
    onCreateNewClaim,
  });

  const primaryAction = buildPrimaryAction(
    userType,
    onViewRequests,
    onCreateNewClaim,
    onStartReport
  );

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

  return (
    <div className="space-y-4 md:space-y-5 pb-20 md:pb-10">
      <section className="px-1 md:px-0">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight text-slate-900">
              {isNewUser ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}!`}
            </h1>
            <p className="text-slate-500 mt-1.5 text-base md:text-lg leading-relaxed md:max-w-3xl">
              {userType === "customer" &&
                (isNewUser
                  ? "Get started by submitting a damage report to receive competitive bids from local shops"
                  : "Here is what is happening with your repairs")}
              {userType === "shop" && "Track incoming requests and active repairs"}
              {userType === "insurer" && "Monitor claims and partner shop performance"}
            </p>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.97] text-white"
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
                className="bd-glass-control px-4 py-2.5 min-h-[44px] text-blue-700 font-medium"
              >
                Exit Demo View
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Map widget — hero position: first thing users see on the dashboard */}
      {userType === "shop" ? (
        <ShopMapWidget primaryColor={primaryColor} secondaryColor={secondaryColor} onViewShops={onViewShops} />
      ) : userType === "insurer" ? (
        <InsurerMapWidget primaryColor={primaryColor} secondaryColor={secondaryColor} onViewShops={onViewShops} />
      ) : (
        <CustomerMapWidget primaryColor={primaryColor} secondaryColor={secondaryColor} />
      )}

      {isNewUser && userType === "customer" ? (
        <HomeOnboardingCard primaryColor={primaryColor} secondaryColor={secondaryColor} />
      ) : (
        <section className="grid grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4">
          {stats.map((item, index) => {
            const Icon = item.icon;
            const delta = index + 1;

            return (
              <article
                key={item.label}
                className="bd-glass-card p-3.5 md:p-5 min-h-[110px] md:min-h-[140px] hover:-translate-y-1 hover:shadow-lg cursor-default transition-all duration-200"
              >
                <div className="flex items-start justify-between mb-3 md:mb-5">
                  <div
                    className={`w-9 h-9 md:w-12 md:h-12 rounded-xl flex items-center justify-center ${toneClasses[item.tone]}`}
                  >
                    <Icon className="w-4.5 h-4.5 md:w-6 md:h-6" />
                  </div>
                  <span className="bd-glass-badge hidden md:inline">+{delta}</span>
                </div>
                <p className="text-2xl md:text-4xl font-bold text-slate-900 leading-none mb-1 md:mb-2 tabular-nums">
                  {item.value}
                </p>
                <p className="text-slate-500 text-sm md:text-lg">{item.label}</p>
              </article>
            );
          })}
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-12 gap-5">
        <div className="xl:col-span-8 space-y-5">
          <HomeReportsList
            userType={userType}
            listHeader={listHeader}
            sortedReports={sortedReports}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            onViewAll={listViewAllAction}
            onOpenReport={onOpenReport}
            onStartReport={onStartReport}
          />
        </div>

        <HomeSidebar
          quickActions={quickActions}
          activityItems={activityItems}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
        />
      </section>
    </div>
  );
}
