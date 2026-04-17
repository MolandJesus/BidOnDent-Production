import { ArrowRight, Mail, Clock, CheckCircle2, XCircle } from "lucide-react";
import CustomerMapWidget from "../dashboard/CustomerMapWidget";
import ShopMapWidget from "../dashboard/ShopMapWidget";
import InsurerMapWidget from "../dashboard/InsurerMapWidget";
import ShopBidsSummary from "../shop/ShopBidsSummary";
import { buildPrimaryAction, buildQuickActions } from "./homeScreenData";
import { HomeOnboardingCard, HomeQuickActions, HomeReportsList } from "./HomeScreenSections";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport, Bid } from "../../types";
import type { EstimateRequest } from "../../services/supabase/estimateRequests";

type HomeScreenProps = {
  userType: string;
  appearanceMode?: DashboardAppearanceMode;
  userInfo?: {
    name?: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
  onStartReport: () => void;
  onViewAllReports: () => void;
  onOpenReport?: (reportId: string) => void;
  onViewReportOnMap?: (reportId: string) => void;
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
  onViewCoverage?: () => void;
  onEnterDemoMode?: () => void;
  demoMode?: boolean;
  originalAccountType?: string;
  onExitDemoMode?: () => void;
  reports?: DamageReport[];
  estimateRequests?: EstimateRequest[];
  onSelectEstimate?: (estimate: EstimateRequest) => void;
  shopSubmittedBids?: Bid[];
  usingSeedFallback?: boolean;
  onDeleteReport?: (reportId: string) => Promise<boolean>;
};

export default function HomeScreen({
  userType = "customer",
  appearanceMode = "map-dark",
  userInfo,
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  onStartReport,
  onViewAllReports,
  onOpenReport,
  onViewReportOnMap,
  onConnectInsurance,
  onViewLikedShops,
  onViewBids,
  onViewRequests,
  onViewJobs,
  onViewClaims,
  onViewShops,
  onViewCoverage,
  onCreateNewClaim,
  onViewCompetitors,
  onViewInsurers,
  onEnterDemoMode,
  demoMode,
  originalAccountType,
  onExitDemoMode,
  reports = [],
  estimateRequests = [],
  onSelectEstimate,
  shopSubmittedBids,
  usingSeedFallback = false,
  onDeleteReport,
}: HomeScreenProps) {
  const isLightAppearance = appearanceMode === "light";
  // Derived variables for overlays and panels
  const firstName = userInfo?.name?.split(" ")[0] || "User";
  const isNewUser = Array.isArray(reports) && reports.length === 0;
  const listHeader =
    userType === "customer" ? "Your Reports" : userType === "shop" ? "Incoming Requests" : "Claims";
  const sortedReports = Array.isArray(reports) ? reports : [];
  const listViewAllAction = onViewAllReports;
  const primaryAction = buildPrimaryAction(
    userType,
    onViewRequests,
    onCreateNewClaim,
    onStartReport
  );
  const welcomeEyebrow =
    userType === "customer"
      ? "Repair overview"
      : userType === "shop"
        ? "Shop operations"
        : "Claims overview";
  const welcomeChipLabel =
    userType === "customer"
      ? isNewUser
        ? "Ready to start"
        : "Live activity"
      : userType === "shop"
        ? "Work queue"
        : "Claims desk";
  const quickActions = buildQuickActions(userType, {
    onStartReport,
    onViewBids,
    onConnectInsurance,
    onViewLikedShops,
    onViewShops,
    onViewCoverage,
    onViewRequests,
    onViewJobs,
    onViewCompetitors,
    onViewInsurers,
    onViewClaims,
    onCreateNewClaim,
  });

  // Map-first, floating overlays layout
  return (
    <div className="relative w-full h-full min-h-[80vh] flex flex-col items-center justify-start pb-20 md:pb-10">
      {/* Dashboard content — welcome, actions, reports, then map widget */}
      <div className="relative z-20 mt-3 w-full max-w-5xl px-2 md:mt-6 md:px-6 flex flex-col gap-3.5 md:gap-5 overflow-x-hidden">
        {/* Compact welcome bar */}
        <section className="bd-dashboard-panel bd-dashboard-panel--accent-blue relative flex flex-wrap items-center justify-between gap-3 overflow-hidden px-4 py-3 md:px-5 md:py-4">
          {/* Subtle royal blue left-edge accent glow */}
          {!isLightAppearance && (
            <div
              className="absolute left-0 top-0 bottom-0 w-[3px] rounded-r-full pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(59, 130, 246, 0.0) 0%, rgba(59, 130, 246, 0.70) 50%, rgba(59, 130, 246, 0.0) 100%)",
              }}
            />
          )}
          <div className="min-w-0">
            <p
              className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                isLightAppearance ? "text-blue-700/70" : "text-blue-100/58"
              }`}
            >
              {welcomeEyebrow}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`bd-dashboard-chip px-2.5 py-1 text-[11px] font-medium ${
                  isLightAppearance
                    ? "bg-white/85 text-blue-700"
                    : "border-blue-200/20 bg-white/10 text-blue-50"
                }`}
              >
                {welcomeChipLabel}
              </span>
            </div>
            <h1
              className={`mt-2 text-lg font-bold tracking-tight sm:truncate md:text-2xl ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
            >
              {isNewUser ? `Welcome, ${firstName}!` : `Welcome back, ${firstName}`}
            </h1>
            <p
              className={`text-sm md:text-[0.92rem] leading-snug ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
            >
              {userType === "customer" &&
                (isNewUser
                  ? "Submit a damage report to receive competitive bids"
                  : "Here\u2019s what\u2019s happening with your repairs")}
              {userType === "shop" && "Track incoming requests and active repairs"}
              {userType === "insurer" && "Monitor claims and partner shop performance"}
            </p>
          </div>
          <div className="flex w-full flex-wrap items-center gap-2 shrink-0 sm:w-auto sm:flex-nowrap">
            <button
              onClick={primaryAction.onClick}
              className="bd-dashboard-primary-button inline-flex min-h-[44px] w-full items-center justify-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold text-white active:scale-[0.97] sm:w-auto sm:whitespace-nowrap"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              {primaryAction.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {demoMode && onExitDemoMode && userType !== originalAccountType && (
              <button
                onClick={onExitDemoMode}
                className={`bd-dashboard-secondary-button min-h-[44px] w-full rounded-xl px-3 py-2 text-sm font-medium sm:w-auto ${
                  isLightAppearance
                    ? "border-slate-200/80 bg-white/90 text-slate-700"
                    : "border-blue-200/18 bg-slate-950/55 text-blue-50"
                }`}
              >
                Exit Demo
              </button>
            )}
          </div>
        </section>
        {isNewUser && userType === "customer" ? (
          <HomeOnboardingCard primaryColor={primaryColor} secondaryColor={secondaryColor} />
        ) : null}
        {/* Quick Actions — role-specific navigation buttons */}
        <HomeQuickActions quickActions={quickActions} appearanceMode={appearanceMode} />
        {/* Customer: Estimate Request Status Cards */}
        {userType === "customer" && estimateRequests.length > 0 && (
          <section className="bd-dashboard-panel bd-dashboard-panel--accent-indigo px-4 py-3.5 md:px-5 md:py-4">
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <div className="mb-1 flex items-center gap-2">
                  <Mail
                    className={`h-4 w-4 ${isLightAppearance ? "text-indigo-600" : "text-indigo-300"}`}
                  />
                  <p
                    className={`text-[11px] font-semibold uppercase tracking-[0.22em] ${
                      isLightAppearance ? "text-slate-500" : "text-indigo-100/58"
                    }`}
                  >
                    Live outreach
                  </p>
                </div>
                <h2
                  className={`text-sm font-semibold ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
                >
                  Estimate Requests
                </h2>
                <p
                  className={`mt-1 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/64"}`}
                >
                  Track which shops have viewed, answered, or accepted your request.
                </p>
              </div>
              <span
                className={`bd-dashboard-chip shrink-0 px-2 py-1 text-xs font-medium ${
                  isLightAppearance
                    ? "bg-white/85 text-indigo-700"
                    : "border-indigo-200/18 bg-white/10 text-indigo-50"
                }`}
              >
                {estimateRequests.length} sent
              </span>
            </div>
            <div className="space-y-2">
              {estimateRequests.slice(0, 3).map((req) => {
                const requestToneClass =
                  req.status === "responded" || req.status === "accepted"
                    ? "bd-dashboard-section--accent-cyan"
                    : req.status === "viewed"
                      ? "bd-dashboard-section--accent-blue"
                      : "bd-dashboard-section--deep";
                const statusIcon =
                  req.status === "responded" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                  ) : req.status === "declined" ? (
                    <XCircle className="h-3.5 w-3.5 text-slate-400" />
                  ) : req.status === "accepted" ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-blue-400" />
                  ) : (
                    <Clock className="h-3.5 w-3.5 text-amber-400" />
                  );
                const statusText =
                  req.status === "responded"
                    ? "Shop responded"
                    : req.status === "declined"
                      ? "Declined"
                      : req.status === "accepted"
                        ? "Accepted"
                        : req.status === "viewed"
                          ? "Viewed by shop"
                          : "Pending";
                return (
                  <button
                    key={req.id}
                    type="button"
                    onClick={() => onSelectEstimate?.(req)}
                    className={`bd-dashboard-section bd-dashboard-section--interactive flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left ${requestToneClass}`}
                  >
                    {statusIcon}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium truncate ${isLightAppearance ? "text-slate-800" : "text-slate-200"}`}
                      >
                        {req.shop_name || "Shop"}
                      </p>
                      <p
                        className={`text-xs truncate ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
                      >
                        {req.description}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 text-[11px] font-medium ${
                        req.status === "responded"
                          ? isLightAppearance
                            ? "text-green-600"
                            : "text-green-400"
                          : req.status === "accepted"
                            ? isLightAppearance
                              ? "text-blue-600"
                              : "text-blue-400"
                            : req.status === "declined"
                              ? "text-slate-400"
                              : isLightAppearance
                                ? "text-amber-600"
                                : "text-amber-400"
                      }`}
                    >
                      {statusText}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        )}
        {/* Report list always accessible as floating panel */}
        <HomeReportsList
          userType={userType}
          appearanceMode={appearanceMode}
          listHeader={listHeader}
          sortedReports={sortedReports}
          primaryColor={primaryColor}
          secondaryColor={secondaryColor}
          onViewAll={listViewAllAction}
          onOpenReport={onOpenReport}
          onViewReportOnMap={onViewReportOnMap}
          onStartReport={onStartReport}
          usingSeedFallback={usingSeedFallback}
          onDeleteReport={onDeleteReport}
        />
        {/* Shop: My Bids summary (between reports list and map widget) */}
        {userType === "shop" && shopSubmittedBids && shopSubmittedBids.length > 0 && (
          <ShopBidsSummary
            bids={shopSubmittedBids}
            appearanceMode={appearanceMode}
            onViewJobs={onViewJobs}
          />
        )}
        {/* Map widget — compact preview with CTA to full Shop Directory */}
        {userType === "shop" ? (
          <ShopMapWidget
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            appearanceMode={appearanceMode}
            reports={reports}
            onViewShops={onViewShops}
          />
        ) : userType === "insurer" ? (
          <InsurerMapWidget
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            appearanceMode={appearanceMode}
            reports={reports}
            onViewShops={onViewShops}
          />
        ) : (
          <CustomerMapWidget
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            appearanceMode={appearanceMode}
            reports={reports}
            onViewShops={onViewShops}
          />
        )}
      </div>
    </div>
  );
}
