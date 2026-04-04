import { useEffect, useRef, useState } from "react";

/**
 * Monitors the service worker for available updates.
 * Returns `needRefresh` when a new version is detected and
 * `updateServiceWorker` to apply the update.
 */
export function useServiceWorkerUpdate() {
  const [needRefresh, setNeedRefresh] = useState(false);
  const updateFnRef = useRef<((reloadPage?: boolean) => Promise<void>) | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function register() {
      try {
        // Dynamic import so it only resolves in production builds where the
        // virtual module exists.  In dev, vite-plugin-pwa serves a no-op stub.
        const { registerSW } = await import("virtual:pwa-register");

        const updateSW = registerSW({
          onNeedRefresh() {
            if (!cancelled) {
              setNeedRefresh(true);
            }
          },
          onOfflineReady() {
            if (import.meta.env.DEV) {
              console.info("[SW] Offline ready — app cached for offline use");
            }
          },
        });

        if (!cancelled) {
          updateFnRef.current = updateSW;
        }
      } catch {
        // virtual:pwa-register is unavailable in test/dev without the PWA plugin
      }
    }

    void register();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateServiceWorker = async () => {
    if (updateFnRef.current) {
      await updateFnRef.current(true);
    }
  };

  return { needRefresh, updateServiceWorker };
}
