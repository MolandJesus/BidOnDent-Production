import {
  BriefcaseBusiness,
  Compass,
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
import NavigationDiscoveryPlacesList from "./NavigationDiscoveryPlacesList";

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
  onOpenShopDirections: (shop: CoverageNearbyShop) => void;
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
  onOpenShopDirections,
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
      .sort(
        (left, right) =>
          right.specialties.length - left.specialties.length || right.rating - left.rating
      )[0] || null;

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
          <div className={cn("flex flex-wrap gap-3 text-xs font-medium", theme.secondaryTextClassName)}>
            <span>{nearbyShops.length} partner shops</span>
            <span>{discoveryPlaces.length} live places</span>
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
        <div
          className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", theme.titleClassName)}
        >
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
              <div
                key={shop.id || shop.name}
                className={
                  selectedShopId === `${shop.id || shop.name}`
                    ? theme.selectedListCardClassName
                    : theme.listCardClassName
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="text-left">
                    <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                      {shop.name}
                    </div>
                    <div className={cn("mt-1 text-xs", theme.secondaryTextClassName)}>
                      {shop.distanceMiles.toFixed(1)} miles
                      {formatApproximateDriveWindow(shop.distanceMiles)
                        ? ` • ${formatApproximateDriveWindow(shop.distanceMiles)}`
                        : ""}
                    </div>
                  </div>
                  <MapPinned className="mt-1 h-4 w-4 shrink-0" />
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectShop(shop)}
                    className={theme.secondaryButtonClassName}
                  >
                    <MapPinned className="h-4 w-4" />
                    Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => onOpenShopDirections(shop)}
                    className={theme.primaryButtonClassName}
                  >
                    <Navigation className="h-4 w-4" />
                    Directions
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <div
          className={cn("mb-3 flex items-center gap-2 text-sm font-semibold", theme.titleClassName)}
        >
          <Globe className="h-4 w-4" />
          Real nearby places
        </div>
        <NavigationDiscoveryPlacesList
          tone={tone}
          theme={theme}
          activeSearchTarget={activeSearchTarget}
          selectedDiscoveryPlaceId={selectedDiscoveryPlaceId}
          selectedDiscoveryPlace={selectedDiscoveryPlace}
          discoveryPlaces={discoveryPlaces}
          isLoadingDiscoveryPlaces={isLoadingDiscoveryPlaces}
          discoveryError={discoveryError}
          onSelectDiscoveryPlace={onSelectDiscoveryPlace}
          onOpenDiscoveryPlaceDirections={onOpenDiscoveryPlaceDirections}
        />
      </div>

      {guides.length > 0 ? (
        <div>
          <div
            className={cn(
              "mb-3 flex items-center gap-2 text-sm font-semibold",
              theme.titleClassName
            )}
          >
            <Sparkles className="h-4 w-4" />
            BidOnDent guides
          </div>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-1">
            {guides.map((guide) => (
              <div
                key={guide.id}
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

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => onSelectShop(guide.shop)}
                      className={theme.secondaryButtonClassName}
                    >
                      <MapPinned className="h-4 w-4" />
                      Preview
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenShopDirections(guide.shop)}
                      className={theme.primaryButtonClassName}
                    >
                      <Navigation className="h-4 w-4" />
                      Directions
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
