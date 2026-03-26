import { Building2, FileText, Shield } from "lucide-react";
import type { MarketUserType } from "../../services/intelligence/marketIntelligence";

export interface ShopDirectoryContextCardsProps {
  userInfo?: { name?: string; email?: string };
  userType: MarketUserType;
  connectedCarrierNames: string[];
  reportCount: number;
}

export default function ShopDirectoryContextCards({
  userInfo,
  userType,
  connectedCarrierNames,
  reportCount,
}: ShopDirectoryContextCardsProps) {
  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <div className="bd-glass-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
          <Building2 className="h-4 w-4" />
          Signed-in context
        </div>
        <p className="mt-3 text-lg font-semibold text-slate-100">
          {userInfo?.name?.split(" ")[0] || "This user"} is browsing as a {userType} account
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300/80">
          The map is reading persisted website identity memory, insurer connections, and repair
          context instead of relying on a single auth-provider model.
        </p>
      </div>

      <div className="bd-glass-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
          <Shield className="h-4 w-4" />
          Carrier influence
        </div>
        <p className="mt-3 text-lg font-semibold text-slate-100">
          {connectedCarrierNames.length > 0
            ? `${connectedCarrierNames.length} carrier preference${connectedCarrierNames.length > 1 ? "s" : ""} are active`
            : "No insurer preferences are active yet"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300/80">
          {connectedCarrierNames.length > 0
            ? `Connected carriers currently shaping the ranking: ${connectedCarrierNames.join(", ")}.`
            : "Connect an insurer to see compatibility-aware ranking shifts across shops and claims routing."}
        </p>
      </div>

      <div className="bd-glass-card p-5">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-blue-200/50">
          <FileText className="h-4 w-4" />
          Repair signals
        </div>
        <p className="mt-3 text-lg font-semibold text-slate-100">
          {reportCount > 0
            ? `${reportCount} report${reportCount > 1 ? "s" : ""} are contributing context`
            : "No report context has been added yet"}
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-300/80">
          {reportCount > 0
            ? "Damage areas, descriptions, and linked vehicle information are already feeding the recommendation stack."
            : "The map is ready now, and it will become more precise as claims and vehicle history grow."}
        </p>
      </div>
    </section>
  );
}
