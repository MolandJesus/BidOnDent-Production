import { useState } from "react";
import { Search, MapPin, Calendar, Phone, Mail, FileText, ChevronRight, AlertCircle, CheckCircle, Clock, Building2, Image as ImageIcon, TrendingUp, XCircle } from "lucide-react";

type InsurerClaimsScreenProps = {
  primaryColor?: string;
  secondaryColor?: string;
  onApproveClaim?: (claimId: number, amount: number) => void;
  onContactShop?: (shopId: number) => void;
};

export default function InsurerClaimsScreen({
  primaryColor = "#003d82",
  onApproveClaim,
  onContactShop
}: InsurerClaimsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "reviewing" | "approved" | "denied">("all");
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [approvalAmount, setApprovalAmount] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // Sample claims data - in production, this would come from Supabase
  const sampleClaims = [
    {
      id: 1001,
      claimNumber: "CLM-2024-1001",
      customerName: "Sarah Johnson",
      customerEmail: "sarah.j@email.com",
      customerPhone: "(555) 123-4567",
      policyNumber: "POL-5678-9012",
      vehicle: "2022 Honda Accord",
      vin: "1HGBH41JXMN109186",
      damageType: "Front Bumper Collision",
      incidentDate: "Dec 18, 2024",
      reportedDate: "Dec 18, 2024",
      estimatedDamage: 2500,
      location: "San Francisco, CA",
      status: "pending",
      priority: "high",
      photoCount: 6,
      description: "Rear-ended at stop light. Front bumper damaged, headlight housing cracked. No injuries reported.",
      shopAssigned: null,
      shopBids: [
        { shopName: "Express Auto Body", amount: 2450, rating: 4.8, distance: "2.3 miles" },
        { shopName: "Premium Collision", amount: 2600, rating: 4.6, distance: "3.1 miles" },
        { shopName: "Quick Fix Auto", amount: 2200, rating: 4.5, distance: "5.2 miles" }
      ]
    },
    {
      id: 1002,
      claimNumber: "CLM-2024-1002",
      customerName: "Michael Chen",
      customerEmail: "m.chen@email.com",
      customerPhone: "(555) 234-5678",
      policyNumber: "POL-3456-7890",
      vehicle: "2020 Toyota Camry",
      vin: "4T1B11HK5LU234567",
      damageType: "Side Panel & Door Damage",
      incidentDate: "Dec 16, 2024",
      reportedDate: "Dec 17, 2024",
      estimatedDamage: 3200,
      location: "Oakland, CA",
      status: "reviewing",
      priority: "medium",
      photoCount: 8,
      description: "Parking lot incident. Driver side door dented, side panel scratched. Minor paint damage.",
      shopAssigned: "Express Auto Body",
      shopContact: "(555) 987-6543",
      approvedAmount: 3100
    },
    {
      id: 1003,
      claimNumber: "CLM-2024-1003",
      customerName: "Emily Rodriguez",
      customerEmail: "emily.r@email.com",
      customerPhone: "(555) 345-6789",
      policyNumber: "POL-8901-2345",
      vehicle: "2019 Ford F-150",
      vin: "1FTFW1ET5KFC12345",
      damageType: "Rear Hatch & Frame",
      incidentDate: "Dec 15, 2024",
      reportedDate: "Dec 15, 2024",
      estimatedDamage: 4500,
      location: "San Jose, CA",
      status: "approved",
      priority: "high",
      photoCount: 7,
      description: "Backed into concrete pole. Rear hatch dented, taillight broken, possible frame damage.",
      shopAssigned: "Premium Collision",
      shopContact: "(555) 876-5432",
      approvedAmount: 4200,
      approvalDate: "Dec 16, 2024"
    },
    {
      id: 1004,
      claimNumber: "CLM-2024-1004",
      customerName: "David Kim",
      customerEmail: "d.kim@email.com",
      customerPhone: "(555) 456-7890",
      policyNumber: "POL-6789-0123",
      vehicle: "2021 BMW 330i",
      vin: "WBA8B9C51M1234567",
      damageType: "Front End Collision",
      incidentDate: "Dec 10, 2024",
      reportedDate: "Dec 11, 2024",
      estimatedDamage: 6800,
      location: "San Francisco, CA",
      status: "approved",
      priority: "high",
      photoCount: 10,
      description: "Multi-vehicle collision. Hood damaged, both headlights broken, radiator support bent.",
      shopAssigned: "Luxury Auto Repair",
      shopContact: "(555) 765-4321",
      approvedAmount: 6500,
      approvalDate: "Dec 12, 2024"
    },
    {
      id: 1005,
      claimNumber: "CLM-2024-1005",
      customerName: "Jennifer Lopez",
      customerEmail: "j.lopez@email.com",
      customerPhone: "(555) 567-8901",
      policyNumber: "POL-4567-8901",
      vehicle: "2023 Tesla Model 3",
      vin: "5YJ3E1EA9PF123456",
      damageType: "Minor Scratch",
      incidentDate: "Dec 20, 2024",
      reportedDate: "Dec 20, 2024",
      estimatedDamage: 800,
      location: "Palo Alto, CA",
      status: "denied",
      priority: "low",
      photoCount: 3,
      description: "Small scratch on passenger door. Appears to be cosmetic wear and tear.",
      denialReason: "Pre-existing condition - normal wear and tear not covered under policy"
    }
  ];

  const filteredClaims = sampleClaims.filter(claim => {
    const matchesSearch = claim.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || claim.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "reviewing": return "bg-blue-100 text-blue-700 border-blue-200";
      case "approved": return "bg-green-100 text-green-700 border-green-200";
      case "denied": return "bg-red-100 text-red-700 border-red-200";
      default: return "bg-gray-100 text-gray-700 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending": return <Clock className="w-4 h-4" />;
      case "reviewing": return <FileText className="w-4 h-4" />;
      case "approved": return <CheckCircle className="w-4 h-4" />;
      case "denied": return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "text-red-600 bg-red-50 border-red-200";
      case "medium": return "text-orange-600 bg-orange-50 border-orange-200";
      case "low": return "text-green-600 bg-green-50 border-green-200";
      default: return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const handleApproveClaim = () => {
    if (selectedClaim && approvalAmount) {
      onApproveClaim?.(selectedClaim.id, parseFloat(approvalAmount));
      setShowApprovalModal(false);
      setApprovalAmount("");
      setSelectedClaim(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>Claims Management</h1>
          
          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by claim #, customer, vehicle, or policy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {[
                { id: "all", label: "All Claims" },
                { id: "pending", label: "Pending" },
                { id: "reviewing", label: "Reviewing" },
                { id: "approved", label: "Approved" },
                { id: "denied", label: "Denied" }
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

      {/* Claims List */}
      <div className="px-4 py-4 space-y-4">
        {filteredClaims.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No claims found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Claim Header */}
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-gray-700">{claim.claimNumber}</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(claim.status)} flex items-center gap-1`}>
                        {getStatusIcon(claim.status)}
                        {claim.status.toUpperCase()}
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(claim.priority)}`}>
                        {claim.priority.toUpperCase()}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg">{claim.customerName}</h3>
                    <p className="text-sm text-gray-600">{claim.vehicle}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500 mb-1">Est. Damage</p>
                    <p className="font-bold text-lg" style={{ color: primaryColor }}>${claim.estimatedDamage.toLocaleString()}</p>
                    {claim.approvedAmount && (
                      <p className="text-xs text-green-600 font-medium">Approved: ${claim.approvedAmount.toLocaleString()}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Incident: {claim.incidentDate}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{claim.location}</span>
                  </div>
                </div>
              </div>

              {/* Policy & Vehicle Info */}
              <div className="px-4 py-3 bg-gray-50">
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Policy Number</p>
                    <p className="text-sm font-medium text-gray-900">{claim.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">VIN</p>
                    <p className="text-sm font-medium text-gray-900">{claim.vin}</p>
                  </div>
                </div>

                <div className="mb-3">
                  <h4 className="font-semibold text-sm mb-1" style={{ color: primaryColor }}>{claim.damageType}</h4>
                  <p className="text-sm text-gray-700">{claim.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="flex items-center text-sm bg-white px-3 py-1 rounded-full border border-gray-200">
                    <ImageIcon className="w-4 h-4 mr-1 text-gray-600" />
                    <span>{claim.photoCount} photos</span>
                  </div>
                </div>
              </div>

              {/* Shop Assignment / Bids */}
              {claim.shopAssigned ? (
                <div className="px-4 py-3 bg-blue-50 border-t border-blue-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-semibold text-blue-900">Assigned Shop</span>
                    </div>
                  </div>
                  <p className="text-sm font-medium text-blue-800">{claim.shopAssigned}</p>
                  {claim.shopContact && (
                    <a href={`tel:${claim.shopContact}`} className="text-sm text-blue-600 flex items-center gap-1 mt-1">
                      <Phone className="w-3 h-3" />
                      {claim.shopContact}
                    </a>
                  )}
                  {claim.approvalDate && (
                    <p className="text-xs text-blue-600 mt-1">Approved: {claim.approvalDate}</p>
                  )}
                </div>
              ) : claim.shopBids && claim.shopBids.length > 0 ? (
                <div className="px-4 py-3 bg-amber-50 border-t border-amber-100">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                      <span className="text-sm font-semibold text-amber-900">Shop Bids ({claim.shopBids.length})</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {claim.shopBids.slice(0, 2).map((bid, index) => (
                      <div key={index} className="flex items-center justify-between bg-white p-2 rounded border border-amber-200">
                        <div>
                          <p className="text-sm font-medium text-gray-900">{bid.shopName}</p>
                          <p className="text-xs text-gray-600">{bid.distance} • ⭐ {bid.rating}</p>
                        </div>
                        <p className="font-bold text-sm" style={{ color: primaryColor }}>${bid.amount.toLocaleString()}</p>
                      </div>
                    ))}
                    {claim.shopBids.length > 2 && (
                      <button className="text-xs text-amber-700 font-medium hover:underline">
                        View all {claim.shopBids.length} bids
                      </button>
                    )}
                  </div>
                </div>
              ) : null}

              {/* Denial Reason */}
              {claim.status === "denied" && claim.denialReason && (
                <div className="px-4 py-3 bg-red-50 border-t border-red-100">
                  <div className="flex items-center gap-2 mb-1">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-sm font-semibold text-red-900">Denial Reason</span>
                  </div>
                  <p className="text-sm text-red-700">{claim.denialReason}</p>
                </div>
              )}

              {/* Actions */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="grid grid-cols-3 gap-2 mb-3">
                  <a
                    href={`tel:${claim.customerPhone}`}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <Phone className="w-4 h-4" />
                    <span className="text-xs">Call</span>
                  </a>
                  <a
                    href={`mailto:${claim.customerEmail}`}
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <Mail className="w-4 h-4" />
                    <span className="text-xs">Email</span>
                  </a>
                  <button
                    className="flex flex-col items-center justify-center gap-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4" />
                    <span className="text-xs">Details</span>
                  </button>
                </div>

                {claim.status === "pending" && (
                  <button
                    onClick={() => {
                      setSelectedClaim(claim);
                      setApprovalAmount(claim.estimatedDamage.toString());
                      setShowApprovalModal(true);
                    }}
                    className="w-full py-3 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                    style={{ backgroundColor: primaryColor }}
                  >
                    <CheckCircle className="w-5 h-5" />
                    Review & Approve
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}

                {claim.status === "approved" && (
                  <div className="w-full py-3 rounded-lg bg-green-50 border-2 border-green-200 text-green-700 font-semibold flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Claim Approved - ${claim.approvedAmount?.toLocaleString()}
                  </div>
                )}

                {claim.status === "denied" && (
                  <div className="w-full py-3 rounded-lg bg-red-50 border-2 border-red-200 text-red-700 font-semibold flex items-center justify-center gap-2">
                    <XCircle className="w-5 h-5" />
                    Claim Denied
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Approval Modal */}
      {showApprovalModal && selectedClaim && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end sm:items-center justify-center z-50 p-4">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold mb-2">Review & Approve Claim</h2>
              <p className="text-sm text-gray-600 mb-4">
                {selectedClaim.claimNumber} - {selectedClaim.customerName}
              </p>

              <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Vehicle</p>
                    <p className="font-medium">{selectedClaim.vehicle}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Policy #</p>
                    <p className="font-medium">{selectedClaim.policyNumber}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Incident Date</p>
                    <p className="font-medium">{selectedClaim.incidentDate}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Est. Damage</p>
                    <p className="font-medium">${selectedClaim.estimatedDamage.toLocaleString()}</p>
                  </div>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Approved Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                  <input
                    type="number"
                    value={approvalAmount}
                    onChange={(e) => setApprovalAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg text-lg"
                    step="0.01"
                    min="0"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Adjust the approved amount based on shop bids and policy coverage
                </p>
              </div>

              {selectedClaim.shopBids && selectedClaim.shopBids.length > 0 && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">Recommended Shops:</p>
                  <div className="space-y-1">
                    {selectedClaim.shopBids.slice(0, 3).map((bid: any, index: number) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-blue-700">{bid.shopName}</span>
                        <span className="font-medium text-blue-900">${bid.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalAmount("");
                    setSelectedClaim(null);
                  }}
                  className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproveClaim}
                  disabled={!approvalAmount || parseFloat(approvalAmount) <= 0}
                  className="flex-1 py-3 rounded-lg text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ backgroundColor: primaryColor }}
                >
                  Approve Claim
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
