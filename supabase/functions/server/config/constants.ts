/**
 * Server Configuration - Constants and Environment
 * CORS headers, environment variables, and static configuration
 */

export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Max-Age': '3600',
  'Access-Control-Expose-Headers': '*',
};

export const config = {
  SUPABASE_URL: Deno.env.get('SUPABASE_URL') ?? '',
  SERVICE_ROLE: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  ANON_KEY: Deno.env.get('SUPABASE_ANON_KEY') ?? '',
  CLERK_SECRET_KEY: Deno.env.get('CLERK_SECRET_KEY') ?? '',
  CLERK_PUBLISHABLE_KEY: Deno.env.get('CLERK_PUBLISHABLE_KEY') ?? '',
  BUILD_VERSION: '2026-03-21-v10 - website runtime + storage contract cleanup',
  ADMIN_EMAIL: 'figmaadmin@bidondent.com',
};
