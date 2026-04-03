import {
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
