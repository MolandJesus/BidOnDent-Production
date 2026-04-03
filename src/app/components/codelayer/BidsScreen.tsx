import { useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";
import ShopRatingModal from "../shop/ShopRatingModal";
import BidCardArticle from "./BidCardArticle";
import AcceptedBidConfirmationSheet from "./AcceptedBidConfirmationSheet";
import type { AcceptedBidInfo } from "./AcceptedBidConfirmationSheet";
import { zipToCoordinates } from "../../services/supabase/map";
import { defaultCoverageCenter } from "../landing/coverageData";
import type { ReportPin } from "../dashboard/MapLibreDashboardMapPreview";
import BidsEmptyState from "./BidsEmptyState";
import BidsSummaryHeader from "./BidsSummaryHeader";
import BidsGeographyMap from "./BidsGeographyMap";
import type { CoveragePartnerShop } from "../maps/serviceCoverageMapTypes";
import { useNotifications } from "../../features/notifications/NotificationContext";
import { FILTERS, transformBid, type BidsScreenProps, type FilterType } from "./bidsScreenHelpers";

export default function BidsScreen({
  primaryColor = "#003d82",
  appearanceMode = "map-dark",
  onBack,
  onStartReport,
  onViewShopDirectory,
  userType = "customer",
  bids: incomingBids = [],
  reports = [],
  onAcceptBid,
  onRejectBid,
}: BidsScreenProps) {
  const notifications = useNotifications();
  const isLight = appearanceMode === "light";
  const [activeBid, setActiveBid] = useState<string | number | null>(null);
  const [acceptedBidId, setAcceptedBidId] = useState<string | number | null>(null);
  const [confirmedBid, setConfirmedBid] = useState<AcceptedBidInfo | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [shopRatings, setShopRatings] = useState<{
    [key: string]: { rating: number; review: string; categoryRatings?: Record<string, number> };
  }>({});

  const liveBids = useMemo(() => {
    return (incomingBids || []).map(transformBid);
  }, [incomingBids]);

  // Restore acceptedBidId from bid data on mount/update
  useEffect(() => {
    const alreadyAccepted = liveBids.find((b) => b.status === "accepted");
    if (alreadyAccepted && acceptedBidId !== alreadyAccepted.id) {
      setAcceptedBidId(alreadyAccepted.id);
    }
  }, [liveBids, acceptedBidId]);

  const selectedReport = useMemo(() => {
    if (liveBids.length === 0) {
      return null;
    }

    return reports.find((report) => report.id === liveBids[0].reportId) || null;
  }, [liveBids, reports]);

  const reportCoords = useMemo(() => {
    if (!selectedReport) {
      return null;
    }
    if (selectedReport.latitude != null && selectedReport.longitude != null) {
      return { lat: selectedReport.latitude, lng: selectedReport.longitude };
    }
    return zipToCoordinates(selectedReport.zip_code || selectedReport.zipCode);
  }, [selectedReport]);

  const reportPins = useMemo<ReportPin[]>(() => {
    if (!selectedReport || !reportCoords) {
      return [];
    }

    const label = [
      selectedReport?.vehicle?.year || selectedReport?.vehicleInfo?.year,
      selectedReport?.vehicle?.make || selectedReport?.vehicleInfo?.make,
      selectedReport?.vehicle?.model || selectedReport?.vehicleInfo?.model,
    ]
      .filter(Boolean)
      .join(" ");

    return [
      {
        id: String(selectedReport.id),
        lat: reportCoords.lat,
        lng: reportCoords.lng,
        label: label || "Damage report",
      },
    ];
  }, [selectedReport, reportCoords]);

  const bidMapShops = useMemo<CoveragePartnerShop[]>(() => {
    return liveBids
      .filter((bid) => bid.shopLatitude != null && bid.shopLongitude != null)
      .map((bid) => ({
        id: String(bid.id),
        name: bid.shopName,
        countyLabel: "Bid comparison",
        lat: bid.shopLatitude as number,
        lng: bid.shopLongitude as number,
        label: bid.shopName,
        addressLine: bid.distance,
        specialties: [],
        rating: bid.rating,
        dataMode: "live" as const,
      }));
  }, [liveBids]);

  const bidMapCenter = useMemo<[number, number]>(() => {
    if (reportCoords) {
      return [reportCoords.lat, reportCoords.lng];
    }

    if (bidMapShops.length > 0) {
      return [bidMapShops[0].lat, bidMapShops[0].lng];
    }

    return defaultCoverageCenter;
  }, [reportCoords, bidMapShops]);

  const vehicleLabel = selectedReport
    ? [
        selectedReport?.vehicle?.year || selectedReport?.vehicleInfo?.year,
        selectedReport?.vehicle?.make || selectedReport?.vehicleInfo?.make,
        selectedReport?.vehicle?.model || selectedReport?.vehicleInfo?.model,
      ]
        .filter(Boolean)
        .join(" ")
    : "your report";

  const hasLiveBids = liveBids.length > 0;

  useEffect(() => {
    if (hasLiveBids && activeBid === null) {
      setActiveBid(liveBids[0]?.id ?? null);
    }
  }, [activeBid, hasLiveBids, liveBids]);

  if (!hasLiveBids) {
    return (
      <BidsEmptyState
        isLight={isLight}
        userType={userType}
        primaryColor={primaryColor}
        onBack={onBack}
        onStartReport={onStartReport}
      />
    );
  }

  const lowestPrice = useMemo(() => Math.min(...liveBids.map((bid) => bid.price)), [liveBids]);
  const averagePrice = useMemo(
    () =>
      Math.round(liveBids.reduce((sum, bid) => sum + bid.price, 0) / Math.max(1, liveBids.length)),
    [liveBids]
  );
  const fastestBidDays = useMemo(
    () => Math.min(...liveBids.map((bid) => Math.max(1, Number(bid.estimatedDays || 0)))),
    [liveBids]
  );
  const recommendedId = useMemo(() => {
    return [...liveBids].sort((a, b) => b.rating - a.rating + (b.reviews - a.reviews) / 200)[0].id;
  }, [liveBids]);

  const filteredBids = useMemo(() => {
    return [...liveBids].sort((a, b) => {
      if (filter === "lowest") return a.price - b.price;
      if (filter === "fastest") {
        const aDays = Math.max(1, Number(a.estimatedDays || 0));
        const bDays = Math.max(1, Number(b.estimatedDays || 0));
        return aDays - bDays;
      }
      if (filter === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [filter, liveBids]);

  const handleRating = (
    shopName: string,
    rating: number,
    review: string,
    categoryRatings: { quality: number; service: number; timeliness: number; value: number }
  ) => {
    setShopRatings((prevRatings) => ({
      ...prevRatings,
      [shopName]: { rating, review, categoryRatings },
    }));
    setShowRatingModal(false);
  };

  return (
    <div className="pb-20 px-4 md:px-6 py-4 md:py-5 space-y-4">
      <BidsSummaryHeader
        isLight={isLight}
        bidCount={liveBids.length}
        vehicleLabel={vehicleLabel}
        lowestPrice={lowestPrice}
        averagePrice={averagePrice}
        fastestBidDays={fastestBidDays}
        onBack={onBack}
      />

      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="bd-dashboard-panel bd-dashboard-panel--deep p-3"
      >
        <div className="mb-3 flex items-start justify-between gap-3 px-1">
          <div>
            <p
              className={`mb-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                isLight ? "text-slate-500" : "text-blue-100/55"
              }`}
            >
              Sort & Compare
            </p>
            <p className={`text-sm ${isLight ? "text-slate-600" : "text-blue-100/66"}`}>
              Switch between price, speed, and rating to find the best bid.
            </p>
          </div>
          <span
            className={`bd-dashboard-chip shrink-0 px-2.5 py-1 text-[11px] font-medium ${
              isLight ? "bg-white/85 text-blue-700" : "border-blue-200/18 bg-white/10 text-blue-50"
            }`}
          >
            {filteredBids.length} visible
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((item) => (
            <button
              key={item.id}
              className={`bd-dashboard-filter-button rounded-full px-3.5 py-1.5 text-sm font-medium ${
                filter === item.id ? "bd-dashboard-filter-button--active" : ""
              }`}
              style={
                filter === item.id
                  ? {
                      background: `linear-gradient(135deg, ${primaryColor} 0%, rgba(56,189,248,0.75) 100%)`,
                    }
                  : {}
              }
              onClick={() => setFilter(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </motion.section>

      <BidsGeographyMap
        isLight={isLight}
        bidMapShops={bidMapShops}
        totalBids={liveBids.length}
        reportPins={reportPins}
        bidMapCenter={bidMapCenter}
        onShopClick={(id) => setActiveBid(id)}
      />

      <motion.section
        variants={{
          hidden: { opacity: 0 },
          show: { opacity: 1, transition: { staggerChildren: 0.08 } },
        }}
        initial="hidden"
        animate="show"
        className="space-y-3"
      >
        {filteredBids.map((bid) => {
          const userRated = shopRatings[bid.shopName];

          return (
            <BidCardArticle
              key={bid.id}
              bid={bid}
              isActive={activeBid === bid.id}
              isAccepted={acceptedBidId === bid.id}
              isRecommended={bid.id === recommendedId}
              lowestPrice={lowestPrice}
              primaryColor={primaryColor}
              userType={userType}
              appearanceMode={appearanceMode}
              userRating={userRated}
              onToggle={() => setActiveBid((prev) => (prev === bid.id ? null : bid.id))}
              onAccept={() => {
                setAcceptedBidId(bid.id);
                setConfirmedBid({
                  shopName: bid.shopName,
                  price: bid.price,
                  timeframe: bid.timeframe,
                  shopLatitude: bid.shopLatitude,
                  shopLongitude: bid.shopLongitude,
                });
                onAcceptBid?.({
                  bidId: String(bid.id),
                  shopId: bid.shopId,
                  shopName: bid.shopName,
                  price: bid.price,
                  timeframe: bid.timeframe,
                  reportId: bid.reportId,
                });
                notifications.push({
                  category: "bid",
                  title: `Bid accepted — ${bid.shopName}`,
                  body: `You accepted ${bid.shopName}'s bid for $${bid.price.toLocaleString()}.`,
                  payload: { bidId: bid.id, shopId: bid.shopId, reportId: bid.reportId },
                  userId: "",
                  deepLink: { screen: "bid", bidId: String(bid.id), reportId: bid.reportId },
                  priority: "high",
                });
              }}
              onReject={() => {
                onRejectBid?.({
                  bidId: String(bid.id),
                  shopName: bid.shopName,
                });
              }}
              onRate={() => {
                setSelectedShop(bid.shopName);
                setShowRatingModal(true);
              }}
            />
          );
        })}
      </motion.section>

      {/* ── All bids rejected: guide customer back to map ── */}
      {userType === "customer" &&
        liveBids.length > 0 &&
        liveBids.every((b) => b.status === "rejected") &&
        onViewShopDirectory && (
          <motion.section
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.15 }}
            className="bd-dashboard-panel bd-dashboard-panel--accent-indigo p-5 text-center"
          >
            <div className="bd-dashboard-note bd-dashboard-note--deep mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full">
              <MapPin className={`h-5 w-5 ${isLight ? "text-amber-500" : "text-amber-200"}`} />
            </div>
            <h3
              className={`text-base font-semibold ${isLight ? "text-slate-800" : "text-slate-100"}`}
            >
              All bids declined
            </h3>
            <p
              className={`mt-1.5 text-sm leading-relaxed max-w-xs mx-auto ${isLight ? "text-slate-500" : "text-blue-100/80"}`}
            >
              Explore more shops on the map to find the right match for your repair.
            </p>
            <button
              onClick={onViewShopDirectory}
              className="bd-dashboard-primary-button mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)`,
              }}
            >
              <MapPin className="h-4 w-4" />
              Find More Shops
            </button>
          </motion.section>
        )}

      {showRatingModal && (
        <ShopRatingModal
          shopName={selectedShop}
          onClose={() => setShowRatingModal(false)}
          onSubmit={(rating, review, categoryRatings) =>
            handleRating(selectedShop, rating, review, categoryRatings)
          }
          primaryColor={primaryColor}
          appearanceMode={appearanceMode}
        />
      )}

      <AcceptedBidConfirmationSheet
        bid={confirmedBid}
        appearanceMode={appearanceMode}
        onViewShopOnMap={() => {
          setConfirmedBid(null);
          onViewShopDirectory?.();
        }}
        onDismiss={() => setConfirmedBid(null)}
      />
    </div>
  );
}
