import { useState } from "react";
import { Search, MapPin, Calendar, DollarSign, Image as ImageIcon, Phone, Mail, ChevronRight, Star, AlertCircle } from "lucide-react";

type ShopRequestsScreenProps = {
  primaryColor?: string;
  secondaryColor?: string;
  onSubmitBid?: (requestId: number, bidAmount: number) => void;
};

export default function ShopRequestsScreen({
  primaryColor = "#003d82",
  onSubmitBid
}: ShopRequestsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "new" | "bidding" | "closed">("all");
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [showBidModal, setShowBidModal] = useState(false);

  // Sample requests data - in production, this would come from Supabase
  const sampleRequests = [
    {
      id: 1,
      customerName: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      customerPhone: "(555) 123-4567",
      vehicle: "2022 Honda Accord",
      damageType: "Front Bumper Damage",
      description: "Rear-ended at stop light. Front bumper has significant dent and scratches. Headlight housing cracked.",
      location: "San Francisco, CA",
      distance: "2.3 miles away",
      photoCount: 4,
      submittedDate: "2 hours ago",
      status: "new",
      urgency: "high",
      insuranceClaim: true,
      insuranceCompany: "State Farm"
    },
    {
      id: 2,
      customerName: "Michael Chen",
      customerEmail: "m.chen@email.com",
      customerPhone: "(555) 234-5678",
      vehicle: "2020 Toyota Camry",
      damageType: "Side Panel & Door",
      description: "Parking lot incident. Driver side door dented, side panel scratched. Paint damage visible.",
      location: "Oakland, CA",
      distance: "5.8 miles away",
      photoCount: 6,
      submittedDate: "5 hours ago",
      status: "bidding",
      urgency: "medium",
      insuranceClaim: false,
      bidCount: 3
    },
    {
      id: 3,
      customerName: "Emily Rodriguez",
      customerEmail: "emily.r@email.com",
      customerPhone: "(555) 345-6789",
      vehicle: "2019 Ford F-150",
      damageType: "Rear Hatch Damage",
      description: "Backed into pole. Rear hatch dented, taillight broken, minor frame concern.",
      location: "San Jose, CA",
      distance: "12.1 miles away",
      photoCount: 5,
      submittedDate: "1 day ago",
      status: "bidding",
      urgency: "low",
      insuranceClaim: true,
      insuranceCompany: "Geico",
      bidCount: 5
    },
  ];

  const filteredRequests = sampleRequests.filter(req => {
    const matchesSearch = req.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         req.damageType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || req.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSubmitBid = () => {
    if (selectedRequest && bidAmount) {
      onSubmitBid?.(selectedRequest.id, parseFloat(bidAmount));
      setShowBidModal(false);
      setBidAmount("");
      setSelectedRequest(null);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case "high": return "text-red-600 bg-red-50";
      case "medium": return "text-orange-600 bg-orange-50";
      case "low": return "text-green-600 bg-green-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new": return "bg-blue-100 text-blue-700";
      case "bidding": return "bg-yellow-100 text-yellow-700";
      case "closed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>Repair Requests</h1>
          
          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by customer, vehicle, or damage..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Requests" },
                { id: "new", label: "New" },
                { id: "bidding", label: "Bidding" },
                { id: "closed", label: "Closed" }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterStatus === filter.id
                      ? "text-white"
                      : "bg-white border border-gray-300 text-gray-700"
                  }`}
                  style={filterStatus === filter.id ? { backgroundColor: primaryColor } : {}}
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
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No requests found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Request Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-lg">{request.customerName}</h3>
                    <p className="text-sm text-gray-600">{request.vehicle}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status)}`}>
                      {request.status.toUpperCase()}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(request.urgency)}`}>
                      {request.urgency.toUpperCase()} PRIORITY
                    </span>
                  </div>
                </div>

                <div className="flex items-center text-sm text-gray-500 mb-2">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>{request.submittedDate}</span>
                  <span className="mx-2">•</span>
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{request.distance}</span>
                </div>
              </div>

              {/* Damage Details */}
              <div className="p-4 bg-gray-50">
                <h4 className="font-semibold mb-2" style={{ color: primaryColor }}>{request.damageType}</h4>
                <p className="text-sm text-gray-700 mb-3">{request.description}</p>

                <div className="flex flex-wrap gap-2 mb-3">
                  <div className="flex items-center text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
                    <ImageIcon className="w-4 h-4 mr-1 text-gray-600" />
                    <span>{request.photoCount} photos</span>
                  </div>
                  {request.insuranceClaim && (
                    <div className="flex items-center text-sm bg-blue-50 px-3 py-1 rounded-full border border-blue-200 text-blue-700">
                      <Star className="w-4 h-4 mr-1" />
                      <span>Insurance: {request.insuranceCompany}</span>
                    </div>
                  )}
                  {request.bidCount && (
                    <div className="flex items-center text-sm bg-yellow-50 px-3 py-1 rounded-full border border-yellow-200 text-yellow-700">
                      <DollarSign className="w-4 h-4 mr-1" />
                      <span>{request.bidCount} bids submitted</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Info */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <a
                    href={`tel:${request.customerPhone}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <Phone className="w-4 h-4" />
                    Call
                  </a>
                  <a
                    href={`mailto:${request.customerEmail}`}
                    className="flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
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
                  className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: primaryColor }}
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
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Submit Bid</h2>
              <p className="text-sm text-gray-600 mb-4">
                {selectedRequest.vehicle} - {selectedRequest.damageType}
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bid Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Enter your competitive bid for this repair job
                </p>
              </div>

              <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  <strong>Customer:</strong> {selectedRequest.customerName}
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Location:</strong> {selectedRequest.location}
                </p>
                {selectedRequest.insuranceClaim && (
                  <p className="text-sm text-gray-700">
                    <strong>Insurance:</strong> {selectedRequest.insuranceCompany}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowBidModal(false);
                    setBidAmount("");
                    setSelectedRequest(null);
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitBid}
                  disabled={!bidAmount || parseFloat(bidAmount) <= 0}
                  className="flex-1 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
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
