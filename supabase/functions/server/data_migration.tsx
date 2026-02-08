/**
 * Data Migration Utility
 * Migrates data from KV store to database tables
 */

import * as kv from "./kv_store.tsx";
import { createClient } from "npm:@supabase/supabase-js@2";

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

/**
 * Migrate all profile data from KV store to database
 */
export async function migrateProfilesFromKV() {
  console.log('🔄 Starting profile migration from KV store to database...');
  
  try {
    // Get all profiles from KV store (they were stored with prefix "profile:")
    const kvProfiles = await kv.getByPrefix("profile:");
    
    if (!kvProfiles || kvProfiles.length === 0) {
      console.log('ℹ️ No profiles found in KV store to migrate');
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    console.log(`📦 Found ${kvProfiles.length} profiles in KV store`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const kvProfile of kvProfiles) {
      try {
        const profileData = typeof kvProfile === 'string' ? JSON.parse(kvProfile) : kvProfile;
        
        if (!profileData || !profileData.email) {
          console.log('⚠️ Skipping invalid profile data');
          skipped++;
          continue;
        }

        // Find the user by email in auth.users
        const { data: users, error: userError } = await supabase.auth.admin.listUsers();
        
        if (userError) {
          console.error('Error fetching users:', userError);
          errors++;
          continue;
        }

        const user = users.users.find(u => u.email === profileData.email);
        
        if (!user) {
          console.log(`⚠️ No auth user found for ${profileData.email}, skipping`);
          skipped++;
          continue;
        }

        // Check if profile already exists in database
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (existingProfile) {
          console.log(`ℹ️ Profile already exists for ${profileData.email}, skipping`);
          skipped++;
          continue;
        }

        // Insert profile into database
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: profileData.email,
            name: profileData.name || 'User',
            phone: profileData.phone || null,
            profile_image_url: profileData.profile_image_url || null,
            account_type: profileData.account_type || 'customer'
          });

        if (insertError) {
          console.error(`❌ Error inserting profile for ${profileData.email}:`, insertError);
          errors++;
        } else {
          console.log(`✅ Migrated profile for ${profileData.email}`);
          migrated++;
        }

      } catch (error) {
        console.error('Error processing profile:', error);
        errors++;
      }
    }

    console.log(`✅ Migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
    return { migrated, skipped, errors };

  } catch (error) {
    console.error('❌ Migration error:', error);
    return { migrated: 0, skipped: 0, errors: 1 };
  }
}

/**
 * Migrate vehicles from KV store to database
 */
export async function migrateVehiclesFromKV() {
  console.log('🔄 Starting vehicles migration from KV store to database...');
  
  try {
    const kvVehicles = await kv.getByPrefix("vehicles:");
    
    if (!kvVehicles || kvVehicles.length === 0) {
      console.log('ℹ️ No vehicles found in KV store to migrate');
      return { migrated: 0, skipped: 0, errors: 0 };
    }

    console.log(`📦 Found ${kvVehicles.length} vehicle records in KV store`);

    let migrated = 0;
    let skipped = 0;
    let errors = 0;

    for (const kvVehicle of kvVehicles) {
      try {
        const vehicleData = typeof kvVehicle === 'string' ? JSON.parse(kvVehicle) : kvVehicle;
        
        if (!vehicleData || !Array.isArray(vehicleData)) {
          skipped++;
          continue;
        }

        // Extract email from the key (format: "vehicles:email@example.com")
        // We need to find the user_id from the email
        // This is tricky without the email in the data, so we'll skip for now
        console.log('⚠️ Vehicle migration requires user context - skipping');
        skipped++;

      } catch (error) {
        console.error('Error processing vehicles:', error);
        errors++;
      }
    }

    console.log(`✅ Vehicles migration complete: ${migrated} migrated, ${skipped} skipped, ${errors} errors`);
    return { migrated, skipped, errors };

  } catch (error) {
    console.error('❌ Vehicles migration error:', error);
    return { migrated: 0, skipped: 0, errors: 1 };
  }
}
