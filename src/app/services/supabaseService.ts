// Supabase service functions for Bidondent
import { projectId, publicAnonKey } from "../../../utils/supabase/info";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================================================
// SINGLETON SUPABASE CLIENT - HOT RELOAD RESISTANT
// ============================================================================
declare global {
  interface Window {
    __bidondent_supabase__?: SupabaseClient;
  }
}

// Get or create singleton - check window FIRST to survive hot reloads
function getSupabaseClient(): SupabaseClient {
  if (typeof window !== 'undefined') {
    // Return existing if available
    if (window.__bidondent_supabase__) {
      return window.__bidondent_supabase__;
    }
    
    // Create only if doesn't exist
    console.log('🔵 Initializing Supabase client (first time)');
    const client = createClient(
      `https://${projectId}.supabase.co`,
      publicAnonKey,
      {
        auth: {
          storageKey: 'bidondent-auth-token',
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storage: window.localStorage,
          debug: false
        },
        global: {
          headers: {
            'X-Client-Info': 'bidondent-app'
          }
        }
      }
    );
    
    window.__bidondent_supabase__ = client;
    return client;
  }
  
  // SSR fallback (shouldn't happen in browser app)
  throw new Error('Supabase requires browser environment');
}

// Initialize immediately on first module load
export const supabase = getSupabaseClient();

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface Profile {
  id?: string;
  user_id?: string;
  email: string;
  name: string;
  phone?: string;
  profile_image_url?: string;
  account_type: 'customer' | 'shop' | 'insurer';
  setup_completed?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  // Add is_admin field
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

// ============================================================================
// BID OPERATIONS
// ============================================================================

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
  status: 'pending' | 'accepted' | 'rejected';
  shop_rating?: number;
  shop_reviews?: number;
  shop_distance?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all bids for a specific damage report
 * @param reportId - ID of the damage report
 * @returns Array of bids
 */
export async function getBidsForReport(reportId: string): Promise<Bid[]> {
  try {
    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('report_id', reportId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching bids:', error);
      return [];
    }

    return data as Bid[];
  } catch (error) {
    console.error('Error in getBidsForReport:', error);
    return [];
  }
}

/**
 * Submit a bid for a damage report (shop users)
 * @param bid - Bid details
 * @returns Created bid or null if failed
 */
export async function submitBid(bid: Bid): Promise<Bid | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('bids')
      .insert({
        user_id: user.id,
        shop_id: user.id,
        report_id: bid.report_id,
        shop_name: bid.shop_name,
        shop_email: bid.shop_email,
        amount: bid.amount,
        estimated_days: bid.estimated_days,
        description: bid.description,
        notes: bid.notes,
        status: 'pending',
        shop_rating: bid.shop_rating,
        shop_reviews: bid.shop_reviews,
        shop_distance: bid.shop_distance
      })
      .select()
      .single();

    if (error) {
      console.error('Error submitting bid:', error);
      return null;
    }

    console.log('✅ Bid submitted successfully');
    return data as Bid;
  } catch (error) {
    console.error('Error in submitBid:', error);
    return null;
  }
}

/**
 * Update bid status (customer accepts/rejects)
 * @param bidId - ID of the bid
 * @param status - New status
 * @returns Updated bid or null if failed
 */
export async function updateBidStatus(
  bidId: string,
  status: 'accepted' | 'rejected'
): Promise<Bid | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('User not authenticated');
      return null;
    }

    const { data, error } = await supabase
      .from('bids')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', bidId)
      .select()
      .single();

    if (error) {
      console.error('Error updating bid status:', error);
      return null;
    }

    console.log(`✅ Bid status updated to ${status}`);
    return data as Bid;
  } catch (error) {
    console.error('Error in updateBidStatus:', error);
    return null;
  }
}

/**
 * Get all bids submitted by current user (shop view)
 * @returns Array of bids
 */
export async function getMyBids(): Promise<Bid[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from('bids')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my bids:', error);
      return [];
    }

    return data as Bid[];
  } catch (error) {
    console.error('Error in getMyBids:', error);
    return [];
  }
}

/**
 * Delete a bid
 * @param bidId - ID of bid to delete
 * @returns True if successful
 */
export async function deleteBid(bidId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }

    const { error } = await supabase
      .from('bids')
      .delete()
      .eq('id', bidId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting bid:', error);
      return false;
    }

    console.log('✅ Bid deleted successfully');
    return true;
  } catch (error) {
    console.error('Error in deleteBid:', error);
    return false;
  }
}

// ============================================================================
// PROFILE OPERATIONS
// ============================================================================

/**
 * Get user profile from database
 * @param email - User's email address
 * @returns Profile data or null if not found
 */
export async function getProfile(email: string): Promise<Profile | null> {
  try {
    console.log('🔍 Fetching profile for:', email);
    
    // Add a timeout to prevent hanging
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => {
        console.log('⏱️ Profile fetch timed out after 5 seconds');
        resolve(null);
      }, 5000);
    });
    
    const fetchPromise = supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .single();
    
    const result = await Promise.race([fetchPromise, timeoutPromise]);
    
    // If timeout occurred
    if (result === null) {
      console.log('⚠️ Profile fetch timed out - continuing without profile');
      return null;
    }
    
    const { data, error } = result as any;

    if (error) {
      // If profile doesn't exist, return null (not an error)
      if (error.code === 'PGRST116') {
        console.log('ℹ️ No profile found for', email);
        return null;
      }
      // If table doesn't exist, return null
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.log('ℹ️ Profiles table not set up yet - using local storage');
        return null;
      }
      console.error('Error fetching profile:', error);
      return null;
    }

    console.log('✅ Profile loaded from database');
    
    // 🔐 AUTO-UPGRADE: If this is bidondent@gmail.com and NOT already admin, upgrade it
    const profile = data as Profile;
    if (email.toLowerCase() === 'bidondent@gmail.com' && !profile.is_admin) {
      console.log('👑 Auto-upgrading bidondent@gmail.com to admin status...');
      try {
        await supabase
          .from('profiles')
          .update({ is_admin: true })
          .eq('email', email);
        
        profile.is_admin = true;
        console.log('✅ Profile upgraded to admin');
      } catch (upgradeError) {
        console.error('⚠️ Failed to upgrade to admin (will try again on next login):', upgradeError);
      }
    }
    
    return profile;
  } catch (error) {
    console.error('Error in getProfile:', error);
    return null;
  }
}

/**
 * Create or update user profile in database
 * @param profile - Profile data to save
 * @returns True if save was successful, false otherwise
 */
export async function saveProfile(profile: Profile): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Cannot save profile: User not authenticated');
      return false;
    }

    // First, get the current user's profile to see if they exist
    const { data: currentProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();  // Use maybeSingle() to avoid error if not found

    // If no current profile exists, check if email is taken by another user
    if (!currentProfile) {
      const { data: emailTaken } = await supabase
        .from('profiles')
        .select('user_id, email')
        .eq('email', profile.email)
        .maybeSingle();  // Use maybeSingle() to avoid error if not found
      
      // If email is taken by a different user, we cannot use that email
      if (emailTaken && emailTaken.user_id !== user.id) {
        console.error(`❌ Email ${profile.email} is already in use by another account`);
        // This is a conflict - the email belongs to a different user_id
        // This can happen when user switches auth providers (e.g., email -> Google)
        // Just silently skip saving - the user can continue with their session
        return false;
      }
    }

    // Now upsert using user_id as the conflict key
    const profileData: any = {
      user_id: user.id,
      email: profile.email,
      name: profile.name,
      phone: profile.phone || null,
      profile_image_url: profile.profile_image_url || null,
      account_type: profile.account_type,
      // Automatically set is_admin for bidondent@gmail.com
      is_admin: profile.email.toLowerCase() === 'bidondent@gmail.com'
    };
    
    // Only include setup_completed if explicitly provided
    if (profile.setup_completed !== undefined) {
      profileData.setup_completed = profile.setup_completed;
    }
    
    // First, check if a profile with this email already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('user_id, email')
      .eq('email', profile.email)
      .maybeSingle();
    
    // If email exists with different user_id, delete the old one first
    if (existingProfile && existingProfile.user_id !== profile.user_id) {
      console.log(`🔄 Email ${profile.email} exists with different user_id - cleaning up old profile...`);
      await supabase
        .from('profiles')
        .delete()
        .eq('email', profile.email)
        .neq('user_id', profile.user_id);
    }
    
    const { error } = await supabase
      .from('profiles')
      .upsert(profileData, {
        onConflict: 'user_id'  // Use user_id since that's what RLS checks
      });

    if (error) {
      // If we still get a unique constraint violation on email, log but don't fail
      if (error.code === '23505' && error.message.includes('profiles_email_key')) {
        console.warn(`⚠️ Email conflict detected for ${profile.email} - attempting to resolve...`);
        
        // Try to delete conflicting profile and retry
        await supabase
          .from('profiles')
          .delete()
          .eq('email', profile.email)
          .neq('user_id', profile.user_id);
        
        // Retry the upsert
        const { error: retryError } = await supabase
          .from('profiles')
          .upsert(profileData, {
            onConflict: 'user_id'
          });
        
        if (retryError) {
          console.error('Error saving profile after retry:', retryError);
          return false;
        }
        
        console.log('✅ Profile saved after resolving conflict');
        return true;
      }
      
      console.error('Error saving profile:', error);
      return false;
    }

    console.log('✅ Profile saved to database');
    return true;
  } catch (error) {
    console.error('Error in saveProfile:', error);
    return false;
  }
}

/**
 * Mark user setup as completed
 * @param email - User's email address
 * @returns True if update was successful
 */
export async function markSetupCompleted(email: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('❌ Cannot mark setup completed: User not authenticated');
      return false;
    }

    const { error } = await supabase
      .from('profiles')
      .update({ setup_completed: true })
      .eq('user_id', user.id)
      .eq('email', email);

    if (error) {
      console.error('Error marking setup completed:', error);
      return false;
    }

    console.log('✅ Setup marked as completed for:', email);
    return true;
  } catch (error) {
    console.error('Error in markSetupCompleted:', error);
    return false;
  }
}

// ============================================================================
// VEHICLE OPERATIONS
// ============================================================================

/**
 * Get all vehicles for the current user
 * @returns Array of vehicles
 */
export async function getVehicles(): Promise<Vehicle[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user');
      return [];
    }

    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, silently return empty array
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.log('ℹ️ Vehicles table not set up yet - using local storage');
        return [];
      }
      console.error('Error fetching vehicles:', error);
      return [];
    }

    console.log(`✅ Loaded ${data.length} vehicles from Supabase`);
    return data as Vehicle[];
  } catch (error) {
    console.error('Error in getVehicles:', error);
    return [];
  }
}

/**
 * Save a vehicle
 * @param vehicle - Vehicle data to save
 * @returns True if save was successful, false otherwise
 */
export async function saveVehicle(vehicle: Vehicle): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Silent return - user not authenticated with Supabase
      return false;
    }

    // Convert year to number if it's a string
    const yearNum = typeof vehicle.year === 'string' ? parseInt(vehicle.year, 10) : vehicle.year;

    // Validate UUID format - if ID exists but isn't a valid UUID, treat as new vehicle
    // Valid UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const hasValidId = vehicle.id && uuidRegex.test(vehicle.id);

    if (hasValidId) {
      // Update existing vehicle
      console.log('🔄 Updating vehicle with ID:', vehicle.id);
      const { error } = await supabase
        .from('vehicles')
        .update({
          make: vehicle.make,
          model: vehicle.model,
          year: yearNum,
          color: vehicle.color,
          license_plate: vehicle.licensePlate || vehicle.license_plate,
          vin: vehicle.vin,
          image_url: vehicle.image_url
        })
        .eq('id', vehicle.id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating vehicle:', error);
        return false;
      }
    } else {
      // Insert new vehicle - database will generate UUID
      if (vehicle.id && !hasValidId) {
        console.log('⚠️ Invalid ID detected (timestamp?), creating new vehicle:', vehicle.id);
      } else {
        console.log('➕ Creating new vehicle');
      }
      
      const { error } = await supabase
        .from('vehicles')
        .insert({
          user_id: user.id,
          make: vehicle.make,
          model: vehicle.model,
          year: yearNum,
          color: vehicle.color,
          license_plate: vehicle.licensePlate || vehicle.license_plate,
          vin: vehicle.vin,
          image_url: vehicle.image_url
        });

      if (error) {
        console.error('Error inserting vehicle:', error);
        return false;
      }
    }

    console.log('✅ Vehicle saved to Supabase');
    return true;
  } catch (error) {
    console.error('Error in saveVehicle:', error);
    return false;
  }
}

/**
 * Delete a vehicle
 * @param vehicleId - ID of vehicle to delete
 * @returns True if delete was successful, false otherwise
 */
export async function deleteVehicle(vehicleId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Silent return - user not authenticated with Supabase
      return false;
    }

    const { error } = await supabase
      .from('vehicles')
      .delete()
      .eq('id', vehicleId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting vehicle:', error);
      return false;
    }

    console.log('✅ Vehicle deleted from Supabase');
    return true;
  } catch (error) {
    console.error('Error in deleteVehicle:', error);
    return false;
  }
}

// ============================================================================
// DAMAGE REPORT OPERATIONS
// ============================================================================

/**
 * Get all damage reports for the current user
 * @returns Array of damage reports
 */
export async function getDamageReports(): Promise<DamageReport[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user');
      return [];
    }

    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, silently return empty array
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.log('ℹ️ Damage reports table not set up yet - using local storage');
        return [];
      }
      console.error('Error fetching damage reports:', error);
      return [];
    }

    console.log(`✅ Loaded ${data.length} damage reports from Supabase`);
    return data as DamageReport[];
  } catch (error) {
    console.error('Error in getDamageReports:', error);
    return [];
  }
}

/**
 * Get all available damage reports (for shops to view as requests)
 * @returns Array of all damage reports across all customers
 */
export async function getAllDamageReports(): Promise<DamageReport[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log('ℹ️ No authenticated user');
      return [];
    }

    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // If table doesn't exist, silently return empty array
      if (error.code === 'PGRST205' || error.code === '42P01') {
        console.log('ℹ️ Damage reports table not set up yet - using local storage');
        return [];
      }
      console.error('Error fetching all damage reports:', error);
      return [];
    }

    console.log(`✅ Loaded ${data.length} total damage reports from Supabase`);
    return data as DamageReport[];
  } catch (error) {
    console.error('Error in getAllDamageReports:', error);
    return [];
  }
}

/**
 * Save or update a damage report
 * Uses Clerk auth and API endpoint to bypass RLS
 * @param report - The damage report to save
 * @param clerkUserId - The Clerk user ID
 * @returns The saved report with ID, or null if failed
 */
export async function saveDamageReport(report: DamageReport, clerkUserId?: string): Promise<DamageReport | null> {
  try {
    // Import Clerk hook to get user
    if (!clerkUserId) {
      console.warn('⚠️ No Clerk user ID provided to saveDamageReport');
      return null;
    }

    if (report.id) {
      // Update existing report - use Supabase directly with service role via API
      console.log('📝 Updating damage report:', report.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/reports/${report.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            clerkUserId,
            report: {
              vehicle_id: report.vehicle_id,
              vehicle_make: report.vehicle_make,
              vehicle_model: report.vehicle_model,
              vehicle_year: report.vehicle_year,
              damage_type: report.damage_type,
              damage_severity: report.damage_severity,
              damage_description: report.damage_description,
              damage_location: report.damage_location,
              address: report.address,
              city: report.city,
              state: report.state,
              zip_code: report.zip_code,
              photo_urls: report.photo_urls || [],
              insurance_claim: report.insurance_claim,
              insurance_company: report.insurance_company,
              preferred_contact: report.preferred_contact,
              additional_notes: report.additional_notes,
              status: report.status || 'pending'
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to update damage report:', errorData);
        return null;
      }

      const result = await response.json();
      console.log('✅ Damage report updated successfully');
      return result.report as DamageReport;
    } else {
      // Insert new report
      console.log('📝 Creating new damage report for user:', clerkUserId);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/reports`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            clerkUserId,
            report: {
              vehicle_id: report.vehicle_id,
              vehicle_make: report.vehicle_make,
              vehicle_model: report.vehicle_model,
              vehicle_year: report.vehicle_year,
              damage_type: report.damage_type,
              damage_severity: report.damage_severity,
              damage_description: report.damage_description,
              damage_location: report.damage_location,
              address: report.address,
              city: report.city,
              state: report.state,
              zip_code: report.zip_code,
              photo_urls: report.photo_urls || [],
              insurance_claim: report.insurance_claim,
              insurance_company: report.insurance_company,
              preferred_contact: report.preferred_contact,
              additional_notes: report.additional_notes,
              status: report.status || 'pending'
            }
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('❌ Failed to save report:', errorData.error || 'Unknown error');
        throw new Error(errorData.error || 'Failed to save report');
      }

      const result = await response.json();
      console.log('✅ Damage report created successfully');
      return result.report as DamageReport;
    }
  } catch (error) {
    console.error('Error in saveDamageReport:', error);
    throw error;
  }
}

/**
 * Delete a damage report
 * @param reportId - ID of report to delete
 * @returns True if delete was successful, false otherwise
 */
export async function deleteDamageReport(reportId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      // Silent return - user not authenticated with Supabase
      return false;
    }

    const { error } = await supabase
      .from('damage_reports')
      .delete()
      .eq('id', reportId)
      .eq('user_id', user.id);

    if (error) {
      console.error('Error deleting damage report:', error);
      return false;
    }

    console.log('✅ Damage report deleted from Supabase');
    return true;
  } catch (error) {
    console.error('Error in deleteDamageReport:', error);
    return false;
  }
}

// ============================================================================
// STORAGE OPERATIONS
// ============================================================================

/**
 * Upload a photo to Supabase Storage via server endpoint
 * @param file - File or Blob to upload
 * @param bucket - Storage bucket name ('profiles', 'vehicles', or 'damage-photos')
 * @param fileName - Optional custom file name
 * @returns Public URL of uploaded file, or null if failed
 */
export async function uploadPhoto(
  file: File | Blob,
  bucket: 'bidondent-profiles' | 'bidondent-vehicles' | 'bidondent-damage-photos',
  fileName?: string
): Promise<string | null> {
  try {
    console.log('📤 Uploading photo to Supabase Storage (using public anon key)...');
    
    // Since we're using Clerk for auth, we'll use the public anon key for uploads
    // This works because our storage buckets can be configured for public upload
    const formData = new FormData();
    formData.append('file', file);
    formData.append('bucket', bucket);
    if (fileName) {
      formData.append('fileName', fileName);
    }

    console.log(`📤 Uploading to bucket: ${bucket}`);

    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-9f243523/upload-photo`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: formData
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Server error uploading photo:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      
      return null;
    }

    const { publicUrl } = await response.json();
    console.log('✅ Photo uploaded successfully:', publicUrl);
    return publicUrl;
  } catch (error) {
    console.error('❌ Exception in uploadPhoto:', error);
    return null;
  }
}

/**
 * Delete a photo from Supabase Storage
 * @param url - Public URL of the photo to delete
 * @param bucket - Storage bucket name
 * @returns True if delete was successful, false otherwise
 */
export async function deletePhoto(
  url: string,
  bucket: 'bidondent-profiles' | 'bidondent-vehicles' | 'bidondent-damage-photos'
): Promise<boolean> {
  try {
    // Extract file path from URL
    const urlParts = url.split('/');
    const fileName = urlParts[urlParts.length - 1];
    const userId = urlParts[urlParts.length - 2];
    const filePath = `${userId}/${fileName}`;

    const { error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) {
      console.error('Error deleting photo:', error);
      return false;
    }

    console.log('✅ Photo deleted from Supabase Storage');
    return true;
  } catch (error) {
    console.error('Error in deletePhoto:', error);
    return false;
  }
}

// ============================================================================
// LEGACY FUNCTIONS (Deprecated - kept for backwards compatibility)
// ============================================================================

/**
 * Upload image to Supabase Storage (Legacy function)
 * @param base64 - Base64 encoded image string
 * @param fileName - File name/path for the image
 * @returns Public URL of uploaded file, or null if failed
 */
export async function uploadImageToSupabase(
  base64: string,
  fileName: string
): Promise<string | null> {
  try {
    // Convert base64 to blob
    const base64Data = base64.split(',')[1] || base64;
    const byteCharacters = atob(base64Data);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const blob = new Blob([byteArray], { type: 'image/jpeg' });

    const sizeInMB = blob.size / 1024 / 1024;
    console.log(`📊 Image blob size: ${sizeInMB.toFixed(2)}MB (${blob.size} bytes)`);
    
    // Check if blob is too large (Supabase free tier typically has ~2-6MB limit per file)
    // Being conservative with 2MB limit
    if (blob.size > 2 * 1024 * 1024) {
      console.error(`❌ Image too large for upload: ${sizeInMB.toFixed(2)}MB (max 2MB)`);
      console.error(`   File will be stored locally instead of cloud storage`);
      return null;
    }

    console.log(`✅ Image size acceptable, proceeding with upload...`);

    // Use the new uploadPhoto function
    return await uploadPhoto(blob, 'bidondent-damage-photos', fileName);
  } catch (error) {
    console.error('Error in uploadImageToSupabase:', error);
    return null;
  }
}

/**
 * @deprecated Use saveProfile instead
 */
export async function saveAccountTypeToSupabase(
  email: string,
  accountType: 'customer' | 'shop' | 'insurer'
): Promise<boolean> {
  console.log('ℹ️ saveAccountTypeToSupabase is deprecated, use saveProfile instead');
  return true;
}

/**
 * @deprecated Use getProfile instead
 */
export async function loadAccountTypeFromSupabase(
  email: string
): Promise<'customer' | 'shop' | 'insurer' | null> {
  console.log('ℹ️ loadAccountTypeFromSupabase is deprecated, use getProfile instead');
  return null;
}

/**
 * @deprecated Use saveProfile instead
 */
export async function saveProfileToSupabase(
  email: string, 
  profileData: any
): Promise<boolean> {
  console.log('ℹ️ saveProfileToSupabase is deprecated, use saveProfile instead');
  return true;
}

/**
 * @deprecated Use getProfile instead
 */
export async function loadProfileFromSupabase(email: string): Promise<any | null> {
  console.log('ℹ️ loadProfileFromSupabase is deprecated, use getProfile instead');
  return null;
}

/**
 * Load vehicles from Supabase (Legacy function)
 * @deprecated Use getVehicles instead
 */
export async function loadVehiclesFromSupabase(email: string): Promise<Vehicle[]> {
  console.log('ℹ️ loadVehiclesFromSupabase is deprecated, use getVehicles instead');
  return await getVehicles();
}

/**
 * Save vehicles to Supabase (Legacy function)
 * @deprecated Use saveVehicle for each vehicle instead
 */
export async function saveVehiclesToSupabase(email: string, vehicles: Vehicle[]): Promise<boolean> {
  console.log('ℹ️ saveVehiclesToSupabase is deprecated, use saveVehicle for each vehicle');
  try {
    for (const vehicle of vehicles) {
      await saveVehicle(vehicle);
    }
    return true;
  } catch (error) {
    console.error('Error in saveVehiclesToSupabase:', error);
    return false;
  }
}

/**
 * Load reports from Supabase (Legacy function)
 * @deprecated Use getDamageReports instead
 */
export async function loadReportsFromSupabase(email: string): Promise<DamageReport[]> {
  console.log('ℹ️ loadReportsFromSupabase is deprecated, use getDamageReports instead');
  return await getDamageReports();
}

/**
 * Save reports to Supabase (Legacy function)
 * @deprecated Use saveDamageReport for each report instead
 */
export async function saveReportsToSupabase(email: string, reports: DamageReport[]): Promise<boolean> {
  console.log('ℹ️ saveReportsToSupabase is deprecated, use saveDamageReport for each report');
  try {
    for (const report of reports) {
      await saveDamageReport(report);
    }
    return true;
  } catch (error) {
    console.error('Error in saveReportsToSupabase:', error);
    return false;
  }
}