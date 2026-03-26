/**
 * ============================================================================
 * REAL-TIME BID COMPONENT EXAMPLE
 * ============================================================================
 *
 * This is a complete working example showing how to integrate:
 * - Real-time bid subscriptions
 * - Performance optimization with caching
 * - Optimistic UI updates
 * - Cloud-agnostic storage
 *
 * Copy this pattern for your own components!
 * ============================================================================
 */

import { useState, useEffect } from "react";
import { DollarSign, Clock, Star, MapPin, TrendingUp, Wifi, WifiOff } from "lucide-react";
import { realtimeBidService } from "../../services/realtime/RealtimeBidService";
import { performanceOptimizer } from "../../services/performance/PerformanceOptimizer";
import { getBidsForReport, updateBidStatus } from "../../services/supabaseService";
import type { Bid } from "../../types";

interface RealtimeBidExampleProps {
  reportId: string;
  onBidAccepted?: (bid: Bid) => void;
}

export default function RealtimeBidExample({ reportId, onBidAccepted }: RealtimeBidExampleProps) {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [newBidCount, setNewBidCount] = useState(0);

  // Load bids on mount with caching
  useEffect(() => {
    loadBids();
  }, [reportId]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (import.meta.env.DEV)
      console.log("🔴 Setting up real-time subscription for report:", reportId);

    const unsubscribe = realtimeBidService.subscribeToReportBids(
      reportId,

      // onNewBid callback
      (newBid) => {
        if (import.meta.env.DEV) console.log("🔴 NEW BID RECEIVED:", newBid);

        // Add to list
        setBids((prev) => [newBid, ...prev]);

        // Increment badge count
        setNewBidCount((prev) => prev + 1);

        // Show notification
        showNotification(
          `New bid: $${newBid.amount}`,
          `${newBid.shopName || "Shop"} - ${newBid.estimatedDays} days`
        );

        // Play sound
        playNotificationSound();

        // Invalidate cache
        performanceOptimizer.invalidateCache(`bids-${reportId}`);
      },

      // onUpdateBid callback
      (updatedBid) => {
        if (import.meta.env.DEV) console.log("🔴 BID UPDATED:", updatedBid);

        setBids((prev) => prev.map((bid) => (bid.id === updatedBid.id ? updatedBid : bid)));

        if (updatedBid.status === "accepted") {
          showNotification("Bid Accepted!", `You accepted ${updatedBid.shopName}'s bid`);
        }
      },

      // onDeleteBid callback
      (bidId) => {
        if (import.meta.env.DEV) console.log("🔴 BID DELETED:", bidId);
        setBids((prev) => prev.filter((bid) => bid.id !== bidId));
      },

      // onConnectionStatus callback
      (status) => {
        if (import.meta.env.DEV) console.log("🔴 Connection status:", status);
        setIsConnected(status === "connected");

        if (status === "error") {
          showNotification("Connection Lost", "Trying to reconnect...", "error");
        } else if (status === "connected") {
          if (import.meta.env.DEV) console.log("✅ Real-time connection established");
        }
      }
    );

    // Cleanup on unmount
    return () => {
      if (import.meta.env.DEV) console.log("🔴 Cleaning up real-time subscription");
      unsubscribe();
    };
  }, [reportId]);

  /**
   * Load bids with caching for performance
   */
  async function loadBids() {
    setIsLoading(true);

    try {
      const cachedBids = await performanceOptimizer.cachedQuery(
        `bids-${reportId}`,
        async () => {
          if (import.meta.env.DEV) console.log("📡 Fetching bids from database...");
          return await getBidsForReport(reportId);
        },
        30000 // Cache for 30 seconds
      );

      setBids(cachedBids as unknown as Bid[]);
      if (import.meta.env.DEV) console.log(`✅ Loaded ${cachedBids.length} bids`);
    } catch (error) {
      if (import.meta.env.DEV) console.error("❌ Error loading bids:", error);
      showNotification("Error", "Failed to load bids", "error");
    } finally {
      setIsLoading(false);
    }
  }

  /**
   * Accept a bid with optimistic UI update
   */
  async function handleAcceptBid(bid: Bid) {
    if (!confirm(`Accept bid from ${bid.shopName} for $${bid.amount}?`)) {
      return;
    }

    // Optimistic update - UI changes immediately
    const optimisticBid = { ...bid, status: "accepted" as const };

    try {
      await performanceOptimizer.optimisticUpdate(
        `bids-${reportId}`,
        bids.map((b) => (b.id === bid.id ? optimisticBid : b)),
        async () => {
          // Actual server update happens in background
          const result = await updateBidStatus(bid.id!, "accepted");

          if (!result) {
            throw new Error("Failed to update bid status");
          }

          return bids.map((b) => (b.id === bid.id ? optimisticBid : b));
        }
      );

      // Update local state
      setBids((prev) => prev.map((b) => (b.id === bid.id ? optimisticBid : b)));

      showNotification("Success!", `Accepted bid from ${bid.shopName}`);
      onBidAccepted?.(optimisticBid);
    } catch (error) {
      if (import.meta.env.DEV) console.error("❌ Error accepting bid:", error);
      showNotification("Error", "Failed to accept bid", "error");

      // Optimistic update will rollback automatically
      loadBids();
    }
  }

  /**
   * Reject a bid with optimistic UI update
   */
  async function handleRejectBid(bid: Bid) {
    const optimisticBid = { ...bid, status: "rejected" as const };

    try {
      await performanceOptimizer.optimisticUpdate(
        `bids-${reportId}`,
        bids.map((b) => (b.id === bid.id ? optimisticBid : b)),
        async () => {
          const result = await updateBidStatus(bid.id!, "rejected");
          if (!result) throw new Error("Failed to update");
          return bids.map((b) => (b.id === bid.id ? optimisticBid : b));
        }
      );

      setBids((prev) => prev.map((b) => (b.id === bid.id ? optimisticBid : b)));

      showNotification("Bid Rejected", `Rejected bid from ${bid.shopName}`);
    } catch (error) {
      if (import.meta.env.DEV) console.error("❌ Error rejecting bid:", error);
      showNotification("Error", "Failed to reject bid", "error");
      loadBids();
    }
  }

  /**
   * Clear new bid notification badge
   */
  function clearNewBidNotification() {
    setNewBidCount(0);
  }

  /**
   * Show toast notification
   */
  function showNotification(title: string, message: string, type: "success" | "error" = "success") {
    // You can integrate with your toast library here
    if (import.meta.env.DEV) console.log(`[${type.toUpperCase()}] ${title}: ${message}`);

    // Example with native notification API
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body: message });
    }
  }

  /**
   * Play notification sound
   */
  function playNotificationSound() {
    // You can add audio here
    const audio = new Audio("/notification.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => {
      // Ignore audio play errors (browser may block)
    });
  }

  // Calculate stats
  const pendingBids = bids.filter((b) => b.status === "pending");
  const lowestBid = pendingBids.length > 0 ? Math.min(...pendingBids.map((b) => b.amount)) : null;
  const averageBid =
    pendingBids.length > 0
      ? pendingBids.reduce((sum, b) => sum + b.amount, 0) / pendingBids.length
      : null;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with connection status */}
      <div className="flex items-center justify-between bg-white rounded-lg shadow p-4">
        <div>
          <h2 className="text-xl font-bold">
            Bids ({bids.length})
            {newBidCount > 0 && (
              <span
                className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-red-600 rounded-full cursor-pointer"
                onClick={clearNewBidNotification}
              >
                {newBidCount} new
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-600">
            {pendingBids.length} pending • Real-time updates enabled
          </p>
        </div>

        {/* Connection indicator */}
        <div className="flex items-center gap-2">
          {isConnected ? (
            <>
              <Wifi className="w-5 h-5 text-green-600" />
              <span className="text-sm text-green-600 font-medium">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-600 font-medium">Offline</span>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      {pendingBids.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center gap-2 text-green-700 mb-1">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Lowest Bid</span>
            </div>
            <div className="text-2xl font-bold text-green-900">${lowestBid?.toFixed(2)}</div>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="flex items-center gap-2 text-blue-700 mb-1">
              <DollarSign className="w-4 h-4" />
              <span className="text-sm font-medium">Average Bid</span>
            </div>
            <div className="text-2xl font-bold text-blue-900">${averageBid?.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* Bids list */}
      <div className="space-y-3">
        {bids.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No bids yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Shops will see your request and submit bids
            </p>
          </div>
        ) : (
          bids.map((bid) => (
            <div
              key={bid.id}
              className={`bg-white rounded-lg shadow-sm border p-4 ${
                bid.status === "accepted"
                  ? "border-green-500 bg-green-50"
                  : bid.status === "rejected"
                    ? "border-gray-300 opacity-60"
                    : "border-gray-200"
              }`}
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{bid.shopName}</h3>
                  <p className="text-sm text-gray-600">{bid.shopEmail}</p>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">${bid.amount.toFixed(2)}</div>
                  {bid.status === "accepted" && (
                    <span className="inline-block px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                      Accepted
                    </span>
                  )}
                  {bid.status === "rejected" && (
                    <span className="inline-block px-2 py-1 bg-gray-600 text-white text-xs rounded-full">
                      Rejected
                    </span>
                  )}
                </div>
              </div>

              <p className="text-gray-700 mb-3">{bid.description}</p>

              <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{bid.estimatedDays} days</span>
                </div>

                {bid.shopRating && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>
                      {bid.shopRating} ({bid.shopReviews} reviews)
                    </span>
                  </div>
                )}

                {bid.shopDistance && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    <span>{bid.shopDistance}</span>
                  </div>
                )}
              </div>

              {bid.status === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleAcceptBid(bid)}
                    className="flex-1 bg-green-600 text-white px-4 py-2 rounded-md font-medium hover:bg-green-700"
                  >
                    Accept Bid
                  </button>
                  <button
                    onClick={() => handleRejectBid(bid)}
                    className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-medium hover:bg-gray-300"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
