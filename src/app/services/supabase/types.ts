export interface Profile {
  id?: string;
  user_id?: string;
  email: string;
  name: string;
  phone?: string;
  profile_image_url?: string;
  account_type: "customer" | "shop" | "insurer";
  setup_completed?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  is_admin?: boolean;
}

export interface Vehicle {
  id?: string;
  user_id?: string;
  make: string;
  model: string;
  year: number;
  color?: string;
  license_plate?: string;
  vin?: string;
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DamageReport {
  id?: string;
  user_id?: string;
  vehicle_id?: string;
  bids?: Bid[];
  vehicle_make: string;
  vehicle_model: string;
  vehicle_year: number;
  damage_type: string;
  damage_severity: string;
  damage_description?: string;
  damage_location: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  photo_urls?: string[];
  insurance_claim?: boolean;
  insurance_company?: string;
  preferred_contact?: string;
  additional_notes?: string;
  status?: string;
  claim_status?: string;
  approved_amount?: number;
  denial_reason?: string;
  claim_decision_date?: string;
  claim_decided_by?: string;
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  bids_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Bid {
  id?: string;
  user_id?: string | null;
  shop_id?: string | null;
  shop_user_id?: string | null;
  clerk_shop_user_id?: string | null;
  damage_report_id?: string;
  report_id?: string;
  shop_name?: string | null;
  shop_email?: string | null;
  amount: number;
  estimated_days: number;
  description?: string | null;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  shop_rating?: number | null;
  shop_reviews?: number | null;
  shop_distance?: string | null;
  shop_latitude?: number | null;
  shop_longitude?: number | null;
  shop_phone?: string | null;
  shop_address?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface ShopInterestSubmission {
  id?: string;
  shop_name: string;
  dmv_registration_number: string;
  contact_person: string;
  email: string;
  phone_number: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  status?: "submitted" | "reviewing" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

export interface InsurerInterestSubmission {
  id?: string;
  company_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  notes?: string;
  status?: "submitted" | "reviewing" | "approved" | "rejected";
  created_at?: string;
  updated_at?: string;
}

export interface PlatformActivityEvent {
  id?: string;
  event_type: string;
  source?: string;
  payload?: Record<string, unknown>;
  created_at?: string;
}

export interface JobAssignment {
  id?: string;
  damage_report_id: string;
  customer_user_id: string;
  shop_user_id: string;
  insurer_user_id?: string;
  bid_id?: string;
  status?: "scheduled" | "in_progress" | "awaiting_parts" | "completed" | "cancelled";
  scheduled_start_at?: string;
  estimated_completion_at?: string;
  completed_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PartnerShopMapRecord {
  id: string;
  shop_name: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  latitude?: number | null;
  longitude?: number | null;
  rating?: number | null;
  specialties?: string[] | null;
  phone_number?: string | null;
  email?: string | null;
  is_active?: boolean | null;
}
