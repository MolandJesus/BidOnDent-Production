import {
  BriefcaseBusiness,
  Compass,
  Fuel,
  Globe,
  MapPinned,
  Navigation,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { cn } from "../../ui/utils";
import { formatApproximateDriveWindow } from "../mapRoutePresentation";
import { getMapSurfaceTheme } from "../mapSurfaceTheme";
import type {
  CoverageNearbyShop,
  CoverageSearchTarget,
  MapSurfaceTone,
} from "../serviceCoverageMapTypes";
import type {
  NavigationDiscoveryPlace,
  NavigationDiscoveryRole,
} from "../../../services/navigation/placeDiscovery";

type NavigationBrowseDiscoveryPanelProps = {
  tone: MapSurfaceTone;
  activeSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  selectedShopId?: string;
  discoveryRole: NavigationDiscoveryRole;
  defaultDiscoveryRole?: NavigationDiscoveryRole;
  selectedDiscoveryPlaceId?: string;
  selectedDiscoveryPlace: NavigationDiscoveryPlace | null;
  discoveryPlaces: NavigationDiscoveryPlace[];
  isLoadingDiscoveryPlaces: boolean;
  discoveryError: string;
  onDiscoveryRoleChange: (role: NavigationDiscoveryRole) => void;
  onSelectShop: (shop: CoverageNearbyShop) => void;
  onSelectDiscoveryPlace: (place: NavigationDiscoveryPlace) => void;
  onOpenDiscoveryPlaceDirections: (place: NavigationDiscoveryPlace) => void;
};

type GuideCard = {
  id: string;
  title: string;
  subtitle: string;
  detail: string;
  shop: CoverageNearbyShop;
  accentClassName: string;
};

const discoveryRoleOptions: Array<{
  id: NavigationDiscoveryRole;
  label: string;
  Icon: typeof ShieldCheck;
}> = [
  { id: "customer", label: "Customer", Icon: ShieldCheck },
  { id: "insurer", label: "Insurer", Icon: BriefcaseBusiness },
  { id: "shop", label: "Shop", Icon: Wrench },
];

function roleSummary(role: NavigationDiscoveryRole) {
  if (role === "insurer") {
    return "Real claim-area body shops and insurer-adjacent places.";
  }

  if (role === "shop") {
    return "Competitive shops, suppliers, and market support nearby.";
  }

  return "Real repair, rental, and fuel places around the active search area.";
}

function discoveryCategoryLabel(place: NavigationDiscoveryPlace) {
  if (place.category === "insurance") {
    return "Insurance";
  }

  if (place.category === "fuel") {
    return "Fuel";
  }

  if (place.category === "rental") {
    return "Rental";
  }

  if (place.category === "supplier") {
    return "Supplier";
  }

  return "Body shop";
}

function discoveryCategoryAccentClassName(place: NavigationDiscoveryPlace, tone: MapSurfaceTone) {
  if (place.category === "insurance") {
    return tone === "light" ? "bg-amber-100 text-amber-900" : "bg-amber-300/18 text-amber-100";
  }

  if (place.category === "fuel") {
    return tone === "light" ? "bg-teal-100 text-teal-900" : "bg-teal-300/18 text-teal-100";
  }

  if (place.category === "supplier") {
    return tone === "light" ? "bg-violet-100 text-violet-900" : "bg-violet-300/18 text-violet-100";
  }

  if (place.category === "rental") {
    return tone === "light" ? "bg-blue-100 text-blue-900" : "bg-blue-300/18 text-blue-100";
  }

  return tone === "light" ? "bg-slate-100 text-slate-900" : "bg-white/10 text-slate-100";
}

export default function NavigationBrowseDiscoveryPanel({
  tone,
  activeSearchTarget,
  nearbyShops,
  selectedShopId,
  discoveryRole,
  defaultDiscoveryRole,
  selectedDiscoveryPlaceId,
  selectedDiscoveryPlace,
  discoveryPlaces,
  isLoadingDiscoveryPlaces,
  discoveryError,
  onDiscoveryRoleChange,
  onSelectShop,
  onSelectDiscoveryPlace,
  onOpenDiscoveryPlaceDirections,
}: NavigationBrowseDiscoveryPanelProps) {
  const theme = getMapSurfaceTheme(tone, true);
  const closestShop = nearbyShops[0] || null;
  const topRatedShop =
    nearbyShops.slice().sort((left, right) => right.rating - left.rating)[0] || null;
  const specialtyShop =
    nearbyShops
      .slice()
      .sort((left, right) => right.specialties.length - left.specialties.length || right.rating - left.rating)[0] ||
    null;

  const guides: GuideCard[] = [
    closestShop
      ? {
          id: "closest",
          title: "Closest partner",
          subtitle: closestShop.name,
          detail: `${closestShop.distanceMiles.toFixed(1)} miles away`,
          shop: closestShop,
          accentClassName:
            tone === "light"
              ? "bg-[linear-gradient(180deg,#dbeafe,#eff6ff)] text-slate-950"
              : "bg-[linear-gradient(180deg,rgba(8,145,178,0.55),rgba(15,23,42,0.94))] text-white",
        }
      : null,
    topRatedShop
      ? {
          id: "top-rated",
          title: "Top rated nearby",
          subtitle: topRatedShop.name,
          detail: `Rated ${topRatedShop.rating.toFixed(1)}`,
          shop: topRatedShop,
          accentClassName:
            tone === "light"
              ? "bg-[linear-gradient(180deg,#fef3c7,#fff7ed)] text-slate-950"
              : "bg-[linear-gradient(180deg,rgba(250,204,21,0.32),rgba(15,23,42,0.94))] text-white",
        }
      : null,
    specialtyShop
      ? {
          id: "specialty",
          title: "BidOnDent specialty",
          subtitle: specialtyShop.name,
          detail:
            specialtyShop.specialties.length > 0
              ? specialtyShop.specialties.slice(0, 2).join(" • ")
              : "Broad service coverage",
          shop: specialtyShop,
          accentClassName:
            tone === "light"
              ? "bg-[linear-gradient(180deg,#dcfce7,#f0fdf4)] text-slate-950"
              : "bg-[linear-gradient(180deg,rgba(34,197,94,0.28),rgba(15,23,42,0.94))] text-white",
        }
      : null,
  ].filter((guide): guide is GuideCard => Boolean(guide));

  return (
    <div className={cn("space-y-4 rounded-[1.75rem] p-4", theme.panelStrongClassName)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className={theme.eyebrowClassName}>Explore Nearby</div>
          <div className={cn("mt-3 text-base font-semibold", theme.titleClassName)}>
            BidOnDent market browse
          </div>
          <div className={cn("mt-1 text-sm", theme.secondaryTextClassName)}>
            {activeSearchTarget
              ? `Live browse results around ${activeSearchTarget.label}`
              : "Search or use GPS to unlock nearby partner shops and real places."}
          </div>
        </div>
        {activeSearchTarget ? (
          <div className="flex flex-wrap gap-2">
            <span className={theme.softBadgeClassName}>{nearbyShops.length} partner shops</span>
            <span className={theme.softBadgeClassName}>{discoveryPlaces.length} live places</span>
          </div>
        ) : null}
      </div>

      <div className={cn("p-4", theme.panelClassName)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className={theme.metricLabelClassName}>Experience lens</div>
            <div className={cn("mt-2 text-sm", theme.secondaryTextClassName)}>
              {roleSummary(discoveryRole)}
            </div>
            {defaultDiscoveryRole && defaultDiscoveryRole === discoveryRole ? (
              <div className="mt-3">
                <span className={theme.softBadgeClassName}>
                  Synced to your {defaultDiscoveryRole} account
                </span>
              </div>
            ) : null}
          </div>
          <div className={theme.segmentedClassName}>
            {discoveryRoleOptions.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => onDiscoveryRoleChange(id)}
                className={
                  discoveryRole === id
                    ? theme.activeSegmentClassName
                    : theme.inactiveSegmentClassName
                }
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <div className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", theme.titleClassName)}>
          <Compass className="h-4 w-4" />
          BidOnDent partner shops
        </div>
        {nearbyShops.length === 0 ? (
          <div className={cn("p-4 text-sm", theme.panelClassName)}>
            Nearby partner shops will appear here once a ZIP or live GPS origin is active.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {nearbyShops.slice(0, 4).map((shop) => (
              <button
                key={shop.id || shop.name}
                type="button"
                onClick={() => onSelectShop(shop)}
                className={
                  selectedShopId === `${shop.id || shop.name}`
                    ? theme.selectedListCardClassName
                    : theme.listCardClassName
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-left">
                    <div className={cn("text-sm font-semibold", theme.titleClassName)}>{shop.name}</div>
                    <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                      {shop.distanceMiles.toFixed(1)} miles
                      {formatApproximateDriveWindow(shop.distanceMiles)
                        ? ` • ${formatApproximateDriveWindow(shop.distanceMiles)}`
                        : ""}
                    </div>
                  </div>
                  <MapPinned className="mt-1 h-4 w-4 shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", theme.titleClassName)}>
          <Globe className="h-4 w-4" />
          Real nearby places
        </div>
        {!activeSearchTarget ? (
          <div className={cn("p-4 text-sm", theme.panelClassName)}>
            Real market places appear after an active ZIP or live-location search exists.
          </div>
        ) : isLoadingDiscoveryPlaces ? (
          <div className={cn("p-4 text-sm", theme.panelClassName)}>
            Loading live nearby places for the current role lens...
          </div>
        ) : discoveryError ? (
          <div
            className={cn(
              "rounded-[1rem] border px-4 py-3 text-sm",
              tone === "light"
                ? "border-amber-200 bg-amber-50 text-amber-900"
                : "border-amber-300/20 bg-amber-500/10 text-amber-200"
            )}
          >
            {discoveryError}
          </div>
        ) : discoveryPlaces.length === 0 ? (
          <div className={cn("p-4 text-sm", theme.panelClassName)}>
            No live places were returned for this role lens in the current area.
          </div>
        ) : (
          <div className="space-y-3">
            {selectedDiscoveryPlace ? (
              <div className={cn("p-4", theme.accentPanelClassName)}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className={theme.metricLabelClassName}>Selected live place</div>
                    <div className={cn("mt-2 text-lg font-semibold", theme.titleClassName)}>
                      {selectedDiscoveryPlace.label}
                    </div>
                    <div className={cn("mt-2 text-sm leading-6", theme.secondaryTextClassName)}>
                      {selectedDiscoveryPlace.subtitle}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                      discoveryCategoryAccentClassName(selectedDiscoveryPlace, tone)
                    )}
                  >
                    {discoveryCategoryLabel(selectedDiscoveryPlace)}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={theme.softBadgeClassName}>
                    {selectedDiscoveryPlace.distanceMiles.toFixed(1)} miles away
                  </span>
                  <span className={theme.softBadgeClassName}>OpenStreetMap live data</span>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDiscoveryPlace(selectedDiscoveryPlace)}
                    className={theme.secondaryButtonClassName}
                  >
                    <MapPinned className="h-4 w-4" />
                    Preview on map
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDiscoveryPlaceDirections(selectedDiscoveryPlace)}
                    className={theme.primaryButtonClassName}
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Maps
                  </button>
                  {selectedDiscoveryPlace.website ? (
                    <a
                      href={selectedDiscoveryPlace.website}
                      target="_blank"
                      rel="noreferrer"
                      className={theme.secondaryButtonClassName}
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  ) : null}
                  {selectedDiscoveryPlace.phoneNumber ? (
                    <a
                      href={`tel:${selectedDiscoveryPlace.phoneNumber}`}
                      className={theme.secondaryButtonClassName}
                    >
                      <Fuel className="h-4 w-4" />
                      Call
                    </a>
                  ) : null}
                </div>
              </div>
            ) : null}

            {discoveryPlaces.slice(0, 6).map((place) => (
              <div
                key={place.id}
                className={
                  selectedDiscoveryPlaceId === place.id
                    ? theme.selectedListCardClassName
                    : theme.listCardClassName
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className={cn("truncate text-sm font-semibold", theme.titleClassName)}>
                        {place.label}
                      </div>
                      {selectedDiscoveryPlaceId === place.id ? (
                        <span className={theme.softBadgeClassName}>Selected</span>
                      ) : null}
                    </div>
                    <div className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                      {place.subtitle}
                    </div>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]",
                      discoveryCategoryAccentClassName(place, tone)
                    )}
                  >
                    {discoveryCategoryLabel(place)}
                  </span>
                </div>
                <div className={cn("mt-3 text-xs", theme.secondaryTextClassName)}>
                  {place.distanceMiles.toFixed(1)} miles away • OpenStreetMap live data
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectDiscoveryPlace(place)}
                    className={theme.secondaryButtonClassName}
                  >
                    <MapPinned className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenDiscoveryPlaceDirections(place)}
                    className={theme.primaryButtonClassName}
                  >
                    <Navigation className="h-4 w-4" />
                    Open in Maps
                  </button>
                  {place.website ? (
                    <a
                      href={place.website}
                      target="_blank"
                      rel="noreferrer"
                      className={theme.secondaryButtonClassName}
                    >
                      <Globe className="h-4 w-4" />
                      Website
                    </a>
                  ) : null}
                  {place.phoneNumber ? (
                    <a href={`tel:${place.phoneNumber}`} className={theme.secondaryButtonClassName}>
                      <Fuel className="h-4 w-4" />
                      Call
                    </a>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {guides.length > 0 ? (
        <div>
          <div className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", theme.titleClassName)}>
            <Sparkles className="h-4 w-4" />
            BidOnDent guides
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {guides.map((guide) => (
              <button
                key={guide.id}
                type="button"
                onClick={() => onSelectShop(guide.shop)}
                className={cn(
                  "overflow-hidden rounded-[1.7rem] border p-0 text-left shadow-[0_20px_44px_rgba(15,23,42,0.16)] transition hover:-translate-y-0.5",
                  tone === "light" ? "border-white/80" : "border-white/10"
                )}
              >
                <div className={cn("px-5 py-5", guide.accentClassName)}>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold uppercase tracking-[0.18em] opacity-70">
                        {guide.title}
                      </div>
                      <div className="mt-4 text-2xl font-semibold leading-tight tracking-[-0.03em]">
                        {guide.subtitle}
                      </div>
                      <div className="mt-2 text-sm opacity-80">{guide.detail}</div>
                    </div>
                    <Star className="h-5 w-5 shrink-0 opacity-80" />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
