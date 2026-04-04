import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, AlertCircle, MapPin } from "lucide-react";
import { logWorkflowEvent } from "../../services/supabaseService";
import { useNotifications } from "../../features/notifications/NotificationContext";
import { zipToCoordinates } from "../../services/supabase/map";
import { defaultCoverageCenter } from "../landing/coverageData";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { ReportPin } from "../dashboard/MapLibreDashboardMapPreview";
import type { RepairRequest } from "./ShopRequestCard";
import ShopRequestCard from "./ShopRequestCard";
import ShopBidModal from "./ShopBidModal";
import {
  transformReportToRequest,
  type ShopRequestsScreenProps,
} from "./shopRequestsScreenHelpers";

export default function ShopRequestsScreen({
  primaryColor = "#003d82",
  reports = [],
  reportsLoading = false,
  isSeedData = false,
  existingBidReportIds = [],
  onSubmitBid,
  appearanceMode = "map-dark",
}: ShopRequestsScreenProps) {
  const isLight = appearanceMode === "light";
  const [searchQuery, setSearchQuery] = useState("");
  const notifications = useNotifications();
  const [filterStatus, setFilterStatus] = useState<
    "all" | "new" | "bidding" | "accepted" | "closed"
  >("all");
  const [selectedRequest, setSelectedRequest] = useState<RepairRequest | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [bidDescription, setBidDescription] = useState("");
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);
  const [submittedBidIds, setSubmittedBidIds] = useState<Set<string>>(new Set());

  // Pre-populate from Supabase-loaded bids
  useEffect(() => {
    if (existingBidReportIds.length > 0) {
      setSubmittedBidIds((prev) => {
        const next = new Set(prev);
        for (const id of existingBidReportIds) next.add(id);
        return next.size === prev.size ? prev : next;
      });
    }
  }, [existingBidReportIds]);

  const liveRequests = reports.map(transformReportToRequest);

  // Map pins for incoming request locations
  const requestPins = useMemo<ReportPin[]>(() => {
    return reports
      .map((report) => {
        const vehicleData = report?.vehicle || report?.vehicleInfo || {};
        const label =
          [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean).join(" ") ||
          report?.damageArea ||
          "Repair request";
        const lat = report?.latitude;
        const lng = report?.longitude;
        if (lat != null && lng != null) {
          return { id: String(report.id), lat, lng, label };
        }
        const zipCode = report?.zipCode || report?.zip_code || "";
        const coords = zipCode ? zipToCoordinates(zipCode) : null;
        if (!coords) return null;
        return { id: String(report.id), lat: coords.lat, lng: coords.lng, label };
      })
      .filter((pin): pin is ReportPin => pin !== null);
  }, [reports]);

  const requestMapCenter = useMemo<[number, number]>(() => {
    if (requestPins.length > 0) {
      return [requestPins[0].lat, requestPins[0].lng];
    }
    return defaultCoverageCenter;
  }, [requestPins]);

  const [focusedRequestId, setFocusedRequestId] = useState<string | null>(null);

  const filteredRequests = liveRequests
    .filter((req) => {
      const matchesSearch =
        req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
        req.damageType.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = filterStatus === "all" || req.status === filterStatus;
      return matchesSearch && matchesFilter;
    })
    // Sort: 0-bid requests first (most urgent), then newest by submission date
    .sort((a, b) => {
      if (a.bidCount !== b.bidCount) return a.bidCount - b.bidCount;
      return (Date.parse(b.submittedAt || "") || 0) - (Date.parse(a.submittedAt || "") || 0);
    });

  const handleSubmitBid = async () => {
    const days = parseInt(estimatedDays, 10);
    if (selectedRequest && bidAmount && days > 0) {
      setIsSubmittingBid(true);
      setBidError(null);

      void logWorkflowEvent({
        event_type: "bid_submitted",
        source: "shop-requests",
        payload: {
          request_id: selectedRequest.id,
          amount: Number(bidAmount),
          estimated_days: days,
          vehicle: selectedRequest.vehicle,
        },
      }).catch((error) => {
        if (import.meta.env.DEV) {
          console.warn("Failed to record workflow event:", error);
        }
      });

      try {
        await onSubmitBid?.(
          String(selectedRequest.id),
          parseFloat(bidAmount),
          days,
          bidDescription.trim() || "Repair bid submitted via BidOnDent"
        );
        notifications.push({
          title: "Bid Submitted",
          body: `$${parseFloat(bidAmount).toLocaleString()} bid sent for ${selectedRequest.vehicle}.`,
          category: "bid",
          payload: { reportId: String(selectedRequest.id), bidAmount: parseFloat(bidAmount) },
          priority: "normal",
          userId: "",
          deepLink: { screen: "bid", bidId: String(selectedRequest.id) },
        });
        setSubmittedBidIds((prev) => new Set(prev).add(String(selectedRequest.id)));
        setShowBidModal(false);
        setBidAmount("");
        setEstimatedDays("");
        setBidDescription("");
        setSelectedRequest(null);
      } catch {
        setBidError("Failed to submit bid. Please try again.");
      } finally {
        setIsSubmittingBid(false);
      }
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className={`border-b ${isLight ? "border-slate-200/60 bg-white/90" : "border-blue-300/15"}`}
        style={
          isLight
            ? { backdropFilter: "blur(12px)" }
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                boxShadow: "0 4px 24px rgba(3, 10, 24, 0.30)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="px-4 py-4">
          <p
            className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${isLight ? "text-blue-600" : "text-blue-300/80"}`}
          >
            Repair requests
          </p>
          <h1
            className={`text-2xl font-bold mb-4 ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            Marketplace
          </h1>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isLight ? "text-slate-400" : "text-blue-200/60"}`}
              />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or damage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60" : "border-blue-300/20 bg-white/8 text-slate-100 placeholder:text-blue-200/50 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20"}`}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  { id: "all", label: "All Requests" },
                  { id: "new", label: "New" },
                  { id: "bidding", label: "Bidding" },
                  { id: "accepted", label: "Accepted" },
                  { id: "closed", label: "Closed" },
                ] as { id: "all" | "new" | "bidding" | "accepted" | "closed"; label: string }[]
              ).map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`bd-dashboard-filter-button rounded-full px-4 py-2 min-h-[44px] font-medium whitespace-nowrap transition-colors ${filterStatus === filter.id ? "text-white shadow-sm" : isLight ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
                  style={
                    filterStatus === filter.id
                      ? { background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }
                      : {}
                  }
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Demo Data Banner */}
      {isSeedData && !reportsLoading && (
        <div className="mx-4 mt-4">
          <div
            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${
              isLight
                ? "bg-amber-50 border border-amber-200/60 text-amber-800"
                : "bg-amber-500/10 border border-amber-400/20 text-amber-300"
            }`}
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>
              Showing example requests for preview. Incoming repair requests will appear here as
              customers submit reports in your area.
            </span>
          </div>
        </div>
      )}

      {/* Request Geography Map */}
      {!reportsLoading && liveRequests.length > 0 && (
        <div className="px-4 pt-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            className="bd-dashboard-panel bd-dashboard-panel--accent-blue overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2
                    className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                  >
                    Request locations
                  </h2>
                  <p
                    className={`mt-0.5 text-xs ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
                  >
                    See where incoming repair requests are in your area.
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isLight
                      ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                      : "bg-amber-400/14 text-amber-200 border border-amber-300/20"
                  }`}
                >
                  {requestPins.length}/{liveRequests.length} mapped
                </span>
              </div>
            </div>

            {requestPins.length > 0 ? (
              <>
                <div className="h-[200px] md:h-[220px]">
                  <DashboardMapPreview
                    shops={[]}
                    reportPins={requestPins}
                    center={requestMapCenter}
                    zoom={10}
                    isLight={isLight}
                    onReportPinClick={(pin) => {
                      if (pin.id) {
                        setFocusedRequestId(pin.id);
                      }
                    }}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-200"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Repair request
                  </span>
                  <span
                    className={`text-[11px] ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
                  >
                    Tap a pin to focus that request card below.
                  </span>
                </div>
              </>
            ) : (
              <div
                className={`mx-3 mb-3 flex items-start gap-2 rounded-xl border border-dashed px-3 py-2.5 text-xs ${
                  isLight ? "border-slate-300/70 text-slate-600" : "border-white/20 text-slate-300"
                }`}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  No request locations available yet. Requests with ZIP codes will appear on this
                  map as customers include location data.
                </span>
              </div>
            )}
          </motion.section>
        </div>
      )}

      {/* Requests List */}
      <div className="px-4 py-4 space-y-4">
        {reportsLoading ? (
          <div className="bd-dashboard-panel bd-dashboard-panel--deep p-5 sm:p-8 text-center">
            <p className={isLight ? "text-slate-500" : "text-blue-100/70"}>
              Loading repair requests…
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bd-dashboard-panel bd-dashboard-panel--deep p-5 sm:p-8 text-center">
            <AlertCircle
              className={`w-12 h-12 mx-auto mb-3 ${isLight ? "text-blue-500/60" : "text-blue-400/70"}`}
            />
            <p className={isLight ? "text-slate-900" : "text-slate-100"}>No requests found</p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              Try adjusting your filters or search
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <ShopRequestCard
              key={request.id}
              request={request}
              isLight={isLight}
              primaryColor={primaryColor}
              focused={focusedRequestId === request.id}
              hasBid={submittedBidIds.has(request.id)}
              onSubmitBid={(req) => {
                setSelectedRequest(req);
                setShowBidModal(true);
              }}
            />
          ))
        )}
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedRequest && (
        <ShopBidModal
          request={selectedRequest}
          isLight={isLight}
          primaryColor={primaryColor}
          bidAmount={bidAmount}
          estimatedDays={estimatedDays}
          bidDescription={bidDescription}
          isSubmitting={isSubmittingBid}
          error={bidError}
          onBidAmountChange={setBidAmount}
          onEstimatedDaysChange={setEstimatedDays}
          onBidDescriptionChange={setBidDescription}
          onSubmit={handleSubmitBid}
          onClose={() => {
            setShowBidModal(false);
            setBidAmount("");
            setEstimatedDays("");
            setBidDescription("");
            setBidError(null);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}
