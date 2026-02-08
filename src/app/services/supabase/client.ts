import { projectId, publicAnonKey } from "../../../../utils/supabase/info";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

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

    console.log("🔵 Initializing Supabase client (first time)");
    const client = createClient(`https://${projectId}.supabase.co`, publicAnonKey, {
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
