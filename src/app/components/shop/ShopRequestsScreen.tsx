import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import { logWorkflowEvent } from "../../services/supabaseService";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import ShopRequestCard, { type RepairRequest } from "./ShopRequestCard";
import ShopBidModal from "./ShopBidModal";

type ShopRequestsScreenProps = {
  primaryColor?: string;
  reports?: any[];
  reportsLoading?: boolean;
  isSeedData?: boolean;
  onSubmitBid?: (
    requestId: string,
    bidAmount: number,
    estimatedDays: number,
    description: string
  ) => Promise<void> | void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ShopRequestsScreen({
  primaryColor = "#003d82",
  reports = [],
  reportsLoading = false,
  isSeedData = false,
  onSubmitBid,
  appearanceMode = "map-dark",
}: ShopRequestsScreenProps) {
  const isLight = appearanceMode === "light";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "bidding" | "closed">("all");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [estimatedDays, setEstimatedDays] = useState("");
  const [bidDescription, setBidDescription] = useState("");
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [isSubmittingBid, setIsSubmittingBid] = useState(false);

  const liveRequests = reports.map((report: any, index: number) => {
    const vehicleData = report?.vehicle || report?.vehicleInfo || {};
    const vehicleParts = [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean);
    const status = String(report?.status ?? "pending").toLowerCase();
    const normalizedStatus =
      status === "pending" ? "new" : status === "in-review" ? "bidding" : "closed";
    const bidCount = Number(report?.bidsCount) || 0;

    const zipCode: string = report?.zip_code || "";
    const address: string = report?.address || "";
    const hasLocation = Boolean(zipCode || address);
    const locationLabel = address || (zipCode ? `ZIP ${zipCode}` : "No location");

    return {
      id: String(report?.id ?? `request-${index}`),
      customerName: "Customer",
      customerEmail: report?.customer_email || "Contact via BidOnDent",
      customerPhone: report?.customer_phone || "Via platform",
      vehicle: vehicleParts.length > 0 ? vehicleParts.join(" ") : "Vehicle details pending",
      damageType: report?.damageArea || report?.damageType || "Damage report",
      description: report?.description || "No description provided yet.",
      location: locationLabel,
      distance: locationLabel,
      hasLocation,
      photoCount: Array.isArray(report?.photos) ? report.photos.length : 0,
      submittedAt: report?.submittedAt || "",
      submittedDate: report?.submittedAt
        ? new Date(report.submittedAt).toLocaleDateString()
        : "Recently submitted",
      status: normalizedStatus,
      urgency: bidCount === 0 ? "high" : bidCount < 3 ? "medium" : "low",
      insuranceClaim: false,
      insuranceCompany: "",
      bidCount,
    };
  });

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
      return b.submittedAt.localeCompare(a.submittedAt);
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
        className={`sticky top-0 z-10 border-b ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}
        style={
          isLight
            ? {}
            : {
                background:
                  "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
                boxShadow: "0 4px 24px rgba(3, 10, 24, 0.30)",
                backdropFilter: "blur(12px)",
              }
        }
      >
        <div className="px-4 py-4">
          <h1
            className={`text-2xl font-bold mb-4 ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            Repair Requests
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
                  { id: "closed", label: "Closed" },
                ] as { id: "all" | "new" | "bidding" | "closed"; label: string }[]
              ).map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`px-4 py-2 min-h-[44px] rounded-lg font-medium whitespace-nowrap transition-colors ${filterStatus === filter.id ? "text-white shadow-sm" : isLight ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
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
              Showing demo requests — live marketplace data will appear when customers submit
              reports.
            </span>
          </div>
        </div>
      )}

      {/* Requests List */}
      <div className="px-4 py-4 space-y-4">
        {reportsLoading ? (
          <div
            className={`bd-glass-card p-5 sm:p-8 text-center${isLight ? " bd-light-surface" : ""}`}
            style={
              isLight
                ? {}
                : {
                    background:
                      "linear-gradient(180deg, rgba(11, 23, 47, 0.80) 0%, rgba(8, 18, 38, 0.76) 100%)",
                    borderColor: "rgba(96, 165, 250, 0.20)",
                  }
            }
          >
            <p className={isLight ? "text-slate-500" : "text-blue-100/70"}>
              Loading repair requests…
            </p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div
            className={`bd-glass-card p-5 sm:p-8 text-center${isLight ? " bd-light-surface" : ""}`}
            style={
              isLight
                ? {}
                : {
                    background:
                      "linear-gradient(180deg, rgba(11, 23, 47, 0.80) 0%, rgba(8, 18, 38, 0.76) 100%)",
                    borderColor: "rgba(96, 165, 250, 0.20)",
                  }
            }
          >
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
