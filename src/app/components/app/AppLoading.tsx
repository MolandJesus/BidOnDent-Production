import { useEffect, useState } from "react";

type AppLoadingProps = {
  message?: string;
};

export default function AppLoading({ message = "Loading..." }: AppLoadingProps) {
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowRecovery(true), 8000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#0b172f] flex items-center justify-center">
      <div className="text-center" aria-busy="true" aria-live="polite" role="status">
        <div
          aria-hidden="true"
          className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"
        ></div>
        <p className="text-blue-200/70">{message}</p>
        {showRecovery && (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-blue-200/50">Taking longer than expected.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-400 underline hover:text-blue-300"
              type="button"
            >
              Tap to reload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
