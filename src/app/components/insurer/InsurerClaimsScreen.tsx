import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import { transformReportsToClaims, type ClaimData } from "./insurerClaimsUtils";
import InsurerClaimCard from "./InsurerClaimCard";
import InsurerClaimApprovalModal from "./InsurerClaimApprovalModal";

type InsurerClaimsScreenProps = {
  primaryColor?: string;
  reports?: any[];
  reportsLoading?: boolean;
  onApproveClaim?: (claimId: number, amount: number) => void;
};

export default function InsurerClaimsScreen({
  primaryColor = "#003d82",
  reports = [],
  reportsLoading = false,
  onApproveClaim,
}: InsurerClaimsScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "reviewing" | "approved" | "denied"
  >("all");
  const [selectedClaim, setSelectedClaim] = useState<any | null>(null);
  const [approvalAmount, setApprovalAmount] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);

  // DEPRECATED: Sample claims data removed - component now expects live data from Supabase
  // If no data is provided, shows empty state instead

  const liveClaims = transformReportsToClaims(reports);

  const claimsSource = liveClaims.length > 0 ? liveClaims : [];

  const filteredClaims = claimsSource.filter((claim) => {
    const matchesSearch =
      claim.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.claimNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.vehicle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      claim.policyNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterStatus === "all" || claim.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleOpenApproval = (claim: ClaimData) => {
    setSelectedClaim(claim);
    setApprovalAmount(claim.estimatedDamage.toString());
    setShowApprovalModal(true);
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
    <div className="min-h-screen bd-glass-panel">
      {/* Header */}
      <div className="bd-glass-panel sticky top-0 z-10 border-b border-slate-200/60">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold mb-4" style={{ color: primaryColor }}>
            Claims Management
          </h1>

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
                { id: "denied", label: "Denied" },
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id as any)}
                  className={`px-4 py-2 min-h-[44px] rounded-lg font-medium whitespace-nowrap transition-colors ${
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
        {reportsLoading ? (
          <div className="bd-glass-card p-5 sm:p-8 text-center">
            <p className="text-slate-500">Loading claims…</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="bd-glass-card p-5 sm:p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No claims found</p>
            <p className="text-sm text-gray-500 mt-1">Try adjusting your filters or search</p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <InsurerClaimCard
              key={claim.id}
              claim={claim}
              primaryColor={primaryColor}
              onOpenApproval={handleOpenApproval}
            />
          ))
        )}
      </div>

      {showApprovalModal && selectedClaim && (
        <InsurerClaimApprovalModal
          selectedClaim={selectedClaim}
          approvalAmount={approvalAmount}
          primaryColor={primaryColor}
          onApprovalAmountChange={setApprovalAmount}
          onApprove={handleApproveClaim}
          onCancel={() => {
            setShowApprovalModal(false);
            setApprovalAmount("");
            setSelectedClaim(null);
          }}
        />
      )}
    </div>
  );
}
