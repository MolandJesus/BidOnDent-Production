import { useCallback, useState } from "react";
import type { ShopMapListing } from "../services/intelligence/shopMapExperience";
import type { WebsiteIdentity } from "../services/auth/websiteIdentity";
import type { DamageReport } from "../services/supabase/types";
import { submitBid } from "../services/supabase/bids";
import { submitEstimateRequest } from "../services/supabase/estimateRequests";
import { useNotifications } from "../features/notifications";

interface UseShopDirectoryActionsOptions {
  identity?: WebsiteIdentity | null;
  mapListings: ShopMapListing[];
  onEstimateSubmitted?: () => void;
  onBidSubmitted?: () => void;
}

export function useShopDirectoryActions({
  identity,
  mapListings,
  onEstimateSubmitted,
  onBidSubmitted,
}: UseShopDirectoryActionsOptions) {
  const notifications = useNotifications();

  // ── Detail sheet ──
  const [detailShop, setDetailShop] = useState<ShopMapListing | null>(null);
  const handleViewShopDetails = useCallback((shop: ShopMapListing) => setDetailShop(shop), []);

  // ── Bid state (shop users) ──
  const [bidReport, setBidReport] = useState<DamageReport | null>(null);
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);

  const handlePlaceBid = useCallback((report: DamageReport) => {
    setBidError(null);
    setBidReport(report);
  }, []);

  const handleSubmitBid = useCallback(
    async (reportId: string, amount: number, estimatedDays: number, description: string) => {
      const clerkUserId = identity?.providerUserId;
      if (!clerkUserId) {
        setBidError("You must be signed in to place a bid.");
        return;
      }
      setBidSubmitting(true);
      setBidError(null);
      try {
        const result = await submitBid(
          {
            damage_report_id: reportId,
            report_id: reportId,
            amount,
            estimated_days: estimatedDays,
            description: description || null,
            status: "pending",
            shop_name: identity?.displayName || null,
            shop_email: identity?.normalizedEmail || null,
          },
          clerkUserId
        );
        if (result) {
          const vehicleLabel = bidReport?.vehicle_make
            ? `${bidReport.vehicle_year} ${bidReport.vehicle_make} ${bidReport.vehicle_model || ""}`.trim()
            : "report";
          notifications.push({
            title: "Bid Submitted",
            body: `$${amount.toLocaleString()} bid sent for ${vehicleLabel}.`,
            category: "bid",
            payload: { reportId, bidAmount: amount },
            priority: "normal",
            userId: clerkUserId,
            deepLink: { screen: "bid", bidId: reportId },
          });
          setBidReport(null);
          onBidSubmitted?.();
        } else {
          setBidError("Failed to submit bid. Please try again.");
        }
      } catch {
        setBidError("An error occurred while submitting your bid.");
      } finally {
        setBidSubmitting(false);
      }
    },
    [
      identity?.providerUserId,
      identity?.displayName,
      identity?.normalizedEmail,
      notifications,
      bidReport,
      onBidSubmitted,
    ]
  );

  // ── Estimate request state (customer users) ──
  const [estimateShop, setEstimateShop] = useState<ShopMapListing | null>(null);
  const [estimateSubmitting, setEstimateSubmitting] = useState(false);
  const [estimateError, setEstimateError] = useState<string | null>(null);

  const handleRequestEstimate = useCallback((shop: ShopMapListing) => {
    setEstimateError(null);
    setEstimateShop(shop);
  }, []);

  const handleSubmitEstimate = useCallback(
    async (shopId: number, description: string, timeline: string) => {
      const shop = mapListings.find((s) => s.id === shopId);
      if (!shop) return;
      setEstimateSubmitting(true);
      setEstimateError(null);
      try {
        const result = await submitEstimateRequest(
          {
            shop_id: shopId,
            shop_name: shop.name,
            description,
            timeline,
          },
          identity?.providerUserId ?? undefined
        );
        if (!result) {
          setEstimateError("Could not send request. Please try again.");
          return;
        }
        notifications.push({
          title: "Estimate Requested",
          body: `Your request was sent to ${shop.name}. Timeline: ${timeline === "urgent" ? "ASAP" : timeline === "this-week" ? "This week" : "Flexible"}.`,
          category: "bid",
          payload: { shopId, shopName: shop.name, description, timeline },
          priority: "normal",
          userId: identity?.providerUserId || "",
          deepLink: { screen: "shop-directory" },
        });
        setEstimateShop(null);
        onEstimateSubmitted?.();
      } catch {
        setEstimateError("Failed to send request. Please try again.");
      } finally {
        setEstimateSubmitting(false);
      }
    },
    [mapListings, notifications, identity?.providerUserId, onEstimateSubmitted]
  );

  return {
    // Detail sheet
    detailShop,
    setDetailShop,
    handleViewShopDetails,
    // Bid
    bidReport,
    setBidReport,
    bidSubmitting,
    bidError,
    handlePlaceBid,
    handleSubmitBid,
    // Estimate
    estimateShop,
    setEstimateShop,
    estimateSubmitting,
    estimateError,
    handleRequestEstimate,
    handleSubmitEstimate,
  };
}
