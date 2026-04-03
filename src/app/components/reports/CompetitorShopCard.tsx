import {
  Award,
  Bookmark,
  CheckCircle,
  Clock,
  DollarSign,
  MapPin,
  Star,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";

type CompetitorShop = {
  id: number;
  name: string;
  rating: number;
  reviews: number;
  topPick: boolean;
  watched: boolean;
  trending: "up" | "down" | "stable";
  monthlyJobs: number;
  averagePriceLabel: string;
  averageRepairTime: string;
  location: string;
  mapDistanceLabel: string;
  specialties: string[];
  certifications: string[];
};

type CompetitorShopCardProps = {
  shop: CompetitorShop;
  index: number;
  isLight: boolean;
  isFocused: boolean;
  primaryColor: string;
  onToggleWatch: (shopId: number) => void;
  onOpenMap?: () => void;
};

export default function CompetitorShopCard({
  shop,
  index,
  isLight,
  isFocused,
  primaryColor,
  onToggleWatch,
  onOpenMap,
}: CompetitorShopCardProps) {
  return (
    <article
      className={`bd-glass-card overflow-hidden rounded-[26px] transition-shadow hover:shadow-md${
        isFocused ? " ring-2 ring-blue-400/60 shadow-lg" : ""
      }${isLight ? " bd-light-surface" : ""}`}
    >
      <div className={`border-b p-4 ${isLight ? "border-slate-200/60" : "border-white/[0.08]"}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
              <h3 className={`font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                {shop.name}
              </h3>
              {shop.topPick && <CheckCircle className="h-4 w-4 text-blue-500" />}
              {shop.watched && (
                <span className="rounded-full bg-blue-500/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-blue-400">
                  Watched
                </span>
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{shop.rating}</span>
                <span className="text-sm text-slate-400">({shop.reviews})</span>
              </div>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-400">{shop.mapDistanceLabel}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {shop.trending === "up" && (
              <>
                <TrendingUp className="h-5 w-5 text-blue-500" />
                <span className="text-xs font-medium text-blue-600">Rising</span>
              </>
            )}
            {shop.trending === "down" && (
              <>
                <TrendingDown className="h-5 w-5 text-rose-500" />
                <span className="text-xs font-medium text-rose-600">Cooling</span>
              </>
            )}
            {shop.trending === "stable" && (
              <span className="text-xs font-medium text-slate-500">Stable</span>
            )}
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Wrench className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Est. Monthly Jobs</p>
              <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                ~{shop.monthlyJobs}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Avg Cost</p>
              <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                {shop.averagePriceLabel}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Est. Avg Time</p>
              <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                ~{shop.averageRepairTime}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400" />
            <div>
              <p className="text-xs text-slate-500">Location</p>
              <p className={`text-sm font-medium ${isLight ? "text-slate-900" : "text-slate-100"}`}>
                {shop.location}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-3">
          <p className="mb-2 text-xs font-medium uppercase text-slate-500">Specialties</p>
          <div className="flex flex-wrap gap-2">
            {shop.specialties.map((specialty) => (
              <span
                key={specialty}
                className="rounded bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-medium uppercase text-slate-500">Certifications</p>
          <div className="flex flex-wrap gap-2">
            {shop.certifications.map((certification) => (
              <span
                key={certification}
                className="flex items-center gap-1 rounded bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700"
              >
                <Award className="h-3 w-3" />
                {certification}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onToggleWatch(shop.id)}
            className={`inline-flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-medium transition-colors ${
              shop.watched
                ? "border border-blue-400/20 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20"
                : isLight
                  ? "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  : "border border-white/[0.10] bg-white/[0.06] text-slate-300 hover:bg-white/[0.10]"
            }`}
          >
            <Bookmark className="h-4 w-4" />
            {shop.watched ? "Remove From Watchlist" : "Watch Competitor"}
          </button>
          {onOpenMap && (
            <button
              onClick={onOpenMap}
              className="rounded-2xl px-4 py-3 text-sm font-medium text-white"
              style={{ backgroundColor: primaryColor }}
            >
              Review In Map
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
