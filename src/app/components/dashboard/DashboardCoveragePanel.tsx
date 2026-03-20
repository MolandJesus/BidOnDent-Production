import { ArrowUpRight, Globe, MapPinned, Radar } from "lucide-react";
import { useState } from "react";

import CoverageMapDialog from "../landing/CoverageMapDialog";
import { countyCenters, defaultCoverageCenter, operatingRegions } from "../landing/coverageData";
import { mapTileLayers } from "../maps/mapTileLayers";
import type { MapTileMode } from "../maps/serviceCoverageMapTypes";
import { useCoveragePartnerShops } from "../../hooks/useCoveragePartnerShops";

type DashboardCoveragePanelProps = {
  primaryColor: string;
  secondaryColor: string;
  onOpenCoveragePage?: () => void;
};

export default function DashboardCoveragePanel({
  primaryColor,
  secondaryColor,
  onOpenCoveragePage,
}: DashboardCoveragePanelProps) {
  const { partnerShops, isLoadingShops } = useCoveragePartnerShops();
  const [isMapExpanded, setIsMapExpanded] = useState(false);
  const [tileMode, setTileMode] = useState<MapTileMode>("roadmap");
  const [mapRevision, setMapRevision] = useState(0);

  return (
    <>
      <section className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-blue-700">
              <Radar className="w-3.5 h-3.5" />
              Coverage
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-slate-900">Coverage command center</h2>
            <p className="mt-2 text-sm text-slate-600">
              Open the live NY coverage map from the dashboard, review partner density, and jump to
              the full search flow when you need ZIP and radius lookup.
            </p>
          </div>

          <div
            className="hidden sm:flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-sm"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <MapPinned className="w-6 h-6" />
          </div>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">Live Regions</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {operatingRegions.length}
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Partner Markers
            </div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">{partnerShops.length}</div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="text-xs uppercase tracking-[0.24em] text-slate-500">View Mode</div>
            <div className="mt-2 text-2xl font-semibold text-slate-900">
              {mapTileLayers[tileMode].label}
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {operatingRegions.slice(0, 4).map((region) => (
            <span
              key={region}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm text-slate-700"
            >
              {region}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setIsMapExpanded(true)}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:shadow-md"
            style={{
              background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)`,
            }}
          >
            <Globe className="w-4 h-4" />
            Open Coverage Map
          </button>

          {onOpenCoveragePage ? (
            <button
              type="button"
              onClick={onOpenCoveragePage}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Full Search Flow
              <ArrowUpRight className="w-4 h-4" />
            </button>
          ) : null}
        </div>

        {isLoadingShops ? (
          <p className="mt-3 text-xs text-slate-500">
            Syncing live partner shop markers for the command center...
          </p>
        ) : null}
      </section>

      <CoverageMapDialog
        open={isMapExpanded}
        onOpenChange={setIsMapExpanded}
        center={defaultCoverageCenter}
        zoom={9}
        revision={mapRevision}
        tileMode={tileMode}
        counties={countyCenters}
        partnerShops={partnerShops}
        mapSearchTarget={null}
        listSearchTarget={null}
        nearbyShops={[]}
        radiusMiles="20"
        radiusMeters={20 * 1609.34}
        regionCount={operatingRegions.length}
        isLoadingShops={isLoadingShops}
        onTileModeChange={setTileMode}
        onCenterActive={() => undefined}
        onResetView={() => setMapRevision((current) => current + 1)}
      />
    </>
  );
}
