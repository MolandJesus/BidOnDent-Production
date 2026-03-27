import { useState } from "react";
import { Search, AlertCircle } from "lucide-react";
import { transformReportsToClaims, type ClaimData } from "./insurerClaimsUtils";
import InsurerClaimCard from "./InsurerClaimCard";
import InsurerClaimApprovalModal from "./InsurerClaimApprovalModal";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type InsurerClaimsScreenProps = {
  primaryColor?: string;
  reports?: any[];
  reportsLoading?: boolean;
  onApproveClaim?: (claimId: number, amount: number) => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function InsurerClaimsScreen({
  primaryColor = "#003d82",
  reports = [],
  reportsLoading = false,
  onApproveClaim,
  appearanceMode = "map-dark",
}: InsurerClaimsScreenProps) {
  const isLight = appearanceMode === "light";
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
            Claims Management
          </h1>

          {/* Search & Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isLight ? "text-slate-400" : "text-blue-200/60"}`}
              />
              <input
                type="text"
                placeholder="Search by claim #, customer, vehicle, or policy..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 border rounded-xl outline-none transition-colors ${isLight ? "border-slate-200 bg-white text-slate-800 placeholder:text-slate-400 focus:border-blue-400/60" : "border-blue-300/20 bg-white/8 text-slate-100 placeholder:text-blue-200/50 focus:border-blue-400/40 focus:ring-1 focus:ring-blue-400/20"}`}
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {(
                [
                  { id: "all", label: "All Claims" },
                  { id: "pending", label: "Pending" },
                  { id: "reviewing", label: "Reviewing" },
                  { id: "approved", label: "Approved" },
                  { id: "denied", label: "Denied" },
                ] as {
                  id: "all" | "pending" | "reviewing" | "approved" | "denied";
                  label: string;
                }[]
              ).map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setFilterStatus(filter.id)}
                  className={`px-4 py-2 min-h-[44px] rounded-lg font-medium whitespace-nowrap transition-colors ${
                    filterStatus === filter.id
                      ? "text-white shadow-sm"
                      : isLight
                        ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                        : "text-blue-100/80 bg-white/8 border border-blue-300/15 hover:bg-white/12"
                  }`}
                  style={
                    filterStatus === filter.id
                      ? {
                          background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
                        }
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

      {/* Claims List */}
      <div className="px-4 py-4 space-y-4">
        {reportsLoading ? (
          <div
            className={`bd-glass-card p-5 sm:p-8 text-center ${isLight ? "" : ""}`}
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
            <p className={isLight ? "text-slate-500" : "text-blue-100/70"}>Loading claims…</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div
            className="bd-glass-card p-5 sm:p-8 text-center"
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
            <p className={isLight ? "text-slate-900" : "text-slate-100"}>No claims found</p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              Try adjusting your filters or search
            </p>
          </div>
        ) : (
          filteredClaims.map((claim) => (
            <InsurerClaimCard
              key={claim.id}
              claim={claim}
              primaryColor={primaryColor}
              appearanceMode={appearanceMode}
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
          appearanceMode={appearanceMode}
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
