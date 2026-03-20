import type { CoverageNearbyShop, CoverageSearchTarget } from "../maps/serviceCoverageMapTypes";

type CoverageNearestShopsProps = {
  isLoadingShops: boolean;
  activeSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  radiusMiles: string;
  className?: string;
};

export default function CoverageNearestShops({
  isLoadingShops,
  activeSearchTarget,
  nearbyShops,
  radiusMiles,
  className,
}: CoverageNearestShopsProps) {
  return (
    <div className={className || "rounded-xl border border-slate-700 bg-slate-900/60 p-4"}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h5 className="font-semibold text-slate-100">Nearest Partner Shops</h5>
          <p className="mt-1 text-sm text-slate-300">
            {activeSearchTarget
              ? `Live routing from ${activeSearchTarget.label}`
              : "Enter a 5-digit ZIP code or use your live location to view the closest shops."}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {activeSearchTarget ? (
            <span className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-3 py-1 text-xs font-medium text-cyan-100">
              {radiusMiles}-mile search window
            </span>
          ) : null}
          {isLoadingShops ? (
            <span className="text-xs text-slate-400">Loading live partner data...</span>
          ) : null}
        </div>
      </div>

      {!activeSearchTarget ? (
        <p className="mt-4 text-sm text-slate-300">
          Start with a New York ZIP code or your current location to preview nearby partner
          capacity.
        </p>
      ) : nearbyShops.length === 0 ? (
        <p className="mt-4 text-sm text-amber-300">
          No partner shops were found within {radiusMiles} miles. Expand the search radius or route
          the request for manual partner assignment.
        </p>
      ) : (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {nearbyShops.map((shop) => (
            <div
              key={shop.id || shop.name}
              className="rounded-xl border border-slate-700 bg-slate-800/70 p-4"
            >
              <div className="text-sm font-semibold text-slate-100">{shop.name}</div>
              <div className="mt-1 text-xs text-slate-300">
                {shop.distanceMiles.toFixed(1)} miles away
                {shop.label ? ` • ${shop.label}` : ""}
              </div>
              <div className="mt-1 text-xs text-cyan-200">{shop.countyLabel}</div>
              {shop.specialties.length > 0 ? (
                <div className="mt-2 text-xs text-slate-300">
                  {shop.specialties.slice(0, 3).join(" • ")}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
