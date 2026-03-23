import { Award, CheckCircle, Compass, Mail, MapPin, Phone, Shield, TrendingUp } from "lucide-react";
import { toggleRoleCollectionShopId } from "../../services/intelligence/shopMapExperience";

type MappedPartnerShop = {
  id: number;
  name: string;
  image: string;
  rating: number;
  reviews: number;
  specialties: string[];
  certifications: string[];
  averagePriceValue: number;
  insuranceCompatibilityScore: number;
  mapDistanceLabel: string;
  mapResult: {
    address: string;
    city: string;
    state: string;
    zipCode: string;
    coordinates: { latitude: number; longitude: number };
  };
  activeJobs: number;
  avgCompletionDays: number;
  certified: boolean;
  completedJobs: number;
  email: string;
  phone: string;
  shortlisted: boolean;
  status: string;
};

type InsurerPartnerShopCardProps = {
  entry: MappedPartnerShop;
  primaryColor: string;
  onDirections: (entry: MappedPartnerShop) => void;
  onToggleShortlist: (updater: (ids: number[]) => number[]) => void;
};

export type { MappedPartnerShop };

export default function InsurerPartnerShopCard({
  entry,
  primaryColor,
  onDirections,
  onToggleShortlist,
}: InsurerPartnerShopCardProps) {
  const statusColorMap: Record<string, string> = {
    active: "border-green-200 bg-green-50 text-green-700",
    pending: "border-yellow-200 bg-yellow-50 text-yellow-700",
    inactive: "border-slate-200 bg-slate-50 text-slate-600",
  };
  const statusColor = statusColorMap[entry.status] || statusColorMap.inactive;

  return (
    <article className="overflow-hidden rounded-[26px] border border-slate-200 bg-white shadow-sm">
      <div className="relative h-44 w-full overflow-hidden bg-slate-100">
        <img
          src={entry.image}
          alt={entry.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.35))]" />
        <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 backdrop-blur-sm">
          {entry.mapDistanceLabel} away
        </div>
      </div>

      <div className="border-b border-slate-100 p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className="text-lg font-bold text-slate-950">{entry.name}</h3>
              {entry.certified && (
                <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                  <CheckCircle className="h-3 w-3" />
                  Certified
                </span>
              )}
              <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusColor}`}>
                {entry.status.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center text-sm text-slate-600">
              <span className="mr-1 text-yellow-500">★</span>
              <span className="font-medium">{entry.rating}</span>
              <span className="mx-1">•</span>
              <span>{entry.reviews} reviews</span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-950 px-3 py-2 text-center text-white">
            <p className="text-[11px] uppercase tracking-[0.16em] text-white/65">Carrier Fit</p>
            <p className="text-lg font-semibold">{entry.insuranceCompatibilityScore}%</p>
          </div>
        </div>

        <div className="space-y-1 text-sm">
          <div className="flex items-center text-slate-700">
            <MapPin className="mr-2 h-4 w-4 text-slate-400" />
            <span>
              {entry.mapResult.address}, {entry.mapResult.city}, {entry.mapResult.state}{" "}
              <div className="ml-6 flex items-center text-slate-600">Best route context ready</div>
            </span>
          </div>
          <div className="ml-6 flex items-center text-slate-600">{entry.mapDistanceLabel} away</div>
        </div>
      </div>

      <div className="bg-slate-50 p-4">
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-slate-500">Pipeline State</p>
            <p className="text-sm font-medium text-slate-900">
              {entry.shortlisted ? "Shortlisted partner" : "Evaluation candidate"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Completed Jobs</p>
            <p className="text-sm font-medium text-slate-900">{entry.completedJobs}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Active Jobs</p>
            <p className="text-sm font-medium" style={{ color: primaryColor }}>
              {entry.activeJobs}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Avg Completion</p>
            <p className="text-sm font-medium text-slate-900">{entry.avgCompletionDays} days</p>
          </div>
        </div>

        <div className="mb-3 rounded-2xl border border-slate-200 bg-white p-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-slate-500">Average Cost</p>
              <p className="text-lg font-bold" style={{ color: primaryColor }}>
                ${entry.averagePriceValue.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500">Network Trend</p>
              <div className="flex items-center gap-1 text-green-600">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">
                  +{Math.max(1, Math.round(entry.rating - 3.9))}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {entry.specialties.map((specialty) => (
            <span key={specialty} className="rounded bg-blue-50 px-2 py-1 text-xs text-blue-700">
              {specialty}
            </span>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {entry.certifications.map((certification) => (
            <span
              key={certification}
              className="flex items-center gap-1 rounded bg-green-50 px-2 py-1 text-xs text-green-700"
            >
              <Award className="h-3 w-3" />
              {certification}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <a
            href={`tel:${entry.phone}`}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium bd-glass-control--utility"
          >
            <Phone className="h-4 w-4" />
            <span className="text-xs">Call</span>
          </a>
          <a
            href={`mailto:${entry.email}`}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium bd-glass-control--utility"
          >
            <Mail className="h-4 w-4" />
            <span className="text-xs">Email</span>
          </a>
          <button
            type="button"
            onClick={() => onDirections(entry)}
            className="flex flex-col items-center justify-center gap-1 rounded-2xl px-3 py-2 text-sm font-medium bd-glass-control--utility"
          >
            <Compass className="h-4 w-4" />
            <span className="text-xs">Directions</span>
          </button>
          <button
            onClick={() =>
              onToggleShortlist((currentIds) => toggleRoleCollectionShopId(currentIds, entry.id))
            }
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2 text-sm font-medium ${
              entry.shortlisted
                ? "border-green-200 bg-green-50 text-green-700"
                : "bd-glass-control--utility"
            }`}
          >
            <Shield className="h-4 w-4" />
            <span className="text-xs">{entry.shortlisted ? "Shortlisted" : "Shortlist"}</span>
          </button>
        </div>
      </div>
    </article>
  );
}
