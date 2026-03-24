import { CreditCard, X } from "lucide-react";

type PaymentModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function PaymentModal({ isOpen, onClose }: PaymentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-5 sm:p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Payment Methods</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium">•••• •••• •••• 4242</p>
                  <p className="text-sm text-gray-500">Expires 12/25</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:underline">Remove</button>
            </div>
          </div>

          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-6 h-6 text-gray-600" />
                <div>
                  <p className="font-medium">•••• •••• •••• 1234</p>
                  <p className="text-sm text-gray-500">Expires 08/26</p>
                </div>
              </div>
              <button className="text-sm text-blue-600 hover:underline">Remove</button>
            </div>
          </div>

          <button
            className="bd-glass-control--utility w-full py-3 border-2 border-dashed border-slate-200/60 rounded-lg"
            onClick={() => alert("Add new payment method clicked!")}
          >
            + Add New Payment Method
          </button>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="bd-glass-control--secondary px-4 py-2" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
