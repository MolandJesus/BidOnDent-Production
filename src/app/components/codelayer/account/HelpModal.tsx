import { Mail, Phone, X } from "lucide-react";

type HelpModalProps = {
  isOpen: boolean;
  primaryColor: string;
  onClose: () => void;
};

export default function HelpModal({ isOpen, primaryColor, onClose }: HelpModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Help & Support</h2>
          <button className="text-gray-500 hover:text-gray-700" onClick={onClose}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Contact Support</h3>
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-500" />
                <span>(555) 123-4567</span>
              </p>
              <p className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span>support@bidondent.com</span>
              </p>
            </div>
          </div>

          <div className="border-b pb-4">
            <h3 className="font-semibold mb-2">Frequently Asked Questions</h3>
            <div className="space-y-2">
              <button className="w-full text-left text-sm text-blue-600 hover:underline">
                How do I submit a damage report?
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:underline">
                How long does it take to receive bids?
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:underline">
                Can I cancel my account?
              </button>
              <button className="w-full text-left text-sm text-blue-600 hover:underline">
                How do I update my payment method?
              </button>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-2">Send us a message</h3>
            <textarea
              placeholder="Describe your issue..."
              className="w-full p-2 border border-gray-300 rounded"
              rows={4}
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50" onClick={onClose}>
            Close
          </button>
          <button
            className="px-4 py-2 text-white rounded"
            style={{ backgroundColor: primaryColor }}
            onClick={() => {
              onClose();
              alert("Message sent! We'll get back to you soon.");
            }}
          >
            Send Message
          </button>
        </div>
      </div>
    </div>
  );
}
