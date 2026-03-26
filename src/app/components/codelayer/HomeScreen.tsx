import { ArrowRight } from "lucide-react";
import CustomerMapWidget from "../dashboard/CustomerMapWidget";
import ShopMapWidget from "../dashboard/ShopMapWidget";
import InsurerMapWidget from "../dashboard/InsurerMapWidget";
import { buildPrimaryAction } from "./homeScreenData";
import { HomeOnboardingCard, HomeReportsList } from "./HomeScreenSections";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

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
  reports?: any[];
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

  // Map-first, floating overlays layout
  return (
    <div className="relative w-full h-full min-h-[80vh] flex flex-col items-center justify-start pb-20 md:pb-10">
      {/* Map widget as hero floating panel — offset for sidebar on desktop */}
      <div
        className="fixed left-0 md:left-72 w-full md:w-[calc(100%-18rem)] z-20 flex flex-col items-center pointer-events-none"
        style={{
          top: "max(env(safe-area-inset-top), 4.25rem)",
          paddingTop: "0.5rem",
        }}
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
      <div className="relative z-30 w-full max-w-4xl mt-[410px] md:mt-[320px] px-2 md:px-0 flex flex-col gap-4 md:gap-5 pointer-events-auto">
        {/* Compact welcome bar — stays tight so map dominates */}
        <section
          className="bd-glass-floating px-4 py-3 md:px-5 md:py-3.5 flex items-center justify-between gap-3 flex-wrap"
          style={
            isLightAppearance
              ? {
                  background:
                    "linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(248, 250, 252, 0.88) 100%)",
                  borderColor: "rgba(148, 163, 184, 0.30)",
                  boxShadow:
                    "0 10px 28px rgba(0, 0, 0, 0.06), inset 0 1px 0 rgba(255, 255, 255, 0.80)",
                }
              : {
                  background:
                    "linear-gradient(180deg, rgba(10, 22, 44, 0.84) 0%, rgba(9, 18, 36, 0.78) 100%)",
                  borderColor: "rgba(96, 165, 250, 0.24)",
                  boxShadow:
                    "0 10px 28px rgba(3, 10, 24, 0.40), inset 0 1px 0 rgba(147, 197, 253, 0.12)",
                }
          }
        >
          <div className="min-w-0">
            <h1
              className={`text-lg md:text-2xl font-bold tracking-tight truncate ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 min-h-[40px] rounded-xl text-sm font-semibold hover:shadow-lg transition-all hover:-translate-y-0.5 active:scale-[0.97] text-white whitespace-nowrap"
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
                className="bd-glass-control px-3 py-2 min-h-[40px] text-sm text-blue-700 font-medium"
              >
                Exit Demo
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
          appearanceMode={appearanceMode}
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
