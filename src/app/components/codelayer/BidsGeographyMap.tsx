import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { ReportPin } from "../dashboard/MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";

type BidsGeographyMapProps = {
  isLight: boolean;
  bidMapShops: CoveragePartnerShop[];
  totalBids: number;
  reportPins: ReportPin[];
  bidMapCenter: [number, number];
  onShopClick: (shopId: string) => void;
};

export default function BidsGeographyMap({
  isLight,
  bidMapShops,
  totalBids,
  reportPins,
  bidMapCenter,
  onShopClick,
}: BidsGeographyMapProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.08 }}
      className="bd-glass-card overflow-hidden"
      style={{
        background: isLight
          ? "linear-gradient(180deg, rgba(255,255,255,0.88) 0%, rgba(241,245,249,0.84) 100%)"
          : "linear-gradient(180deg, rgba(11, 23, 47, 0.78) 0%, rgba(8, 18, 38, 0.74) 100%)",
        borderColor: isLight ? "rgba(148,163,184,0.25)" : "rgba(96, 165, 250, 0.18)",
      }}
    >
      <div className="p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2
              className={`text-sm font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              Bid geography comparison
            </h2>
            <p className={`mt-0.5 text-xs ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              Compare where each bidding shop is relative to your report.
            </p>
          </div>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
              isLight
                ? "bg-blue-50 text-blue-700 border border-blue-200/60"
                : "bg-blue-400/14 text-blue-200 border border-blue-300/20"
            }`}
          >
            {bidMapShops.length}/{totalBids} mapped
          </span>
        </div>
      </div>

      {bidMapShops.length > 0 ? (
        <>
          <div className="h-[220px] md:h-[240px]">
            <DashboardMapPreview
              shops={bidMapShops}
              reportPins={reportPins}
              center={bidMapCenter}
              zoom={10}
              isLight={isLight}
              onShopClick={(shop) => {
                if (shop.id) {
                  onShopClick(shop.id);
                }
              }}
            />
          </div>
          <div className="flex flex-wrap items-center gap-2 p-3">
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                isLight ? "bg-slate-100 text-slate-700" : "bg-white/10 text-slate-200"
              }`}
            >
              <span className="h-2 w-2 rounded-full bg-blue-500" />
              Shop bid
            </span>
            {reportPins.length > 0 ? (
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  isLight ? "bg-amber-100 text-amber-700" : "bg-amber-500/20 text-amber-200"
                }`}
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Your report
              </span>
            ) : null}
            <span className={`text-[11px] ${isLight ? "text-slate-500" : "text-blue-100/70"}`}>
              Tap a blue pin to highlight that shop&apos;s bid card.
            </span>
          </div>
        </>
      ) : (
        <div
          className={`mx-3 mb-3 flex items-start gap-2 rounded-xl border border-dashed px-3 py-2.5 text-xs ${
            isLight ? "border-slate-300/70 text-slate-600" : "border-white/20 text-slate-300"
          }`}
        >
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            No bid locations are available yet. Location-enabled bids will appear on this map as
            soon as shops include coordinates.
          </span>
        </div>
      )}
    </motion.section>
  );
}
