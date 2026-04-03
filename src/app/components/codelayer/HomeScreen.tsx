import { ArrowRight, Mail, Clock, CheckCircle2, XCircle } from "lucide-react";
import CustomerMapWidget from "../dashboard/CustomerMapWidget";
import ShopMapWidget from "../dashboard/ShopMapWidget";
import InsurerMapWidget from "../dashboard/InsurerMapWidget";
import ShopBidsSummary from "../shop/ShopBidsSummary";
import { buildPrimaryAction, buildQuickActions } from "./homeScreenData";
import { HomeOnboardingCard, HomeQuickActions, HomeReportsList } from "./HomeScreenSections";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";
import type { EstimateRequest } from "../../services/supabase/estimateRequests";
import type { Bid as SupabaseBid } from "../../services/supabase/types";

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
  shopSubmittedBids?: SupabaseBid[];
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

  // Map-first, floating overlays layout
  return (
    <div className="relative w-full h-full min-h-[80vh] flex flex-col items-center justify-start pb-20 md:pb-10">
      {/* Dashboard content — welcome, actions, reports, then map widget */}
      <div className="relative z-20 mt-3 w-full max-w-4xl px-2 md:mt-6 md:px-6 flex flex-col gap-3.5 md:gap-5">
        {/* Compact welcome bar */}
        <section
          className={`bd-glass-floating relative flex items-center justify-between gap-3 overflow-hidden px-4 py-3 md:px-5 md:py-3.5 flex-wrap${isLightAppearance ? " bd-light-surface" : ""}`}
          style={
            isLightAppearance
              ? {
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 252, 255, 0.92) 100%)",
                  borderColor: "rgba(148, 163, 184, 0.28)",
                  boxShadow:
                    "0 10px 32px rgba(15, 23, 42, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.90)",
                }
              : {
                  background:
                    "linear-gradient(180deg, rgba(8, 18, 46, 0.88) 0%, rgba(7, 15, 38, 0.82) 100%)",
                  borderColor: "rgba(96, 165, 250, 0.22)",
                  boxShadow:
                    "0 12px 36px rgba(2, 8, 24, 0.45), inset 0 1px 0 rgba(147, 197, 253, 0.14), 0 0 40px rgba(37, 99, 235, 0.06)",
                }
          }
        >
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
            <h1
              className={`text-lg md:text-2xl font-bold tracking-tight truncate ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
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
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={primaryAction.onClick}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[44px] rounded-xl text-sm font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.97] text-white whitespace-nowrap"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
                boxShadow: "0 4px 16px rgba(37, 99, 235, 0.25)",
              }}
            >
              {primaryAction.label}
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            {demoMode && onExitDemoMode && userType !== originalAccountType && (
              <button
                onClick={onExitDemoMode}
                className={`px-3 py-2 min-h-[40px] text-sm font-medium rounded-xl border transition-colors ${
                  isLightAppearance
                    ? "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 shadow-sm"
                    : "bd-glass-control text-blue-100"
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
        <HomeQuickActions
          quickActions={quickActions}
          appearanceMode={appearanceMode}
          primaryColor={primaryColor}
        />
        {/* Customer: Estimate Request Status Cards */}
        {userType === "customer" && estimateRequests.length > 0 && (
          <section
            className={`bd-glass-floating px-4 py-3.5 md:px-5 md:py-4${isLightAppearance ? " bd-light-surface" : ""}`}
            style={
              isLightAppearance
                ? {
                    background: "rgba(255, 255, 255, 0.95)",
                    borderColor: "rgba(148, 163, 184, 0.28)",
                  }
                : {
                    background:
                      "linear-gradient(180deg, rgba(8, 18, 46, 0.88) 0%, rgba(7, 15, 38, 0.82) 100%)",
                    borderColor: "rgba(96, 165, 250, 0.22)",
                  }
            }
          >
            <div className="flex items-center gap-2 mb-3">
              <Mail
                className={`h-4 w-4 ${isLightAppearance ? "text-blue-600" : "text-blue-400"}`}
              />
              <h2
                className={`text-sm font-semibold ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
              >
                Estimate Requests
              </h2>
              <span
                className={`ml-auto text-xs font-medium ${isLightAppearance ? "text-slate-500" : "text-slate-400"}`}
              >
                {estimateRequests.length} sent
              </span>
            </div>
            <div className="space-y-2">
              {estimateRequests.slice(0, 3).map((req) => {
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
                    className={`flex items-center gap-3 rounded-xl px-3 py-2.5 w-full text-left transition-colors ${isLightAppearance ? "bg-slate-50 hover:bg-slate-100" : "bg-white/[0.04] hover:bg-white/[0.08]"}`}
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
