export interface ShopBusinessProfile {
  id?: string;
  websiteUserKey: string;
  clerkUserId?: string | null;
  businessName: string;
  businessAddress: string;
  businessCity: string;
  businessState: string;
  businessZip: string;
  businessPhone: string;
  website?: string | null;
  businessHours?: string | null;
  certifications: string[];
  specialties: string[];
  acceptsInsuranceClaims: boolean;
  offersEstimates: boolean;
  insurerPrograms: string[];
  supportedMakes: string[];
  averageRating?: number | null;
  totalReviews?: number | null;
  isAcceptingBids: boolean;
  averageTicketValue?: number | null;
  responseTimeHours?: number | null;
  completionRate?: number | null;
  profileImageUrl?: string | null;
  aboutSummary?: string | null;
  geoLatitude?: number | null;
  geoLongitude?: number | null;
  isDirectoryVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface InsurerBusinessProfile {
  id?: string;
  websiteUserKey: string;
  clerkUserId?: string | null;
  companyName: string;
  companyAddress: string;
  companyCity: string;
  companyState: string;
  companyZip: string;
  companyPhone: string;
  licenseNumber?: string | null;
  licenseState?: string | null;
  website?: string | null;
  claimTypes: string[];
  preferredShops: boolean;
  autoApproval: boolean;
  maxClaimAmount?: number | null;
  description?: string | null;
  repairProgramFocus: string[];
  benefits: string[];
  accountConnectionNotes: string[];
  digitalClaimsExperience: "standard" | "strong" | "excellent";
  popular: boolean;
  profileImageUrl?: string | null;
  isDirectoryVisible: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface DirectoryInventory {
  shops: ShopBusinessProfile[];
  insurers: InsurerBusinessProfile[];
}
