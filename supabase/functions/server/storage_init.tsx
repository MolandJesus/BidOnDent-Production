import { createClient } from 'npm:@supabase/supabase-js@2';
import {
  bucketMimeTypes,
  canonicalStorageBuckets,
  legacyStorageBuckets,
} from './config/storage.ts';

/**
 * Initialize Supabase Storage Buckets
 * Creates the necessary storage buckets for the Bidondent application
 * This function is idempotent and safe to call multiple times
 */
export async function initializeStorageBuckets() {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase credentials for storage initialization');
    return false;
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('🔧 Initializing Supabase Storage buckets...');

    // Get existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }

    const existingBucketNames = existingBuckets?.map(b => b.name) || [];
    const buckets = [
      { name: canonicalStorageBuckets.accountMedia, public: false },
      { name: canonicalStorageBuckets.vehicleMedia, public: false },
      { name: canonicalStorageBuckets.reportMedia, public: false },
      ...[legacyStorageBuckets.profiles, legacyStorageBuckets.vehicles, legacyStorageBuckets.damagePhotos]
        .filter((bucketName) => existingBucketNames.includes(bucketName))
        .map((bucketName) => ({ name: bucketName, public: false })),
    ];

    // Create each bucket if it doesn't exist
    for (const bucket of buckets) {
      if (existingBucketNames.includes(bucket.name)) {
        console.log(`✅ Bucket '${bucket.name}' already exists`);
        
        // Update existing bucket to ensure user media stays private.
        try {
          await supabase.storage.updateBucket(bucket.name, {
            public: false,
            fileSizeLimit: 10485760, // 10MB limit (increased from 5MB)
            allowedMimeTypes: bucketMimeTypes
          });
          console.log(`✅ Updated bucket '${bucket.name}' to be private`);
        } catch (updateError) {
          console.log(`⚠️ Could not update bucket '${bucket.name}':`, updateError);
        }
        continue;
      }

      const { error: createError } = await supabase.storage.createBucket(bucket.name, {
        public: false,
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: bucketMimeTypes
      });

      if (createError) {
        console.error(`❌ Error creating bucket '${bucket.name}':`, createError);
      } else {
        console.log(`✅ Created private bucket '${bucket.name}'`);
      }
    }

    console.log('✅ Storage buckets initialized successfully');
    console.log('ℹ️ Canonical website media buckets are ready and legacy media buckets are maintained when present');
    return true;
  } catch (error) {
    console.error('❌ Error initializing storage buckets:', error);
    return false;
  }
}
