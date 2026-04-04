import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Clock, DollarSign, MapPin, Navigation, Phone, Mail } from "lucide-react";
import DashboardMapPreview from "../dashboard/MapLibreDashboardMapPreview";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

export type AcceptedBidInfo = {
  shopName: string;
  price: number;
  timeframe: string;
  shopLatitude?: number | null;
  shopLongitude?: number | null;
  shopEmail?: string;
  shopPhone?: string;
  shopAddress?: string;
};

type AcceptedBidConfirmationSheetProps = {
  bid: AcceptedBidInfo | null;
  appearanceMode?: DashboardAppearanceMode;
  onViewShopOnMap: () => void;
  onDismiss: () => void;
};

export default function AcceptedBidConfirmationSheet({
  bid,
  appearanceMode = "map-dark",
  onViewShopOnMap,
  onDismiss,
}: AcceptedBidConfirmationSheetProps) {
  const isLight = appearanceMode === "light";

  const shopPin: CoveragePartnerShop[] =
    bid?.shopLatitude && bid?.shopLongitude
      ? [
          {
            name: bid.shopName,
            countyLabel: "",
            lat: bid.shopLatitude,
            lng: bid.shopLongitude,
            label: bid.shopName,
            specialties: [],
            rating: 0,
          },
        ]
      : [];

  const hasMapCoords = shopPin.length > 0;

  return (
    <AnimatePresence>
      {bid && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onDismiss}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            className="bd-dashboard-panel fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border-t border-white/[0.08]"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div
                className={`h-1 w-10 rounded-full ${isLight ? "bg-slate-300" : "bg-white/20"}`}
              />
            </div>

            <div className="px-5 pb-6 pt-2">
              {/* Success icon + heading */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15">
                  <BadgeCheck className="h-7 w-7 text-emerald-400" />
                </div>
                <h2 className={`text-lg font-bold ${isLight ? "text-slate-900" : "text-white"}`}>
                  Bid Accepted
                </h2>
                <p className={`mt-1 text-sm ${isLight ? "text-slate-500" : "text-slate-300/80"}`}>
                  Your repair is confirmed with{" "}
                  <span className="font-semibold">{bid.shopName}</span>
                </p>
              </div>

              {/* Details row */}
              <div className="bd-dashboard-note mb-4 flex items-center justify-center gap-4 rounded-xl px-4 py-3">
                <div className="flex items-center gap-1.5">
                  <DollarSign
                    className={`h-4 w-4 ${isLight ? "text-emerald-600" : "text-emerald-400"}`}
                  />
                  <span
                    className={`text-sm font-semibold ${isLight ? "text-slate-900" : "text-white"}`}
                  >
                    ${bid.price.toLocaleString()}
                  </span>
                </div>
                <div className={`h-4 w-px ${isLight ? "bg-slate-200" : "bg-white/10"}`} />
                <div className="flex items-center gap-1.5">
                  <Clock className={`h-4 w-4 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                  <span className={`text-sm ${isLight ? "text-slate-700" : "text-slate-200"}`}>
                    {bid.timeframe}
                  </span>
                </div>
              </div>

              {/* Shop contact info */}
              {(bid.shopPhone || bid.shopEmail || bid.shopAddress) && (
                <div className="bd-dashboard-note mb-4 rounded-xl px-4 py-3 space-y-2">
                  {bid.shopPhone && (
                    <a
                      href={`tel:${bid.shopPhone}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Phone className={`h-4 w-4 ${isLight ? "text-emerald-600" : "text-emerald-400"}`} />
                      <span className={isLight ? "text-slate-700" : "text-slate-200"}>
                        {bid.shopPhone}
                      </span>
                    </a>
                  )}
                  {bid.shopEmail && (
                    <a
                      href={`mailto:${bid.shopEmail}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <Mail className={`h-4 w-4 ${isLight ? "text-blue-600" : "text-blue-400"}`} />
                      <span className={isLight ? "text-slate-700" : "text-slate-200"}>
                        {bid.shopEmail}
                      </span>
                    </a>
                  )}
                  {bid.shopAddress && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className={`h-4 w-4 ${isLight ? "text-slate-500" : "text-slate-400"}`} />
                      <span className={isLight ? "text-slate-700" : "text-slate-200"}>
                        {bid.shopAddress}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Mini-map preview (if shop has coordinates) */}
              {hasMapCoords && (
                <div className="mb-4 h-[140px] rounded-xl overflow-hidden">
                  <DashboardMapPreview
                    shops={shopPin}
                    center={[bid.shopLatitude!, bid.shopLongitude!]}
                    zoom={12}
                    isLight={isLight}
                  />
                </div>
              )}

              {/* CTAs */}
              <div className="flex flex-col gap-2.5">
                <button
                  onClick={onViewShopOnMap}
                  className="bd-dashboard-primary-button flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
                  style={{
                    background: "linear-gradient(135deg, #003d82 0%, #0f8fd7 100%)",
                    minHeight: 44,
                  }}
                >
                  {hasMapCoords ? (
                    <Navigation className="h-4 w-4" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                  View Shop on Map
                </button>
                <button
                  onClick={onDismiss}
                  className="bd-dashboard-secondary-button flex w-full items-center justify-center rounded-xl px-5 py-3 font-medium focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  style={{ minHeight: 44 }}
                >
                  Stay on Bids
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
