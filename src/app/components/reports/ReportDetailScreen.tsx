import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, MapPin, Search, Star, Wrench } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import RepairLifecycleTimeline from "../workflow/RepairLifecycleTimeline";
import { customerLifecycle } from "../workflow/lifecycle-presets";
import { LANDING_PAGE_IMAGES } from "../../constants";
import { zipToCoordinates } from "../../services/supabase/map";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { ReportPin } from "../dashboard/MapLibreDashboardMapPreview";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";

type Report = DamageReport & {
  // Support flattened vehicle info (from Supabase)
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
};

type ReportDetailScreenProps = {
  report: Report;
  onBack: () => void;
  onViewAllBids?: () => void;
  onFindShops?: () => void;
  onConfirmCompletion?: (reportId: string) => void;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ReportDetailScreen({
  report,
  onBack,
  onViewAllBids,
  onFindShops,
  onConfirmCompletion,
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

  // Detect accepted bid for active-repair card
  const acceptedBid = useMemo(
    () => (report.bids || []).find((b) => b.status === "accepted"),
    [report.bids]
  );

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

  /** Report location from ZIP code for the mini-map */
  const reportCoords = useMemo(
    () => zipToCoordinates(report.zip_code || report.zipCode),
    [report.zip_code, report.zipCode]
  );

  /** Report pin for the map */
  const reportPins = useMemo<ReportPin[]>(() => {
    if (!reportCoords) return [];
    const label = `${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}`.trim() || "Report";
    return [{ id: report.id, lat: reportCoords.lat, lng: reportCoords.lng, label }];
  }, [reportCoords, report.id, vehicleInfo]);

  /** Bidding shops as "shop" pins — only those with valid coordinates */
  const shopPinsFromBids = useMemo(() => {
    return interestedShops
      .filter((s) => s.shopLatitude != null && s.shopLongitude != null)
      .map((s) => ({
        id: s.id,
        name: s.name,
        label: s.name,
        lat: s.shopLatitude as number,
        lng: s.shopLongitude as number,
        rating: s.rating,
        addressLine: s.distance,
        countyLabel: "",
        specialties: [] as string[],
        dataMode: "live" as const,
      }));
  }, [interestedShops]);

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div
        className={`bd-glass-panel border-b sticky top-0 z-10${isLight ? " bd-light-surface border-slate-200/60" : " border-white/30"}`}
      >
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
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-emerald-400/15 text-emerald-300"
                    : status === "completed"
                      ? isLight
                        ? "bg-violet-50 text-violet-700"
                        : "bg-violet-400/15 text-violet-300"
                      : status === "resolved"
                        ? isLight
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-emerald-400/15 text-emerald-300"
                        : "bg-indigo-100 text-indigo-700"
              }`}
            >
              {status === "active"
                ? "In Repair"
                : status === "completed"
                  ? "Repair Done"
                  : status === "resolved"
                    ? "Confirmed"
                    : status.charAt(0).toUpperCase() + status.slice(1)}
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

        {/* Report Location Map */}
        {reportCoords && (
          <div className={`bd-glass-card overflow-hidden${isLight ? " bd-light-surface" : ""}`}>
            <div className="p-3 sm:p-4">
              <h2 className="font-bold text-lg mb-2">Report Location</h2>
              <p className={`text-sm mb-3 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {report.address || report.city
                  ? [report.address, report.city, report.state].filter(Boolean).join(", ")
                  : `ZIP ${report.zip_code || report.zipCode || "area"}`}
                {shopPinsFromBids.length > 0 &&
                  ` · ${shopPinsFromBids.length} shop${shopPinsFromBids.length > 1 ? "s" : ""} bidding`}
              </p>
            </div>
            <div className="h-[180px] md:h-[200px]">
              <DashboardMapPreview
                shops={shopPinsFromBids}
                reportPins={reportPins}
                center={[reportCoords.lat, reportCoords.lng]}
                zoom={11}
                isLight={isLight}
              />
            </div>
          </div>
        )}

        {/* Active Repair Card — shown when a bid has been accepted */}
        {status === "active" && acceptedBid && (
          <div className={`bd-glass-card overflow-hidden${isLight ? " bd-light-surface" : ""}`}>
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                  <Wrench className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-bold text-base">Active Repair</h2>
                  <p className={`text-xs ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                    Bid accepted — repair in progress
                  </p>
                </div>
              </div>
              <div
                className={`rounded-xl p-3 space-y-2 ${isLight ? "bg-emerald-50/60" : "bg-emerald-500/[0.08]"}`}
              >
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                    Shop
                  </span>
                  <span className="font-semibold text-sm">{acceptedBid.shopName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                    Accepted Bid
                  </span>
                  <span className="font-semibold text-sm">
                    ${acceptedBid.amount.toLocaleString()}
                  </span>
                </div>
                {acceptedBid.estimatedDays > 0 && (
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                      Est. Timeline
                    </span>
                    <span className="font-semibold text-sm">
                      {acceptedBid.estimatedDays}–{acceptedBid.estimatedDays + 1} days
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Repair Complete Card — shown when shop marks job completed */}
        {status === "completed" && (
          <div className={`bd-glass-card overflow-hidden${isLight ? " bd-light-surface" : ""}`}>
            <div className="p-3 sm:p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/15">
                  <CheckCircle2 className="h-4.5 w-4.5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="font-bold text-base">Repair Complete</h2>
                  <p className={`text-xs ${isLight ? "text-emerald-700" : "text-emerald-400"}`}>
                    The shop has marked this repair as finished
                  </p>
                </div>
              </div>
              {acceptedBid && (
                <div
                  className={`rounded-xl p-3 space-y-2 mb-3 ${isLight ? "bg-emerald-50/60" : "bg-emerald-500/[0.08]"}`}
                >
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                      Shop
                    </span>
                    <span className="font-semibold text-sm">{acceptedBid.shopName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-sm ${isLight ? "text-slate-600" : "text-slate-300"}`}>
                      Final Amount
                    </span>
                    <span className="font-semibold text-sm">
                      ${acceptedBid.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
              {onConfirmCompletion && (
                <button
                  onClick={() => onConfirmCompletion(String(report.id))}
                  className="w-full py-3 min-h-[44px] rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm Repair Complete
                </button>
              )}
            </div>
          </div>
        )}

        <RepairLifecycleTimeline
          title="Repair Progress"
          subtitle="Track where your request is in the repair journey"
          steps={customerLifecycle(status, report.repairStatus)}
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
              <p>No bids have arrived yet. Shops will appear here as soon as they respond.</p>
              {onFindShops && (
                <button
                  className="mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-white text-sm font-semibold"
                  style={{ backgroundColor: primaryColor }}
                  onClick={onFindShops}
                >
                  <Search className="h-4 w-4" />
                  Find Nearby Shops
                </button>
              )}
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
