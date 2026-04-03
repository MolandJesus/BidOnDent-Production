import type { ClaimShop, Policyholder } from "./newClaimData";
import type { ClaimFormData } from "./InsurerNewClaimForm";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";
import type { Report } from "../../../types";

export type InsurerNewClaimScreenProps = {
  primaryColor?: string;
  reports?: Report[];
  onBack?: () => void;
  onCreateClaim?: (
    claimData: { customer: Policyholder; shop: ClaimShop | null } & ClaimFormData
  ) => void;
  appearanceMode?: DashboardAppearanceMode;
};

export const INITIAL_CLAIM_FORM_DATA: ClaimFormData = {
  policyNumber: "",
  incidentDate: "",
  damageDescription: "",
  estimatedAmount: "",
  priority: "medium",
};
