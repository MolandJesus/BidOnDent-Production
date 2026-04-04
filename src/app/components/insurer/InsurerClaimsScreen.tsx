import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Search, AlertCircle, MapPin } from "lucide-react";
import { zipToCoordinates } from "../../services/supabase/map";
import { defaultCoverageCenter } from "../landing/coverageData";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { ReportPin } from "../dashboard/MapLibreDashboardMapPreview";
import { transformReportsToClaims, type ClaimData } from "./insurerClaimsUtils";
import InsurerClaimCard from "./InsurerClaimCard";
import InsurerClaimApprovalModal from "./InsurerClaimApprovalModal";
import InsurerClaimDenialModal from "./InsurerClaimDenialModal";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";
import { useNotifications } from "../../features/notifications/NotificationContext";

type InsurerClaimsScreenProps = {
  primaryColor?: string;
  reports?: DamageReport[];
  reportsLoading?: boolean;
  isSeedData?: boolean;
  onApproveClaim?: (claimId: string, amount: number) => void | Promise<void>;
  onDenyClaim?: (claimId: string, reason: string) => void | Promise<void>;
  appearanceMode?: DashboardAppearanceMode;
};

export default function InsurerClaimsScreen({
  primaryColor = "#003d82",
  reports = [],
  reportsLoading = false,
  isSeedData = false,
  onApproveClaim,
  onDenyClaim,
  appearanceMode = "map-dark",
}: InsurerClaimsScreenProps) {
  const isLight = appearanceMode === "light";
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "pending" | "reviewing" | "approved" | "denied"
  >("all");
  const [selectedClaim, setSelectedClaim] = useState<ClaimData | null>(null);
  const [approvalAmount, setApprovalAmount] = useState("");
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showDenialModal, setShowDenialModal] = useState(false);
  const notifications = useNotifications();

  // DEPRECATED: Sample claims data removed - component now expects live data from Supabase
  // If no data is provided, shows empty state instead

  const liveClaims = transformReportsToClaims(reports);

  const claimsSource = liveClaims.length > 0 ? liveClaims : [];

  // Map pins for claim locations
  const claimPins = useMemo<ReportPin[]>(() => {
    return (reports || [])
      .map((report) => {
        const vehicleData = report?.vehicle || report?.vehicleInfo || {};
        const label =
          [vehicleData.year, vehicleData.make, vehicleData.model].filter(Boolean).join(" ") ||
          report?.damageArea ||
          "Insurance claim";
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

  const claimMapCenter = useMemo<[number, number]>(() => {
    if (claimPins.length > 0) {
      return [claimPins[0].lat, claimPins[0].lng];
    }
    return defaultCoverageCenter;
  }, [claimPins]);

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

  const handleApproveClaim = async () => {
    if (selectedClaim && approvalAmount) {
      if (selectedClaim.id.startsWith("seed-")) return;
      try {
        await onApproveClaim?.(selectedClaim.id, parseFloat(approvalAmount));
        notifications.push({
          category: "insurer",
          title: "Claim approved",
          body: `Claim ${selectedClaim.claimNumber} approved for $${parseFloat(approvalAmount).toLocaleString()}.`,
          payload: { claimId: selectedClaim.id },
          userId: "",
          deepLink: null,
          priority: "high",
        });
        setShowApprovalModal(false);
        setApprovalAmount("");
        setSelectedClaim(null);
      } catch {
        notifications.push({
          category: "insurer",
          title: "Approval failed",
          body: "Could not approve this claim. Please try again.",
          payload: { claimId: selectedClaim.id },
          userId: "",
          deepLink: null,
          priority: "high",
        });
      }
    }
  };

  const handleOpenDenial = (claim: ClaimData) => {
    setSelectedClaim(claim);
    setShowDenialModal(true);
  };

  const handleDenyClaim = async (reason: string) => {
    if (selectedClaim) {
      if (selectedClaim.id.startsWith("seed-")) return;
      try {
        await onDenyClaim?.(selectedClaim.id, reason);
        notifications.push({
          category: "insurer",
          title: "Claim denied",
          body: `Claim ${selectedClaim.claimNumber} has been denied.`,
          payload: { claimId: selectedClaim.id },
          userId: "",
          deepLink: null,
          priority: "normal",
        });
        setShowDenialModal(false);
        setSelectedClaim(null);
      } catch {
        notifications.push({
          category: "insurer",
          title: "Denial failed",
          body: "Could not deny this claim. Please try again.",
          payload: { claimId: selectedClaim.id },
          userId: "",
          deepLink: null,
          priority: "high",
        });
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
            className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${isLight ? "text-indigo-600" : "text-indigo-300/80"}`}
          >
            Claims overview
          </p>
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
                  className={`bd-dashboard-filter-button rounded-full px-4 py-2 min-h-[44px] font-medium whitespace-nowrap transition-colors ${
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
              Showing example claims for preview. Active claims will appear here as repair reports
              are filed.
            </span>
          </div>
        </div>
      )}

      {/* Claim Geography Map */}
      {!reportsLoading && claimsSource.length > 0 && (
        <div className="px-4 pt-4">
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, delay: 0.08 }}
            className="bd-dashboard-panel bd-dashboard-panel--accent-indigo overflow-hidden"
          >
            <div className="p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2
                    className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
                  >
                    Claim locations
                  </h2>
                  <p
                    className={`mt-0.5 text-xs ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
                  >
                    Geographic distribution of active insurance claims.
                  </p>
                </div>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isLight
                      ? "bg-amber-50 text-amber-700 border border-amber-200/60"
                      : "bg-amber-400/14 text-amber-200 border border-amber-300/20"
                  }`}
                >
                  {claimPins.length}/{claimsSource.length} mapped
                </span>
              </div>
            </div>

            {claimPins.length > 0 ? (
              <>
                <div className="h-[200px] md:h-[220px]">
                  <DashboardMapPreview
                    shops={[]}
                    reportPins={claimPins}
                    center={claimMapCenter}
                    zoom={10}
                    isLight={isLight}
                  />
                </div>
                <div className="flex flex-wrap items-center gap-2 p-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                      isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-200"
                    }`}
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-400" />
                    Insurance claim
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
                  No claim locations available. Claims with ZIP codes will appear on this map.
                </span>
              </div>
            )}
          </motion.section>
        </div>
      )}

      {/* Claims List */}
      <div className="px-4 py-4 space-y-4">
        {reportsLoading ? (
          <div className="bd-dashboard-panel bd-dashboard-panel--deep p-5 sm:p-8 text-center">
            <p className={isLight ? "text-slate-500" : "text-blue-100/70"}>Loading claims…</p>
          </div>
        ) : filteredClaims.length === 0 ? (
          <div className="bd-dashboard-panel bd-dashboard-panel--deep p-5 sm:p-8 text-center">
            <AlertCircle
              className={`w-12 h-12 mx-auto mb-3 ${isLight ? "text-blue-500/60" : "text-blue-400/70"}`}
            />
            <p className={isLight ? "text-slate-900" : "text-slate-100"}>
              {liveClaims.length === 0 ? "No claims yet" : "No claims found"}
            </p>
            <p className={`text-sm mt-1 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              {liveClaims.length === 0
                ? "Filed claims from customers will appear here automatically."
                : "Try adjusting your filters or search"}
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
              onOpenDenial={handleOpenDenial}
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

      {showDenialModal && selectedClaim && (
        <InsurerClaimDenialModal
          selectedClaim={selectedClaim}
          primaryColor={primaryColor}
          onDeny={handleDenyClaim}
          appearanceMode={appearanceMode}
          onCancel={() => {
            setShowDenialModal(false);
            setSelectedClaim(null);
          }}
        />
      )}
    </div>
  );
}
