import {
  MapPin,
  Calendar,
  Phone,
  Mail,
  FileText,
  ChevronRight,
  CheckCircle,
  Clock,
  Building2,
  Image as ImageIcon,
  TrendingUp,
  XCircle,
} from "lucide-react";
import RepairLifecycleTimeline from "../workflow/RepairLifecycleTimeline";
import { insurerLifecycle } from "../workflow/lifecycle-presets";
import ImageWithFallback from "../codelayer/ImageWithFallback";
import { type ClaimData, getStatusColor, getPriorityColor } from "./insurerClaimsUtils";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type InsurerClaimCardProps = {
  claim: ClaimData;
  primaryColor: string;
  onOpenApproval: (claim: ClaimData) => void;
  onOpenDenial?: (claim: ClaimData) => void;
  onViewDetails?: (claim: ClaimData) => void;
  appearanceMode?: DashboardAppearanceMode;
};

function getStatusIcon(status: string) {
  switch (status) {
    case "pending":
      return <Clock className="w-4 h-4" />;
    case "reviewing":
      return <FileText className="w-4 h-4" />;
    case "approved":
      return <CheckCircle className="w-4 h-4" />;
    case "denied":
      return <XCircle className="w-4 h-4" />;
    default:
      return <Clock className="w-4 h-4" />;
  }
}

export default function InsurerClaimCard({
  claim,
  primaryColor,
  onOpenApproval,
  onOpenDenial,
  onViewDetails,
  appearanceMode = "map-dark",
}: InsurerClaimCardProps) {
  const isLight = appearanceMode === "light";
  const estimatedDamageLabel =
    claim.estimatedDamage > 0 ? `$${claim.estimatedDamage.toLocaleString()}` : "Pending";

  return (
    <div
      className={`bd-glass-card overflow-hidden${isLight ? " bd-light-surface" : ""}`}
      style={
        isLight
          ? undefined
          : {
              background:
                "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
              borderColor: "rgba(96, 165, 250, 0.22)",
            }
      }
    >
      {/* Claim Header */}
      <div className={`p-4 border-b ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-sm font-bold ${isLight ? "text-blue-600" : "text-blue-200/80"}`}
              >
                {claim.claimNumber}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${getStatusColor(claim.status)} flex items-center gap-1`}
              >
                {getStatusIcon(claim.status)}
                {claim.status.toUpperCase()}
              </span>
              <span
                className={`px-2 py-1 rounded text-xs font-medium border ${getPriorityColor(claim.priority)}`}
              >
                {claim.priority.toUpperCase()}
              </span>
            </div>
            <h3 className={`font-bold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              {claim.customerName}
            </h3>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>
              {claim.vehicle}
            </p>
          </div>
          <div className="text-right">
            <p className={`text-xs mb-1 ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>
              Est. Damage
            </p>
            <p className={`font-bold text-lg ${isLight ? "text-blue-600" : "text-blue-200"}`}>
              {estimatedDamageLabel}
            </p>
            {claim.approvedAmount && (
              <p className="text-xs text-emerald-400 font-medium">
                Approved: ${claim.approvedAmount.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div
          className={`flex flex-wrap gap-x-4 gap-y-1 text-sm ${isLight ? "text-slate-600" : "text-blue-100/70"}`}
        >
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
      <div className={`px-4 py-3 ${isLight ? "bg-slate-50/80" : "bg-white/5"}`}>
        <div className="mb-3 flex items-start gap-3">
          <div
            className={`h-24 w-24 shrink-0 overflow-hidden rounded-2xl border ${
              isLight ? "border-slate-200 bg-white" : "border-blue-300/15 bg-white/[0.06]"
            }`}
          >
            {claim.previewPhoto ? (
              <ImageWithFallback
                src={claim.previewPhoto}
                alt={`${claim.damageType} preview`}
                className="h-full w-full object-cover"
                loading="lazy"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center ${
                  isLight ? "text-slate-400" : "text-blue-200/50"
                }`}
              >
                <ImageIcon className="h-8 w-8" />
              </div>
            )}
          </div>

          <div className="min-w-0 flex-1">
            <h4
              className={`font-semibold text-sm mb-1 ${isLight ? "text-blue-600" : "text-blue-200"}`}
            >
              {claim.damageType}
            </h4>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/80"}`}>
              {claim.description}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>
              Policy Number
            </p>
            <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>
              {claim.policyNumber}
            </p>
          </div>
          <div>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>VIN</p>
            <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}>
              {claim.vin}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div
            className={`flex items-center text-sm px-3 py-1 rounded-full border ${
              isLight
                ? "text-slate-600 bg-slate-100 border-slate-200"
                : "text-blue-100/80 bg-white/[0.08] border-blue-300/15"
            }`}
          >
            <ImageIcon
              className={`w-4 h-4 mr-1 ${isLight ? "text-slate-400" : "text-blue-200/60"}`}
            />
            <span>{claim.photoCount} photos</span>
          </div>
        </div>
      </div>

      {/* Shop Assignment / Bids */}
      {claim.shopAssigned ? (
        <div
          className={`px-4 py-3 border-t ${isLight ? "bg-blue-50/60 border-slate-200/60" : "bg-blue-500/10 border-blue-300/15"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Building2 className={`w-4 h-4 ${isLight ? "text-blue-500" : "text-blue-300"}`} />
              <span
                className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                Assigned Shop
              </span>
            </div>
          </div>
          <p className={`text-sm font-medium ${isLight ? "text-slate-700" : "text-blue-100"}`}>
            {claim.shopAssigned}
          </p>
          {claim.shopContact && (
            <a
              href={`tel:${claim.shopContact}`}
              className={`text-sm flex items-center gap-1 mt-1 ${isLight ? "text-blue-600" : "text-blue-300"}`}
            >
              <Phone className="w-3 h-3" />
              {claim.shopContact}
            </a>
          )}
          {!claim.shopContact && (
            <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>
              Contact info will be provided once shop confirms assignment
            </p>
          )}
          {claim.approvalDate && (
            <p className={`text-xs mt-1 ${isLight ? "text-slate-500" : "text-blue-200/60"}`}>
              Approved: {claim.approvalDate}
            </p>
          )}
        </div>
      ) : claim.shopBids && claim.shopBids.length > 0 ? (
        <div
          className={`px-4 py-3 border-t ${isLight ? "bg-amber-50/60 border-slate-200/60" : "bg-amber-500/10 border-blue-300/15"}`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span
                className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
              >
                Shop Bids ({claim.shopBids.length})
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {claim.shopBids.slice(0, 2).map((bid, index) => (
              <div
                key={index}
                className={`flex items-center justify-between p-2 rounded-lg border ${
                  isLight ? "bg-slate-50 border-slate-200" : "bg-white/[0.08] border-blue-300/15"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-200"}`}
                  >
                    {bid.shopName}
                  </p>
                  <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
                    {bid.distance} · {bid.rating}
                  </p>
                </div>
                <p className={`font-bold text-sm ${isLight ? "text-blue-600" : "text-blue-200"}`}>
                  ${bid.amount.toLocaleString()}
                </p>
              </div>
            ))}
            {claim.shopBids.length > 2 && (
              <button className="text-xs text-amber-300 font-medium hover:underline">
                View all {claim.shopBids.length} bids
              </button>
            )}
          </div>
        </div>
      ) : null}

      {/* Denial Reason */}
      {claim.status === "denied" && claim.denialReason && (
        <div className="px-4 py-3 bg-rose-500/10 border-t border-blue-300/15">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-rose-400" />
            <span className="text-sm font-semibold text-rose-200">Denial Reason</span>
          </div>
          <p className="text-sm text-rose-100/80">{claim.denialReason}</p>
        </div>
      )}

      {/* Actions */}
      <div className={`p-4 border-t ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}>
        <div className="mb-3">
          <RepairLifecycleTimeline
            title="Claim Lifecycle"
            steps={insurerLifecycle(claim.status)}
            compact
            appearanceMode={appearanceMode}
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
          {claim.customerPhone && claim.customerPhone !== "Not provided" ? (
            <a
              href={`tel:${claim.customerPhone}`}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                isLight
                  ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                  : "text-blue-100/80 bg-white/[0.08] border border-blue-300/15 hover:bg-white/[0.12]"
              }`}
            >
              <Phone className="w-4 h-4" />
              <span className="text-xs">Call</span>
            </a>
          ) : (
            <span
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg opacity-50 cursor-not-allowed ${
                isLight
                  ? "text-slate-600 bg-slate-100 border border-slate-200"
                  : "text-blue-100/80 bg-white/[0.08] border border-blue-300/15"
              }`}
              title="Contact info not available"
            >
              <Phone className="w-4 h-4" />
              <span className="text-xs">Call</span>
            </span>
          )}
          {claim.customerEmail && claim.customerEmail !== "Not provided" ? (
            <a
              href={`mailto:${claim.customerEmail}`}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
                isLight
                  ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                  : "text-blue-100/80 bg-white/[0.08] border border-blue-300/15 hover:bg-white/[0.12]"
              }`}
            >
              <Mail className="w-4 h-4" />
              <span className="text-xs">Email</span>
            </a>
          ) : (
            <span
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg opacity-50 cursor-not-allowed ${
                isLight
                  ? "text-slate-600 bg-slate-100 border border-slate-200"
                  : "text-blue-100/80 bg-white/[0.08] border border-blue-300/15"
              }`}
              title="Contact info not available"
            >
              <Mail className="w-4 h-4" />
              <span className="text-xs">Email</span>
            </span>
          )}
          <button
            onClick={() => onViewDetails?.(claim)}
            className={`flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm rounded-lg transition-colors ${
              isLight
                ? "text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200"
                : "text-blue-100/80 bg-white/[0.08] border border-blue-300/15 hover:bg-white/[0.12]"
            }`}
          >
            <FileText className="w-4 h-4" />
            <span className="text-xs">Details</span>
          </button>
        </div>

        {claim.status === "pending" && (
          <div className="flex gap-2">
            <button
              onClick={() => onOpenDenial?.(claim)}
              className={`flex-1 py-3 min-h-[44px] rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors ${
                isLight
                  ? "text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100"
                  : "text-rose-300 bg-rose-500/15 border border-rose-400/30 hover:bg-rose-500/25"
              }`}
            >
              <XCircle className="w-5 h-5" />
              Deny
            </button>
            <button
              onClick={() => onOpenApproval(claim)}
              className="bd-dashboard-primary-button flex-[2] py-3 min-h-[44px] text-white font-semibold flex items-center justify-center gap-2"
              style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
            >
              <CheckCircle className="w-5 h-5" />
              Review & Approve
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}

        {claim.status === "approved" && (
          <div className="w-full py-3 rounded-xl bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 font-semibold flex items-center justify-center gap-2">
            <CheckCircle className="w-5 h-5" />
            Claim Approved - ${claim.approvedAmount?.toLocaleString()}
          </div>
        )}

        {claim.status === "denied" && (
          <div className="w-full py-3 rounded-xl bg-rose-500/15 border border-rose-400/30 text-rose-300 font-semibold flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5" />
            Claim Denied
          </div>
        )}
      </div>
    </div>
  );
}
