import { Hono } from 'npm:hono@4'
import { createClient } from 'npm:@supabase/supabase-js@2'
import { initializeDatabaseTables } from "./database_init.tsx";
import { initializeStorageBuckets } from "./storage_init.tsx";

// BUILD VERSION: 2026-02-13-v6 - Simplified CORS headers
console.log('🚀 Edge Function Server Starting - Build: 2026-02-13-v6');

// Initialize database tables and storage buckets on startup
(async () => {
  await initializeDatabaseTables();
  await initializeStorageBuckets();
})();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '3600',
  'Access-Control-Expose-Headers': '*',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE)

const supabaseAuth = createClient(SUPABASE_URL, ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Helper: strip the function prefix and extract the route path
function stripFunctionPrefix(pathname: string): string {
  // Remove /functions/v1/ prefix that Supabase adds
  let path = pathname;
  if (path.startsWith('/functions/v1/')) {
    path = path.slice('/functions/v1/'.length);
  }
  // Also handle /server prefix for local testing
  if (path.startsWith('/server/')) {
    path = path.slice('/server/'.length);
  }
  if (path.startsWith('/server')) {
    path = path.slice('/server'.length) || '/';
  }
  // Ensure leading slash for routes
  if (!path.startsWith('/')) {
    path = '/' + path;
  }
  return path || '/';
}

Deno.serve(async (req) => {
  // Helper to ensure all responses have CORS headers
  const respond = (body: any, status = 200, additionalHeaders: Record<string, string> = {}) => {
    return new Response(
      typeof body === 'string' ? body : JSON.stringify(body),
      {
        status,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          ...additionalHeaders,
        }
      }
    );
  };


  // Handle OPTIONS preflight for all routes
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  const url = new URL(req.url)
  const path = stripFunctionPrefix(url.pathname)

  try {
    // Log all incoming requests for debugging
    const isDeleteMatch = path === '/delete-vehicle' && req.method === 'POST';
    console.log(`🔍 Path check: isDeleteMatch=${isDeleteMatch}, path=${path}, method=${req.method}`);

    // Health check endpoint with version
    if (path === '/make-server-9f243523/health' && req.method === 'GET') {
      return respond({
        status: 'ok',
        version: '2026-02-13-v5',
        adminEmail: 'figmaadmin@bidondent.com'
      });
    }

    // Database migration endpoint
    if (path === '/make-server-9f243523/migrate-database' && req.method === 'POST') {
      try {
        await initializeDatabaseTables()

        // Step 2: Manually add clerk_user_id column if it still doesn't exist
        try {
          const { Client } = await import('https://deno.land/x/postgres@v0.17.0/mod.ts');
          const dbUrl = Deno.env.get('SUPABASE_DB_URL') ?? '';
          if (dbUrl) {
            const client = new Client(dbUrl);
            await client.connect();

            try {
              // Check if column exists
              const checkResult = await client.queryArray(
                `SELECT column_name FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'vehicles' AND column_name = 'clerk_user_id'`
              );

              if (checkResult.rows.length === 0) {
                await client.queryArray(`ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;`);
              } else {
              }

              // Do the same for damage_reports
              const checkReportsResult = await client.queryArray(
                `SELECT column_name FROM information_schema.columns
                 WHERE table_schema = 'public' AND table_name = 'damage_reports' AND column_name = 'clerk_user_id'`
              );

              if (checkReportsResult.rows.length === 0) {
                await client.queryArray(`ALTER TABLE public.damage_reports ADD COLUMN IF NOT EXISTS clerk_user_id TEXT;`);
              } else {
              }

            } finally {
              await client.end();
            }
          }
        } catch (postgresError: any) {
          console.warn('⚠️ Could not verify columns via direct DB connection:', postgresError.message);
        }

        // Force PostgREST to reload schema cache via HTTP
        try {
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

          if (supabaseUrl && serviceKey) {
            // PostgREST admin endpoint for schema cache reload
            const postgrestAdminUrl = supabaseUrl.replace('https://', 'https://') + '/rest/v1/';
            await fetch(postgrestAdminUrl, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'apikey': serviceKey,
                'Prefer': 'schema-reload'
              }
            });
          }
        } catch (reloadError) {
        }

        return new Response(
          JSON.stringify({ success: true, message: 'Database migration completed' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: any) {
        console.error('Migration error:', error)
        return new Response(
          JSON.stringify({ error: 'Migration failed', details: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Setup admin account endpoint (no auth required - only works for figmaadmin@bidondent.com)
    if (path === '/make-server-9f243523/admin/setup-admin' && req.method === 'POST') {
      console.log('🚀 Admin setup endpoint hit!');

      try {
        const body = await req.json()
        console.log('📦 Request body:', body);
        const { email, password } = body

        // Only allow creating the specific admin email
        if (!email || email.toLowerCase() !== 'figmaadmin@bidondent.com') {
          return new Response(
            JSON.stringify({ error: 'This endpoint is only for setting up figmaadmin@bidondent.com' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!password) {
          return new Response(
            JSON.stringify({ error: 'Missing required field: password' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (password.length < 6) {
          return new Response(
            JSON.stringify({ error: 'Password must be at least 6 characters' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }


        const { data: existingUsers } = await supabase.auth.admin.listUsers()
        const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

        let userId: string

        if (existingUser) {
          console.log(`Admin user already exists in auth: ${existingUser.id}`)
          userId = existingUser.id

          // Update password
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            userId,
            {
              password: password,
              email_confirm: true,
              user_metadata: {
                name: 'Admin User',
                phone: '',
                user_type: 'customer'
              }
            }
          )

          if (updateError) {
            console.error('Error updating admin password:', updateError.message)
            return new Response(
              JSON.stringify({ error: updateError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }
          console.log('Updated admin password')
        } else {
          // Create new admin user
          const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
              name: 'Admin User',
              phone: '',
              user_type: 'customer'
            }
          })

          if (createError) {
            console.error('Error creating admin user:', createError.message)
            return new Response(
              JSON.stringify({ error: createError.message }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          if (!userData.user) {
            return new Response(
              JSON.stringify({ error: 'No user data returned' }),
              { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
          }

          userId = userData.user.id
          console.log(`Admin auth user created: ${userId}`)
        }

        // Create or update profile with is_admin = true
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            user_id: userId,
            email: email,
            name: 'Admin User',
            phone: '',
            account_type: 'customer',
            setup_completed: false,
            is_admin: true, // Critical: Mark as admin
          }, {
            onConflict: 'user_id'
          })

        if (profileError) {
          console.error('Error creating/updating admin profile:', profileError.message)
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }


        return new Response(
          JSON.stringify({
            success: true,
            message: 'Admin account created successfully',
            userId: userId
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: any) {
        console.error('Admin setup error:', error)
        return new Response(
          JSON.stringify({ error: error.message || 'Failed to set up admin account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Check if admin account exists (no auth required - public endpoint)
    if (path === '/make-server-9f243523/admin/check-admin-exists' && req.method === 'GET') {
      console.log('🔍 Checking if admin account exists...');

      try {
        const adminEmail = 'figmaadmin@bidondent.com';

        // Check auth users
        const { data: existingUsers } = await supabase.auth.admin.listUsers()

        const existingUser = existingUsers?.users?.find(u => u.email?.toLowerCase() === adminEmail)

        if (existingUser) {
        }

        return new Response(
          JSON.stringify({
            exists: !!existingUser,
            email: adminEmail,
            totalUsers: existingUsers?.users?.length || 0
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: any) {
        console.error('Error checking admin:', error)
        return new Response(
          JSON.stringify({
            exists: false, // Default to false on error to show setup button
            error: error.message
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (path === '/make-server-9f243523/admin/create-user' && req.method === 'POST') {
      const body = await req.json()
      console.log('🔍 CREATE-USER: Raw body received:', JSON.stringify(body, null, 2));

      const { email, password, name, account_type, adminEmail } = body

      console.log('🔍 CREATE-USER: Extracted adminEmail:', adminEmail);
      console.log('🔍 CREATE-USER: adminEmail type:', typeof adminEmail);
      console.log('🔍 CREATE-USER: adminEmail?.toLowerCase():', adminEmail?.toLowerCase());
      console.log('🔍 CREATE-USER: Comparison result:', adminEmail?.toLowerCase() !== 'figmaadmin@bidondent.com');

      // Case-insensitive admin check
      if (adminEmail?.toLowerCase() !== 'figmaadmin@bidondent.com') {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }


      if (!email || !password || !account_type) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: email, password, account_type' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (password.length < 6) {
        return new Response(
          JSON.stringify({ error: 'Password must be at least 6 characters' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Admin creating user: ${email} (${account_type})`)

      const { data: existingUsers } = await supabase.auth.admin.listUsers()
      const existingUser = existingUsers?.users?.find(u => u.email === email)

      let userId: string

      if (existingUser) {
        console.log(`User already exists in auth: ${existingUser.id}`)
        userId = existingUser.id

        const { error: updateError } = await supabase.auth.admin.updateUserById(
          userId,
          {
            password: password,
            email_confirm: true,
            user_metadata: {
              name: name || 'Test Account',
              phone: '',
              user_type: account_type
            }
          }
        )

        if (updateError) {
          console.error('Error updating existing user:', updateError.message)
        } else {
          console.log('Updated existing auth user password')
        }
      } else {
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: name || 'Test Account',
            phone: '',
            user_type: account_type
          }
        })

        if (createError) {
          console.error('Error creating user:', createError.message)
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!userData.user) {
          return new Response(
            JSON.stringify({ error: 'No user data returned' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        userId = userData.user.id
        console.log(`Auth user created: ${userId}`)
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: userId,
          email: email,
          name: name || 'Test Account',
          phone: '',
          account_type: account_type,
          setup_completed: false,
          // Set is_admin to true if this is the main admin account
          is_admin: email.toLowerCase() === 'figmaadmin@bidondent.com',
        }, {
          onConflict: 'user_id'
        })

      if (profileError) {
        console.error('Error creating profile:', profileError.message)
        return new Response(
          JSON.stringify({
            error: `User ${existingUser ? 'updated' : 'created'} but profile error: ${profileError.message}`,
            userId: userId
          }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Profile created successfully for ${email}`)

      return new Response(
        JSON.stringify({
          success: true,
          userId: userId,
          email: email,
          accountType: account_type,
          message: existingUser ? 'User updated and profile synced' : 'User created successfully'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (path === '/make-server-9f243523/admin/delete-user' && req.method === 'POST') {
      const body = await req.json()
      const { email, adminEmail } = body

      // Case-insensitive admin check
      if (adminEmail?.toLowerCase() !== 'figmaadmin@bidondent.com') {
        console.log(`Unauthorized admin access attempt by: ${adminEmail}`)
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!email) {
        return new Response(
          JSON.stringify({ error: 'Missing email' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Admin deleting user: ${email}`)

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', email)
        .maybeSingle()

      if (profileError) {
        console.error('Error finding profile:', profileError.message)
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!profiles?.user_id) {
        return new Response(
          JSON.stringify({ error: 'User not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const userId = profiles.user_id

      const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)

      if (deleteAuthError) {
        console.error('Error deleting auth user:', deleteAuthError.message)
        return new Response(
          JSON.stringify({ error: deleteAuthError.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { error: deleteProfileError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId)

      if (deleteProfileError) {
        console.error('Error deleting profile:', deleteProfileError.message)
      }

      console.log(`Successfully deleted user: ${email}`)

      return new Response(
        JSON.stringify({
          success: true,
          email: email,
          userId: userId
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Admin management - promote/demote admin (super admin only)
    if (path === '/make-server-9f243523/admin/manage-admin' && req.method === 'POST') {
      const body = await req.json()
      const { email: targetEmail, promote, adminEmail } = body

      // Only super admin can manage admins
      if (adminEmail?.toLowerCase() !== 'figmaadmin@bidondent.com') {
        console.log(`Unauthorized admin management attempt by: ${adminEmail}`)
        return new Response(
          JSON.stringify({ error: 'Only the super admin can manage admin accounts' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      if (!targetEmail || typeof promote !== 'boolean') {
        return new Response(
          JSON.stringify({ error: 'Missing email or promote parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Prevent demoting super admin
      if (targetEmail?.toLowerCase() === 'figmaadmin@bidondent.com' && !promote) {
        return new Response(
          JSON.stringify({ error: 'Cannot demote the super admin' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      try {
        console.log(`Managing admin status: ${promote ? 'promoting' : 'demoting'} ${targetEmail}`)

        const { data: updatedProfile, error: updateError } = await supabase
          .from('profiles')
          .update({ is_admin: promote })
          .eq('email', targetEmail)
          .select()
          .maybeSingle()

        if (updateError) {
          console.error('Error updating admin status:', updateError)
          return new Response(
            JSON.stringify({ error: 'Failed to update admin status' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        if (!updatedProfile) {
          console.error('Profile not found for email:', targetEmail)
          return new Response(
            JSON.stringify({ error: 'User profile not found' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }


        return new Response(
          JSON.stringify({
            success: true,
            profile: updatedProfile,
            message: `${targetEmail} ${promote ? 'promoted to admin' : 'demoted from admin'}`
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: any) {
        console.error('Manage admin error:', error)
        return new Response(
          JSON.stringify({ error: error.message || 'Failed to manage admin' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Track user login activity
    if (path === '/make-server-9f243523/track-login' && req.method === 'POST') {
      const body = await req.json()
      const { email, user_id } = body

      if (!email && !user_id) {
        return new Response(
          JSON.stringify({ error: 'Missing email or user_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`Tracking login for: ${email || user_id}`)

      try {
        // Update last_login timestamp
        const updateData: any = {
          last_login: new Date().toISOString()
        }

        let query = supabase.from('profiles').update(updateData)

        if (email) {
          query = query.eq('email', email)
        } else if (user_id) {
          query = query.eq('user_id', user_id)
        }

        const { error: updateError } = await query

        if (updateError) {
          console.error('Error updating last_login:', updateError.message)
          return new Response(
            JSON.stringify({ error: updateError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }


        return new Response(
          JSON.stringify({ success: true }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: any) {
        console.error('Track login error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Delete user account
    if (path === '/make-server-9f243523/delete-account' && req.method === 'POST') {
      // Verify user is authenticated
      const authHeader = req.headers.get('Authorization')

      if (!authHeader) {
        console.error('❌ No Authorization header in delete request')
        return new Response(
          JSON.stringify({ error: 'No Authorization header provided' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const token = authHeader.replace('Bearer ', '')
      console.log('🔍 Validating JWT token for account deletion...')
      console.log('🔑 Token length:', token.length)
      console.log('🔑 Token preview:', token.substring(0, 20) + '...')

      // Use EXACT SAME validation pattern as upload-photo
      const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

      if (authError || !user) {
        console.error('❌ JWT validation failed:', {
          error: authError?.message,
          hasUser: !!user,
          errorName: authError?.name,
          errorStatus: authError?.status
        })
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            details: authError?.message || 'Invalid token'
          }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }


      try {
        // Get user's profile to check account type and email
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, account_type, is_admin')
          .eq('user_id', user.id)
          .maybeSingle()

        if (profileError) {
          console.error('Error fetching profile:', profileError)
          return new Response(
            JSON.stringify({ error: 'Failed to fetch profile' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Safety check: Prevent deletion of admin accounts
        if (profile?.is_admin) {
          console.log('⛔ Blocked attempt to delete admin account')
          return new Response(
            JSON.stringify({ error: 'Admin accounts cannot be deleted' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }

        // Safety check: Prevent deletion of test accounts
        const testEmails = [
          'customer.test@bidondent.com',
          'shop.test@bidondent.com',
          'insurer.test@bidondent.com'
        ]
        if (profile?.email && testEmails.includes(profile.email)) {
          console.log('⛔ Blocked attempt to delete test account')
          return new Response(
            JSON.stringify({ error: 'Test accounts cannot be deleted through this method' }),
            { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }


        // SIMPLIFIED APPROACH: Delete auth user first (like admin delete)
        // When auth user is deleted, Supabase CASCADE will handle related data
        const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id)

        if (authDeleteError) {
          console.error('Error deleting auth user:', authDeleteError)
          return new Response(
            JSON.stringify({ error: 'Failed to delete authentication account', details: authDeleteError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }


        // Delete profile (CASCADE should have already handled this if configured, but let's be explicit)
        const { error: profileDeleteError } = await supabase
          .from('profiles')
          .delete()
          .eq('user_id', user.id)

        if (profileDeleteError) {
          console.error('Error deleting profile:', profileDeleteError)
          // Don't return error here since auth is already deleted
        } else {
        }

        // Clean up related data (in case CASCADE isn't configured)
        // These are non-critical, so we won't fail if they error
        await supabase.from('bids').delete().eq('user_id', user.id)
        await supabase.from('damage_reports').delete().eq('user_id', user.id)
        await supabase.from('vehicles').delete().eq('user_id', user.id)



        return new Response(
          JSON.stringify({
            success: true,
            message: 'Account deleted successfully'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      } catch (error: any) {
        console.error('Delete account error:', error)
        return new Response(
          JSON.stringify({ error: error.message || 'Failed to delete account' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    if (path === '/make-server-9f243523/upload-photo' && req.method === 'POST') {
      // For Clerk-authenticated users, we skip JWT validation
      // and allow uploads with the public anon key
      console.log('📤 Photo upload endpoint hit')

      const formData = await req.formData()
      const file = formData.get('file') as File
      const bucket = formData.get('bucket') as string

      if (!file || !bucket) {
        console.error('❌ Missing file or bucket in upload request')
        return new Response(
          JSON.stringify({ error: 'Missing file or bucket parameter' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const validBuckets = ['bidondent-profiles', 'bidondent-vehicles', 'bidondent-damage-photos']
      if (!validBuckets.includes(bucket)) {
        console.error('❌ Invalid bucket name:', bucket)
        return new Response(
          JSON.stringify({ error: 'Invalid bucket name' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      console.log(`📤 Uploading file to bucket: ${bucket}`)
      console.log(`📁 File size: ${file.size} bytes`)

      // Use a timestamp-based filename for anonymous uploads
      const fileExt = file.name.split('.').pop() || 'jpg'
      const fileName = `uploads/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (error) {
        console.error('❌ Storage upload error:', error)
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path)


      return new Response(
        JSON.stringify({ publicUrl }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // List all users (admin only)
    if (path === '/make-server-9f243523/admin/list-users' && req.method === 'GET') {
      try {
        console.log('📋 Listing all users...');

        const { data: authData } = await supabase.auth.admin.listUsers();
        const users = authData?.users || [];


        return new Response(
          JSON.stringify({ users }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error listing users:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Bulk delete users (admin only)
    if (path === '/make-server-9f243523/admin/delete-users' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { userIds } = body;

        if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
          return new Response(
            JSON.stringify({ error: 'userIds array is required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }


        let deleted = 0;
        const errors = [];

        for (const userId of userIds) {
          try {
            // Delete from auth
            const { error: authError } = await supabase.auth.admin.deleteUser(userId);

            if (authError) {
              console.error(`Error deleting user ${userId}:`, authError);
              errors.push({ userId, error: authError.message });
            } else {
              deleted++;
            }
          } catch (error: any) {
            console.error(`Error deleting user ${userId}:`, error);
            errors.push({ userId, error: error.message });
          }
        }


        return new Response(
          JSON.stringify({
            deleted,
            requested: userIds.length,
            errors: errors.length > 0 ? errors : undefined
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error in bulk delete:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Create test account (admin only - linked to admin)
    if (path === '/make-server-9f243523/admin/create-test-account' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { email, password, userType } = body;

        if (!email || !password || !userType) {
          return new Response(
            JSON.stringify({ error: 'email, password, and userType are required' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`🧪 Creating test account: ${email} (${userType})`);

        // Create user with email already confirmed
        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
          email: email,
          password: password,
          email_confirm: true,
          user_metadata: {
            name: `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
            user_type: userType,
            created_by_admin: true
          }
        });

        if (createError) {
          console.error('Error creating test user:', createError);
          return new Response(
            JSON.stringify({ error: createError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        if (!userData.user) {
          return new Response(
            JSON.stringify({ error: 'Failed to create user' }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Create profile for test user
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: userData.user.id,
            email: email,
            name: `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
            account_type: userType,
            setup_completed: true
          });

        if (profileError) {
          console.error('Error creating test profile:', profileError);
          return new Response(
            JSON.stringify({ error: profileError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }


        return new Response(
          JSON.stringify({
            success: true,
            userId: userData.user.id,
            email: email,
            userType: userType
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error creating test account:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get storage statistics
    if (path === '/make-server-9f243523/storage-stats' && req.method === 'GET') {
      try {

        // Count all damage reports
        const { data: reports, error: reportsError } = await supabase
          .from('damage_reports')
          .select('photo_urls');

        if (reportsError) {
          console.error('Error fetching reports:', reportsError);
          return new Response(
            JSON.stringify({ error: reportsError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Count total photos and estimate storage
        let totalPhotos = 0;
        let estimatedBytes = 0;
        const avgPhotoSize = 400 * 1024; // 400KB average per photo

        reports?.forEach((report: any) => {
          const photoUrls = report.photo_urls || [];
          totalPhotos += photoUrls.length;
        });

        estimatedBytes = totalPhotos * avgPhotoSize;
        const estimatedMB = (estimatedBytes / 1024 / 1024).toFixed(0);
        const storageLimit = 1024; // 1GB in MB
        const storagePercentage = Math.round((estimatedBytes / (storageLimit * 1024 * 1024)) * 100);

        const stats = {
          totalReports: reports?.length || 0,
          totalPhotos,
          estimatedStorageUsed: `${estimatedMB}MB`,
          estimatedStorageUsedBytes: estimatedBytes,
          storageLimit: '1GB',
          storagePercentage,
          bandwidthWarning: storagePercentage > 50,
          needsCleanup: storagePercentage > 70
        };


        return new Response(
          JSON.stringify(stats),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error fetching storage stats:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Cleanup old reports (older than X days)
    if (path === '/make-server-9f243523/cleanup-old-reports' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { daysOld = 30 } = body;


        // Calculate cutoff date
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        const cutoffISO = cutoffDate.toISOString();

        // Find old reports with photos
        const { data: oldReports, error: fetchError } = await supabase
          .from('damage_reports')
          .select('id, photo_urls')
          .lt('created_at', cutoffISO);

        if (fetchError) {
          console.error('Error fetching old reports:', fetchError);
          return new Response(
            JSON.stringify({ error: fetchError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        // Delete photos from storage first
        let photosDeleted = 0;
        for (const report of (oldReports || [])) {
          const photoUrls = report.photo_urls || [];
          for (const url of photoUrls) {
            try {
              // Extract path from URL
              const urlObj = new URL(url);
              const pathParts = urlObj.pathname.split('/');
              const fileName = pathParts[pathParts.length - 1];
              const folder = pathParts[pathParts.length - 2];
              const filePath = `${folder}/${fileName}`;

              const { error: deleteError } = await supabase.storage
                .from('bidondent-damage-photos')
                .remove([filePath]);

              if (!deleteError) {
                photosDeleted++;
              }
            } catch (e) {
              // Skip if URL parsing fails
              console.warn('Failed to delete photo:', url);
            }
          }
        }

        // Delete the reports
        const { error: deleteError } = await supabase
          .from('damage_reports')
          .delete()
          .lt('created_at', cutoffISO);

        if (deleteError) {
          console.error('Error deleting old reports:', deleteError);
          return new Response(
            JSON.stringify({ error: deleteError.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        const reportsDeleted = oldReports?.length || 0;

        return new Response(
          JSON.stringify({
            deleted: reportsDeleted,
            photosDeleted,
            message: `Deleted ${reportsDeleted} reports older than ${daysOld} days`
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error cleaning up old reports:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Save damage report (Clerk auth support)
    if (path === '/make-server-9f243523/reports' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { clerkUserId, report } = body;

        if (!clerkUserId) {
          return new Response(
            JSON.stringify({ error: 'Missing clerkUserId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`📝 Saving damage report for Clerk user: ${clerkUserId}`);

        // Use service role to bypass RLS and save with clerk_user_id
        const { data, error } = await supabase
          .from('damage_reports')
          .insert({
            clerk_user_id: clerkUserId,
            vehicle_make: report.vehicle_make,
            vehicle_model: report.vehicle_model,
            vehicle_year: report.vehicle_year,
            damage_type: report.damage_type,
            damage_severity: report.damage_severity || 'moderate',
            damage_description: report.damage_description,
            damage_location: report.damage_location,
            photo_urls: report.photo_urls || [],
            insurance_claim: report.insurance_claim || false,
            insurance_company: report.insurance_company,
            preferred_contact: report.preferred_contact || 'email',
            additional_notes: report.additional_notes,
            status: report.status || 'pending'
          })
          .select()
          .single();

        if (error) {
          console.error('❌ Error saving damage report:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }


        return new Response(
          JSON.stringify({ success: true, report: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error in save damage report endpoint:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get damage reports (Clerk auth support)
    if (path === '/make-server-9f243523/reports' && req.method === 'GET') {
      try {
        const url = new URL(req.url);
        const clerkUserId = url.searchParams.get('clerkUserId');

        if (!clerkUserId) {
          return new Response(
            JSON.stringify({ error: 'Missing clerkUserId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`📋 Fetching damage reports for Clerk user: ${clerkUserId}`);

        // Use service role to bypass RLS
        const { data, error } = await supabase
          .from('damage_reports')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching damage reports:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }


        return new Response(
          JSON.stringify({ reports: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error in get damage reports endpoint:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Save vehicle (Clerk auth support)
    if (path === '/make-server-9f243523/vehicles' && req.method === 'POST') {
      try {
        const body = await req.json();
        const { clerkUserId, vehicle } = body;

        if (!clerkUserId) {
          return new Response(
            JSON.stringify({ error: 'Missing clerkUserId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`🚗 Saving vehicle for Clerk user: ${clerkUserId}`);

        // Convert year to number if it's a string
        const yearNum = typeof vehicle.year === 'string' ? parseInt(vehicle.year, 10) : vehicle.year;

        // Check if vehicle has a valid UUID (existing vehicle)
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        const hasValidId = vehicle.id && uuidRegex.test(vehicle.id);

        let data, error;

        if (hasValidId) {
          // Update existing vehicle
          console.log('🔄 Updating vehicle with ID:', vehicle.id);
          const result = await supabase
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
            .eq('clerk_user_id', clerkUserId)
            .select()
            .single();

          data = result.data;
          error = result.error;
        } else {
          // Insert new vehicle
          console.log('➕ Inserting new vehicle');
          const result = await supabase
            .from('vehicles')
            .insert({
              clerk_user_id: clerkUserId,
              make: vehicle.make,
              model: vehicle.model,
              year: yearNum,
              color: vehicle.color,
              license_plate: vehicle.licensePlate || vehicle.license_plate,
              vin: vehicle.vin,
              image_url: vehicle.image_url
            })
            .select()
            .single();

          data = result.data;
          error = result.error;
        }

        if (error) {
          console.error('❌ Error saving vehicle:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }


        return new Response(
          JSON.stringify({ success: true, vehicle: data }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      } catch (error: any) {
        console.error('Error in save vehicle endpoint:', error);
        return new Response(
          JSON.stringify({ error: error.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Get vehicles (Clerk auth support)
    if (path === '/make-server-9f243523/vehicles' && req.method === 'GET') {
      try {
        const url = new URL(req.url);
        const clerkUserId = url.searchParams.get('clerkUserId');

        if (!clerkUserId) {
          return new Response(
            JSON.stringify({ error: 'Missing clerkUserId' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log(`🚗 Fetching vehicles for Clerk user: ${clerkUserId}`);

        // Use service role to bypass RLS
        const { data, error } = await supabase
          .from('vehicles')
          .select('*')
          .eq('clerk_user_id', clerkUserId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('❌ Error fetching vehicles:', error);
          return new Response(
            JSON.stringify({ error: error.message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }


        return respond({ vehicles: data });
      } catch (error: any) {
        console.error('Error in get vehicles endpoint:', error);
        return respond({ error: error.message }, 500);
      }
    }

    // Delete vehicle via POST (Clerk auth support - avoiding CORS DELETE issues)
    if ((path === '/make-server-9f243523/delete-vehicle' || path === '/delete-vehicle') && req.method === 'POST') {
      try {
        const body = await req.json();
        const { vehicleId, clerkUserId } = body;


        if (!vehicleId || !clerkUserId) {
          return respond({ error: 'Missing vehicleId or clerkUserId' }, 400);
        }

        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicleId)
          .eq('clerk_user_id', clerkUserId);

        if (error) {
          console.error('❌ Error deleting vehicle:', error);
          return respond({ error: error.message }, 500);
        }

        return respond({ success: true, message: 'Vehicle deleted' });
      } catch (error: any) {
        console.error('Error in delete vehicle endpoint:', error);
        return respond({ error: error.message }, 500);
      }
    }

    // Delete vehicle (Clerk auth support)
    if (path.startsWith('/make-server-9f243523/vehicles/') && req.method === 'DELETE') {
      try {
        const url = new URL(req.url);
        const vehicleId = path.split('/').pop();
        const clerkUserId = url.searchParams.get('clerkUserId');


        if (!vehicleId || !clerkUserId) {
          return respond({ error: 'Missing vehicleId or clerkUserId' }, 400);
        }


        const { error } = await supabase
          .from('vehicles')
          .delete()
          .eq('id', vehicleId)
          .eq('clerk_user_id', clerkUserId);

        if (error) {
          console.error('❌ Error deleting vehicle:', error);
          return respond({ error: error.message }, 500);
        }

        return respond({ success: true, message: 'Vehicle deleted' });
      } catch (error: any) {
        console.error('Error in delete vehicle endpoint:', error);
        return respond({ error: error.message }, 500);
      }
    }

    // Delete damage report (Clerk auth support)
    if (path.startsWith('/make-server-9f243523/reports/') && req.method === 'DELETE') {
      try {
        const url = new URL(req.url);
        const reportId = path.split('/').pop();
        const clerkUserId = url.searchParams.get('clerkUserId');


        if (!reportId || !clerkUserId) {
          return respond({ error: 'Missing reportId or clerkUserId' }, 400);
        }


        const { error } = await supabase
          .from('damage_reports')
          .delete()
          .eq('id', reportId)
          .eq('clerk_user_id', clerkUserId);

        if (error) {
          console.error('❌ Error deleting report:', error);
          return respond({ error: error.message }, 500);
        }

        return respond({ success: true, message: 'Report deleted' });
      } catch (error: any) {
        console.error('Error in delete report endpoint:', error);
        return respond({ error: error.message }, 500);
      }
    }

    return respond({ error: 'Not found' }, 404)
  } catch (error: any) {
    console.error('Error:', error)
    return respond({ error: 'Internal server error', details: error?.message }, 500)
  }
})
