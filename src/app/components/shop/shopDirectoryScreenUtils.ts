import { Briefcase, Car, Shield } from "lucide-react";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { DamageReport } from "../../services/supabase/types";

export type ShopDirectoryScreenProps = {
  onBack: () => void;
  onOpenRelatedScreen?: () => void;
  appearanceMode?: DashboardAppearanceMode;
  primaryColor?: string;
  secondaryColor?: string;
  identity?: WebsiteIdentity | null;
  userType?: MarketUserType;
  userInfo?: {
    name?: string;
    email?: string;
  };
  vehicles?: Array<{ make?: string; model?: string; year?: string | number }>;
  reports?: Array<{
    damageArea?: string;
    damageAreas?: string[];
    damageType?: string;
    description?: string;
  }>;
  onViewReportDetail?: (reportId: string) => void;
  onViewBids?: (reportId?: string) => void;
  mapReports?: DamageReport[];
  /** Pre-seed search from report context (e.g. zip or city). */
  initialSearchHint?: string;
  /** Center the map on these coordinates on first mount (e.g. from a report's location). */
  initialMapCenter?: import("../../types/mapDomain").Coordinates;
  /** Auto-open report drawer for this report ID on map mount. */
  focusReportId?: string;
};

export function getRoleIcon(userType: MarketUserType) {
  if (userType === "shop") return Briefcase;
  if (userType === "insurer") return Shield;
  return Car;
}

export function getRoleAccent(userType: MarketUserType, isLight: boolean) {
  if (userType === "shop") {
    return isLight
      ? "bg-amber-50 text-amber-700 border-amber-300/60"
      : "bg-amber-400/15 text-amber-300 border-amber-400/30";
  }
  if (userType === "insurer") {
    return isLight
      ? "bg-emerald-50 text-emerald-700 border-emerald-300/60"
      : "bg-emerald-400/15 text-emerald-300 border-emerald-400/30";
  }
  return isLight
    ? "bg-blue-50 text-blue-700 border-blue-300/60"
    : "bg-blue-400/15 text-blue-200 border-blue-400/30";
}
