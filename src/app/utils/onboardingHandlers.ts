import type { ShopOnboardingFormData, InsurerOnboardingFormData } from "../types";

export type SaveBusinessProfileFn = (data: Record<string, unknown>) => Promise<void>;

/**
 * Build the payload and persist a new shop business profile from onboarding form data.
 */
export async function completeShopOnboarding(
  data: ShopOnboardingFormData,
  saveBusinessProfile: SaveBusinessProfileFn
): Promise<void> {
  await saveBusinessProfile({
    aboutSummary: `${data.shopName} is now part of the BidOnDent network for ${data.city}, ${data.state}.`,
    acceptsInsuranceClaims: !!data.insurance,
    averageRating: 4.7,
    averageTicketValue: data.specialties?.includes("Luxury Vehicles") ? 1050 : 890,
    businessAddress: data.address,
    businessCity: data.city,
    businessHours: data.hours,
    businessName: data.shopName,
    businessPhone: data.phone,
    businessState: data.state,
    businessZip: data.zip,
    certifications: data.certifications || [],
    completionRate: 95,
    insurerPrograms: data.insurance ? ["Progressive", "State Farm"] : [],
    isAcceptingBids: true,
    isDirectoryVisible: true,
    offersEstimates: !!data.estimates,
    profileImageUrl: null,
    responseTimeHours: 3,
    specialties: data.specialties || [],
    supportedMakes: [],
    totalReviews: 0,
    website: data.website || null,
  });
}

/**
 * Build the payload and persist a new insurer business profile from onboarding form data.
 */
export async function completeInsurerOnboarding(
  data: InsurerOnboardingFormData,
  saveBusinessProfile: SaveBusinessProfileFn
): Promise<void> {
  await saveBusinessProfile({
    accountConnectionNotes: [
      "Provider-agnostic insurer profile created from onboarding",
      data.autoApproval
        ? "Auto-approval is enabled for qualified claims"
        : "Manual review stays in place for higher-touch claims",
    ],
    autoApproval: !!data.autoApproval,
    benefits: ["Claims routing", "Repair-network coordination"],
    claimTypes: data.claimTypes || [],
    companyAddress: data.address,
    companyCity: data.city,
    companyName: data.companyName,
    companyPhone: data.phone,
    companyState: data.state,
    companyZip: data.zip,
    description: `${data.companyName} is now available in the BidOnDent insurer directory.`,
    digitalClaimsExperience: data.autoApproval ? "excellent" : "strong",
    isDirectoryVisible: true,
    licenseNumber: data.licenseNumber,
    licenseState: data.state,
    maxClaimAmount: data.maxClaimAmount ? Number(data.maxClaimAmount) : null,
    popular: false,
    preferredShops: !!data.preferredShops,
    profileImageUrl: null,
    repairProgramFocus: data.claimTypes || [],
    website: data.website || null,
  });
}
