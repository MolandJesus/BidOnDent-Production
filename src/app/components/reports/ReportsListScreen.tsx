import { useMemo, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Clock, DollarSign, ChevronRight, ZoomIn, MapPin, Wrench } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import PhotoGalleryLightbox from "./PhotoGalleryLightbox";
import { zipToCoordinates } from "../../services/supabase/map";
import { defaultCoverageCenter } from "../landing/coverageData";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { ReportPin } from "../dashboard/MapLibreDashboardMapPreview";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";

type ReportsListScreenProps = {
  reports: DamageReport[];
  reportsLoading: boolean;
  reportsError: string | null;
  onBack: () => void;
  onSelectReport: (reportId: string) => void;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
  onStartReport?: () => void;
};

export default function ReportsListScreen({
  reports,
  reportsLoading,
  reportsError,
  onBack,
  onSelectReport,
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
  onStartReport,
}: ReportsListScreenProps) {
  const isLight = appearanceMode === "light";
  const reduceMotion = useReducedMotion();
  const [filter, setFilter] = useState("all"); // all, pending, active, completed
  const [selectedPhotos, setSelectedPhotos] = useState<string[] | null>(null);

  const getReportToneClass = (report: DamageReport) => {
    const status = String(report.status || "pending");

    if (status === "active") {
      return "bd-dashboard-section--accent-cyan";
    }

    if (status === "completed" || status === "resolved") {
      return "bd-dashboard-section--accent-indigo";
    }

    if ((report.bidsCount || report.bids?.length || 0) > 0) {
      return "bd-dashboard-section--accent-blue";
    }

    return "bd-dashboard-section--deep";
  };

  // Report location pins for overview map
  const reportMapPins = useMemo<ReportPin[]>(() => {
    if (!Array.isArray(reports)) return [];
    return reports
      .map((report) => {
        const vehicleData = report?.vehicle || report?.vehicleInfo || {};
        const label =
          [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean).join(" ") ||
          report?.damageArea ||
          "Damage report";
        const lat = report?.latitude;
        const lng = report?.longitude;
        if (lat != null && lng != null) {
          return { id: String(report.id), lat, lng, label };
        }
        const zipCode = report?.zipCode || "";
        const coords = zipCode ? zipToCoordinates(zipCode) : null;
        if (!coords) return null;
        return { id: String(report.id), lat: coords.lat, lng: coords.lng, label };
      })
      .filter((pin): pin is ReportPin => pin !== null);
  }, [reports]);

  const reportMapCenter = useMemo<[number, number]>(() => {
    if (reportMapPins.length > 0) {
      return [reportMapPins[0].lat, reportMapPins[0].lng];
    }
    return defaultCoverageCenter;
  }, [reportMapPins]);

  // Support for error/empty/loading states
  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) => {
        if (filter === "all") return true;
        if (filter === "pending")
          return report.status === "pending" || report.status === "in-review";
        if (filter === "completed")
          return report.status === "completed" || report.status === "resolved";
        return report.status === filter;
      })
    : [];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-4 pt-4">
        <div className="bd-dashboard-panel bd-dashboard-panel--accent-blue px-4 py-4">
          <div className="flex items-center mb-3">
            <button
              onClick={onBack}
              aria-label="Back"
              className="bd-dashboard-secondary-button mr-3 flex h-11 w-11 items-center justify-center rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <p
                className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  isLight ? "text-blue-700/70" : "text-blue-100/58"
                }`}
              >
                Report Library
              </p>
              <h1 className="text-xl font-bold">My Reports</h1>
              <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {Array.isArray(reports) ? reports.length : 0} total reports
              </p>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto">
            {[
              { id: "all", label: "All" },
              { id: "pending", label: "Pending" },
              { id: "active", label: "Active" },
              { id: "completed", label: "Completed" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id)}
                className={`bd-dashboard-filter-button min-h-[44px] rounded-lg px-4 py-2.5 text-sm font-medium whitespace-nowrap ${
                  filter === tab.id ? "bd-dashboard-filter-button--active" : ""
                }`}
                style={filter === tab.id ? { background: primaryColor } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports Overview Map */}
      {!reportsLoading && filteredReports.length > 0 && (
        <div className="px-4 pt-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.25, delay: 0.06 }}
            className="bd-dashboard-panel bd-dashboard-panel--accent-cyan overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2
                    className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                  >
                    Report locations
                  </h2>
                  <p
                    className={`mt-0.5 text-xs ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
                  >
                    All your submitted damage reports on the map.
                  </p>
                </div>
                <span className="bd-dashboard-chip shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold">
                  {reportMapPins.length}/{filteredReports.length} mapped
                </span>
              </div>
            </div>

            {reportMapPins.length > 0 ? (
              <>
                <div className="h-[180px] md:h-[200px]">
                  <DashboardMapPreview
                    shops={[]}
                    reportPins={reportMapPins}
                    center={reportMapCenter}
                    zoom={10}
                    isLight={isLight}
                    onReportPinClick={(pin) => {
                      if (pin.id) {
                        onSelectReport(pin.id);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <span className="bd-dashboard-chip inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium">
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Damage report
                  </span>
                  <span
                    className={`text-[11px] ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
                  >
                    Tap a pin to view that report.
                  </span>
                </div>
              </>
            ) : (
              <div
                className={`bd-dashboard-note mx-3 mb-3 flex items-start gap-2 rounded-xl px-3 py-2.5 text-xs ${
                  isLight ? "text-slate-600" : "text-slate-300"
                }`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  No report locations available. Reports with ZIP codes will appear on this map.
                </span>
              </div>
            )}
          </motion.section>
        </div>
      )}

      {/* Reports List */}
      <div className="px-4 py-4 space-y-4">
        {reportsLoading ? (
          <div className="bd-dashboard-panel bd-dashboard-panel--deep p-5 text-center sm:p-8">
            <p className={isLight ? "text-slate-500" : "text-slate-400"}>Loading reports…</p>
          </div>
        ) : reportsError ? (
          <div className="bd-dashboard-panel bd-dashboard-panel--accent-indigo p-5 text-center sm:p-8">
            <p className="text-red-600 font-semibold">Unable to load reports</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bd-dashboard-panel bd-dashboard-panel--deep p-5 text-center sm:p-8">
            <MapPin
              className={`w-12 h-12 mx-auto mb-3 ${isLight ? "text-blue-500/60" : "text-blue-400/70"}`}
            />
            <p className={isLight ? "text-slate-900" : "text-slate-100"}>No reports yet</p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              Submit a damage report to start getting bids from local shops.
            </p>
            {onStartReport && (
              <button
                type="button"
                onClick={onStartReport}
                className="bd-dashboard-primary-button mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
                style={{ background: primaryColor }}
              >
                Start New Report
              </button>
            )}
          </div>
        ) : (
          filteredReports.map((report) => {
            const submittedAt = report.submittedAt || report.createdAt;
            const bidsCount = report.bidsCount || 0;

            return (
              <div
                key={report.id}
                className={`bd-dashboard-section bd-dashboard-section--interactive overflow-hidden transition-shadow ${getReportToneClass(report)}`}
              >
                <div className="flex gap-3 p-4">
                  {/* Small Photo Thumbnail - Left Side */}
                  {report.photos && report.photos.length > 0 && (
                    <div
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group ${isLight ? "bg-slate-100" : "bg-white/[0.06]"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotos(report.photos);
                      }}
                    >
                      <ImageWithFallback
                        src={report.photos[0]}
                        alt="Damage preview"
                        className="w-full h-full object-cover"
                      />
                      {report.photos.length > 1 && (
                        <div className="absolute bottom-0 right-0 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded-tl">
                          +{report.photos.length - 1}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <ZoomIn className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </div>
                  )}

                  {/* Report Information - Right Side (Prominent) */}
                  <div
                    className="flex-1 min-w-0 cursor-pointer"
                    onClick={() => onSelectReport(String(report.id))}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {report.vehicle?.year || report.vehicleInfo?.year}{" "}
                          {report.vehicle?.make || report.vehicleInfo?.make}{" "}
                          {report.vehicle?.model || report.vehicleInfo?.model}
                        </h3>
                        <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          Damage to{" "}
                          {report.damageArea || report.damageAreas?.[0] || "reported area"}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 flex-shrink-0 ${
                          report.status === "pending"
                            ? isLight
                              ? "bg-sky-100 text-sky-700"
                              : "bg-sky-500/15 text-sky-300"
                            : report.status === "active"
                              ? isLight
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-emerald-500/15 text-emerald-300"
                              : report.status === "completed"
                                ? isLight
                                  ? "bg-violet-100 text-violet-700"
                                  : "bg-violet-500/15 text-violet-300"
                                : report.status === "resolved"
                                  ? isLight
                                    ? "bg-emerald-100 text-emerald-700"
                                    : "bg-emerald-500/15 text-emerald-300"
                                  : isLight
                                    ? "bg-indigo-100 text-indigo-700"
                                    : "bg-indigo-500/15 text-indigo-300"
                        }`}
                      >
                        {report.status === "active"
                          ? "In Repair"
                          : report.status === "completed"
                            ? "Repair Done"
                            : report.status === "resolved"
                              ? "Confirmed"
                              : report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                      </span>
                    </div>

                    {report.description && (
                      <p
                        className={`text-sm mb-2 line-clamp-1 ${isLight ? "text-slate-600" : "text-slate-300"}`}
                      >
                        {report.description}
                      </p>
                    )}

                    {/* Stats Row */}
                    <div
                      className={`flex items-center gap-3 text-xs mb-2 ${isLight ? "text-slate-500" : "text-slate-400"}`}
                    >
                      <div className="flex items-center">
                        <Clock className="w-3.5 h-3.5 mr-1" />
                        <span>{new Date(submittedAt).toLocaleDateString()}</span>
                      </div>
                      {bidsCount > 0 && (
                        <div className="flex items-center text-blue-600 font-medium">
                          <DollarSign className="w-3.5 h-3.5 mr-1" />
                          <span>{bidsCount} bids</span>
                        </div>
                      )}
                    </div>

                    {/* Bids Info */}
                    {(report.status === "active" ||
                      report.status === "completed" ||
                      report.status === "resolved") &&
                    report.bids?.find((b) => b.status === "accepted") ? (
                      <div
                        className={`flex items-center gap-2 pt-2 border-t ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
                      >
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15">
                          <Wrench className="h-3.5 w-3.5 text-emerald-500" />
                        </div>
                        <span
                          className={`text-sm font-semibold ${isLight ? "text-emerald-700" : "text-emerald-400"}`}
                        >
                          {report.bids!.find((b) => b.status === "accepted")!.shopName}
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                      </div>
                    ) : bidsCount > 0 ? (
                      <div
                        className={`flex items-center gap-2 pt-2 border-t ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
                      >
                        <div className="flex -space-x-1.5">
                          {[...Array(Math.min(bidsCount, 3))].map((_, idx) => (
                            <div
                              key={idx}
                              className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-xs font-medium"
                              style={{ backgroundColor: primaryColor, color: "white" }}
                            >
                              {String.fromCharCode(65 + idx)}
                            </div>
                          ))}
                        </div>
                        <span
                          className={`text-sm font-semibold ${isLight ? "text-slate-700" : "text-slate-300"}`}
                        >
                          {report.bidsCount} {report.bidsCount === 1 ? "bid" : "bids"} received
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 ml-auto" />
                      </div>
                    ) : (
                      <div
                        className={`pt-2 border-t ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
                      >
                        <p
                          className={`text-xs italic ${isLight ? "text-slate-500" : "text-slate-400"}`}
                        >
                          Waiting for body shops to review...
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Photo Gallery Lightbox */}
      {selectedPhotos && selectedPhotos.length > 0 && (
        <PhotoGalleryLightbox photos={selectedPhotos} onClose={() => setSelectedPhotos(null)} />
      )}
    </div>
  );
}
