import {
  ArrowRight,
  Calendar,
  Camera,
  ChevronRight,
  DollarSign,
  Eye,
  MapPin,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { formatDate, formatStatus, getReportTitle, getReportDescription } from "./home-helpers";
import {
  type ActionItem,
  statusClasses,
  statusClassesLight,
  actionIconTones,
} from "./homeScreenData";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";

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
      className="relative overflow-hidden rounded-2xl p-4 text-white bd-glass-card sm:p-6"
      style={{
        background:
          "linear-gradient(135deg, rgba(15, 30, 60, 0.92) 0%, rgba(10, 22, 48, 0.88) 50%, rgba(20, 40, 80, 0.85) 100%)",
        borderColor: "rgba(96, 165, 250, 0.25)",
        boxShadow:
          "0 8px 32px rgba(2, 6, 23, 0.35), 0 0 64px rgba(59, 130, 246, 0.10), inset 0 1px 0 rgba(147, 197, 253, 0.12)",
      }}
    >
      {/* Royal blue atmospheric sheen */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 80% -10%, ${primaryColor}22, transparent 50%), radial-gradient(ellipse 50% 40% at -5% 110%, ${secondaryColor}18, transparent 55%)`,
        }}
      />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-400/25 to-transparent" />
      <div className="relative">
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-[0.20em] text-blue-300/55">
          Getting started
        </p>
        <h2 className="mb-2 text-lg font-semibold sm:text-xl">How BidOnDent Works</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:mt-4 sm:grid-cols-3 sm:gap-4">
          {steps.map((step, i) => (
            <div
              key={step.label}
              className="flex items-start gap-3 rounded-xl border border-blue-300/14 bg-white/[0.03] px-3 py-2.5 sm:border-0 sm:bg-transparent sm:px-0 sm:py-0"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/25 text-sm font-bold shadow-sm ring-1 ring-blue-400/30 backdrop-blur-sm">
                {i + 1}
              </div>
              <div>
                <p className="font-semibold">{step.label}</p>
                <p className="mt-0.5 text-sm leading-5 text-blue-100/70">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ============================================================================
// HomeQuickActions — 2x2 grid of role-specific action buttons
// ============================================================================

export function HomeQuickActions({
  quickActions,
  appearanceMode = "map-dark",
  primaryColor,
}: {
  quickActions: ActionItem[];
  appearanceMode?: DashboardAppearanceMode;
  primaryColor: string;
}) {
  const isLight = appearanceMode === "light";
  if (quickActions.length === 0) return null;
  return (
    <section
      className={`rounded-2xl border p-4 md:p-5 ${isLight ? "bg-white/80 border-slate-200/60 shadow-sm" : "bd-glass-card"}`}
    >
      <h2
        className={`mb-3 text-sm font-semibold uppercase tracking-[0.18em] md:text-base md:normal-case md:tracking-normal ${isLight ? "text-slate-800" : "text-slate-100"}`}
      >
        Quick Actions
      </h2>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 snap-x snap-mandatory scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-2.5 sm:overflow-visible sm:px-0 sm:pb-0 md:grid-cols-4 md:gap-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          const iconTone = actionIconTones[index % actionIconTones.length];
          return (
            <button
              key={action.title}
              onClick={action.onClick}
              className={`w-[min(15rem,72vw)] shrink-0 snap-start rounded-xl p-3 text-left font-medium transition-all duration-200 active:scale-[0.97] min-h-[124px] sm:min-h-[44px] sm:w-auto md:p-4 ${
                isLight
                  ? "border border-slate-200/70 bg-white/60 hover:bg-blue-50/50 hover:border-blue-300/40 hover:shadow-sm"
                  : "bd-glass-card hover:shadow-lg hover:-translate-y-0.5 hover:border-blue-400/[0.2]"
              }`}
            >
              <div
                className={`mb-2 flex h-9 w-9 items-center justify-center rounded-xl md:mb-2.5 md:h-10 md:w-10 ${iconTone}`}
              >
                <Icon className="h-4.5 w-4.5 md:h-5 md:w-5" />
              </div>
              <h3
                className={`font-semibold text-sm leading-tight ${isLight ? "text-slate-800" : "text-slate-100"}`}
              >
                {action.title}
              </h3>
              <p
                className={`mt-1 line-clamp-2 text-[11px] leading-snug md:text-xs ${isLight ? "text-slate-500" : "text-slate-500"}`}
              >
                {action.description}
              </p>
            </button>
          );
        })}
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
  onViewReportOnMap,
  onStartReport,
}: {
  userType: string;
  appearanceMode?: DashboardAppearanceMode;
  listHeader: string;
  sortedReports: DamageReport[];
  primaryColor: string;
  secondaryColor: string;
  onViewAll?: () => void;
  onOpenReport?: (reportId: string) => void;
  onViewReportOnMap?: (reportId: string) => void;
  onStartReport: () => void;
}) {
  const isLightAppearance = appearanceMode === "light";
  return (
    <div
      className={`rounded-2xl border p-4 sm:p-5 ${isLightAppearance ? "bg-white/80 border-slate-200/60 shadow-sm" : "bd-glass-card"}`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`text-base font-semibold ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
        >
          {listHeader}
        </h2>
        {onViewAll && (
          <button
            onClick={onViewAll}
            className={`text-sm font-medium inline-flex items-center gap-1 px-3 py-2 min-h-[44px] rounded-xl transition-colors ${isLightAppearance ? "text-blue-600 hover:text-blue-700 hover:bg-blue-50" : "text-blue-200 hover:text-white hover:bg-blue-400/12"}`}
          >
            View All
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {sortedReports.length === 0 && (
        <div
          className={`rounded-xl border p-4 text-center sm:p-8 ${isLightAppearance ? "bg-blue-50/60 border-blue-100/80" : "bg-blue-950/30 border-blue-300/[0.22]"}`}
        >
          <Camera
            className={`w-10 h-10 mx-auto mb-3 ${isLightAppearance ? "text-blue-500/70" : "text-blue-400/70"}`}
          />
          <p
            className={`font-medium mb-1 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
          >
            {userType === "customer" && "No damage reports yet"}
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
            const statusClass = isLightAppearance
              ? (statusClassesLight[status] ?? "bg-slate-100 text-slate-600")
              : (statusClasses[status] ?? "bg-white/[0.08] text-slate-300");
            const title = getReportTitle(report, userType);
            const description = getReportDescription(report, userType);
            const hasPhoto = Array.isArray(report?.photos) && report.photos.length > 0;
            const canOpenReport = Boolean(onOpenReport && report?.id);

            return (
              <article
                key={report.id}
                className={`bd-glass-card${isLightAppearance ? " bd-light-surface" : ""} p-4 transition-shadow ${isLightAppearance ? "border-slate-200/60" : "bg-slate-900/25 border-blue-400/[0.18]"} ${
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
                  <div
                    className={`w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 border ${isLightAppearance ? "bg-slate-100 border-slate-200/70" : "bg-slate-800/40 border-white/10"}`}
                  >
                    {hasPhoto ? (
                      <ImageWithFallback
                        src={report.photos[0]}
                        alt="Damage report"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div
                        className={`w-full h-full flex items-center justify-center ${isLightAppearance ? "text-blue-400/60" : "text-blue-400/50"}`}
                      >
                        <Camera className="w-7 h-7" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h3
                        className={`text-base md:text-lg font-semibold truncate ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
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
                      {userType !== "insurer" &&
                      status === "active" &&
                      report.bids?.find((b) => b.status === "accepted") ? (
                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${isLightAppearance ? "text-emerald-700" : "text-emerald-400"}`}
                        >
                          <Wrench className="w-4 h-4" />
                          {report.bids!.find((b) => b.status === "accepted")!.shopName}
                          {" · $"}
                          {report
                            .bids!.find((b) => b.status === "accepted")!
                            .amount.toLocaleString()}
                        </span>
                      ) : userType !== "insurer" ? (
                        <span className="inline-flex items-center gap-1.5">
                          <DollarSign className="w-4 h-4" />
                          {Number(report?.bids?.length ?? report?.bidsCount ?? 0)} bids received
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-4">
                    {onViewReportOnMap && report?.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewReportOnMap(String(report.id));
                        }}
                        className={`inline-flex items-center justify-center min-h-[44px] min-w-[44px] rounded-xl transition-colors ${
                          isLightAppearance
                            ? "text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                            : "text-blue-300/70 hover:bg-blue-400/12 hover:text-blue-200"
                        }`}
                        title="View on map"
                        aria-label="View report on map"
                      >
                        <MapPin className="w-4.5 h-4.5" />
                      </button>
                    )}
                    <ChevronRight
                      className={`w-5 h-5 flex-shrink-0 ${isLightAppearance ? "text-slate-400" : "text-blue-200/80"}`}
                    />
                  </div>
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
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Quick Actions</h2>
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
                    ? "border border-white/10 bg-slate-800/40 text-slate-400 cursor-not-allowed"
                    : "bd-glass-card hover:shadow-lg hover:-translate-y-1 active:scale-[0.97] hover:border-blue-400/[0.2]"
                }`}
              >
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${iconTone}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-slate-100 text-sm">{action.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-snug">{action.description}</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="bd-glass-card p-5">
        <h2 className="text-xl font-semibold text-slate-100 mb-4">Recent Activity</h2>
        {activityItems.length === 0 && (
          <p className="text-slate-400 text-sm">No recent activity to show yet.</p>
        )}
        {activityItems.length > 0 && (
          <div className="space-y-3">
            {activityItems.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.id}
                  className="flex items-start gap-3 p-2 rounded-xl hover:bg-white/[0.04] transition-colors"
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${item.tone}`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-slate-100 leading-snug">{item.label}</p>
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
        style={{ borderColor: "rgba(96, 165, 250, 0.18)" }}
      >
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}14 0%, ${secondaryColor}0a 100%)`,
          }}
        />
        <div className="flex items-center gap-2 mb-2 relative">
          <Eye className="w-5 h-5 text-blue-400" />
          <h3 className="text-base font-semibold text-slate-100">Pro Tip</h3>
        </div>
        <p className="text-slate-400 text-sm relative">
          Compare at least 3 bids before selecting a shop. Review warranty terms and timeline to
          avoid surprises.
        </p>
      </section>
    </aside>
  );
}
