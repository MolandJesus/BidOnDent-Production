import type { ReactNode } from "react";

type AccountOverlaysProps = {
  isSaving: boolean;
  saveSuccess: boolean;
  primaryColor: string;
};

export default function AccountOverlays({
  isSaving,
  saveSuccess,
  primaryColor,
}: AccountOverlaysProps): ReactNode {
  return (
    <>
      {/* Loading Overlay for Image Upload */}
      {isSaving && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bd-glass-floating rounded-lg p-6 flex flex-col items-center">
            <svg
              className="animate-spin h-12 w-12 mb-3"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              style={{ color: primaryColor }}
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="font-medium text-gray-700">Uploading image...</p>
            <p className="text-sm text-gray-500">Compressing and saving to cloud</p>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {saveSuccess && (
        <div
          className="fixed top-20 right-4 bg-white border-l-4 px-4 py-3 rounded shadow-lg z-50 flex items-center gap-3 animate-slide-in-right"
          style={{ borderColor: primaryColor }}
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${primaryColor}15` }}
          >
            <svg
              className="w-5 h-5"
              style={{ color: primaryColor }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">Profile Saved</p>
            <p className="text-sm text-gray-500">Changes synced to cloud</p>
          </div>
        </div>
      )}
    </>
  );
}
