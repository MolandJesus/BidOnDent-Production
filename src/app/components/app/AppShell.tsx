import { useCallback, useEffect, useRef, useState } from "react";
import { markRouteEnter, markRouteLeave } from "../../utils/perfMarks";

// ============================================================================
// AUTH CONFIG FALLBACK — shown when Clerk or Supabase env vars are missing
// ============================================================================

export function AuthConfigFallback({ missingSupabase = false }: { missingSupabase?: boolean }) {
  return (
    <div className="min-h-screen bg-[#0b172f] px-6 py-16 text-slate-200">
      <div className="mx-auto max-w-2xl rounded-2xl border border-blue-300/15 bg-white/[0.04] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">App setup required</h1>
        {missingSupabase ? (
          <>
            <p className="mt-3 text-sm leading-6 text-blue-100/70">
              The app could not connect to the database because the Supabase environment variables
              are missing.
            </p>
            <p className="mt-3 text-sm font-semibold text-amber-300">
              In Vercel → Project Settings → Environment Variables, add:
            </p>
            <ul className="mt-3 list-disc space-y-1.5 pl-5 text-sm text-blue-100/70">
              <li>
                <code className="text-blue-300">VITE_SUPABASE_URL</code> — your Supabase project URL
                (e.g. https://abc123.supabase.co)
              </li>
              <li>
                <code className="text-blue-300">VITE_SUPABASE_ANON_KEY</code> — your Supabase anon
                public key
              </li>
              <li>
                <code className="text-blue-300">VITE_CLERK_PUBLISHABLE_KEY</code> — your Clerk
                pk_live key
              </li>
            </ul>
            <p className="mt-4 text-sm text-blue-100/70">
              After adding all three, trigger a new Vercel deployment.
            </p>
          </>
        ) : (
          <>
            <p className="mt-3 text-sm leading-6 text-blue-100/70">
              The app could not initialize authentication because the Clerk publishable key is
              missing or invalid.
            </p>
            <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-blue-100/70">
              <li>
                Copy <code className="text-blue-300">.env.example</code> to{" "}
                <code className="text-blue-300">.env</code>
              </li>
              <li>
                Set <code className="text-blue-300">VITE_CLERK_PUBLISHABLE_KEY</code> to your Clerk
                pk_test or pk_live value
              </li>
              <li>Refresh the browser</li>
            </ol>
          </>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// HASH PAGE ROUTING — standalone pages (legal, about, partnership)
// ============================================================================

const HASH_PAGES = ["about", "privacy-policy", "terms-of-service", "insurer-partnership"] as const;
type HashPage = (typeof HASH_PAGES)[number];

function parseHashPage(hash: string): HashPage | null {
  const path = hash.replace(/^#\/?/, "");
  return HASH_PAGES.includes(path as HashPage) ? (path as HashPage) : null;
}

export function useHashPage() {
  const [page, setPage] = useState<HashPage | null>(() => parseHashPage(window.location.hash));
  const previousPageRef = useRef<HashPage | null>(page);

  useEffect(() => {
    const previous = previousPageRef.current;
    if (previous !== page) {
      if (previous !== null) markRouteLeave(`hashPage:${previous}`);
      if (page !== null) markRouteEnter(`hashPage:${page}`);
      else markRouteEnter("hashPage:landing");
      previousPageRef.current = page;
    }
  }, [page]);

  useEffect(() => {
    const onHashChange = () => setPage(parseHashPage(window.location.hash));
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  const clearPage = useCallback(() => {
    setPage(null);
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

  return { hashPage: page, clearHashPage: clearPage };
}

export type { HashPage };
