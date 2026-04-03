import { useEffect, useMemo, useState } from "react";
import { useMarketplaceReports } from "../hooks/useMarketplaceReports";
import { useShopReportNotifications } from "../hooks/useShopReportNotifications";
import { SEED_DAMAGE_REPORTS } from "../constants";
import { getShopSubmittedBids } from "../services/supabase/bids";
import {
  getMyEstimateRequests,
  getShopEstimateRequests,
  updateEstimateRequest,
  customerRespondToEstimate,
} from "../services/supabase/estimateRequests";
import type { EstimateRequest } from "../services/supabase/estimateRequests";
import type { DamageReport } from "../types";

interface DashboardDataDeps {
  userType: string;
  providerUserId: string | undefined;
  reports: DamageReport[];
  photoStorage: Record<string, string[]>;
}

export function useDashboardData({
  userType,
  providerUserId,
  reports,
  photoStorage,
}: DashboardDataDeps) {
  const {
    marketplaceReports,
    loading: marketplaceLoading,
    refetch: refetchMarketplace,
  } = useMarketplaceReports(userType);

  // Real-time: notify shop users when new reports arrive + auto-refresh list
  useShopReportNotifications({ userType, onNewReport: refetchMarketplace });

  const enrichedUserReports = reports.map((report) => ({
    ...report,
    photos:
      Array.isArray(photoStorage[report.id]) && photoStorage[report.id].length > 0
        ? photoStorage[report.id]
        : Array.isArray(report.photos)
          ? report.photos
          : [],
  }));

  const liveReportMap = new Map<string, DamageReport>();
  marketplaceReports.forEach((report) => {
    liveReportMap.set(String(report.id), report);
  });
  enrichedUserReports.forEach((report) => {
    const reportKey = String(report.id);
    const existing = liveReportMap.get(reportKey);
    if (!existing) {
      liveReportMap.set(reportKey, report);
      return;
    }
    liveReportMap.set(reportKey, {
      ...existing,
      customerName: report.customerName || existing.customerName,
      customerEmail: report.customerEmail || existing.customerEmail,
      customerPhone: report.customerPhone || existing.customerPhone,
      description: report.description || existing.description,
      damageDescription: report.damageDescription || existing.damageDescription,
      damageArea: report.damageArea || existing.damageArea,
      damageType: report.damageType || existing.damageType,
      address: report.address || existing.address,
      city: report.city || existing.city,
      state: report.state || existing.state,
      zipCode: report.zipCode || existing.zipCode,
      zip_code: report.zip_code || existing.zip_code,
      claimNumber: report.claimNumber || existing.claimNumber,
      policyNumber: report.policyNumber || existing.policyNumber,
      vehicle: report.vehicle || existing.vehicle,
      vehicleInfo: report.vehicleInfo || existing.vehicleInfo,
      photos: report.photos.length > 0 ? report.photos : existing.photos,
      bids: Array.isArray(report.bids) && report.bids.length > 0 ? report.bids : existing.bids,
      bidsCount: report.bidsCount ?? existing.bidsCount,
      bidAmount: report.bidAmount ?? existing.bidAmount,
      submittedAt: report.submittedAt || existing.submittedAt,
      createdAt: report.createdAt || existing.createdAt,
      status: report.status || existing.status,
    });
  });

  const liveMarketplaceReports = Array.from(liveReportMap.values()).sort((left, right) => {
    const leftDate = Date.parse(left.submittedAt || left.createdAt || "");
    const rightDate = Date.parse(right.submittedAt || right.createdAt || "");
    return rightDate - leftDate;
  });
  const usingSeedFallback = liveMarketplaceReports.length === 0;
  const shopInsurerReports = usingSeedFallback ? SEED_DAMAGE_REPORTS : liveMarketplaceReports;
  const shopInsurerReportsLoading = marketplaceLoading && liveMarketplaceReports.length === 0;

  // Shop submitted bids
  const [shopSubmittedBids, setShopSubmittedBids] = useState<
    Awaited<ReturnType<typeof getShopSubmittedBids>>
  >([]);
  const [shopBidReportIds, setShopBidReportIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    if (userType !== "shop" || !providerUserId) return;
    let cancelled = false;
    getShopSubmittedBids(providerUserId).then((bids) => {
      if (!cancelled) {
        setShopSubmittedBids(bids);
        const ids = new Set(
          bids.map((b) => b.damage_report_id || b.report_id || "").filter(Boolean)
        );
        setShopBidReportIds(ids);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userType, providerUserId]);

  const shopBidReportIdsArray = useMemo(() => Array.from(shopBidReportIds), [shopBidReportIds]);

  // Shop estimate requests
  const [shopEstimateRequests, setShopEstimateRequests] = useState<
    Awaited<ReturnType<typeof getShopEstimateRequests>>
  >([]);
  const [shopEstimatesLoading, setShopEstimatesLoading] = useState(false);
  useEffect(() => {
    if (userType !== "shop" || !providerUserId) return;
    let cancelled = false;
    setShopEstimatesLoading(true);
    getShopEstimateRequests(providerUserId)
      .then((data) => {
        if (!cancelled) setShopEstimateRequests(data);
      })
      .finally(() => {
        if (!cancelled) setShopEstimatesLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userType, providerUserId]);

  // Customer estimate requests
  const [customerEstimateRequests, setCustomerEstimateRequests] = useState<
    Awaited<ReturnType<typeof getMyEstimateRequests>>
  >([]);
  useEffect(() => {
    if (userType !== "customer" || !providerUserId) return;
    let cancelled = false;
    getMyEstimateRequests(providerUserId).then((data) => {
      if (!cancelled) setCustomerEstimateRequests(data);
    });
    return () => {
      cancelled = true;
    };
  }, [userType, providerUserId]);

  // Customer estimate detail sheet
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateRequest | null>(null);
  const [estimateActionLoading, setEstimateActionLoading] = useState(false);

  const handleCustomerEstimateResponse = async (
    requestId: string,
    status: "accepted" | "declined"
  ) => {
    if (!providerUserId) return;
    setEstimateActionLoading(true);
    const updated = await customerRespondToEstimate(requestId, status, providerUserId);
    setEstimateActionLoading(false);
    if (updated) {
      setCustomerEstimateRequests((prev) =>
        prev.map((r) => (r.id === requestId ? { ...r, status: updated.status } : r))
      );
      setSelectedEstimate((prev) =>
        prev?.id === requestId ? { ...prev, status: updated.status } : prev
      );
    }
  };

  const handleShopEstimateUpdate = async (
    requestId: string,
    status: EstimateRequest["status"],
    responseMessage?: string
  ) => {
    if (!providerUserId) return;
    const result = await updateEstimateRequest(requestId, status, providerUserId, responseMessage);
    if (result) {
      setShopEstimateRequests((prev) =>
        prev.map((r) =>
          r.id === requestId
            ? { ...r, status, response_message: responseMessage ?? r.response_message }
            : r
        )
      );
    }
  };

  return {
    enrichedUserReports,
    shopInsurerReports,
    shopInsurerReportsLoading,
    usingSeedFallback,
    shopSubmittedBids,
    shopBidReportIdsArray,
    shopEstimateRequests,
    shopEstimatesLoading,
    customerEstimateRequests,
    selectedEstimate,
    setSelectedEstimate,
    estimateActionLoading,
    handleCustomerEstimateResponse,
    handleShopEstimateUpdate,
    refetchMarketplace,
  };
}
