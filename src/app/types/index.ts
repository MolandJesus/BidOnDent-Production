// Type definitions for Bidondent application

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
  };
  damageAreas: string[];
  photos: string[];
  description: string;
  status: 'pending' | 'in-review' | 'completed';
  createdAt: string;
  bids?: Bid[];
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
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  shopRating?: number;
  shopReviews?: number;
  shopDistance?: string;
}

export interface Notification {
  id: number;
  type: 'bid' | 'update' | 'message';
  message: string;
  time: string;
  read: boolean;
}

export interface Activity {
  id: string;
  type: 'bid_submitted' | 'request_viewed' | 'job_accepted' | 'claim_created' | 'shop_added';
  message: string;
  timestamp: string;
  metadata?: {
    reportId?: string;
    bidAmount?: number;
    vehicleInfo?: string;
    [key: string]: any;
  };
}

export interface RedirectInfo {
  type: 'customer' | 'shop' | 'insurer';
  isReturning?: boolean;
}

export type ViewMode = 
  | 'dashboard' 
  | 'reports-list' 
  | 'report-detail' 
  | 'insurer-connect' 
  | 'liked-shops' 
  | 'vehicles' 
  | 'new-claim'
  | 'smoke-test'
  | 'demo-switcher';

export type LoginView = 
  | 'main' 
  | 'signup' 
  | 'customer' 
  | 'shop' 
  | 'insurer';

export interface NavTab {
  id: string;
  label: string;
  icon: any;
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
  activities?: Activity[];
}