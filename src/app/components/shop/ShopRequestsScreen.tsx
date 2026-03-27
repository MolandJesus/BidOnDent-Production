import { useState } from "react";
import {
  Search,
  MapPin,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Phone,
  Mail,
  ChevronRight,
  Star,
  AlertCircle,
} from "lucide-react";
import { logWorkflowEvent } from "../../services/supabaseService";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ShopRequestsScreenProps = {
  primaryColor?: string;
  reports?: any[];
  reportsLoading?: boolean;
  onSubmitBid?: (
    requestId: string,
    bidAmount: number,
    estimatedDays: number,
    description: string
  ) => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ShopRequestsScreen({
  primaryColor = "#003d82",
  reports = [],
  reportsLoading = false,
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

  const handleSubmitBid = () => {
    const days = parseInt(estimatedDays, 10);
    if (selectedRequest && bidAmount && days > 0) {
      void logWorkflowEvent({
        event_type: "bid_submitted",
        source: "shop-requests",
        payload: {
          request_id: selectedRequest.id,
          amount: Number(bidAmount),
          estimated_days: days,
          vehicle: selectedRequest.vehicle,
        },
      });
      onSubmitBid?.(
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
    }
  };

  const getUrgencyColor = (urgency: string) => {
    if (isLight) {
      switch (urgency) {
        case "high": return "text-red-700 bg-red-100 border border-red-300";
        case "medium": return "text-orange-700 bg-orange-100 border border-orange-300";
        case "low": return "text-green-700 bg-green-100 border border-green-300";
        default: return "text-slate-700 bg-slate-100 border border-slate-300";
      }
    }
    switch (urgency) {
      case "high": return "text-red-300 bg-red-500/15 border border-red-400/25";
      case "medium": return "text-orange-300 bg-orange-500/15 border border-orange-400/25";
      case "low": return "text-green-300 bg-green-500/15 border border-green-400/25";
      default: return "text-slate-300 bg-slate-500/15 border border-slate-400/25";
    }
  };

  const getStatusColor = (status: string) => {
    if (isLight) {
      switch (status) {
        case "new": return "bg-blue-100 text-blue-700 border border-blue-300";
        case "bidding": return "bg-yellow-100 text-yellow-700 border border-yellow-300";
        case "closed": return "bg-slate-100 text-slate-600 border border-slate-300";
        default: return "bg-slate-100 text-slate-600 border border-slate-300";
      }
    }
    switch (status) {
      case "new": return "bg-blue-500/15 text-blue-300 border border-blue-400/25";
      case "bidding": return "bg-yellow-500/15 text-yellow-300 border border-yellow-400/25";
      case "closed": return "bg-slate-500/15 text-slate-300 border border-slate-400/25";
      default: return "bg-slate-500/15 text-slate-300 border border-slate-400/25";
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div
        className={`sticky top-0 z-10 border-b ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}
        style={isLight ? {} : {
          background: "linear-gradient(180deg, rgba(11, 23, 47, 0.92) 0%, rgba(8, 18, 38, 0.86) 100%)",
          boxShadow: "0 4px 24px rgba(3, 10, 24, 0.30)",
          backdropFilter: "blur(12px)",
        }}
      >
        <div className="px-4 py-4">
          <h1 className={`text-2xl font-bold mb-4 ${isLight ? "text-slate-900" : "text-slate-100"}`}>Repair Requests</h1>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isLight ? "text-slate-400" : "text-blue-200/60"}`} />
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
                  style={filterStatus === filter.id ? { background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` } : {}}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="px-4 py-4 space-y-4">
        {reportsLoading ? (
          <div
            className="bd-glass-card p-5 sm:p-8 text-center"
            style={isLight ? {} : {
              background: "linear-gradient(180deg, rgba(11, 23, 47, 0.80) 0%, rgba(8, 18, 38, 0.76) 100%)",
              borderColor: "rgba(96, 165, 250, 0.20)",
            }}
          >
            <p className={isLight ? "text-slate-500" : "text-blue-100/70"}>Loading repair requests…</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div
            className="bd-glass-card p-5 sm:p-8 text-center"
            style={isLight ? {} : {
              background: "linear-gradient(180deg, rgba(11, 23, 47, 0.80) 0%, rgba(8, 18, 38, 0.76) 100%)",
              borderColor: "rgba(96, 165, 250, 0.20)",
            }}
          >
            <AlertCircle className={`w-12 h-12 mx-auto mb-3 ${isLight ? "text-blue-500/60" : "text-blue-400/70"}`} />
            <p className={isLight ? "text-slate-900" : "text-slate-100"}>No requests found</p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>Try adjusting your filters or search</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div
              key={request.id}
              className="bd-glass-card overflow-hidden"
              style={isLight ? {} : {
                background: "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
                borderColor: "rgba(96, 165, 250, 0.22)",
              }}
            >
              {/* Request Header */}
              <div className={`p-4 border-b ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className={`font-bold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}>{request.customerName}</h3>
                    <p className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>{request.vehicle}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}
                    >
                      {request.status.toUpperCase()}
                    </span>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(request.urgency)}`}
                    >
                      {request.urgency.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>

                <div className={`flex items-center flex-wrap gap-x-2 gap-y-1 text-sm mb-2 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {request.submittedDate}
                  </span>
                  <span className={isLight ? "text-slate-300" : "text-blue-300/30"}>·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {request.distance}
                  </span>
                  {request.hasLocation && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-400/25">
                      <MapPin className="w-3 h-3" />
                      Located
                    </span>
                  )}
                </div>
              </div>

              {/* Damage Details */}
              <div className="p-4">
                <h4 className={`font-semibold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>{request.damageType}</h4>
                <p className={`text-sm mb-3 ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>{request.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <div className={`flex items-center text-sm px-3 py-1 rounded-full ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15"}`}>
                    <ImageIcon className={`w-4 h-4 mr-1 ${isLight ? "text-slate-400" : "text-blue-200/60"}`} />
                    <span>{request.photoCount} photos</span>
                  </div>
                  {request.insuranceClaim && (
                    <div className="flex items-center text-sm text-blue-200 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 mr-1" />
                      <span>Insurance: {request.insuranceCompany}</span>
                    </div>
                  )}
                  {request.bidCount && (
                    <div className={`flex items-center text-sm px-3 py-1 rounded-full ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200" : "text-blue-200/80 bg-white/8 border border-blue-300/15"}`}>
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>{request.bidCount} bids submitted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className={`p-4 border-t ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <a
                    href={`tel:${request.customerPhone}`}
                    className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`mailto:${request.customerEmail}`}
                    className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
                  >
                    <Mail className="w-4 h-4" />
                    Email
                  </a>
                </div>

                <button
                  onClick={() => {
                    setSelectedRequest(request);
                    setShowBidModal(true);
                  }}
                  className="w-full py-3 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
                >
                  <DollarSign className="w-5 h-5" />
                  Submit Bid
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bid Modal */}
      {showBidModal && selectedRequest && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-4">
          <div
            className={`rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden border ${isLight ? "bg-white border-slate-200/60 shadow-xl" : "border-blue-300/20"}`}
            style={isLight ? {} : {
              background: "linear-gradient(180deg, rgba(11, 23, 47, 0.95) 0%, rgba(8, 18, 38, 0.92) 100%)",
              boxShadow: "0 20px 60px rgba(3, 10, 24, 0.60)",
            }}
          >
            <div className="p-6">
              <h2 className={`text-xl font-bold mb-2 ${isLight ? "text-slate-900" : "text-slate-100"}`}>Submit Bid</h2>
              <p className={`text-sm mb-4 ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>
                {selectedRequest.vehicle} - {selectedRequest.damageType}
              </p>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                  Bid Amount
                </label>
                <div className="relative">
                  <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 font-medium ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>
                    $
                  </span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="0.00"
                    className={`w-full pl-8 pr-4 py-3 border rounded-xl text-lg outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60" : "border-blue-300/20 bg-white/8 text-slate-100 placeholder:text-blue-200/40 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20"}`}
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className={`text-xs mt-2 ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>
                  Enter your competitive bid for this repair job
                </p>
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                  Estimated Days to Complete
                </label>
                <input
                  type="number"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="e.g. 3"
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60" : "border-blue-300/20 bg-white/8 text-slate-100 placeholder:text-blue-200/40 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20"}`}
                  min="1"
                  max="90"
                />
              </div>

              <div className="mb-4">
                <label className={`block text-sm font-medium mb-2 ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                  Description (optional)
                </label>
                <textarea
                  value={bidDescription}
                  onChange={(e) => setBidDescription(e.target.value)}
                  placeholder="Describe your repair approach, parts needed, etc."
                  className={`w-full px-4 py-3 border rounded-xl outline-none transition-colors resize-none ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60" : "border-blue-300/20 bg-white/8 text-slate-100 placeholder:text-blue-200/40 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20"}`}
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className={`mb-4 p-3 rounded-xl border ${isLight ? "bg-slate-50 border-slate-200" : "bg-white/5 border-blue-300/15"}`}>
                <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                  <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Customer:</strong> {selectedRequest.customerName}
                </p>
                <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                  <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Location:</strong> {selectedRequest.location}
                </p>
                {selectedRequest.insuranceClaim && (
                  <p className={`text-sm ${isLight ? "text-slate-700" : "text-blue-100/80"}`}>
                    <strong className={isLight ? "text-slate-900" : "text-slate-200"}>Insurance:</strong> {selectedRequest.insuranceCompany}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBidModal(false);
                    setBidAmount("");
                    setEstimatedDays("");
                    setBidDescription("");
                    setSelectedRequest(null);
                  }}
                  className={`flex-1 py-3 min-h-[44px] rounded-xl font-medium transition-colors ${isLight ? "text-slate-700 border border-slate-200 hover:bg-slate-50" : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"}`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBid}
                  disabled={
                    !bidAmount ||
                    parseFloat(bidAmount) <= 0 ||
                    !estimatedDays ||
                    parseInt(estimatedDays, 10) <= 0
                  }
                  className="flex-1 py-3 min-h-[44px] rounded-xl text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                  style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
                >
                  Submit Bid
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
