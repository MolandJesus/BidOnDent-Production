import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_BASE_URL } from "./runtime";

declare global {
  interface Window {
    __bidondent_supabase__?: SupabaseClient;
  }
}

function getSupabaseClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    if (window.__bidondent_supabase__) {
      return window.__bidondent_supabase__;
    }

    if (import.meta.env.DEV) console.log("🔵 Initializing Supabase client (first time)");
    const client = createClient(SUPABASE_BASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        storageKey: "bidondent-auth-token",
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        flowType: "pkce",
        storage: window.localStorage,
        debug: false
      },
      global: {
        headers: {
          "X-Client-Info": "bidondent-app"
        }
      }
    });

    window.__bidondent_supabase__ = client;
    return client;
  }

  throw new Error("Supabase requires browser environment");
}

export const supabase = getSupabaseClient();

/**
 * Inject a Clerk-issued JWT (signed with Supabase's JWT secret via a "supabase"
 * template) into the Supabase Realtime client so that RLS policies referencing
 * `request.jwt.claims->>'sub'` resolve correctly for live subscriptions.
 *
 * Call this whenever the Clerk session token refreshes. Passing `null` clears
 * the token (e.g., on sign-out).
 */
export function setSupabaseRealtimeAuth(token: string | null) {
  if (token) {
    supabase.realtime.setAuth(token);
  }
}
