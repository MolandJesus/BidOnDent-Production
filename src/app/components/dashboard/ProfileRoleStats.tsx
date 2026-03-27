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
  const containerCls = isLightAppearance
    ? "px-4 py-3 bg-slate-50/80 border-b border-slate-200/50"
    : "px-4 py-3 bg-slate-800/30 border-b border-blue-200/15";
  const valueCls = isLightAppearance
    ? "font-bold text-lg text-slate-800"
    : "font-bold text-lg text-slate-100";
  const labelCls = isLightAppearance ? "text-xs text-slate-500" : "text-xs text-blue-200/60";
  const footerBorderCls = isLightAppearance
    ? "border-t border-slate-200/50"
    : "border-t border-blue-200/15";
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
