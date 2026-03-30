/**
 * ShopRequestCard.tsx — Individual repair request card for shop requests list.
 *
 * Extracted from ShopRequestsScreen. Displays request header with status/urgency badges,
 * damage details, photo/bid counts, contact buttons, and "Submit Bid" CTA.
 */
import {
  MapPin,
  Calendar,
  DollarSign,
  Image as ImageIcon,
  Phone,
  Mail,
  ChevronRight,
  Star,
  BadgeCheck,
} from "lucide-react";

export type RepairRequest = {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  vehicle: string;
  damageType: string;
  description: string;
  location: string;
  distance: string;
  hasLocation: boolean;
  photoCount: number;
  photoUrls: string[];
  previewPhoto: string | null;
  submittedAt: string;
  submittedDate: string;
  status: string;
  urgency: string;
  insuranceClaim: boolean;
  insuranceCompany: string;
  bidCount: number;
};

export function getUrgencyColor(urgency: string, isLight: boolean) {
  if (isLight) {
    switch (urgency) {
      case "high":
        return "text-red-700 bg-red-100 border border-red-300";
      case "medium":
        return "text-orange-700 bg-orange-100 border border-orange-300";
      case "low":
        return "text-green-700 bg-green-100 border border-green-300";
      default:
        return "text-slate-700 bg-slate-100 border border-slate-300";
    }
  }
  switch (urgency) {
    case "high":
      return "text-red-300 bg-red-500/15 border border-red-400/25";
    case "medium":
      return "text-orange-300 bg-orange-500/15 border border-orange-400/25";
    case "low":
      return "text-green-300 bg-green-500/15 border border-green-400/25";
    default:
      return "text-slate-300 bg-slate-500/15 border border-slate-400/25";
  }
}

export function getStatusColor(status: string, isLight: boolean) {
  if (isLight) {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-700 border border-blue-300";
      case "bidding":
        return "bg-yellow-100 text-yellow-700 border border-yellow-300";
      case "accepted":
        return "bg-emerald-100 text-emerald-700 border border-emerald-300";
      case "closed":
        return "bg-slate-100 text-slate-600 border border-slate-300";
      default:
        return "bg-slate-100 text-slate-600 border border-slate-300";
    }
  }
  switch (status) {
    case "new":
      return "bg-blue-500/15 text-blue-300 border border-blue-400/25";
    case "bidding":
      return "bg-yellow-500/15 text-yellow-300 border border-yellow-400/25";
    case "accepted":
      return "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25";
    case "closed":
      return "bg-slate-500/15 text-slate-300 border border-slate-400/25";
    default:
      return "bg-slate-500/15 text-slate-300 border border-slate-400/25";
  }
}

type ShopRequestCardProps = {
  request: RepairRequest;
  isLight: boolean;
  primaryColor: string;
  focused?: boolean;
  hasBid?: boolean;
  onSubmitBid: (request: RepairRequest) => void;
};

export default function ShopRequestCard({
  request,
  isLight,
  primaryColor,
  focused = false,
  hasBid = false,
  onSubmitBid,
}: ShopRequestCardProps) {
  return (
    <div
      className={`bd-glass-card overflow-hidden transition-shadow duration-200${isLight ? " bd-light-surface" : ""}${focused ? " ring-2 ring-amber-400/60" : ""}`}
      style={
        isLight
          ? {}
          : {
              background:
                "linear-gradient(180deg, rgba(11, 23, 47, 0.82) 0%, rgba(8, 18, 38, 0.78) 100%)",
              borderColor: focused ? "rgba(251, 191, 36, 0.50)" : "rgba(96, 165, 250, 0.22)",
            }
      }
    >
      {/* Request Header */}
      <div className={`p-4 border-b ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}>
        <div className="flex items-start justify-between mb-2">
          <div>
            <h3 className={`font-bold text-lg ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              {request.customerName}
            </h3>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>
              {request.vehicle}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(request.status, isLight)}`}
            >
              {request.status.toUpperCase()}
            </span>
            <span
              className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(request.urgency, isLight)}`}
            >
              {request.urgency.toUpperCase()} PRIORITY
            </span>
          </div>
        </div>

        <div
          className={`flex items-center flex-wrap gap-x-2 gap-y-1 text-sm mb-2 ${isLight ? "text-slate-500" : "text-blue-100/70"}`}
        >
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
        <div className="mb-3 flex items-start gap-3">
          <div
            className={`h-24 w-24 shrink-0 overflow-hidden rounded-2xl border ${
              isLight ? "border-slate-200 bg-slate-100" : "border-blue-300/15 bg-white/[0.06]"
            }`}
          >
            {request.previewPhoto ? (
              <img
                src={request.previewPhoto}
                alt={`${request.damageType} preview`}
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
            <h4 className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              {request.damageType}
            </h4>
            <p className={`mt-1 text-sm ${isLight ? "text-slate-600" : "text-blue-100/75"}`}>
              {request.description}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-3">
          <div
            className={`flex items-center text-sm px-3 py-1 rounded-full ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200" : "text-blue-100/80 bg-white/8 border border-blue-300/15"}`}
          >
            <ImageIcon
              className={`w-4 h-4 mr-1 ${isLight ? "text-slate-400" : "text-blue-200/60"}`}
            />
            <span>{request.photoCount} photos</span>
          </div>
          {request.insuranceClaim && (
            <div className="flex items-center text-sm text-blue-200 bg-blue-500/10 border border-blue-400/20 px-3 py-1 rounded-full">
              <Star className="w-4 h-4 mr-1" />
              <span>Insurance: {request.insuranceCompany}</span>
            </div>
          )}
          {request.bidCount > 0 && (
            <div
              className={`flex items-center text-sm px-3 py-1 rounded-full ${isLight ? "text-slate-600 bg-slate-100 border border-slate-200" : "text-blue-200/80 bg-white/8 border border-blue-300/15"}`}
            >
              <DollarSign className="w-4 h-4 mr-1" />
              <span>{request.bidCount} bids submitted</span>
            </div>
          )}
        </div>
      </div>

      {/* Contact Info */}
      <div className={`p-4 border-t ${isLight ? "border-slate-200/60" : "border-blue-300/15"}`}>
        <div className="grid grid-cols-2 gap-3 mb-3">
          {request.status === "accepted" ? (
            <>
              <a
                href={`tel:${request.customerPhone}`}
                className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${isLight ? "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100" : "text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 hover:bg-emerald-500/25"}`}
              >
                <Phone className="w-4 h-4" />
                Call
              </a>
              <a
                href={`mailto:${request.customerEmail}`}
                className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium transition-colors ${isLight ? "text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100" : "text-emerald-300 bg-emerald-500/15 border border-emerald-400/25 hover:bg-emerald-500/25"}`}
              >
                <Mail className="w-4 h-4" />
                Email
              </a>
            </>
          ) : (
            <>
              <span
                className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium ${isLight ? "text-slate-400 bg-slate-100 border border-slate-200" : "text-blue-100/50 bg-white/5 border border-blue-300/10"}`}
                title="Contact info available after bid accepted"
              >
                <Phone className="w-4 h-4" />
                Call
              </span>
              <span
                className={`flex items-center justify-center gap-2 px-4 py-2 min-h-[44px] rounded-xl text-sm font-medium ${isLight ? "text-slate-400 bg-slate-100 border border-slate-200" : "text-blue-100/50 bg-white/5 border border-blue-300/10"}`}
                title="Contact info available after bid accepted"
              >
                <Mail className="w-4 h-4" />
                Email
              </span>
            </>
          )}
        </div>

        {request.status === "accepted" ? (
          <div
            className={`w-full py-3 min-h-[44px] rounded-xl font-semibold flex items-center justify-center gap-2 ${
              isLight
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25"
            }`}
          >
            <BadgeCheck className="w-5 h-5" />
            Bid Accepted — Job Active
          </div>
        ) : hasBid ? (
          <div
            className={`w-full py-3 min-h-[44px] rounded-xl font-semibold flex items-center justify-center gap-2 ${
              isLight
                ? "bg-violet-50 text-violet-700 border border-violet-200"
                : "bg-violet-500/15 text-violet-300 border border-violet-400/25"
            }`}
          >
            <BadgeCheck className="w-5 h-5" />
            Bid Sent — Awaiting Response
          </div>
        ) : (
          <button
            onClick={() => onSubmitBid(request)}
            className="w-full py-3 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, #0f8fd7 100%)`,
            }}
          >
            <DollarSign className="w-5 h-5" />
            Submit Bid
            <ChevronRight className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
