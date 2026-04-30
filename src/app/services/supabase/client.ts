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
        realtime: {
          // Fetch a fresh Clerk-issued JWT at channel-join time so Realtime
          // subscriptions are always authenticated regardless of the token
          // arrival timing relative to component mount.
          accessToken: async () => {
            try {
              const w = window as unknown as {
                Clerk?: {
                  session?: {
                    getToken: (opts: { template: string }) => Promise<string | null>;
                  };
                };
              };
              return (await w.Clerk?.session?.getToken({ template: "supabase" })) ?? null;
            } catch {
              return null;
            }
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
 * Previously injected a one-time Clerk JWT into Realtime via setAuth().
 * Now a no-op: the Supabase client is initialized with an `accessToken` async
 * callback that fetches a fresh Clerk JWT at channel-join time, eliminating
 * the token-expiry race condition. Kept for backward compatibility.
 */
export function setSupabaseRealtimeAuth(_token: string | null) {
  // no-op — handled by accessToken callback in createClient options
}
