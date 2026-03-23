import { Compass, Mail, MapPin, Phone } from "lucide-react";
import type { CustomProspect } from "./insurerPartnerShopsUtils";

type ManualProspectCardProps = {
  prospect: CustomProspect;
  onDirections: (prospect: CustomProspect) => void;
};

export default function ManualProspectCard({ prospect, onDirections }: ManualProspectCardProps) {
  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-slate-950">{prospect.name}</h3>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-amber-700">
            Manual lead
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-sm text-slate-600">
          <MapPin className="h-4 w-4 text-slate-400" />
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
            Directions
          </button>
        </div>

        {prospect.specialties.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {prospect.specialties.map((specialty) => (
              <span
                key={specialty}
                className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
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
