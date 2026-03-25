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
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-b border-slate-200/40">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-gray-900">{reportCount}</div>
            <div className="text-xs text-gray-600">Reports</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Car className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-gray-900">{vehicleCount}</div>
            <div className="text-xs text-gray-600">Vehicles</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <DollarSign className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-gray-900">{bidCount}</div>
            <div className="text-xs text-gray-600">Bids</div>
          </div>
        </div>
      </div>
    );
  }

  if (userType === "shop") {
    return (
      <div className="px-4 py-3 bg-gradient-to-r from-blue-50/70 to-sky-50/70 border-b border-slate-200/40">
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <ClipboardList className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-gray-900">{shopRequestsCount}</div>
            <div className="text-xs text-gray-600">Requests</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Wrench className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-gray-900">{shopBidCount}</div>
            <div className="text-xs text-gray-600">Submitted Bids</div>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-1">
              <Award className="w-4 h-4 text-blue-600" />
            </div>
            <div className="font-bold text-lg text-gray-900">{shopAverageRating}</div>
            <div className="text-xs text-gray-600">Rating</div>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-slate-200/40 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-600">
            <TrendingUp className="w-3 h-3 text-blue-600" />
            <span>
              Tracked bids: <span className="font-semibold text-gray-900">{shopBidCount}</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-3 bg-gradient-to-r from-blue-50/70 to-indigo-50/70 border-b border-slate-200/40">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-bold text-lg text-gray-900">{reportCount}</div>
          <div className="text-xs text-gray-600">Active Claims</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="font-bold text-lg text-gray-900">{insurerPartnerShops}</div>
          <div className="text-xs text-gray-600">Partner Shops</div>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <CheckCircle className="w-4 h-4 text-sky-600" />
          </div>
          <div className="font-bold text-lg text-gray-900">{insurerResolvedClaims}</div>
          <div className="text-xs text-gray-600">Resolved</div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-200/40 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="w-3 h-3 text-blue-600" />
          <span>
            Tracked bids: <span className="font-semibold text-gray-900">{insurerBidCount}</span>
          </span>
        </div>
      </div>
    </div>
  );
}
