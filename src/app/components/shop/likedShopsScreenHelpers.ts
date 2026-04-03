import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { WebsiteIdentity } from "../../services/auth/websiteIdentity";

export type LikedShopsScreenProps = {
  onBack: () => void;
  onOpenMap?: () => void;
  primaryColor?: string;
  secondaryColor?: string;
  identity?: WebsiteIdentity | null;
  appearanceMode?: DashboardAppearanceMode;
};
