import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";
import ServiceCoverageMap from "../maps/ServiceCoverageMap";
import CoverageNearestShops from "./CoverageNearestShops";
import { mapTileLayers } from "../maps/mapTileLayers";
import type {
  CoverageCountyMarker,
  CoverageNearbyShop,
  CoveragePartnerShop,
  CoverageSearchTarget,
  MapTileMode,
} from "../maps/serviceCoverageMapTypes";

type CoverageMapDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  center: [number, number];
  zoom: number;
  revision: number;
  tileMode: MapTileMode;
  counties: CoverageCountyMarker[];
  partnerShops: CoveragePartnerShop[];
  mapSearchTarget: CoverageSearchTarget | null;
  listSearchTarget: CoverageSearchTarget | null;
  nearbyShops: CoverageNearbyShop[];
  radiusMiles: string;
  radiusMeters: number;
  regionCount: number;
  isLoadingShops: boolean;
  onTileModeChange: (mode: MapTileMode) => void;
  onCenterActive: () => void;
  onResetView: () => void;
};

export default function CoverageMapDialog({
  open,
  onOpenChange,
  center,
  zoom,
  revision,
  tileMode,
  counties,
  partnerShops,
  mapSearchTarget,
  listSearchTarget,
  nearbyShops,
  radiusMiles,
  radiusMeters,
  regionCount,
  isLoadingShops,
  onTileModeChange,
  onCenterActive,
  onResetView,
}: CoverageMapDialogProps) {
  const viewModeLabel = mapTileLayers[tileMode].label;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(1320px,calc(100vw-2rem))] overflow-hidden border-slate-700 bg-slate-950 p-0 text-white sm:max-w-[min(1320px,calc(100vw-2rem))] [&>button]:text-white">
        <DialogHeader className="border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(34,211,238,0.16),_transparent_48%)] px-6 py-5 text-left">
          <DialogTitle className="text-2xl font-semibold text-white">
            Coverage command center
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-300">
            Inspect live partner coverage in roadmap or satellite mode, center on your active
            search, and review nearby shops without leaving the page.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-0 xl:grid-cols-[minmax(0,1fr)_360px]">
          <div className="p-4 sm:p-6">
            <ServiceCoverageMap
              center={center}
              zoom={zoom}
              revision={revision}
              tileMode={tileMode}
              counties={counties}
              partnerShops={partnerShops}
              activeSearchTarget={mapSearchTarget}
              radiusMeters={radiusMeters}
              radiusMiles={radiusMiles}
              regionCount={regionCount}
              mapHeightClassName="h-[70vh] min-h-[540px]"
              immersiveFullscreen
              onTileModeChange={onTileModeChange}
              onCenterActive={onCenterActive}
              onResetView={onResetView}
            />
          </div>

          <aside className="border-t border-white/10 bg-slate-900/80 p-4 sm:p-6 xl:border-t-0 xl:border-l">
            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">View Mode</div>
                <div className="mt-2 text-xl font-semibold text-white">{viewModeLabel}</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Coverage Grid
                </div>
                <div className="mt-2 text-xl font-semibold text-white">{regionCount} regions</div>
              </div>
              <div className="rounded-2xl border border-slate-700 bg-slate-950/80 p-4">
                <div className="text-xs uppercase tracking-[0.24em] text-slate-400">
                  Partner Markers
                </div>
                <div className="mt-2 text-xl font-semibold text-white">
                  {partnerShops.length} live shops
                </div>
              </div>
            </div>

            <CoverageNearestShops
              className="mt-4 rounded-2xl border border-slate-700 bg-slate-950/80 p-4"
              isLoadingShops={isLoadingShops}
              activeSearchTarget={listSearchTarget}
              nearbyShops={nearbyShops}
              radiusMiles={radiusMiles}
            />
          </aside>
        </div>
      </DialogContent>
    </Dialog>
  );
}
