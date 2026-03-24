import { ArrowRight, MapPin } from "lucide-react";

type StepServiceLocationProps = {
  primaryColor: string;
  zipCode: string;
  address: string;
  onZipChange: (zip: string) => void;
  onAddressChange: (address: string) => void;
  onBack: () => void;
  onContinue: () => void;
};

export default function StepServiceLocation({
  primaryColor,
  zipCode,
  address,
  onZipChange,
  onAddressChange,
  onBack,
  onContinue,
}: StepServiceLocationProps) {
  return (
    <div className="p-4 sm:p-6 space-y-5">
      <div className="text-center">
        <div
          className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center"
          style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, #00a0e9 100%)` }}
        >
          <MapPin className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-1">Service Location</h2>
        <p className="text-slate-500 text-sm leading-relaxed">
          Shops near you will see this request first on the BidOnDent network
        </p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">ZIP Code</label>
          <input
            type="text"
            inputMode="numeric"
            value={zipCode}
            onChange={(e) => onZipChange(e.target.value.replace(/\D/g, "").slice(0, 5))}
            className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
            placeholder="e.g. 11201"
            maxLength={5}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            City or Address <span className="text-slate-400 font-normal">(optional)</span>
          </label>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full px-3 py-3 border border-slate-200 rounded-xl text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-400 transition-colors"
            placeholder="e.g. Brooklyn, NY"
          />
        </div>
      </div>

      <div className="flex items-start gap-2.5 rounded-xl bg-blue-50/60 border border-blue-100/60 px-3.5 py-3">
        <MapPin className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 leading-relaxed">
          Your location is only shared with shops you choose. It helps nearby shops on the map
          find and respond to your request faster.
        </p>
      </div>

      <div className="flex gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl font-semibold bd-glass-control--secondary"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="flex-1 py-3 px-4 min-h-[44px] rounded-xl text-white font-semibold flex items-center justify-center"
          style={{ backgroundColor: primaryColor }}
        >
          Continue
          <ArrowRight className="w-5 h-5 ml-2" />
        </button>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full text-center text-sm text-slate-400 hover:text-slate-600 transition-colors py-1.5"
      >
        Skip — I&apos;ll add location later
      </button>
    </div>
  );
}
