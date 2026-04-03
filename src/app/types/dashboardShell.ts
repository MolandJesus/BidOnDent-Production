import type { RefObject } from "react";
import type { Bid, Notification, Report, Vehicle } from "../../types";

/** Shared profile shape used by DashboardLayout, DashboardSidebar, DashboardHeader, LandingPageLayout */
export type ProfileDropdownData = {
  userType: "customer" | "shop" | "insurer";
  notifications?: Notification[];
  notificationSyncActive?: boolean;
  reports: Report[];
  vehicles: Vehicle[];
  bids: Bid[];
  onNavigate: (destination: string, tab?: string) => void;
  onLogout: () => void;
  forwardedRef: RefObject<HTMLDivElement | null>;
};

/** Shared user profile shape used by dashboard shell components */
export type UserProfile = {
  name: string;
  email: string;
  user_type: string;
  phone?: string;
};
