import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_BASE_URL } from "./runtime";

declare global {
  interface Window {
    __bidondent_supabase__?: SupabaseClient;
  }
}

// Exported so App.tsx can surface a visible config-error screen instead of
// an infinite spinner when the environment variables are missing in Vercel.
export const hasMissingSupabaseConfig = !SUPABASE_BASE_URL || !SUPABASE_ANON_KEY;

function getSupabaseClient(): SupabaseClient {
  if (typeof window !== "undefined") {
    if (window.__bidondent_supabase__) {
      return window.__bidondent_supabase__;
    }

    if (hasMissingSupabaseConfig) {
      // Use a placeholder URL so createClient does not throw synchronously.
      // React can still mount and show a config-error screen.
      // All backend calls will fail until real values are set in Vercel → Settings → Environment Variables.
      console.error(
        "[Config] VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY is missing. " +
          "Set these in Vercel → Project Settings → Environment Variables, then redeploy."
      );
    }

    if (import.meta.env.DEV) console.log("🔵 Initializing Supabase client (first time)");
    const client = createClient(
      SUPABASE_BASE_URL || "https://placeholder.supabase.co",
      SUPABASE_ANON_KEY || "placeholder-anon-key",
      {
        auth: {
          storageKey: "bidondent-auth-token",
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true,
          flowType: "pkce",
          storage: window.localStorage,
          debug: false,
        },
        global: {
          headers: {
            "X-Client-Info": "bidondent-app",
          },
        },
      }
    );

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
