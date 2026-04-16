import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { DamageReport } from "../../types";

export type AccountScreenProps = {
  userType: string;
  primaryColor?: string;
  appearanceMode?: DashboardAppearanceMode;
  userName?: string;
  userEmail?: string;
  userPhone?: string;
  profileImage?: string;
  vehicles?: { id?: string; make: string; model: string; year: string | number }[];
  reports?: DamageReport[];
  websiteIdentity?: WebsiteIdentity | null;
  onDeleteAccount?: () => Promise<void> | void;
  onLogout?: () => Promise<void> | void;
  onOpenSmokeTest?: () => void;
  onSaveProfile?: (data: {
    name: string;
    email: string;
    phone: string;
    profileImage?: string;
  }) => Promise<void> | void;
  onViewVehicles?: () => void;
  onViewReport?: (reportId: string) => void;
};

export const TEST_ACCOUNT_EMAILS = [
  "customer.test@bidondent.com",
  "shop.test@bidondent.com",
  "insurer.test@bidondent.com",
] as const;
