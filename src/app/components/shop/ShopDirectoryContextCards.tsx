import { Building2, FileText, Shield } from "lucide-react";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export interface ShopDirectoryContextCardsProps {
  userInfo?: { name?: string; email?: string };
  userType: MarketUserType;
  connectedCarrierNames: string[];
  reportCount: number;
  appearanceMode?: DashboardAppearanceMode;
}

export default function ShopDirectoryContextCards({
  userInfo,
  userType,
  connectedCarrierNames,
  reportCount,
  appearanceMode = "map-dark",
}: ShopDirectoryContextCardsProps) {
  const isLight = appearanceMode === "light";
  const cardClass = isLight
    ? "bg-white/80 border border-slate-200/60 shadow-sm rounded-2xl p-5"
    : "bd-glass-card p-5";
  const labelClass = `flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] ${
    isLight ? "text-blue-600/70" : "text-blue-200/50"
  }`;
  const headingClass = `mt-3 text-lg font-semibold ${
    isLight ? "text-slate-900" : "text-slate-100"
  }`;
  const bodyClass = `mt-2 text-sm leading-6 ${isLight ? "text-slate-600" : "text-slate-300/80"}`;
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <div className={cardClass}>
        <div className={labelClass}>
          <Building2 className="h-4 w-4" />
          Signed-in context
        </div>
        <p className={headingClass}>
          {userInfo?.name?.split(" ")[0] || "This user"} is browsing as a {userType} account
        </p>
        <p className={bodyClass}>
          Account preferences, insurer connections, and repair history are being used to personalize
          shop rankings and routing recommendations.
        </p>
      </div>

      <div className={cardClass}>
        <div className={labelClass}>
          <Shield className="h-4 w-4" />
          Carrier influence
        </div>
        <p className={headingClass}>
          {connectedCarrierNames.length > 0
            ? `${connectedCarrierNames.length} carrier preference${connectedCarrierNames.length > 1 ? "s" : ""} are active`
            : "No insurer preferences are active yet"}
        </p>
        <p className={bodyClass}>
          {connectedCarrierNames.length > 0
            ? `Connected carriers currently shaping the ranking: ${connectedCarrierNames.join(", ")}.`
            : "Connect an insurer to see compatibility-aware ranking shifts across shops and claims routing."}
        </p>
      </div>

      <div className={cardClass}>
        <div className={labelClass}>
          <FileText className="h-4 w-4" />
          Repair signals
        </div>
        <p className={headingClass}>
          {reportCount > 0
            ? `${reportCount} report${reportCount > 1 ? "s" : ""} are contributing context`
            : "No report context has been added yet"}
        </p>
        <p className={bodyClass}>
          {reportCount > 0
            ? "Damage areas, descriptions, and linked vehicle information are already feeding the recommendation stack."
            : "The map is ready now, and it will become more precise as claims and vehicle history grow."}
        </p>
      </div>
    </section>
  );
}
