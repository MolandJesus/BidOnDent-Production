import {
  ArrowRight,
  Calendar,
  Camera,
  ChevronRight,
  DollarSign,
  Eye,
  type LucideIcon,
} from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { formatDate, formatStatus, getReportTitle, getReportDescription } from "./home-helpers";
import { type ActionItem, statusClasses, actionIconTones } from "./homeScreenData";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

// ============================================================================
// Types
// ============================================================================

type ActivityItem = {
  id: string;
  label: string;
  time: string;
  icon: LucideIcon;
  tone: string;
};

// ============================================================================
// HomeOnboardingCard — "How BidOnDent Works" for new customers
// ============================================================================

export function HomeOnboardingCard({
  primaryColor,
  secondaryColor,
}: {
  primaryColor: string;
  secondaryColor: string;
}) {
  const steps = [
    { label: "Submit a Report", detail: "Upload photos of vehicle damage" },
    { label: "Receive Bids", detail: "Local shops compete for your repair" },
    { label: "Choose & Navigate", detail: "Pick the best offer and get directions" },
  ];

  return (
    <section
      className="rounded-2xl p-5 sm:p-6 text-white relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
        boxShadow:
          "0 8px 32px rgba(37, 99, 235, 0.22), 0 0 48px rgba(59, 130, 246, 0.10), inset 0 1px 0 rgba(255, 255, 255, 0.15)",
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_-10%,rgba(255,255,255,0.12),transparent_50%)]" />
      <div className="relative">
        <h2 className="text-xl font-semibold mb-2">How BidOnDent Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          {steps.map((step, i) => (
            <div key={step.label} className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 text-sm font-bold shadow-sm">
                {i + 1}
              </div>
              <div>
                <p className="font-medium">{step.label}</p>
                <p className="text-white/80 text-sm">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HomeReportsList — report cards + empty state
// ============================================================================

export function HomeReportsList({
  userType,
  appearanceMode = "map-dark",
  listHeader,
  sortedReports,
  primaryColor,
  secondaryColor,
  onViewAll,
  onOpenReport,
  onStartReport,
}: {
  userType: string;
  appearanceMode?: DashboardAppearanceMode;
  listHeader: string;
  sortedReports: any[];
  primaryColor: string;
  secondaryColor: string;
  onViewAll?: () => void;
  onOpenReport?: (reportId: string) => void;
  onStartReport: () => void;
}) {
  const isLightAppearance = appearanceMode === "light";
  return (
    <div
      className="bd-glass-card p-5"
      style={
        isLightAppearance
          ? {
              background:
                "linear-gradient(180deg, rgba(255, 255, 255, 0.88) 0%, rgba(248, 250, 252, 0.84) 100%)",
              borderColor: "rgba(148, 163, 184, 0.25)",
            }
          : {
              background:
                "linear-gradient(180deg, rgba(10, 19, 38, 0.82) 0%, rgba(8, 15, 30, 0.78) 100%)",
              borderColor: "rgba(96, 165, 250, 0.22)",
            }
      }
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`text-xl font-semibold ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
        >
          {listHeader}
        </h2>
        <button
          onClick={onViewAll}
          className={`text-sm font-medium inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-xl transition-colors ${isLightAppearance ? "text-blue-600 hover:text-blue-800 hover:bg-blue-50/60" : "text-blue-200 hover:text-white hover:bg-blue-400/12"}`}
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {sortedReports.length === 0 && (
        <div
          className={`bd-glass-card p-5 sm:p-8 text-center ${isLightAppearance ? "bg-slate-50/60 border-slate-200/40" : "bg-blue-950/30 border-blue-300/22"}`}
        >
          <Camera
            className={`w-10 h-10 mx-auto mb-3 ${isLightAppearance ? "text-blue-500/60" : "text-blue-400/70"}`}
          />
          <p
            className={`font-medium mb-1 ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
          >
            {userType === "customer" && "No repair requests yet"}
            {userType === "shop" && "No customer requests yet"}
            {userType === "insurer" && "No claims submitted yet"}
          </p>
          <p
            className={`text-sm mb-4 ${isLightAppearance ? "text-slate-500" : "text-blue-100/75"}`}
          >
            {userType === "customer" &&
              "Submit your first damage report to start receiving competitive bids from local shops."}
            {userType === "shop" && "New customer requests will appear here as they come in."}
            {userType === "insurer" && "Submitted claims will appear here for review."}
          </p>
          {userType === "customer" && (
            <button
              onClick={onStartReport}
              className="inline-flex items-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium text-white shadow-sm hover:shadow-md transition-all"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
              }}
            >
              <Camera className="w-4 h-4" />
              Start Your First Report
            </button>
          )}
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
                className={`bd-glass-card p-4 transition-shadow ${isLightAppearance ? "bg-white/60 border-slate-200/40" : "bg-slate-900/25 border-blue-200/18"} ${
                  canOpenReport ? "hover:shadow-md cursor-pointer" : ""
                }`}
                style={
                  isLightAppearance
                    ? undefined
                    : { boxShadow: "inset 0 1px 0 rgba(148,163,184,0.06)" }
                }
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
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100/60 flex-shrink-0 border border-slate-200/40">
                    {hasPhoto ? (
                      <ImageWithFallback
                        src={report.photos[0]}
                        alt="Damage report"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-blue-400/50">
                        <Camera className="w-7 h-7" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-lg md:text-xl font-semibold truncate ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
                      >
                        {title}
                      </h3>
                      <span
                        className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusClass}`}
                      >
                        {formatStatus(status)}
                      </span>
                    </div>
                    <p
                      className={`mt-1 line-clamp-2 ${isLightAppearance ? "text-slate-500" : "text-blue-100/75"}`}
                    >
                      {description}
                    </p>

                    <div
                      className={`flex flex-wrap items-center gap-4 mt-3 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
                    >
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
                  <ChevronRight
                    className={`w-5 h-5 mt-7 flex-shrink-0 ${isLightAppearance ? "text-slate-400" : "text-blue-200/80"}`}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// HomeSidebar — quick actions, activity feed, pro tip
// ============================================================================

export function HomeSidebar({
  quickActions,
  activityItems,
  primaryColor,
  secondaryColor,
}: {
  quickActions: ActionItem[];
  activityItems: ActivityItem[];
  primaryColor: string;
  secondaryColor: string;
}) {
  return (
    <aside className="xl:col-span-4 space-y-5">
      <section className="bd-glass-card p-5">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Quick Actions</h2>
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
                className={`text-left p-4 transition-all duration-200 rounded-xl font-medium ${
                  isDisabled
                    ? "border border-slate-200/60 bg-slate-100/60 text-slate-400 cursor-not-allowed"
                    : "bd-glass-card hover:shadow-lg hover:-translate-y-1 active:scale-[0.97] hover:border-blue-200/60"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${iconTone}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-900 text-sm">{action.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{action.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bd-glass-card p-5">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Activity</h2>
        {activityItems.length === 0 && (
          <p className="text-slate-600 text-sm">No recent activity to show yet.</p>
        )}
        {activityItems.length > 0 && (
          <div className="space-y-3">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-slate-50/60 transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${item.tone}`}
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
        className="bd-glass-card rounded-2xl p-5 relative overflow-hidden"
        style={{ borderColor: "rgba(219, 234, 254, 0.7)" }}
      >
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}14 0%, ${secondaryColor}0a 100%)`,
          }}
        />
        <div className="flex items-center gap-2 mb-2 relative">
          <Eye className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-semibold text-slate-900">Pro Tip</h3>
        </div>
        <p className="text-slate-600 text-sm relative">
          Compare at least 3 bids before selecting a shop. Review warranty terms and timeline to
          avoid surprises.
        </p>
      </section>
    </aside>
  );
}
