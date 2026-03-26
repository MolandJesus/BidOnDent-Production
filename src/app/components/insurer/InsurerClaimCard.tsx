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
import { type ClaimData, getStatusColor, getPriorityColor } from "./insurerClaimsUtils";

type InsurerClaimCardProps = {
  claim: ClaimData;
  primaryColor: string;
  onOpenApproval: (claim: ClaimData) => void;
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
}: InsurerClaimCardProps) {
  return (
    <div
      className="bd-glass-card overflow-hidden"
      style={{
        background: "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
        borderColor: "rgba(96, 165, 250, 0.22)",
      }}
    >
      {/* Claim Header */}
      <div className="p-4 border-b border-blue-300/15">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-bold text-blue-200/80">{claim.claimNumber}</span>
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
            <h3 className="font-bold text-lg text-slate-100">{claim.customerName}</h3>
            <p className="text-sm text-blue-100/75">{claim.vehicle}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-blue-200/60 mb-1">Est. Damage</p>
            <p className="font-bold text-lg text-blue-200">
              ${claim.estimatedDamage.toLocaleString()}
            </p>
            {claim.approvedAmount && (
              <p className="text-xs text-emerald-400 font-medium">
                Approved: ${claim.approvedAmount.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-blue-100/70">
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
      <div className="px-4 py-3 bg-white/5">
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-xs text-blue-200/60">Policy Number</p>
            <p className="text-sm font-medium text-slate-200">{claim.policyNumber}</p>
          </div>
          <div>
            <p className="text-xs text-blue-200/60">VIN</p>
            <p className="text-sm font-medium text-slate-200">{claim.vin}</p>
          </div>
        </div>

        <div className="mb-3">
          <h4 className="font-semibold text-sm mb-1 text-blue-200">
            {claim.damageType}
          </h4>
          <p className="text-sm text-blue-100/80">{claim.description}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center text-sm text-blue-100/80 bg-white/8 px-3 py-1 rounded-full border border-blue-300/15">
            <ImageIcon className="w-4 h-4 mr-1 text-blue-200/60" />
            <span>{claim.photoCount} photos</span>
          </div>
        </div>
      </div>

      {/* Shop Assignment / Bids */}
      {claim.shopAssigned ? (
        <div className="px-4 py-3 bg-blue-500/10 border-t border-blue-300/15">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-blue-300" />
              <span className="text-sm font-semibold text-slate-100">Assigned Shop</span>
            </div>
          </div>
          <p className="text-sm font-medium text-blue-100">{claim.shopAssigned}</p>
          {claim.shopContact && (
            <a
              href={`tel:${claim.shopContact}`}
              className="text-sm text-blue-300 flex items-center gap-1 mt-1"
            >
              <Phone className="w-3 h-3" />
              {claim.shopContact}
            </a>
          )}
          {!claim.shopContact && (
            <p className="text-xs text-blue-200/60 mt-1">
              Contact info will be provided once shop confirms assignment
            </p>
          )}
          {claim.approvalDate && (
            <p className="text-xs text-blue-200/60 mt-1">Approved: {claim.approvalDate}</p>
          )}
        </div>
      ) : claim.shopBids && claim.shopBids.length > 0 ? (
        <div className="px-4 py-3 bg-amber-500/10 border-t border-blue-300/15">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-semibold text-slate-100">
                Shop Bids ({claim.shopBids.length})
              </span>
            </div>
          </div>
          <div className="space-y-2">
            {claim.shopBids.slice(0, 2).map((bid, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white/8 p-2 rounded-lg border border-blue-300/15"
              >
                <div>
                  <p className="text-sm font-medium text-slate-200">{bid.shopName}</p>
                  <p className="text-xs text-blue-100/70">
                    {bid.distance} · {bid.rating}
                  </p>
                </div>
                <p className="font-bold text-sm text-blue-200">
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
      <div className="p-4 border-t border-blue-300/15">
        <div className="mb-3">
          <RepairLifecycleTimeline
            title="Claim Lifecycle"
            steps={insurerLifecycle(claim.status)}
            compact
          />
        </div>

        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
          <a
            href={`tel:${claim.customerPhone}`}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm text-blue-100/80 bg-white/8 border border-blue-300/15 rounded-lg hover:bg-white/12 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="text-xs">Call</span>
          </a>
          <a
            href={`mailto:${claim.customerEmail}`}
            className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm text-blue-100/80 bg-white/8 border border-blue-300/15 rounded-lg hover:bg-white/12 transition-colors"
          >
            <Mail className="w-4 h-4" />
            <span className="text-xs">Email</span>
          </a>
          <button className="flex flex-col items-center justify-center gap-1 px-3 py-2 text-sm text-blue-100/80 bg-white/8 border border-blue-300/15 rounded-lg hover:bg-white/12 transition-colors">
            <FileText className="w-4 h-4" />
            <span className="text-xs">Details</span>
          </button>
        </div>

        {claim.status === "pending" && (
          <button
            onClick={() => onOpenApproval(claim)}
            className="w-full py-3 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)` }}
          >
            <CheckCircle className="w-5 h-5" />
            Review & Approve
            <ChevronRight className="w-5 h-5" />
          </button>
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
