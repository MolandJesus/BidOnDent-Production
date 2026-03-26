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
}: ProfileRoleStatsProps) {
  if (userType === "customer") {
    return (
      <div className="px-4 py-3 bg-slate-800/30 border-b border-blue-200/15">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FileText className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-bold text-lg text-slate-100">{reportCount}</div>
            <div className="text-xs text-blue-200/60">Reports</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Car className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-slate-100">{vehicleCount}</div>
            <div className="text-xs text-blue-200/60">Vehicles</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-slate-100">{bidCount}</div>
            <div className="text-xs text-blue-200/60">Bids</div>
          </div>
        </div>
      </div>
    );
  }

  if (userType === "shop") {
    return (
      <div className="px-4 py-3 bg-slate-800/30 border-b border-blue-200/15">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ClipboardList className="w-4 h-4 text-blue-400" />
            </div>
            <div className="font-bold text-lg text-slate-100">{shopRequestsCount}</div>
            <div className="text-xs text-blue-200/60">Requests</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-slate-100">{shopBidCount}</div>
            <div className="text-xs text-blue-200/60">Submitted Bids</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-slate-100">{shopAverageRating}</div>
            <div className="text-xs text-blue-200/60">Rating</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-blue-200/15 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-blue-200/60">
            <TrendingUp className="w-3 h-3 text-blue-400" />
            <span>
              Tracked bids: <span className="font-semibold text-slate-200">{shopBidCount}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-slate-800/30 border-b border-blue-200/15">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FileText className="w-4 h-4 text-blue-400" />
          </div>
          <div className="font-bold text-lg text-slate-100">{reportCount}</div>
          <div className="text-xs text-blue-200/60">Active Claims</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-bold text-lg text-slate-100">{insurerPartnerShops}</div>
          <div className="text-xs text-blue-200/60">Partner Shops</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-bold text-lg text-slate-100">{insurerResolvedClaims}</div>
          <div className="text-xs text-blue-200/60">Resolved</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-blue-200/15 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-blue-200/60">
          <Clock className="w-3 h-3 text-blue-400" />
          <span>
            Tracked bids: <span className="font-semibold text-slate-200">{insurerBidCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
