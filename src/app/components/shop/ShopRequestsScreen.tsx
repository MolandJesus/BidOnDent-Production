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
};

export default function ShopRequestsScreen({
  primaryColor = "#003d82",
  reports = [],
  reportsLoading = false,
  onSubmitBid,
}: ShopRequestsScreenProps) {
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
    switch (urgency) {
      case "high":
        return "text-red-600 bg-red-50";
      case "medium":
        return "text-orange-600 bg-orange-50";
      case "low":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700";
      case "bidding":
        return "bg-yellow-100 text-yellow-700";
      case "closed":
        return "bg-gray-100 text-gray-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bd-glass-panel">
      {/* Header */}
      <div className="bd-glass-card border-b sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4 text-bd-blue-900">Repair Requests</h1>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bd-blue-200 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or damage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bd-glass-control"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Requests" },
                { id: "new", label: "New" },
                { id: "bidding", label: "Bidding" },
                { id: "closed", label: "Closed" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as any)}
                  className={`bd-glass-control px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${filterStatus === filter.id ? "text-white bg-bd-blue-900" : ""}`}
                  style={filterStatus === filter.id ? {} : {}}
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
          <div className="bd-glass-card p-5 sm:p-8 text-center">
            <p className="text-slate-500">Loading repair requests…</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="bd-glass-card p-5 sm:p-8 text-center">
            <AlertCircle className="w-12 h-12 text-bd-blue-200 mx-auto mb-3" />
            <p className="text-bd-blue-300">No requests found</p>
            <p className="text-sm text-bd-blue-200 mt-1">Try adjusting your filters or search</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bd-glass-card overflow-hidden">
              {/* Request Header */}
              <div className="p-4 border-b border-bd-blue-100/30">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg text-bd-blue-900">{request.customerName}</h3>
                    <p className="text-sm text-bd-blue-200">{request.vehicle}</p>
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

                <div className="flex items-center flex-wrap gap-x-2 gap-y-1 text-sm text-bd-blue-200 mb-2">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {request.submittedDate}
                  </span>
                  <span className="text-bd-blue-100/40">·</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {request.distance}
                  </span>
                  {request.hasLocation && (
                    <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                      <MapPin className="w-3 h-3" />
                      Located
                    </span>
                  )}
                </div>
              </div>

              {/* Damage Details */}
              <div className="p-4 bd-glass-panel">
                <h4 className="font-semibold mb-2 text-bd-blue-900">{request.damageType}</h4>
                <p className="text-sm text-bd-blue-200 mb-3">{request.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center text-sm bd-glass-card px-3 py-1 rounded-full">
                    <ImageIcon className="w-4 h-4 mr-1 text-bd-blue-200" />
                    <span>{request.photoCount} photos</span>
                  </div>
                  {request.insuranceClaim && (
                    <div className="flex items-center text-sm bd-glass-card px-3 py-1 rounded-full text-bd-blue-400">
                      <Star className="w-4 h-4 mr-1" />
                      <span>Insurance: {request.insuranceCompany}</span>
                    </div>
                  )}
                  {request.bidCount && (
                    <div className="flex items-center text-sm bd-glass-card px-3 py-1 rounded-full text-bd-blue-300">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>{request.bidCount} bids submitted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 bd-glass-panel border-t border-bd-blue-100/30">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <a
                    href={`tel:${request.customerPhone}`}
                    className="bd-glass-control flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`mailto:${request.customerEmail}`}
                    className="bd-glass-control flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium"
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
                  className="bd-glass-control w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bd-glass-card rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2 text-bd-blue-900">Submit Bid</h2>
              <p className="text-sm text-bd-blue-200 mb-4">
                {selectedRequest.vehicle} - {selectedRequest.damageType}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-bd-blue-300 mb-2">
                  Bid Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-bd-blue-200 font-medium">
                    $
                  </span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 bd-glass-control text-lg"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-bd-blue-200 mt-2">
                  Enter your competitive bid for this repair job
                </p>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-bd-blue-300 mb-2">
                  Estimated Days to Complete
                </label>
                <input
                  type="number"
                  value={estimatedDays}
                  onChange={(e) => setEstimatedDays(e.target.value)}
                  placeholder="e.g. 3"
                  className="w-full px-4 py-3 bd-glass-control"
                  min="1"
                  max="90"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-bd-blue-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={bidDescription}
                  onChange={(e) => setBidDescription(e.target.value)}
                  placeholder="Describe your repair approach, parts needed, etc."
                  className="w-full px-4 py-3 bd-glass-control resize-none"
                  rows={3}
                  maxLength={500}
                />
              </div>

              <div className="mb-4 p-3 bd-glass-panel rounded-lg">
                <p className="text-sm text-bd-blue-200">
                  <strong>Customer:</strong> {selectedRequest.customerName}
                </p>
                <p className="text-sm text-bd-blue-200">
                  <strong>Location:</strong> {selectedRequest.location}
                </p>
                {selectedRequest.insuranceClaim && (
                  <p className="text-sm text-bd-blue-200">
                    <strong>Insurance:</strong> {selectedRequest.insuranceCompany}
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
                  className="bd-glass-control flex-1 py-3 font-medium"
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
                  className="bd-glass-control flex-1 py-3 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
