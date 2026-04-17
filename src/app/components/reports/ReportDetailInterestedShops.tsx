import { MapPin, Search, Star } from "lucide-react";
import ImageWithFallback from "../codelayer/ImageWithFallback";

type InterestedShop = {
  id: string | number;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  bidAmount: number;
  estimatedTime: string;
  image: string;
  description: string;
  shopLatitude: number | null;
  shopLongitude: number | null;
};

type ReportDetailInterestedShopsProps = {
  shops: InterestedShop[];
  isLight: boolean;
  primaryColor: string;
  onViewAllBids?: () => void;
  onFindShops?: () => void;
};

export default function ReportDetailInterestedShops({
  shops,
  isLight,
  primaryColor,
  onViewAllBids,
  onFindShops,
}: ReportDetailInterestedShopsProps) {
  return (
    <div className="bd-dashboard-panel p-3 sm:p-4">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-bold text-lg">Interested Shops</h2>
        <span className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
          {shops.length === 1 ? "1 bid received" : `${shops.length} bids received`}
        </span>
      </div>

      {shops.length === 0 ? (
        <div
          className={`bd-dashboard-note rounded-xl p-4 text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}
        >
          <p>No bids have arrived yet. Shops will appear here as soon as they respond.</p>
          {onFindShops && (
            <button
              className="bd-dashboard-primary-button mt-3 flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white"
              style={{ background: primaryColor }}
              onClick={onFindShops}
            >
              <Search className="h-4 w-4" />
              Find Nearby Shops
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {shops.map((shop) => (
            <div
              key={shop.id}
              className="bd-dashboard-section bd-dashboard-section--interactive p-3 transition-all duration-200"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 ${isLight ? "bg-slate-100" : "bg-white/[0.06]"}`}
                >
                  <ImageWithFallback
                    src={shop.image}
                    alt={shop.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <h3
                      className={`font-semibold ${isLight ? "text-slate-900" : "text-slate-100"}`}
                    >
                      {shop.name}
                    </h3>
                    <span className="bd-dashboard-chip ml-2 flex-shrink-0 px-2 py-0.5 text-[11px] font-semibold">
                      BID
                    </span>
                  </div>

                  <div className="flex items-center text-sm mb-2 flex-wrap gap-x-2 gap-y-1">
                    {shop.rating > 0 ? (
                      <>
                        <Star className="w-3 h-3 text-yellow-400 flex-shrink-0" fill="#FBBF24" />
                        <span className="font-medium">{shop.rating}</span>
                        {shop.reviews > 0 && (
                          <span className={isLight ? "text-slate-500" : "text-slate-400"}>
                            ({shop.reviews})
                          </span>
                        )}
                      </>
                    ) : (
                      <span className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        No rating yet
                      </span>
                    )}
                    <span className="text-slate-500">•</span>
                    <MapPin className="w-3 h-3 text-slate-400 flex-shrink-0" />
                    <span className={`truncate ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                      {shop.distance}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div
                        className="text-lg font-bold tabular-nums"
                        style={{ color: primaryColor }}
                      >
                        ${shop.bidAmount?.toLocaleString()}
                      </div>
                      <div className={`text-xs ${isLight ? "text-slate-500" : "text-slate-400"}`}>
                        {shop.estimatedTime}
                      </div>
                    </div>
                    <button
                      className="bd-dashboard-primary-button min-h-[44px] flex-shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold text-white"
                      style={{ background: primaryColor }}
                      onClick={onViewAllBids}
                    >
                      View Bid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {shops.length > 0 && (
        <>
          {/* Mobile: sticky footer */}
          <button
            className="bd-dashboard-primary-button sm:hidden fixed left-2 right-2 bottom-2 z-40 min-h-[52px] rounded-xl px-4 py-3 font-semibold text-white"
            style={{ background: primaryColor }}
            onClick={onViewAllBids}
          >
            Compare All Bids
          </button>
          {/* Desktop: inline */}
          <button
            className="bd-dashboard-primary-button mt-4 hidden w-full rounded-xl px-4 py-3 font-semibold text-white sm:block"
            style={{ background: primaryColor }}
            onClick={onViewAllBids}
          >
            Compare All Bids
          </button>
        </>
      )}
    </div>
  );
}
