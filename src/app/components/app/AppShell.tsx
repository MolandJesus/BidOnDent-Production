import { useCallback, useEffect, useState } from "react";

// ============================================================================
// AUTH CONFIG FALLBACK — shown when Clerk key is missing/invalid
// ============================================================================

export function AuthConfigFallback() {
  return (
    <div className="min-h-screen bg-[#0b172f] px-6 py-16 text-slate-200">
      <div className="mx-auto max-w-2xl rounded-2xl border border-blue-300/15 bg-white/[0.04] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">App setup required</h1>
        <p className="mt-3 text-sm leading-6 text-blue-100/70">
          The app could not initialize authentication because the Clerk publishable key is missing
          or invalid.
        </p>
        <ol className="mt-6 list-decimal space-y-2 pl-5 text-sm text-blue-100/70">
          <li>Open utils/clerk/info.tsx</li>
          <li>Set clerkPublishableKey to your Clerk pk_test or pk_live value</li>
          <li>Refresh the browser</li>
        </ol>
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
