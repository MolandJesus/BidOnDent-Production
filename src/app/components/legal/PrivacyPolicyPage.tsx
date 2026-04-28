import { ShieldCheck } from "lucide-react";
import { useAppearanceModeCtx } from "../../hooks/AppearanceModeContext";

type PrivacyPolicyPageProps = {
  onBackToHome: () => void;
};

export default function PrivacyPolicyPage({ onBackToHome }: PrivacyPolicyPageProps) {
  const [appearanceMode] = useAppearanceModeCtx();
  const isLight = appearanceMode === "light";

  return (
    <main
      className={`min-h-screen py-14 px-4 ${
        isLight ? "bg-gradient-to-b from-[#eef4fb] via-[#e6eef9] to-[#dde6f5]" : "bg-gradient-to-b from-[#08142b] via-[#0a1626] to-[#060d1c]"
      }`}
    >
      <div className="max-w-3xl mx-auto bd-glass-card p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className={`text-3xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}>
              Privacy Policy
            </h1>
            <p className={`text-sm ${isLight ? "text-slate-500" : "text-slate-400"}`}>
              Last updated: March 20, 2026
            </p>
          </div>
        </div>

        <p className={`leading-relaxed mb-5 ${isLight ? "text-slate-700" : "text-slate-300"}`}>
          BidOnDent is committed to protecting customer, shop, and insurer data. For any privacy
          questions or data requests, please contact us at{" "}
          <span className="font-semibold">bidondent@gmail.com</span>.
        </p>

        <div
          className={`rounded-xl border p-4 mb-6 ${
            isLight ? "border-blue-200 bg-blue-50" : "border-blue-400/20 bg-blue-500/10"
          }`}
        >
          <p className={`text-sm leading-relaxed ${isLight ? "text-blue-900" : "text-blue-200"}`}>
            <span className="font-semibold">Privacy Notice:</span> We take your privacy and data
            security seriously. For questions about how we handle your data, please reach out to us
            directly.
          </p>
        </div>

        <h2
          className={`text-xl font-semibold mb-3 ${isLight ? "text-slate-900" : "text-slate-100"}`}
        >
          Current Data Handling Summary
        </h2>
        <ul
          className={`list-disc pl-5 space-y-2 leading-relaxed ${isLight ? "text-slate-700" : "text-slate-300"}`}
        >
          <li>Account profile information is used to deliver role-based platform functionality.</li>
          <li>Damage reports, bids, and workflow events are stored for operational processing.</li>
          <li>
            Uploaded images and related metadata are retained to support claim and repair flows.
          </li>
          <li>Access is restricted based on user role and authorized business operations.</li>
        </ul>

        <div
          className={`mt-8 pt-6 border-t flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
            isLight ? "border-slate-300/60" : "border-white/[0.12]"
          }`}
        >
          <a
            href="mailto:bidondent@gmail.com"
            className={`font-medium transition-colors ${
              isLight ? "text-blue-700 hover:text-blue-800" : "text-blue-400 hover:text-blue-300"
            }`}
          >
            Contact: bidondent@gmail.com
          </a>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-white font-semibold shadow-lg"
            style={{ background: "linear-gradient(135deg, #003d82 0%, #0ea5e9 100%)" }}
          >
            Back to BidOnDent
          </button>
        </div>
      </div>
    </main>
  );
}
