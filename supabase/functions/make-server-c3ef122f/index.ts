// ============================================================================
// BIDONDENT EDGE FUNCTION
// Server endpoint for handling authenticated requests
// ============================================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const path = url.pathname.replace('/make-server-c3ef122f', '');

    // Route to photo upload handler
    if (path === '/upload-photo' && req.method === 'POST') {
      return await handlePhotoUpload(req);
    }

    // Default 404
    return new Response(
      JSON.stringify({ error: 'Not found' }),
      { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});

// ============================================================================
// PHOTO UPLOAD HANDLER
// ============================================================================

async function handlePhotoUpload(req: Request): Promise<Response> {
  try {
    console.log('📤 Photo upload request received');

    // Step 1: Verify authentication
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.error('❌ No authorization header');
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Create Supabase client with service role for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Verify the user's JWT token
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      console.error('❌ Invalid token:', userError?.message);
      return new Response(
        JSON.stringify({ error: 'Invalid or expired token' }),
        { 
          status: 401, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ User authenticated:', user.email);

    // Step 2: Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const bucket = formData.get('bucket') as string;

    if (!file || !bucket) {
      console.error('❌ Missing file or bucket parameter');
      return new Response(
        JSON.stringify({ error: 'Missing file or bucket parameter' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate bucket name
    const validBuckets = ['bidondent-profiles', 'bidondent-vehicles', 'bidondent-damage-photos'];
    if (!validBuckets.includes(bucket)) {
      console.error('❌ Invalid bucket:', bucket);
      return new Response(
        JSON.stringify({ error: `Invalid bucket. Must be one of: ${validBuckets.join(', ')}` }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log(`📦 Uploading to bucket: ${bucket}`);

    // Step 3: Ensure bucket exists (idempotent)
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return new Response(
        JSON.stringify({ error: 'Failed to access storage' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      console.log(`🆕 Creating bucket: ${bucket}`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucket, {
        public: false, // Private bucket - use signed URLs
        fileSizeLimit: 10485760, // 10MB limit
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
      });

      if (createError) {
        console.error('❌ Error creating bucket:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create storage bucket' }),
          { 
            status: 500, 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          }
        );
      }
      console.log(`✅ Bucket created: ${bucket}`);
    }

    // Step 4: Generate unique file path
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExt = file.name.split('.').pop() || 'jpg';
    const fileName = `${timestamp}-${randomString}.${fileExt}`;
    const filePath = `${user.id}/${fileName}`;

    console.log(`📝 File path: ${filePath}`);

    // Step 5: Upload file
    const fileBuffer = await file.arrayBuffer();
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from(bucket)
      .upload(filePath, fileBuffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (uploadError) {
      console.error('❌ Upload error:', uploadError);
      return new Response(
        JSON.stringify({ error: 'Failed to upload file', details: uploadError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ File uploaded successfully:', uploadData.path);

    // Step 6: Generate signed URL (valid for 1 year)
    const { data: signedUrlData, error: signedUrlError } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(filePath, 31536000); // 1 year in seconds

    if (signedUrlError) {
      console.error('❌ Error generating signed URL:', signedUrlError);
      return new Response(
        JSON.stringify({ error: 'Failed to generate URL' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Signed URL generated');

    // Return the signed URL
    return new Response(
      JSON.stringify({ 
        publicUrl: signedUrlData.signedUrl,
        path: filePath
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('❌ Exception in handlePhotoUpload:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}
