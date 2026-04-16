import {
  AlertCircle,
  ArrowRight,
  Calendar,
  Camera,
  ChevronRight,
  DollarSign,
  MapPin,
  Wrench,
} from "lucide-react";
import ImageWithFallback from "./ImageWithFallback";
import { formatDate, formatStatus, getReportTitle, getReportDescription } from "./home-helpers";
import { statusClasses, statusClassesLight } from "./homeScreenData";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";

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
  usingSeedFallback = false,
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
  usingSeedFallback?: boolean;
}) {
  const isLightAppearance = appearanceMode === "light";
  const visibleReports = sortedReports.slice(0, 4);

  const getReportToneClass = (report: DamageReport) => {
    const status = String(report?.status ?? "pending").toLowerCase();
    const acceptedBid =
      status === "active" ? report.bids?.find((bid) => bid.status === "accepted") : undefined;

    if (acceptedBid) {
      return "bd-dashboard-section--accent-cyan";
    }

    if ((report?.bids?.length ?? report?.bidsCount ?? 0) > 0 || status === "in-review") {
      return "bd-dashboard-section--accent-blue";
    }

    if (status === "completed" || status === "resolved") {
      return "bd-dashboard-section--accent-indigo";
    }

    return "bd-dashboard-section--deep";
  };

  return (
    <div className="bd-dashboard-panel bd-dashboard-panel--deep rounded-2xl p-4 sm:p-5">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p
            className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
              isLightAppearance ? "text-slate-500" : "text-blue-100/55"
            }`}
          >
            Repair Activity
          </p>
          <h2
            className={`text-base font-semibold ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
          >
            {listHeader}
          </h2>
          <p
            className={`mt-1 text-sm ${isLightAppearance ? "text-slate-500" : "text-blue-100/65"}`}
          >
            {sortedReports.length > 0
              ? "Your most recent items with map access and status context."
              : "This space fills in once reports or requests start coming through."}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span
            className={`bd-dashboard-chip px-2.5 py-1 text-[11px] font-medium ${
              isLightAppearance
                ? "bg-white/85 text-blue-700"
                : "border-blue-200/18 bg-white/10 text-blue-50"
            }`}
          >
            {sortedReports.length > 0 ? `${visibleReports.length} recent` : "Waiting"}
          </span>
          {onViewAll && (
            <button
              onClick={onViewAll}
              className="bd-dashboard-ghost-button inline-flex min-h-[44px] items-center gap-1 rounded-xl px-3 py-2 text-sm font-medium"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {usingSeedFallback && (
        <div className="mb-3 flex items-center gap-2 rounded-lg bg-amber-500/15 border border-amber-400/25 px-3 py-2 text-xs text-amber-300">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          <span>
            Showing example requests for preview. Real requests will appear as customers submit
            reports.
          </span>
        </div>
      )}

      {sortedReports.length === 0 && (
        <div className="bd-dashboard-section bd-dashboard-section--accent-blue rounded-xl p-4 text-center sm:p-8">
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
              className="bd-dashboard-primary-button inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white"
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
          {visibleReports.map((report) => {
            const status = String(report?.status ?? "pending").toLowerCase();
            const statusClass = isLightAppearance
              ? (statusClassesLight[status] ?? "bg-slate-100 text-slate-600")
              : (statusClasses[status] ?? "bg-white/[0.08] text-slate-300");
            const title = getReportTitle(report, userType);
            const description = getReportDescription(report, userType);
            const hasPhoto = Array.isArray(report?.photos) && report.photos.length > 0;
            const canOpenReport = Boolean(onOpenReport && report?.id);
            const acceptedBid =
              userType !== "insurer" && status === "active"
                ? report.bids?.find((bid) => bid.status === "accepted")
                : undefined;
            const cardToneClass = getReportToneClass(report);

            return (
              <article
                key={report.id}
                className={`bd-dashboard-section p-4 transition-shadow ${cardToneClass} ${
                  canOpenReport ? "bd-dashboard-section--interactive cursor-pointer" : ""
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
                      {userType !== "insurer" && acceptedBid ? (
                        <span
                          className={`inline-flex items-center gap-1.5 font-medium ${isLightAppearance ? "text-emerald-700" : "text-emerald-400"}`}
                        >
                          <Wrench className="w-4 h-4" />
                          {acceptedBid.shopName}
                          {" · $"}
                          {acceptedBid.amount.toLocaleString()}
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
                        className="bd-dashboard-secondary-button inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl"
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
