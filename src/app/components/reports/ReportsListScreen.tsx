import { useState } from "react";
import { ArrowLeft, Clock, DollarSign, ChevronRight, ZoomIn, X, ChevronLeft } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type Report = {
  id: number;
  vehicle: {
    make: string;
    model: string;
    year: string;
    vin?: string;
  };
  damageArea: string;
  photos: string[];
  description: string;
  incident?: string;
  status: string;
  submittedAt: string;
  bidsCount: number;
};

type ReportsListScreenProps = {
  reports: Report[];
  reportsLoading: boolean;
  reportsError: string | null;
  onBack: () => void;
  onSelectReport: (reportId: number) => void;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ReportsListScreen({
  reports,
  reportsLoading,
  reportsError,
  onBack,
  onSelectReport,
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
}: ReportsListScreenProps) {
  const isLight = appearanceMode === "light";
  const [filter, setFilter] = useState("all"); // all, pending, active, completed
  const [selectedPhotos, setSelectedPhotos] = useState<string[] | null>(null);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Support for error/empty/loading states
  const filteredReports = Array.isArray(reports)
    ? reports.filter((report) => {
        if (filter === "all") return true;
        return report.status === filter;
      })
    : [];

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div
        className={`bd-glass-panel border-b sticky top-0 z-10${isLight ? " bd-light-surface border-slate-200/60" : " border-white/30"}`}
      >
        <div className="px-4 py-4">
          <div className="flex items-center mb-3">
            <button
              onClick={onBack}
              className="mr-3 flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
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
                className={`px-4 py-2.5 min-h-[44px] rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === tab.id ? "text-white" : "bd-glass-control--utility"
                }`}
                style={filter === tab.id ? { backgroundColor: primaryColor } : {}}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reports List */}
      <div className="px-4 py-4 space-y-4">
        {reportsLoading ? (
          <div
            className={`bd-glass-card p-5 sm:p-8 text-center${isLight ? " bd-light-surface" : ""}`}
          >
            <p className={isLight ? "text-slate-500" : "text-slate-400"}>Loading reports…</p>
          </div>
        ) : reportsError ? (
          <div
            className={`bd-glass-card p-5 sm:p-8 text-center${isLight ? " bd-light-surface" : ""}`}
          >
            <p className="text-red-600 font-semibold">Unable to load reports</p>
          </div>
        ) : filteredReports.length === 0 ? (
          <div
            className={`bd-glass-card p-5 sm:p-8 text-center${isLight ? " bd-light-surface" : ""}`}
          >
            <p className={isLight ? "text-slate-500" : "text-slate-400"}>No reports yet</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            return (
              <div
                key={report.id}
                className={`bd-glass-card overflow-hidden hover:shadow-md transition-shadow${isLight ? " bd-light-surface" : ""}`}
              >
                <div className="flex gap-3 p-4">
                  {/* Small Photo Thumbnail - Left Side */}
                  {report.photos && report.photos.length > 0 && (
                    <div
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity relative group ${isLight ? "bg-slate-100" : "bg-white/[0.06]"}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPhotos(report.photos);
                        setCurrentPhotoIndex(0);
                        setZoomLevel(1);
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
                    onClick={() => onSelectReport(report.id)}
                  >
                    <div className="flex items-start justify-between mb-1">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-lg truncate">
                          {report.vehicle.year} {report.vehicle.make} {report.vehicle.model}
                        </h3>
                        <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                          Damage to {report.damageArea}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium whitespace-nowrap ml-2 flex-shrink-0 ${
                          report.status === "pending"
                            ? "bg-sky-100 text-sky-700"
                            : report.status === "active"
                              ? "bg-blue-100 text-blue-400"
                              : "bg-indigo-100 text-indigo-700"
                        }`}
                      >
                        {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
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
                        <span>{new Date(report.submittedAt).toLocaleDateString()}</span>
                      </div>
                      {report.bidsCount > 0 && (
                        <div className="flex items-center text-blue-600 font-medium">
                          <DollarSign className="w-3.5 h-3.5 mr-1" />
                          <span>{report.bidsCount} bids</span>
                        </div>
                      )}
                    </div>

                    {/* Bids Info */}
                    {report.bidsCount > 0 && (
                      <div
                        className={`flex items-center gap-2 pt-2 border-t ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}
                      >
                        <div className="flex -space-x-1.5">
                          {[...Array(Math.min(report.bidsCount, 3))].map((_, idx) => (
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
                    )}

                    {/* No bids yet */}
                    {report.bidsCount === 0 && (
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

      {/* Photo Gallery Lightbox - Clean Mobile-Friendly Design */}
      {selectedPhotos && selectedPhotos.length > 0 && (
        <div
          className="fixed inset-0 bg-black z-50 flex flex-col"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSelectedPhotos(null);
              setCurrentPhotoIndex(0);
              setZoomLevel(1);
            }
          }}
        >
          {/* Header Bar */}
          <div className="flex items-center justify-between p-4 bg-black/50 backdrop-blur">
            <div className="text-white">
              <span className="font-medium">
                {currentPhotoIndex + 1} / {selectedPhotos.length}
              </span>
            </div>
            <button
              className="text-white hover:bg-white/10 rounded-full p-2 transition-colors"
              onClick={() => {
                setSelectedPhotos(null);
                setCurrentPhotoIndex(0);
                setZoomLevel(1);
              }}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Main Photo Area with Touch Support */}
          <div
            className="flex-1 flex items-center justify-center relative overflow-hidden"
            onTouchStart={(e) => {
              setTouchStart(e.targetTouches[0].clientX);
            }}
            onTouchMove={(e) => {
              setTouchEnd(e.targetTouches[0].clientX);
            }}
            onTouchEnd={() => {
              if (touchStart - touchEnd > 75) {
                // Swiped left - next photo
                if (currentPhotoIndex < selectedPhotos.length - 1) {
                  setCurrentPhotoIndex((prev) => prev + 1);
                  setZoomLevel(1);
                }
              }
              if (touchStart - touchEnd < -75) {
                // Swiped right - previous photo
                if (currentPhotoIndex > 0) {
                  setCurrentPhotoIndex((prev) => prev - 1);
                  setZoomLevel(1);
                }
              }
            }}
            onDoubleClick={() => {
              // Double-click to toggle zoom
              setZoomLevel((prev) => (prev === 1 ? 2 : 1));
            }}
            onClick={(e) => {
              if (e.detail === 2) {
                // Double-tap for mobile
                setZoomLevel((prev) => (prev === 1 ? 2 : 1));
              }
            }}
          >
            <img
              src={selectedPhotos[currentPhotoIndex]}
              alt={`Photo ${currentPhotoIndex + 1}`}
              className="max-w-full max-h-full object-contain transition-transform duration-300"
              style={{
                transform: `scale(${zoomLevel})`,
                cursor: zoomLevel === 1 ? "zoom-in" : "zoom-out",
              }}
            />

            {/* Navigation Arrows (Desktop) */}
            {selectedPhotos.length > 1 && (
              <>
                {currentPhotoIndex > 0 && (
                  <button
                    className="hidden md:flex absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur text-white rounded-full p-3 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex((prev) => prev - 1);
                      setZoomLevel(1);
                    }}
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                )}
                {currentPhotoIndex < selectedPhotos.length - 1 && (
                  <button
                    className="hidden md:flex absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/10 hover:bg-white/20 backdrop-blur text-white rounded-full p-3 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex((prev) => prev + 1);
                      setZoomLevel(1);
                    }}
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                )}
              </>
            )}
          </div>

          {/* Bottom Controls */}
          <div className="p-4 bg-black/50 backdrop-blur space-y-3">
            {/* Photo Thumbnails Strip */}
            {selectedPhotos.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {selectedPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                      idx === currentPhotoIndex
                        ? "border-white scale-105"
                        : "border-white/30 opacity-60 hover:opacity-100"
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setCurrentPhotoIndex(idx);
                      setZoomLevel(1);
                    }}
                  >
                    <img
                      src={photo}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Instructions */}
            <div className="text-center text-white/70 text-sm">
              <span className="hidden md:inline">Click photo to zoom • </span>
              <span className="md:hidden">Double-tap to zoom • Swipe to navigate • </span>
              Tap outside to close
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
