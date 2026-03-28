import { useState } from "react";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import RepairLifecycleTimeline from "../workflow/RepairLifecycleTimeline";
import { customerLifecycle } from "../workflow/lifecycle-presets";
import { LANDING_PAGE_IMAGES } from "../../constants";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type Report = {
  id: number | string;
  vehicle?: {
    make: string;
    model: string;
    year: string;
    vin?: string;
  };
  // Support flattened vehicle info (from Supabase)
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  damageArea: string;
  photos: string[];
  description: string;
  incident?: string;
  status: string;
  submittedAt: string;
  bidsCount: number;
  bids?: Array<{
    id: string | number;
    shopName?: string;
    shopEmail?: string;
    amount?: number;
    estimatedDays?: number;
    description?: string;
    shopRating?: number;
    shopReviews?: number;
    shopDistance?: string;
  }>;
};

type ReportDetailScreenProps = {
  report: Report;
  onBack: () => void;
  onViewAllBids?: () => void;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ReportDetailScreen({
  report,
  onBack,
  onViewAllBids,
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
}: ReportDetailScreenProps) {
  const isLight = appearanceMode === "light";
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Handle both nested vehicle and flattened vehicle properties
  const vehicleInfo = report.vehicle || {
    make: report.vehicle_make || "",
    model: report.vehicle_model || "",
    year: report.vehicle_year?.toString() || "",
  };

  // Provide safe defaults for potentially undefined properties
  const status = report.status || "pending";
  const photos = report.photos || [];
  const damageArea = report.damageArea || "Unknown";
  const description = report.description || "No description provided";
  const submittedAt = report.submittedAt || new Date().toISOString();

  const interestedShops = (report.bids || []).map((bid) => ({
    id: bid.id,
    name: bid.shopName || "Auto Shop",
    rating: Number(bid.shopRating || 0),
    reviews: Number(bid.shopReviews || 0),
    distance: bid.shopDistance || "Within service area",
    bidAmount: Number(bid.amount || 0),
    estimatedTime: bid.estimatedDays
      ? `${bid.estimatedDays}-${bid.estimatedDays + 1} days`
      : "Timeline pending",
    image: LANDING_PAGE_IMAGES.DEFAULT_PROFILE,
    description: bid.description || "Bid details will be finalized with the shop after selection.",
    shopLatitude: bid.shopLatitude ?? null,
    shopLongitude: bid.shopLongitude ?? null,
  }));

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className={`bd-glass-panel border-b sticky top-0 z-10${isLight ? " bd-light-surface border-slate-200/60" : " border-white/30"}`}>
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className={`mr-3 flex h-11 w-11 items-center justify-center rounded-lg transition-colors ${isLight ? "hover:bg-slate-100" : "hover:bg-white/10"}`}
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">
                {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
              </h1>
              <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Report #{report.id}
              </p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === "pending"
                  ? "bg-sky-100 text-sky-700"
                  : status === "active"
                    ? isLight
                      ? "bg-blue-50 text-blue-700"
                      : "bg-blue-400/15 text-blue-200"
                    : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-2 py-2 space-y-3 sm:px-4 sm:py-4 sm:space-y-4">
        {/* Photo Gallery */}
        <div className={`bd-glass-card overflow-hidden${isLight ? " bd-light-surface" : ""}`}>
          <div className="p-3 sm:p-4">
            <h2 className="font-bold text-lg mb-2 sm:mb-3">Damage Photos</h2>
            {photos.length === 0 ? (
              <div
                className={`rounded-xl border border-dashed border-slate-300/60 p-4 text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}
              >
                No photos were submitted with this report.
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
                {photos.map((photo, idx) => (
                  <div
                    key={idx}
                    className={`aspect-square ${isLight ? "bg-slate-100" : "bg-white/[0.06]"} rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity min-w-[44px] min-h-[44px]`}
                    onClick={() => setSelectedPhoto(photo)}
                  >
                    <ImageWithFallback
                      src={photo}
                      alt={`Damage photo ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Vehicle Information */}
        <div className={`bd-glass-card p-3 sm:p-4${isLight ? " bd-light-surface" : ""}`}>
          <h2 className="font-bold text-lg mb-3">Vehicle Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={isLight ? "text-slate-500" : "text-slate-400"}>Year:</span>
              <span className="font-medium">{vehicleInfo.year}</span>
            </div>
            <div className="flex justify-between">
              <span className={isLight ? "text-slate-500" : "text-slate-400"}>Make:</span>
              <span className="font-medium">{vehicleInfo.make}</span>
            </div>
            <div className="flex justify-between">
              <span className={isLight ? "text-slate-500" : "text-slate-400"}>Model:</span>
              <span className="font-medium">{vehicleInfo.model}</span>
            </div>
            {report.vehicle?.vin && (
              <div className="flex justify-between">
                <span className={isLight ? "text-slate-500" : "text-slate-400"}>VIN:</span>
                <span className="font-medium text-sm">{report.vehicle.vin}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className={isLight ? "text-slate-500" : "text-slate-400"}>Damaged Area:</span>
              <span className="font-medium capitalize">{damageArea}</span>
            </div>
          </div>
        </div>

        {/* Damage Description */}
        <div className={`bd-glass-card p-3 sm:p-4${isLight ? " bd-light-surface" : ""}`}>
          <h2 className="font-bold text-lg mb-3">Damage Description</h2>
          <p className={isLight ? "text-slate-700" : "text-slate-300"}>{description}</p>
          {report.incident && (
            <>
              <h3 className="font-medium mt-4 mb-2">What Happened</h3>
              <p className={isLight ? "text-slate-700" : "text-slate-300"}>{report.incident}</p>
            </>
          )}
        </div>

        {/* Submission Details */}
        <div className={`bd-glass-card p-3 sm:p-4${isLight ? " bd-light-surface" : ""}`}>
          <h2 className="font-bold text-lg mb-3">Submission Details</h2>
          <div
            className={`flex items-center text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}
          >
            <Clock className="w-4 h-4 mr-2" />
            <span>
              Submitted on{" "}
              {new Date(submittedAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>

        <RepairLifecycleTimeline
          title="Repair Progress"
          subtitle="Track where your request is in the repair journey"
          steps={customerLifecycle(status)}
          appearanceMode={appearanceMode}
        />

        {/* Interested Shops */}
        <div className={`bd-glass-card p-3 sm:p-4${isLight ? " bd-light-surface" : ""}`}>
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Interested Shops</h2>
            <span className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              {interestedShops.length} bids received
            </span>
          </div>

          {interestedShops.length === 0 ? (
            <div
              className={`rounded-xl border border-dashed border-slate-300/60 p-4 text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}
            >
              No bids have arrived yet. Shops will appear here as soon as they respond.
            </div>
          ) : (
            <div className="space-y-3">
              {interestedShops.map((shop) => (
                <div
                  key={shop.id}
                  className={`bd-glass-card p-3 hover:shadow-md transition-all duration-200${isLight ? " bd-light-surface" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ${isLight ? "bg-slate-100" : "bg-white/[0.06]"}`}
                    >
                      <ImageWithFallback
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3
                          className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                        >
                          {shop.name}
                        </h3>
                        <span className="bd-glass-badge ml-2 flex-shrink-0">BID</span>
                      </div>

                      <div className="flex items-center text-sm mb-2 flex-wrap gap-x-2 gap-y-1">
                        {shop.rating > 0 ? (
                          <>
                            <Star
                              className="w-3 h-3 text-yellow-400 flex-shrink-0"
                              fill="#FBBF24"
                            />
                            <span className="font-medium">{shop.rating}</span>
                            {shop.reviews > 0 && (
                              <span className={isLight ? "text-slate-500" : "text-slate-400"}>
                                ({shop.reviews})
                              </span>
                            )}
                          </>
                        ) : (
                          <span
                            className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}
                          >
                            No rating yet
                          </span>
                        )}
                        <span className="text-slate-500">•</span>
                        <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span
                          className={`truncate ${isLight ? "text-slate-500" : "text-slate-400"}`}
                        >
                          {shop.distance}
                        </span>
                      </div>

                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div
                            className="text-lg font-bold tabular-nums"
                            style={{ color: primaryColor }}
                          >
                            ${shop.bidAmount?.toLocaleString()}
                          </div>
                          <div
                            className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}
                          >
                            {shop.estimatedTime}
                          </div>
                        </div>
                        <button
                          className="px-4 py-2.5 min-h-[44px] rounded-xl text-white text-sm font-semibold flex-shrink-0"
                          style={{ backgroundColor: primaryColor }}
                          onClick={onViewAllBids}
                        >
                          View Bid
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {interestedShops.length > 0 && (
            <>
              {/* Mobile: sticky footer */}
              <button
                className="sm:hidden fixed left-2 right-2 bottom-2 z-40 py-3 px-4 rounded-xl text-white font-semibold shadow-lg min-h-[52px]"
                style={{ backgroundColor: primaryColor }}
                onClick={onViewAllBids}
              >
                Compare All Bids
              </button>
              {/* Desktop: inline */}
              <button
                className="hidden sm:block w-full mt-4 py-3 px-4 rounded-xl text-white font-semibold"
                style={{ backgroundColor: primaryColor }}
                onClick={onViewAllBids}
              >
                Compare All Bids
              </button>
            </>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white text-3xl min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close"
          >
            ×
          </button>
          <img
            src={selectedPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
            style={{ maxWidth: "100vw", maxHeight: "100vh" }}
          />
        </div>
      )}
    </div>
  );
}
