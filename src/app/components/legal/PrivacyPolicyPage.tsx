import { ShieldCheck } from "lucide-react";

type PrivacyPolicyPageProps = {
  onBackToHome: () => void;
};

export default function PrivacyPolicyPage({ onBackToHome }: PrivacyPolicyPageProps) {
  return (
    <main className="min-h-screen bg-slate-50 py-16 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Privacy Policy</h1>
            <p className="text-sm text-slate-500">Last updated: March 20, 2026</p>
          </div>
        </div>

        <p className="text-slate-700 leading-relaxed mb-5">
          BidOnDent is committed to protecting customer, shop, and insurer data. Our detailed privacy policy is being finalized by our legal team. Please contact us at <span className="font-semibold">bidondent@gmail.com</span> with any privacy inquiries.
        </p>

        <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 mb-6">
          <p className="text-blue-900 text-sm leading-relaxed">
            <span className="font-semibold">Privacy Notice:</span> We are committed to your privacy and data security. Our comprehensive privacy policy will be available upon request. For questions about how we handle your data, please contact our privacy team.
          </p>
        </div>

        <h2 className="text-xl font-semibold text-slate-900 mb-3">Current Data Handling Summary</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-700 leading-relaxed">
          <li>Account profile information is used to deliver role-based platform functionality.</li>
          <li>Damage reports, bids, and workflow events are stored for operational processing.</li>
          <li>Uploaded images and related metadata are retained to support claim and repair flows.</li>
          <li>Access is restricted based on user role and authorized business operations.</li>
        </ul>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <a
            href="mailto:bidondent@gmail.com"
            className="text-blue-700 font-medium hover:text-blue-800 transition-colors"
          >
            Contact: bidondent@gmail.com
          </a>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center justify-center rounded-lg bg-slate-900 text-white px-4 py-2.5 font-medium hover:bg-slate-800 transition-colors"
          >
            Back to BidOnDent
          </button>
        </div>
      </div>
    </main>
  );
}
