/**
 * Server Configuration - Constants and Environment
 * CORS headers, environment variables, and static configuration
 */

/**
 * Allowed origins for CORS.
 * In production, restrict to the real deployment domain(s).
 * For local development, Vite dev servers are also permitted.
 */
const ALLOWED_ORIGINS = [
  'https://bidondent.com',
  'https://www.bidondent.com',
  'https://bidondent.vercel.app',
  // Local development
  ...(Deno.env.get('ENVIRONMENT') === 'local'
    ? ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000']
    : []),
];

/** Build a CORS origin header value from the request Origin. */
export function getCorsOrigin(requestOrigin?: string | null): string {
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  // Fallback: first allowed origin (never wildcard)
  return ALLOWED_ORIGINS[0];
}

export const corsHeaders = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGINS[0],
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-clerk-user-id',
  'Access-Control-Max-Age': '3600',
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
