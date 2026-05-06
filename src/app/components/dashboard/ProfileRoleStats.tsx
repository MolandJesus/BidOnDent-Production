import {
  Award,
  Building2,
  Car,
  CheckCircle,
  ClipboardList,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Wrench,
} from "lucide-react";

type ProfileRoleStatsProps = {
  userType: "customer" | "shop" | "insurer";
  reportCount: number;
  vehicleCount: number;
  bidCount: number;
  shopRequestsCount: number;
  shopBidCount: number;
  shopAverageRating: string;
  insurerPartnerShops: number;
  insurerResolvedClaims: number;
  insurerBidCount: number;
  isLightAppearance?: boolean;
};

export default function ProfileRoleStats({
  userType,
  reportCount,
  vehicleCount,
  bidCount,
  shopRequestsCount,
  shopBidCount,
  shopAverageRating,
  insurerPartnerShops,
  insurerResolvedClaims,
  insurerBidCount,
  isLightAppearance = false,
}: ProfileRoleStatsProps) {
  // D8: stats container reads as lit-glass plate — warm inset bottom + warm
  // halo bring it into the gold-lamp family. Cool blue body preserved.
  // Light-mode aligned to locked 2026-05-03 palette (KI-066): cream inset
  // replaces white, bronze rim + deep outer halo replace forbidden warm yellows.
  const containerCls = isLightAppearance
    ? "px-4 py-3 bg-[linear-gradient(180deg,rgba(238,247,255,0.65)_0%,rgba(219,234,254,0.40)_100%)] border-b border-blue-200/35 shadow-[inset_0_1px_0_rgba(252,240,208,0.78),inset_0_-1px_0_rgba(140,82,22,0.26),0_0_24px_rgba(196,130,45,0.12)]"
    : // Dark role-stats container aligned to locked palette (KI-066).
      "px-4 py-3 bg-[linear-gradient(180deg,rgba(15,30,55,0.55)_0%,rgba(11,23,47,0.45)_100%)] border-b border-blue-400/15 shadow-[inset_0_1px_0_rgba(147,197,253,0.10),inset_0_-1px_0_rgba(140,82,22,0.30),0_0_28px_rgba(196,130,45,0.16)]";
  const valueCls = isLightAppearance
    ? "font-bold text-lg text-slate-800"
    : "font-bold text-lg text-slate-100";
  const labelCls = isLightAppearance ? "text-xs text-slate-500" : "text-xs text-blue-200/60";
  const footerBorderCls = isLightAppearance
    ? "border-t border-blue-200/35"
    : "border-t border-blue-400/15";
  const footerTextCls = isLightAppearance ? "text-slate-500" : "text-blue-200/60";
  const footerValueCls = isLightAppearance
    ? "font-semibold text-slate-700"
    : "font-semibold text-slate-200";
  if (userType === "customer") {
    return (
      <div className={containerCls}>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className={valueCls}>{reportCount}</div>
            <div className={labelCls}>Reports</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Car className="w-4 h-4 text-blue-600" />
            </div>
            <div className={valueCls}>{vehicleCount}</div>
            <div className={labelCls}>Vehicles</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className={valueCls}>{bidCount}</div>
            <div className={labelCls}>Bids</div>
          </div>
        </div>
      </div>
    );
  }

  if (userType === "shop") {
    return (
      <div className={containerCls}>
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ClipboardList className="w-4 h-4 text-blue-400" />
            </div>
            <div className={valueCls}>{shopRequestsCount}</div>
            <div className={labelCls}>Requests</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <div className={valueCls}>{shopBidCount}</div>
            <div className={labelCls}>Submitted Bids</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className={valueCls}>{shopAverageRating}</div>
            <div className={labelCls}>Rating</div>
          </div>
        </div>
        <div className={`mt-3 pt-3 ${footerBorderCls} flex items-center justify-between text-xs`}>
          <div className={`flex items-center gap-1 ${footerTextCls}`}>
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span>
              Tracked bids: <span className={footerValueCls}>{shopBidCount}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerCls}>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className={valueCls}>{reportCount}</div>
          <div className={labelCls}>Active Claims</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className={valueCls}>{insurerPartnerShops}</div>
          <div className={labelCls}>Partner Shops</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="w-4 h-4 text-sky-600" />
          </div>
          <div className={valueCls}>{insurerResolvedClaims}</div>
          <div className={labelCls}>Resolved</div>
        </div>
      </div>
      <div className={`mt-3 pt-3 ${footerBorderCls} flex items-center justify-between text-xs`}>
        <div className={`flex items-center gap-1 ${footerTextCls}`}>
          <Clock className="w-3 h-3 text-blue-400" />
          <span>
            Tracked bids: <span className={footerValueCls}>{insurerBidCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
