// Type definitions for BidOnDent application

export interface UserInfo {
  name: string;
  email: string;
  profileImage: string;
}

export interface Vehicle {
  id: string;
  year: string;
  make: string;
  model: string;
  vin?: string;
  licensePlate?: string;
  color?: string;
}

export interface DamageReport {
  id: string;
  vehicleId: string;
  vehicleInfo: {
    year: string;
    make: string;
    model: string;
    vin?: string;
  };
  damageAreas: string[];
  photos: string[];
  description: string;
  damageDescription?: string;
  status: "pending" | "in-review" | "active" | "completed" | "resolved";
  createdAt: string;
  submittedAt?: string;
  address?: string;
  city?: string;
  state?: string;
  damageArea?: string;
  incident?: string;
  zipCode?: string;
  zip_code?: string;
  damageType?: string;
  claimNumber?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  policyNumber?: string;
  bidAmount?: number;
  bidsCount?: number;
  vehicle?: { year?: string; make?: string; model?: string; vin?: string };
  bids?: Bid[];
  repairStatus?: string;
  assignmentId?: string;
  claimStatus?: string;
  approvedAmount?: number;
  denialReason?: string;
  claimDecisionDate?: string;
}

export interface Bid {
  id: string;
  shopId: string;
  shopName: string;
  shopEmail: string;
  reportId: string;
  amount: number;
  estimatedDays: number;
  description: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  shopRating?: number;
  shopReviews?: number;
  shopDistance?: string;
  shopLatitude?: number;
  shopLongitude?: number;
}

export interface Notification {
  id: number | string;
  type: "bid" | "update" | "message" | "repair_request" | "claim";
  message: string;
  time: string;
  read: boolean;
  createdAt?: string;
  reportData?: Record<string, unknown> | DamageReport | Bid;
}

export interface Activity {
  id: string;
  type:
    | "bid_submitted"
    | "request_viewed"
    | "job_accepted"
    | "claim_created"
    | "shop_added"
    | "claim_opened"
    | "claim_in_progress"
    | "claim_approved"
    | "claim_denied"
    | "new_user";
  message: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RedirectInfo {
  type: "customer" | "shop" | "insurer";
  email?: string;
  isReturning?: boolean;
}

export type ViewMode =
  | "dashboard"
  | "reports-list"
  | "report-detail"
  | "insurer-connect"
  | "liked-shops"
  | "shop-directory"
  | "insurance-companies"
  | "competitor-analysis"
  | "vehicles"
  | "new-claim"
  | "smoke-test"
  | "demo-switcher";

export type LoginView = "main" | "login" | "signup" | "customer" | "shop" | "insurer";

export interface NavTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string; size?: number }>;
}

export interface UserData {
  userInfo: UserInfo;
  vehicles: Vehicle[];
  reports: DamageReport[];
  bids: Bid[];
  userPhone: string;
  redirectInfo: RedirectInfo;
  notifications: Notification[];
  hasSeenPhotoGuide: boolean;
  photoStorage?: Record<string, string[]>;
  activities?: Activity[];
}

export interface ShopOnboardingFormData {
  shopName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  hours: string;
  certifications: string[];
  specialties: string[];
  insurance: boolean;
  estimates: boolean;
}

export interface InsurerOnboardingFormData {
  companyName: string;
  licenseNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  website: string;
  claimTypes: string[];
  preferredShops: boolean;
  autoApproval: boolean;
  maxClaimAmount: string;
}
