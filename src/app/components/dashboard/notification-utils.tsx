import { AlertCircle, Bell, DollarSign, FileText, Package, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { Notification } from "../../types";

type NotificationIconComponent = ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
>;

type NotificationVisual = {
  icon: NotificationIconComponent;
  iconClassName: string;
  badgeClassName: string;
  label: string;
};

const notificationVisuals: Record<Notification["type"], NotificationVisual> = {
  repair_request: {
    icon: AlertCircle,
    iconClassName: "text-blue-500",
    badgeClassName: "bg-blue-500/15 text-blue-200 border-blue-400/20",
    label: "Repair request",
  },
  bid: {
    icon: DollarSign,
    iconClassName: "text-emerald-400",
    badgeClassName: "bg-emerald-500/15 text-emerald-200 border-emerald-400/20",
    label: "New bid",
  },
  claim: {
    icon: FileText,
    iconClassName: "text-violet-400",
    badgeClassName: "bg-violet-500/15 text-violet-200 border-violet-400/20",
    label: "Claim update",
  },
  update: {
    icon: Package,
    iconClassName: "text-amber-400",
    badgeClassName: "bg-amber-500/15 text-amber-200 border-amber-400/20",
    label: "Platform update",
  },
  message: {
    icon: Bell,
    iconClassName: "text-slate-400",
    badgeClassName: "bg-slate-500/15 text-slate-200 border-slate-400/20",
    label: "Message",
  },
};

export function getNotificationVisual(type: Notification["type"] = "message") {
  return notificationVisuals[type] ?? notificationVisuals.message;
}

export function getNotificationDestination(
  notification: Notification,
  userType: "customer" | "shop" | "insurer"
) {
  if (notification.type === "repair_request" && userType === "shop") {
    return "requests";
  }

  if (notification.type === "bid" && userType === "customer") {
    return "bids";
  }

  if (notification.type === "claim" && userType === "insurer") {
    return "claims";
  }

  if (notification.type === "update") {
    return "home";
  }

  return undefined;
}
