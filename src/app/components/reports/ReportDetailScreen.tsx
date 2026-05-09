import { useMemo, useState } from "react";
import { ArrowLeft, CheckCircle2, Clock, Maximize2, Search, Wrench } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import ReportDetailInterestedShops from "./ReportDetailInterestedShops";
import RepairLifecycleTimeline from "../workflow/RepairLifecycleTimeline";
import { customerLifecycle } from "../workflow/lifecycle-presets";
import { LANDING_PAGE_IMAGES } from "../../constants";
import { useGeoCoordinates } from "../../hooks/useGeoCoordinates";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { ReportPin } from "../dashboard/MapLibreDashboardMapPreview";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";
import { useNotifications } from "../../features/notifications/NotificationContext";
import { useBidsForReport } from "../../hooks/useBidsForReport";
import { formatVehicleLabel } from "../../utils/formatVehicleLabel";

type BidsConnectionStatus = "connected" | "disconnected" | "error" | "idle";

// KI-012 parity: mirror BidsSummaryHeader's Live / Reconnecting / Offline chip
// onto ReportDetailScreen so customers reading a single report see the same
// realtime-trust signal they get on the bids list. Helper kept local (not
// imported from BidsSummaryHeader) to avoid restructuring that surface — see
// owner brief 2026-05-06 "no JSX restructuring".
function getLiveStatusChip(status: BidsConnectionStatus, isLight: boolean) {
  if (status === "idle") return null;

  if (status === "connected") {
    return {
      label: "Live",
      title: "Live updates connected. New bids appear instantly.",
      dotClass: "bg-emerald-500",
      ringClass: "shadow-[0_0_0_3px_rgba(16,185,129,0.18)]",
      chipClass: isLight
        ? "border border-emerald-300/60 bg-emerald-50/85 text-emerald-700"
        : "border border-emerald-300/30 bg-emerald-400/10 text-emerald-200",
    };
  }

  if (status === "error") {
    return {
      label: "Reconnecting\u2026",
      title: "Live updates interrupted. Retrying \u2014 values shown are the last known.",
      dotClass: "bg-amber-500",
      ringClass: "shadow-[0_0_0_3px_rgba(245,158,11,0.18)]",
      chipClass: isLight
        ? "border border-amber-300/60 bg-amber-50/85 text-amber-700"
        : "border border-amber-300/30 bg-amber-400/10 text-amber-200",
    };
  }

  return {
    label: "Offline \u00b7 last known",
    title: "Realtime offline. Showing the last loaded bids \u2014 refresh to update.",
    dotClass: "bg-slate-400",
    ringClass: "",
    chipClass: isLight
      ? "border border-slate-300/60 bg-slate-100/85 text-slate-600"
      : "border border-slate-300/25 bg-white/8 text-slate-200",
  };
}

type ReportDetailScreenProps = {
  report: DamageReport;
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
  const notifications = useNotifications();
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Handle both nested vehicle and flattened vehicle properties
  const vehicleInfo = report.vehicleInfo || {
    make: "",
    model: "",
    year: "",
  };

  // Provide safe defaults for potentially undefined properties
  const status = report.status || "pending";
  const photos = report.photos || [];
  const damageArea = report.damageArea || "Unknown";
  const description = report.description || "No description provided";
  const submittedAt = report.submittedAt || new Date().toISOString();

  // Load live bids for this report; fall back to embedded report.bids if not yet fetched
  const { bids: liveBids, connectionStatus: bidsConnectionStatus } = useBidsForReport(report.id);
  const bidsSource = liveBids.length > 0 ? liveBids : report.bids || [];
  const liveChip = getLiveStatusChip(bidsConnectionStatus, isLight);

  // Detect accepted bid for active-repair card
  const acceptedBid = useMemo(() => bidsSource.find((b) => b.status === "accepted"), [bidsSource]);

  const interestedShops = bidsSource.map((bid) => ({
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

  const zipFallbackCoords = useGeoCoordinates(report.zipCode);

  /** Report location for the mini-map — prefer stored coordinates, fall back to ZIP */
  const reportCoords = useMemo(() => {
    if (report.latitude != null && report.longitude != null) {
      return { lat: report.latitude, lng: report.longitude };
    }
    return zipFallbackCoords;
  }, [report.latitude, report.longitude, zipFallbackCoords]);

  /** Report pin for the map */
  const reportPins = useMemo<ReportPin[]>(() => {
    if (!reportCoords) return [];
    const label =
      formatVehicleLabel({
        year: vehicleInfo.year,
        make: vehicleInfo.make,
        model: vehicleInfo.model,
      }) || "Report";
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
      <div className="px-4 pt-4">
        <div className="bd-dashboard-panel bd-dashboard-panel--accent-blue px-4 py-4">
          <div className="flex items-center">
            <button
              onClick={onBack}
              aria-label="Back"
              className="bd-dashboard-secondary-button mr-3 flex h-11 w-11 items-center justify-center rounded-lg"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p
                className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  isLight ? "text-blue-700/70" : "text-blue-100/58"
                }`}
              >
                Report Overview
              </p>
              <h1 className="text-lg font-bold">
                {formatVehicleLabel({
                  year: vehicleInfo.year,
                  make: vehicleInfo.make,
                  model: vehicleInfo.model,
                })}
              </h1>
              <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                Report #{report.id}
              </p>
              {liveChip && (
                <div
                  className={`bd-dashboard-chip mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${liveChip.chipClass}`}
                  title={liveChip.title}
                  aria-label={liveChip.title}
                >
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${liveChip.dotClass} ${liveChip.ringClass}`}
                    aria-hidden="true"
                  />
                  {liveChip.label}
                </div>
              )}
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${
                status === "pending"
                  ? isLight
                    ? "bg-sky-100 text-sky-700"
                    : "bg-sky-500/15 text-sky-300"
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
                        : isLight
                          ? "bg-indigo-100 text-indigo-700"
                          : "bg-indigo-500/15 text-indigo-300"
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
        <div className="bd-dashboard-panel bd-dashboard-panel--deep overflow-hidden">
          <div className="p-3 sm:p-4">
            <h2 className="font-bold text-lg mb-2 sm:mb-3">Damage Photos</h2>
            {photos.length === 0 ? (
              <div
                className={`bd-dashboard-note bd-dashboard-note--deep rounded-xl border border-dashed p-4 text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}
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
        <div className="bd-dashboard-panel bd-dashboard-panel--accent-cyan p-3 sm:p-4">
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
        <div className="bd-dashboard-panel bd-dashboard-panel--deep p-3 sm:p-4">
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
        <div className="bd-dashboard-panel bd-dashboard-panel--accent-indigo p-3 sm:p-4">
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

        {/*
         * Report Location Map — Tier B preview surface (Pass 232).
         *
         * Convergence metadata (per Block D execution doctrine):
         *  1. Runtime paths touched     : P3 (preview-surface exploration); escalation P4 → shop directory filtered by report area.
         *  2. Runtime classes touched   : Preview only.
         *  3. Tier semantics touched    : Tier B preview (panel-embedded).
         *  4. Motion classes touched    : none (Engine 3 motion authority unchanged; KI-181 deferred to Phase 2).
         *  5. Shell hierarchy impact    : Panel-first archetype preserved (231c §6); no hybrid.
         *  6. Authority semantics       : unchanged — preview owns no camera, no persistence, no operational state.
         *  7. Reduced-motion inheritance: unchanged (Engine 3 contract conformance is Phase 2 work).
         *  8. Hidden-authority risk     : none added — onMapClick wires existing engine callback to the existing onFindShops escalation; no imperative camera, no new persistence key.
         *  9. Continuity guarantees     : unaffected — preview remains stateless across remount/reload.
         * 10. Rollback semantics        : revert this hunk; behavior reverts to button-only escalation.
         */}
        {reportCoords && (
          <div
            className="bd-dashboard-panel bd-dashboard-panel--accent-cyan overflow-hidden"
            data-runtime-class="preview"
            data-tier-semantic="B"
            data-expand-target="shop-directory-filtered-by-report"
          >
            <div className="p-3 sm:p-4">
              <h2 className="font-bold text-lg mb-2">Report Location</h2>
              <p className={`text-sm mb-3 ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                {report.address || report.city
                  ? [report.address, report.city, report.state].filter(Boolean).join(", ")
                  : `ZIP ${report.zipCode || "area"}`}
                {shopPinsFromBids.length > 0 &&
                  ` · ${shopPinsFromBids.length} shop${shopPinsFromBids.length > 1 ? "s" : ""} bidding`}
              </p>
            </div>
            <div className="relative h-[180px] md:h-[200px]">
              <DashboardMapPreview
                shops={shopPinsFromBids}
                reportPins={reportPins}
                center={[reportCoords.lat, reportCoords.lng]}
                zoom={11}
                isLight={isLight}
                onMapClick={onFindShops}
                /* Pass 242 (KI-181 sub-pass B audit): autoFit="always" matches
                   pre-Pass-241 implicit behavior. With ≥2 bidding shops the
                   fittedView memo currently overrides the caller center.
                   Doctrinal target for sub-pass C is "when-no-caller-bounds"
                   + callerBoundsExplicit (the caller centers on the report
                   intentionally), but flipping defaults is NOT authorized
                   under Phase 3A. Explicit "always" preserves today's UX. */
                autoFit="always"
              />
              {onFindShops && (
                <div
                  className={`pointer-events-none absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold uppercase tracking-wide ${
                    isLight
                      ? "bg-white/85 text-slate-700 shadow-sm ring-1 ring-slate-200/80"
                      : "bg-slate-900/70 text-slate-100 shadow-sm ring-1 ring-white/10"
                  }`}
                  aria-hidden="true"
                  data-affordance="tap-to-expand"
                >
                  <Maximize2 className="h-3 w-3" />
                  <span>Tap to expand</span>
                </div>
              )}
            </div>
            {onFindShops && (
              <div className="p-3 sm:p-4 pt-0">
                <button
                  className="bd-dashboard-secondary-button flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold"
                  style={{ color: primaryColor }}
                  onClick={onFindShops}
                >
                  <Search className="h-4 w-4" />
                  View All Shops on Map
                </button>
              </div>
            )}
          </div>
        )}

        {/* Active Repair Card — shown when a bid has been accepted */}
        {status === "active" && acceptedBid && (
          <div className="bd-dashboard-panel bd-dashboard-panel--accent-cyan overflow-hidden">
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
                className={`bd-dashboard-note bd-dashboard-note--deep rounded-xl p-3 space-y-2 ${isLight ? "text-slate-700" : "text-slate-200"}`}
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
          <div className="bd-dashboard-panel bd-dashboard-panel--accent-indigo overflow-hidden">
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
                  className={`bd-dashboard-note bd-dashboard-note--deep mb-3 rounded-xl p-3 space-y-2 ${isLight ? "text-slate-700" : "text-slate-200"}`}
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
                  onClick={async () => {
                    try {
                      await onConfirmCompletion(String(report.id));
                      notifications.push({
                        category: "report",
                        title: "Repair confirmed complete",
                        body: `Report #${report.id} has been marked as completed.`,
                        payload: { reportId: report.id },
                        userId: "",
                        deepLink: null,
                        priority: "high",
                      });
                    } catch {
                      notifications.push({
                        category: "report",
                        title: "Confirmation failed",
                        body: "Could not confirm completion. Please try again.",
                        payload: { reportId: report.id },
                        userId: "",
                        deepLink: null,
                        priority: "high",
                      });
                    }
                  }}
                  className="bd-dashboard-primary-button flex w-full min-h-[44px] items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
                  style={{ background: "linear-gradient(135deg, #059669 0%, #10b981 100%)" }}
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

        <ReportDetailInterestedShops
          shops={interestedShops}
          isLight={isLight}
          primaryColor={primaryColor}
          onViewAllBids={onViewAllBids}
          onFindShops={onFindShops}
        />
      </div>

      {/* Photo Lightbox */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200 motion-reduce:animate-none"
          onClick={() => setSelectedPhoto(null)}
        >
          <button
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white text-3xl min-w-[44px] min-h-[44px] flex items-center justify-center"
            onClick={() => setSelectedPhoto(null)}
            aria-label="Close"
          >
            ×
          </button>
          {/* Phase 3 media trust (2026-05-03 P3): swap to ImageWithFallback
              so any storage:// pointer that leaks past server hydration
              renders the premium glass tile instead of a broken full-screen
              `<img>`. */}
          <ImageWithFallback
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
