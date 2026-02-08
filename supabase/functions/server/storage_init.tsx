import { createClient } from 'npm:@supabase/supabase-js@2';

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

  const buckets = [
    { name: 'bidondent-profiles', public: true },
    { name: 'bidondent-vehicles', public: true },
    { name: 'bidondent-damage-photos', public: true }
  ];

  try {
    console.log('🔧 Initializing Supabase Storage buckets...');

    // Get existing buckets
    const { data: existingBuckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return false;
    }

    const existingBucketNames = existingBuckets?.map(b => b.name) || [];

    // Create each bucket if it doesn't exist
    for (const bucket of buckets) {
      if (existingBucketNames.includes(bucket.name)) {
        console.log(`✅ Bucket '${bucket.name}' already exists`);
        
        // Update existing bucket to ensure it's public
        try {
          await supabase.storage.updateBucket(bucket.name, {
            public: true,
            fileSizeLimit: 10485760, // 10MB limit (increased from 5MB)
            allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
          });
          console.log(`✅ Updated bucket '${bucket.name}' to be public`);
        } catch (updateError) {
          console.log(`⚠️ Could not update bucket '${bucket.name}':`, updateError);
        }
        continue;
      }

      const { error: createError } = await supabase.storage.createBucket(bucket.name, {
        public: true,
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
      });

      if (createError) {
        console.error(`❌ Error creating bucket '${bucket.name}':`, createError);
      } else {
        console.log(`✅ Created public bucket '${bucket.name}'`);
      }
    }

    console.log('✅ Storage buckets initialized successfully (all buckets are PUBLIC)');
    console.log('ℹ️ No RLS policies needed - buckets are configured as public');
    return true;
  } catch (error) {
    console.error('❌ Error initializing storage buckets:', error);
    return false;
  }
}