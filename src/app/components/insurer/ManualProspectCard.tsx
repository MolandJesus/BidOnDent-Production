import { Compass, Mail, MapPin, Phone } from "lucide-react";
import type { CustomProspect } from "./insurerPartnerShopsUtils";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type ManualProspectCardProps = {
  prospect: CustomProspect;
  onDirections: (prospect: CustomProspect) => void;
  appearanceMode?: DashboardAppearanceMode;
};

export default function ManualProspectCard({
  prospect,
  onDirections,
  appearanceMode = "map-dark",
}: ManualProspectCardProps) {
  const isLight = appearanceMode === "light";
  return (
    <article className={`overflow-hidden bd-glass-card${isLight ? " bd-light-surface" : ""}`}>
      <div className={`border-b p-4 ${isLight ? "border-slate-200/60" : "border-blue-200/30"}`}>
        <div className="flex items-center gap-2">
          <h3 className={`text-lg font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
            {prospect.name}
          </h3>
          <span className="rounded-full border border-amber-400/30 bg-amber-400/15 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-300">
            Manual lead
          </span>
        </div>
        <div
          className={`mt-2 flex items-center gap-2 text-sm ${isLight ? "text-slate-600" : "text-slate-300/70"}`}
        >
          <MapPin className={`h-4 w-4 ${isLight ? "text-slate-400" : "text-blue-200/50"}`} />
          {prospect.address}, {prospect.city}, {prospect.state} {prospect.zip}
        </div>
      </div>

      <div className="space-y-3 p-4">
        <div className="grid gap-3 sm:grid-cols-3">
          <a
            href={`tel:${prospect.phone}`}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors bd-glass-control--utility"
          >
            <Phone className="h-4 w-4" />
            {prospect.phone}
          </a>
          <a
            href={`mailto:${prospect.email}`}
            className="inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors bd-glass-control--utility"
          >
            <Mail className="h-4 w-4" />
            {prospect.email}
          </a>
          <button
            type="button"
            onClick={() => onDirections(prospect)}
            className="inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors bd-glass-control--utility"
          >
            <Compass className="h-4 w-4" />
            Export Directions
          </button>
        </div>

        {prospect.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prospect.specialties.map((specialty) => (
              <span
                key={specialty}
                className="rounded-full bg-blue-400/15 px-2.5 py-1 text-xs font-medium text-blue-200"
                style={{ boxShadow: "0 0 8px rgba(59, 130, 246, 0.06)" }}
              >
                {specialty}
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
