import type { Bid, DamageReport, Notification, RedirectInfo } from "../../types";

const MAX_NOTIFICATION_ITEMS = 50;

function normalizeCreatedAt(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

export function formatRelativeTimestamp(dateValue?: string) {
  const normalized = normalizeCreatedAt(dateValue);
  if (!normalized) {
    return "Just now";
  }

  const date = new Date(normalized);
  const deltaMs = Date.now() - date.getTime();
  const deltaMinutes = Math.max(1, Math.round(deltaMs / 60000));

  if (deltaMinutes < 60) {
    return `${deltaMinutes} min ago`;
  }

  const deltaHours = Math.round(deltaMinutes / 60);
  if (deltaHours < 24) {
    return `${deltaHours} hr ago`;
  }

  const deltaDays = Math.round(deltaHours / 24);
  return `${deltaDays} day${deltaDays === 1 ? "" : "s"} ago`;
}

function sortNotifications(notifications: Notification[]) {
  return [...notifications].sort((left, right) => {
    const leftTime = normalizeCreatedAt(left.createdAt);
    const rightTime = normalizeCreatedAt(right.createdAt);
    return rightTime.localeCompare(leftTime);
  });
}

export function mergeNotifications(existing: Notification[], incoming: Notification[]) {
  const sanitizedExisting = existing.filter(
    (notification) =>
      typeof notification.id === "string" ||
      Boolean(notification.createdAt) ||
      Boolean(notification.reportData)
  );
  const existingMap = new Map(
    sanitizedExisting.map((notification) => [`${notification.id}`, notification])
  );
  const merged = new Map<string, Notification>();

  for (const notification of [...incoming, ...sanitizedExisting]) {
    const key = `${notification.id}`;
    const current = merged.get(key);
    const existingMatch = existingMap.get(key);

    merged.set(key, {
      ...(current || {}),
      ...notification,
      read: existingMatch?.read ?? current?.read ?? notification.read,
      createdAt: normalizeCreatedAt(notification.createdAt || current?.createdAt),
    });
  }

  return sortNotifications(Array.from(merged.values())).slice(0, MAX_NOTIFICATION_ITEMS);
}

export function buildNotificationsSnapshot(args: {
  userType?: RedirectInfo["type"];
  reports: DamageReport[];
  bids: Bid[];
  existingNotifications?: Notification[];
}) {
  const { userType, reports, bids, existingNotifications = [] } = args;
  const snapshot: Notification[] = [];

  if (userType === "customer") {
    for (const bid of bids) {
      snapshot.push({
        id: `bid-${bid.id}`,
        type: "bid",
        message: `${bid.shopName || "Auto Shop"} submitted a $${Number(bid.amount || 0).toLocaleString()} bid on your report`,
        time: formatRelativeTimestamp(bid.createdAt),
        createdAt: normalizeCreatedAt(bid.createdAt),
        read: false,
        reportData: bid,
      });
    }

    for (const report of reports) {
      if (report.status && report.status !== "pending") {
        snapshot.push({
          id: `report-status-${report.id}-${report.status}`,
          type: "update",
          message:
            `Your report for ${report.vehicleInfo?.year || ""} ${report.vehicleInfo?.make || ""} ${report.vehicleInfo?.model || ""}`.trim() +
            ` moved to ${report.status.replace("-", " ")}`,
          time: formatRelativeTimestamp(report.submittedAt || report.createdAt),
          createdAt: normalizeCreatedAt(report.submittedAt || report.createdAt),
          read: false,
          reportData: report,
        });
      }
    }
  }

  if (userType === "shop") {
    for (const report of reports) {
      snapshot.push({
        id: `repair-request-${report.id}`,
        type: "repair_request",
        message:
          `Open repair request: ${report.vehicleInfo?.year || ""} ${report.vehicleInfo?.make || ""} ${report.vehicleInfo?.model || ""}`.trim(),
        time: formatRelativeTimestamp(report.submittedAt || report.createdAt),
        createdAt: normalizeCreatedAt(report.submittedAt || report.createdAt),
        read: false,
        reportData: report,
      });
    }

    for (const bid of bids.filter((entry) => entry.status !== "pending")) {
      snapshot.push({
        id: `shop-bid-status-${bid.id}-${bid.status}`,
        type: "update",
        message: `Your bid from ${bid.shopName || "your shop"} is ${bid.status}`,
        time: formatRelativeTimestamp(bid.createdAt),
        createdAt: normalizeCreatedAt(bid.createdAt),
        read: false,
        reportData: bid,
      });
    }
  }

  if (userType === "insurer") {
    for (const report of reports) {
      snapshot.push({
        id: `claim-${report.id}`,
        type: "claim",
        message:
          `Claim review item: ${report.vehicleInfo?.year || ""} ${report.vehicleInfo?.make || ""} ${report.vehicleInfo?.model || ""}`.trim(),
        time: formatRelativeTimestamp(report.submittedAt || report.createdAt),
        createdAt: normalizeCreatedAt(report.submittedAt || report.createdAt),
        read: false,
        reportData: report,
      });
    }
  }

  return mergeNotifications(existingNotifications, snapshot);
}
