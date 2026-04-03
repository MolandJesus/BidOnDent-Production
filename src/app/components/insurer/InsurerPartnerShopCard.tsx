import { Award, CheckCircle, Compass, Mail, MapPin, Phone, Shield, TrendingUp } from "lucide-react";
import { toggleRoleCollectionShopId } from "../../services/intelligence/shopMapExperience";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

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
  appearanceMode?: DashboardAppearanceMode;
  focused?: boolean;
};

export type { MappedPartnerShop };

export default function InsurerPartnerShopCard({
  entry,
  primaryColor,
  onDirections,
  onToggleShortlist,
  appearanceMode = "map-dark",
  focused,
}: InsurerPartnerShopCardProps) {
  const isLight = appearanceMode === "light";
  const statusColorMap: Record<string, string> = {
    active: "border-green-400/30 bg-green-400/10 text-green-300",
    pending: "border-yellow-400/30 bg-yellow-400/10 text-yellow-300",
    inactive: "border-white/[0.12] bg-white/[0.05] text-slate-400",
  };
  const statusColor = statusColorMap[entry.status] || statusColorMap.inactive;

  return (
    <article
      className={`overflow-hidden rounded-[26px] bd-glass-card transition-shadow${focused ? " ring-2 ring-blue-400/60 shadow-lg" : ""}${isLight ? " bd-light-surface" : ""}`}
    >
      <div className="relative h-44 w-full overflow-hidden bg-white/[0.08]">
        <img
          src={entry.image}
          alt={entry.name}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.35))]" />
        <div className="absolute bottom-3 right-3 rounded-full border border-white/20 bg-black/50 px-3 py-1 text-xs font-semibold text-slate-100 backdrop-blur-sm">
          {entry.mapDistanceLabel} away
        </div>
      </div>

      <div className="border-b border-white/[0.08] p-4">
        <div className="mb-2 flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h3 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                {entry.name}
              </h3>
              {entry.certified && (
                <span className="flex items-center gap-1 rounded-full border border-green-400/30 bg-green-400/10 px-2 py-0.5 text-xs font-medium text-green-300">
                  <CheckCircle className="h-3 w-3" />
                  Certified
                </span>
              )}
              <span className={`rounded-full border px-2 py-1 text-xs font-medium ${statusColor}`}>
                {entry.status.toUpperCase()}
              </span>
            </div>
            <div
              className={`flex items-center text-sm ${isLight ? "text-slate-500" : "text-slate-300/70"}`}
            >
              <span className="mr-1 text-amber-400">★</span>
              <span className={`font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}>
                {entry.rating}
              </span>
              <span className="mx-1">•</span>
              <span>{entry.reviews} reviews</span>
            </div>
          </div>

          {entry.insuranceCompatibilityScore > 0 && (
            <div
              className={`rounded-2xl border px-3 py-2 text-center ${
                isLight ? "border-blue-400/40 bg-blue-50" : "border-blue-400/30 bg-blue-500/20"
              }`}
            >
              <p
                className={`text-[11px] uppercase tracking-[0.16em] ${isLight ? "text-blue-500" : "text-blue-200/60"}`}
              >
                Carrier Fit
              </p>
              <p
                className={`text-lg font-semibold ${isLight ? "text-blue-700" : "text-slate-100"}`}
              >
                {entry.insuranceCompatibilityScore}%
              </p>
            </div>
          )}
        </div>

        <div className={`space-y-1 text-sm ${isLight ? "text-slate-600" : "text-slate-300/70"}`}>
          <div className="flex items-center">
            <MapPin className={`mr-2 h-4 w-4 ${isLight ? "text-slate-400" : "text-blue-200/50"}`} />
            <span>
              {entry.mapResult.address}, {entry.mapResult.city}, {entry.mapResult.state}{" "}
              <div
                className={`ml-6 flex items-center ${isLight ? "text-slate-400" : "text-slate-400/70"}`}
              >
                Best route context ready
              </div>
            </span>
          </div>
          <div
            className={`ml-6 flex items-center ${isLight ? "text-slate-400" : "text-slate-400/70"}`}
          >
            {entry.mapDistanceLabel} away
          </div>
        </div>
      </div>

      <div className={`p-4 ${isLight ? "bg-slate-50/80" : "bg-white/[0.03]"}`}>
        <div className="mb-3 grid grid-cols-2 gap-3">
          <div>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/50"}`}>
              Pipeline State
            </p>
            <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              {entry.shortlisted ? "Shortlisted partner" : "Evaluation candidate"}
            </p>
          </div>
          <div>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/50"}`}>
              Completed Jobs
            </p>
            <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              {entry.completedJobs}
            </p>
          </div>
          <div>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/50"}`}>
              Active Jobs
            </p>
            <p className="text-sm font-medium" style={{ color: primaryColor }}>
              {entry.activeJobs}
            </p>
          </div>
          <div>
            <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/50"}`}>
              Avg Completion
            </p>
            <p className={`text-sm font-medium ${isLight ? "text-slate-800" : "text-slate-100"}`}>
              {entry.avgCompletionDays} days
            </p>
          </div>
        </div>

        <div className={`mb-3 rounded-2xl bd-glass-card p-3${isLight ? " bd-light-surface" : ""}`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/50"}`}>
                Average Cost
              </p>
              <p className="text-lg font-bold" style={{ color: primaryColor }}>
                ${entry.averagePriceValue.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className={`text-xs ${isLight ? "text-slate-500" : "text-blue-200/50"}`}>
                Network Trend
              </p>
              <div className="flex items-center gap-1 text-green-400">
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
            <span
              key={specialty}
              className="rounded bg-blue-400/15 px-2 py-1 text-xs text-blue-200"
            >
              {specialty}
            </span>
          ))}
        </div>

        <div className="mb-3 flex flex-wrap gap-1">
          {entry.certifications.map((certification) => (
            <span
              key={certification}
              className="flex items-center gap-1 rounded bg-green-400/15 px-2 py-1 text-xs text-green-300"
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
            <span className="text-center text-xs">BidOnDent Maps</span>
          </button>
          <button
            onClick={() =>
              onToggleShortlist((currentIds) => toggleRoleCollectionShopId(currentIds, entry.id))
            }
            className={`flex flex-col items-center justify-center gap-1 rounded-2xl border px-3 py-2 text-sm font-medium ${
              entry.shortlisted
                ? "border-green-400/30 bg-green-400/10 text-green-300"
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
