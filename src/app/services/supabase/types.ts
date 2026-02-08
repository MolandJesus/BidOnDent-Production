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
  photo_urls?: string[];
  insurance_claim?: boolean;
  insurance_company?: string;
  preferred_contact?: string;
  additional_notes?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Bid {
  id?: string;
  user_id?: string;
  shop_id?: string;
  report_id: string;
  shop_name: string;
  shop_email: string;
  amount: number;
  estimated_days: number;
  description: string;
  notes?: string;
  status: "pending" | "accepted" | "rejected";
  shop_rating?: number;
  shop_reviews?: number;
  shop_distance?: string;
  created_at?: string;
  updated_at?: string;
}
