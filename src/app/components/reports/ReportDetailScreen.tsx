import { useState } from "react";
import { ArrowLeft, Clock, MapPin, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import RepairLifecycleTimeline from "../workflow/RepairLifecycleTimeline";
import { customerLifecycle } from "../workflow/lifecycle-presets";
import { LANDING_PAGE_IMAGES } from "../../constants";

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
};

export default function ReportDetailScreen({
  report,
  onBack,
  onViewAllBids,
  primaryColor = "#003d82",
}: ReportDetailScreenProps) {
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
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100/80 pb-20">
      {/* Header */}
      <div className="bd-glass-panel border-b border-white/30 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              className="mr-3 flex h-11 w-11 items-center justify-center rounded-lg transition-colors hover:bg-white/60"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-lg font-bold">
                {vehicleInfo.year} {vehicleInfo.make} {vehicleInfo.model}
              </h1>
              <p className="text-sm text-gray-600">Report #{report.id}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : status === "active"
                    ? "bg-blue-100 text-blue-700"
                    : "bg-green-100 text-green-700"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
          </div>
        </div>
      </div>

      <div className="px-4 py-4 space-y-4">
        {/* Photo Gallery */}
        <div className="bd-glass-card overflow-hidden">
          <div className="p-4">
            <h2 className="font-bold text-lg mb-3">Damage Photos</h2>
            <div className="grid grid-cols-3 gap-2">
              {photos.map((photo, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
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
          </div>
        </div>

        {/* Vehicle Information */}
        <div className="bd-glass-card p-4">
          <h2 className="font-bold text-lg mb-3">Vehicle Information</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Year:</span>
              <span className="font-medium">{vehicleInfo.year}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Make:</span>
              <span className="font-medium">{vehicleInfo.make}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Model:</span>
              <span className="font-medium">{vehicleInfo.model}</span>
            </div>
            {report.vehicle?.vin && (
              <div className="flex justify-between">
                <span className="text-gray-600">VIN:</span>
                <span className="font-medium text-sm">{report.vehicle.vin}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Damaged Area:</span>
              <span className="font-medium capitalize">{damageArea}</span>
            </div>
          </div>
        </div>

        {/* Damage Description */}
        <div className="bd-glass-card p-4">
          <h2 className="font-bold text-lg mb-3">Damage Description</h2>
          <p className="text-gray-700">{description}</p>
          {report.incident && (
            <>
              <h3 className="font-medium mt-4 mb-2">What Happened</h3>
              <p className="text-gray-700">{report.incident}</p>
            </>
          )}
        </div>

        {/* Submission Details */}
        <div className="bd-glass-card p-4">
          <h2 className="font-bold text-lg mb-3">Submission Details</h2>
          <div className="flex items-center text-sm text-gray-600">
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
        />

        {/* Interested Shops */}
        <div className="bd-glass-card p-4">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-bold text-lg">Interested Shops</h2>
            <span className="text-sm text-gray-600">{interestedShops.length} bids received</span>
          </div>

          {interestedShops.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300/60 p-4 text-sm text-gray-600">
              No bids have arrived yet. Shops will appear here as soon as they respond.
            </div>
          ) : (
            <div className="space-y-3">
              {interestedShops.map((shop) => (
                <div
                  key={shop.id}
                  className="border border-slate-200/60 rounded-xl p-3 hover:border-blue-300/60 hover:bg-slate-50/50 transition-all duration-200"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100">
                      <ImageWithFallback
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-medium">{shop.name}</h3>
                        <span
                          className="px-2 py-1 rounded-md text-xs font-bold text-white"
                          style={{ backgroundColor: primaryColor }}
                        >
                          BID
                        </span>
                      </div>

                      <div className="flex items-center text-sm mb-2">
                        <Star className="w-3 h-3 text-yellow-400 mr-1" fill="#FBBF24" />
                        <span className="font-medium mr-1">{shop.rating}</span>
                        <span className="text-gray-500">({shop.reviews})</span>
                        <span className="mx-2 text-gray-300">•</span>
                        <MapPin className="w-3 h-3 mr-1 text-gray-400" />
                        <span className="text-gray-600">{shop.distance}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div
                            className="text-lg font-bold tabular-nums"
                            style={{ color: primaryColor }}
                          >
                            ${shop.bidAmount?.toLocaleString()}
                          </div>
                          <div className="text-xs text-gray-500">{shop.estimatedTime}</div>
                        </div>
                        <button
                          className="px-3 py-1.5 rounded-md text-white text-sm font-medium"
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
            <button
              className="w-full mt-4 py-3 px-4 rounded-lg text-white font-medium"
              style={{ backgroundColor: primaryColor }}
              onClick={onViewAllBids}
            >
              Compare All Bids
            </button>
          )}
        </div>
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl"
            onClick={() => setSelectedPhoto(null)}
          >
            ×
          </button>
          <img
            src={selectedPhoto}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
        </div>
      )}
    </div>
  );
}
