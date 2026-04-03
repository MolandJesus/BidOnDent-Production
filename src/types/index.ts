/**
 * Centralized Type Definitions
 * All shared TypeScript interfaces and types for the BidOnDent application
 */

// ============================================================================
// Authentication & User Types
// ============================================================================

export type UserType = "customer" | "shop" | "insurer" | "admin";

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  accountType: UserType;
  avatar_url?: string;
  created_at?: string;
  setupCompleted?: boolean;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  loading: boolean;
  error?: string;
}

// ============================================================================
// Report & Damage Types
// ============================================================================

export type ReportStatus = "pending" | "in-review" | "active" | "completed" | "closed";

export interface Report {
  id: number;
  userId: string;
  damageArea: string;
  damageType?: string;
  location?: string;
  description?: string;
  photos: string[];
  submittedAt: string;
  status: ReportStatus;
  vehicle?: VehicleInfo;
  bidsCount?: number;
  [key: string]: any;
}

export interface VehicleInfo {
  year?: string;
  make?: string;
  model?: string;
  vin?: string;
  color?: string;
}

// ============================================================================
// Bid & Shop Types
// ============================================================================

export interface Bid {
  id: string;
  reportId: string;
  shopId: string;
  amount: number;
  estimatedDays: number;
  description: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website?: string;
  rating: number;
  certifications: string[];
  specialties: string[];
  canDoInsurance: boolean;
  canDoEstimates: boolean;
}

export interface PartnerShop {
  id: string;
  name: string;
  rating: number;
  reviews: number;
  distance: string;
  certifications: string[];
  specialties: string[];
  status: "active" | "pending" | "inactive";
  activeReports: number;
}

// ============================================================================
// Insurer & Claims Types
// ============================================================================

export type ClaimStatus = "pending" | "reviewing" | "approved" | "denied";

export interface Claim {
  id: number;
  claimNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  policyNumber: string;
  vehicle: string;
  vin: string;
  damageType: string;
  incidentDate: string;
  reportedDate: string;
  estimatedDamage: number;
  location: string;
  status: ClaimStatus;
  priority: "low" | "medium" | "high";
  photoCount: number;
  description: string;
  shopAssigned?: string;
  shopContact?: string;
  approvedAmount?: number;
  approvalDate?: string;
  denialReason?: string;
}

export interface InsuranceCompany {
  id: string;
  name: string;
  phone: string;
  email: string;
  website?: string;
  activePartners: number;
  totalClaims: number;
}

// ============================================================================
// Intake & Submission Types
// ============================================================================

export type SubmissionStatus = "submitted" | "reviewing" | "approved" | "rejected";

export interface ShopSubmission {
  id: string;
  shopName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  website?: string;
  status: SubmissionStatus;
  submittedAt: string;
  notes?: string;
}

export interface InsurerSubmission {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  status: SubmissionStatus;
  submittedAt: string;
  notes?: string;
}

// ============================================================================
// Form Types
// ============================================================================

export interface ShopForm {
  name: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

export interface InsurerForm {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  notes?: string;
}

// ============================================================================
// Map & Geolocation Types
// ============================================================================

export type Coordinates = {
  latitude: number;
  longitude: number;
};

export interface PartnerShopMapRecord {
  id: string;
  name: string;
  coordinates: Coordinates;
  rating: number;
  specialties: string[];
  distance?: number;
}

export interface LocationData {
  zip: string;
  coordinates: Coordinates;
  county?: string;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface BaseScreenProps {
  primaryColor?: string;
  secondaryColor?: string;
  onBack?: () => void;
}

export interface ListScreenProps extends BaseScreenProps {
  items: any[];
  onItemClick?: (item: any) => void;
}

// ============================================================================
// API & Service Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ============================================================================
// Workflow & Activity Types
// ============================================================================

export interface WorkflowEvent {
  id: string;
  type: string;
  timestamp: string;
  actor?: string;
  description: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  timestamp: string;
  details?: Record<string, unknown>;
}

// ============================================================================
// Environment & Configuration Types
// ============================================================================

export interface AppConfig {
  apiBasePath: string;
  environment: "development" | "staging" | "production";
  debug: boolean;
  features: {
    realtimeBids: boolean;
    crossAccountMessaging: boolean;
    advancedAnalytics: boolean;
  };
}

// Supabase types are imported separately via src/app/services/supabase/types
// Do NOT re-export them here to avoid naming conflicts (Bid, Vehicle, DamageReport, etc.)
