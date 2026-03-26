import { AlertCircle, Trash2, X } from "lucide-react";

type DeleteAccountModalProps = {
  isOpen: boolean;
  isDeleting: boolean;
  deleteConfirmText: string;
  onDeleteConfirmTextChange: (value: string) => void;
  onClose: () => void;
  onDelete: () => void;
};

export default function DeleteAccountModal({
  isOpen,
  isDeleting,
  deleteConfirmText,
  onDeleteConfirmTextChange,
  onClose,
  onDelete,
}: DeleteAccountModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bd-glass-floating p-5 sm:p-6 rounded-lg max-w-md w-full">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-slate-100">Delete Account?</h2>
          </div>
          <button
            className="text-slate-400 hover:text-slate-300"
            onClick={onClose}
            disabled={isDeleting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-800 font-medium mb-2">This action cannot be undone.</p>
            <p className="text-sm text-red-700">
              Deleting your account will permanently remove your BidOnDent sign-in access.
            </p>
            <ul className="list-disc list-inside text-sm text-red-700 mt-2 space-y-1">
              <li>Your ability to sign back into this account</li>
              <li>Your saved local website session on this browser</li>
              <li>
                Any connected website data queued to this account may take additional backend
                cleanup time
              </li>
            </ul>
          </div>

          <div>
            <label
              htmlFor="delete-confirm"
              className="block text-sm font-medium text-slate-300 mb-2"
            >
              Type <span className="font-bold text-red-600">DELETE</span> to confirm:
            </label>
            <input
              id="delete-confirm"
              type="text"
              value={deleteConfirmText}
              onChange={(e) => onDeleteConfirmTextChange(e.target.value)}
              placeholder="Type DELETE here"
              className="w-full px-3 py-2 border border-white/[0.12] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              disabled={isDeleting}
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            className="bd-glass-control--secondary flex-1 px-4 py-2"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            className="bd-glass-control--destructive flex-1 px-4 py-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={onDelete}
            disabled={isDeleting || deleteConfirmText.toLowerCase() !== "delete"}
          >
            {isDeleting ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
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
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Forever
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
