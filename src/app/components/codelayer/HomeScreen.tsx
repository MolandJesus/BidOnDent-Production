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
}) {
  // Derived variables for overlays and panels
  const firstName = userInfo?.name?.split(" ")[0] || "User";
  const isNewUser = Array.isArray(reports) && reports.length === 0;
  const listHeader =
    userType === "customer" ? "Your Reports" : userType === "shop" ? "Incoming Requests" : "Claims";
  const sortedReports = Array.isArray(reports) ? reports : [];
  const listViewAllAction = onViewAllReports;
  const primaryAction = buildPrimaryAction(userType, { onStartReport, onCreateNewClaim });
  const stats = buildStats(userType, reports);
  const quickActions = buildQuickActions(userType, {
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
  });
  const activityItems = [];

  // Map-first, floating overlays layout
  return (
    <div className="relative w-full h-full min-h-[80vh] flex flex-col items-center justify-start pb-20 md:pb-10">
      {/* Map widget as hero floating panel — offset for sidebar on desktop */}
      <div
        className="fixed top-0 left-0 md:left-72 w-full md:w-[calc(100%-18rem)] z-20 flex flex-col items-center pointer-events-none"
        style={{ paddingTop: "max(env(safe-area-inset-top), 1.5rem)" }}
      >
        <div className="w-full max-w-4xl px-2 md:px-6">
          {userType === "shop" ? (
            <ShopMapWidget
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onViewShops={onViewShops}
            />
          ) : userType === "insurer" ? (
            <InsurerMapWidget
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              onViewShops={onViewShops}
            />
          ) : (
            <CustomerMapWidget primaryColor={primaryColor} secondaryColor={secondaryColor} />
          )}
        </div>
      </div>
      {/* Floating overlays for onboarding and report list */}
      <div className="relative z-30 w-full max-w-4xl mt-[320px] px-2 md:px-0 flex flex-col gap-6 pointer-events-auto">
        <section className="bd-glass-floating p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
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
              className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl font-semibold hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-[0.97] text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: "0 4px 20px rgba(37, 99, 235, 0.28), 0 0 32px rgba(59, 130, 246, 0.10)",
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
        </section>
        {isNewUser && userType === "customer" ? (
          <HomeOnboardingCard primaryColor={primaryColor} secondaryColor={secondaryColor} />
        ) : null}
        {/* Report list always accessible as floating panel */}
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
    </div>
  );
}
