import {
  BriefcaseBusiness,
  Compass,
  Globe,
  MapPinned,
  Navigation,
  ShieldCheck,
  Sparkles,
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
    <div className={cn("space-y-4 rounded-[1.85rem] p-4", theme.panelStrongClassName)}>
      <div>
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className={theme.eyebrowClassName}>Explore Nearby</div>
            <div className={cn("mt-2 text-sm font-semibold", theme.titleClassName)}>
              {activeSearchTarget
                ? `Live market view around ${activeSearchTarget.label}`
                : "Search or enable GPS to start exploring"}
            </div>
          </div>
          {activeSearchTarget ? (
            <div
              className={cn(
                "flex items-center gap-2 text-[10px] font-semibold",
                theme.secondaryTextClassName
              )}
            >
              <span>{nearbyShops.length} shops</span>
              <span className="opacity-40">·</span>
              <span>{discoveryPlaces.length} places</span>
            </div>
          ) : null}
        </div>
        <div className={cn("mt-1.5 text-sm", theme.secondaryTextClassName)}>
          {activeSearchTarget
            ? `Browsing around ${activeSearchTarget.label}`
            : "Search or enable GPS to discover nearby partner shops and places."}
        </div>
      </div>

      <div className={cn("space-y-2.5 p-3", theme.panelClassName)}>
        <div className="flex items-center justify-between gap-2">
          <div className={theme.metricLabelClassName}>Experience lens</div>
          {defaultDiscoveryRole && defaultDiscoveryRole === discoveryRole ? (
            <span className={theme.softBadgeClassName}>Synced to {defaultDiscoveryRole}</span>
          ) : null}
        </div>
        <div className={theme.segmentedClassName}>
          {discoveryRoleOptions.map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => onDiscoveryRoleChange(id)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-full px-2.5 py-2.5 min-h-[44px] text-xs font-semibold transition-all duration-200",
                discoveryRole === id ? theme.activeSegmentClassName : theme.inactiveSegmentClassName
              )}
            >
              <Icon className="h-3.5 w-3.5" />
              {label}
            </button>
          ))}
        </div>
        <div className={cn("text-xs leading-relaxed", theme.secondaryTextClassName)}>
          {roleSummary(discoveryRole)}
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
          <div className={cn("rounded-[1.15rem] border p-3.5 text-sm", theme.panelClassName)}>
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl",
                  tone === "light" ? "bg-sky-100 text-sky-600" : "bg-cyan-400/12 text-cyan-300"
                )}
              >
                <Compass className="h-4 w-4" />
              </div>
              <div>
                <div className={cn("text-sm font-semibold", theme.titleClassName)}>
                  Partner shops appear after search focus is set
                </div>
                <div className={cn("mt-1 text-xs leading-5", theme.secondaryTextClassName)}>
                  Start with a ZIP, address, or live GPS origin, then this area becomes a curated
                  set of BidOnDent partner options.
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={theme.softBadgeClassName}>ZIP or address</span>
                  <span className={theme.softBadgeClassName}>Live GPS</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-2">
            {nearbyShops.slice(0, 4).map((shop) => (
              <div
                key={shop.id || shop.name}
                className={
                  selectedShopId === `${shop.id || shop.name}`
                    ? theme.selectedListCardClassName
                    : theme.listCardClassName
                }
              >
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                      tone === "light" ? "bg-sky-100 text-sky-600" : "bg-cyan-400/12 text-cyan-300"
                    )}
                  >
                    <MapPinned className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className={cn("truncate text-sm font-semibold", theme.titleClassName)}>
                      {shop.name}
                    </div>
                    <div className={cn("text-xs", theme.secondaryTextClassName)}>
                      {shop.distanceMiles.toFixed(1)} mi
                      {formatApproximateDriveWindow(shop.distanceMiles)
                        ? ` · ${formatApproximateDriveWindow(shop.distanceMiles)}`
                        : ""}
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1.5">
                    <button
                      type="button"
                      onClick={() => onSelectShop(shop)}
                      className={cn(theme.compactIconButtonClassName)}
                      title="Preview on map"
                    >
                      <MapPinned className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenShopDirections(shop)}
                      className={cn(theme.compactIconButtonClassName)}
                      title="Start route"
                    >
                      <Navigation className="h-3.5 w-3.5" />
                    </button>
                  </div>
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
          <div className="grid gap-2">
            {guides.map((guide) => (
              <div
                key={guide.id}
                className={cn(
                  "overflow-hidden rounded-[1.35rem] border text-left shadow-[0_18px_40px_rgba(15,23,42,0.12)] transition hover:-translate-y-0.5",
                  tone === "light" ? "border-white/80" : "border-white/10"
                )}
              >
                <div className={cn("px-4 py-3", guide.accentClassName)}>
                  <div className="flex items-center gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] opacity-60">
                        {guide.title}
                      </div>
                      <div className="mt-1 truncate text-base font-semibold leading-tight tracking-[-0.02em]">
                        {guide.subtitle}
                      </div>
                      <div className="mt-0.5 text-xs opacity-75">{guide.detail}</div>
                    </div>
                    <div className="flex shrink-0 gap-1.5">
                      <button
                        type="button"
                        onClick={() => onSelectShop(guide.shop)}
                        className={cn(theme.compactIconButtonClassName)}
                        title="Preview on map"
                      >
                        <MapPinned className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onOpenShopDirections(guide.shop)}
                        className={cn(theme.compactIconButtonClassName)}
                        title="Start route"
                      >
                        <Navigation className="h-3.5 w-3.5" />
                      </button>
                    </div>
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
