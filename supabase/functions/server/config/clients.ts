/**
 * Supabase Client Instances
 * Shared Supabase client initialization
 */

import { createClient } from 'npm:@supabase/supabase-js@2'
import { config } from './constants.ts'

/**
 * Service role client - Full database access for admin operations
 * Used for auth admin functions and server-side database operations
 */
export const supabase = createClient(config.SUPABASE_URL, config.SERVICE_ROLE)

/**
 * Anon key client - Limited access for public operations
 * Used for RLS-protected queries
 */
export const supabaseAuth = createClient(config.SUPABASE_URL, config.ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})
