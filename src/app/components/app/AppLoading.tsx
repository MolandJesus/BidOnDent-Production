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
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{message}</p>
        {showRecovery && (
          <div className="mt-6 space-y-2">
            <p className="text-sm text-gray-500">Taking longer than expected.</p>
            <button
              onClick={() => window.location.reload()}
              className="text-sm text-blue-600 underline hover:text-blue-800"
            >
              Tap to reload
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
