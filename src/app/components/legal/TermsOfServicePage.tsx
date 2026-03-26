import { FileText } from "lucide-react";

type TermsOfServicePageProps = {
  onBackToHome: () => void;
};

export default function TermsOfServicePage({ onBackToHome }: TermsOfServicePageProps) {
  return (
    <main className="min-h-screen py-16 px-4">
      <div className="max-w-3xl mx-auto bd-glass-card p-8 md:p-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-500/10 border border-blue-400/20 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-100">Terms of Service</h1>
            <p className="text-sm text-slate-400">Last updated: March 24, 2026</p>
          </div>
        </div>

        <p className="text-slate-300 leading-relaxed mb-5">
          Welcome to BidOnDent. By accessing or using our platform, you agree to these Terms of
          Service. Please read them carefully before using our services.
        </p>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">1. Acceptance of Terms</h2>
        <p className="text-slate-300 leading-relaxed mb-5">
          By creating an account or using BidOnDent, you agree to be bound by these Terms of
          Service, our Privacy Policy, and any additional terms that apply to specific features. If
          you do not agree, do not use our platform.
        </p>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">2. Description of Service</h2>
        <p className="text-slate-300 leading-relaxed mb-5">
          BidOnDent is a marketplace platform connecting vehicle owners with body shops and
          insurance providers for vehicle damage repair. We facilitate damage reporting, bid
          collection, and repair coordination. BidOnDent does not perform repairs directly.
        </p>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">3. User Accounts</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-300 leading-relaxed mb-5">
          <li>You must provide accurate and complete information when creating an account.</li>
          <li>You are responsible for maintaining the security of your account credentials.</li>
          <li>You must be at least 18 years old to use our platform.</li>
          <li>
            One person or business may maintain one account per role (customer, shop, insurer).
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">4. User Roles</h2>
        <div className="space-y-3 mb-5">
          <div className="bd-glass-card rounded-xl p-4">
            <h3 className="font-medium text-slate-100 mb-1">Customers</h3>
            <p className="text-sm text-slate-400">
              Submit damage reports, receive bids from body shops, and select repair providers. You
              are responsible for the accuracy of your damage reports and uploaded photos.
            </p>
          </div>
          <div className="bd-glass-card rounded-xl p-4">
            <h3 className="font-medium text-slate-100 mb-1">Body Shops</h3>
            <p className="text-sm text-slate-400">
              View damage reports, submit bids, and manage repair jobs. You are responsible for
              honoring accepted bids and providing quality repair services.
            </p>
          </div>
          <div className="bd-glass-card rounded-xl p-4">
            <h3 className="font-medium text-slate-100 mb-1">Insurers</h3>
            <p className="text-sm text-slate-400">
              Manage claims, coordinate with partner shops, and oversee repair workflows. You are
              responsible for timely claim processing.
            </p>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">5. Bids and Transactions</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-300 leading-relaxed mb-5">
          <li>Bids submitted by body shops are considered binding offers.</li>
          <li>
            Accepting a bid creates an agreement between the customer and the body shop. BidOnDent
            facilitates but is not a party to this agreement.
          </li>
          <li>BidOnDent does not guarantee the quality, timing, or outcome of any repair work.</li>
          <li>
            Payment terms are between the customer (or insurer) and the body shop unless otherwise
            specified.
          </li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">6. Prohibited Conduct</h2>
        <ul className="list-disc pl-5 space-y-2 text-slate-300 leading-relaxed mb-5">
          <li>Submitting false or misleading damage reports.</li>
          <li>Manipulating bids or engaging in bid rigging.</li>
          <li>Using the platform for any unlawful purpose.</li>
          <li>Attempting to circumvent platform fees or processes.</li>
          <li>Harassing other users or platform staff.</li>
        </ul>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">7. Content and Data</h2>
        <p className="text-slate-300 leading-relaxed mb-5">
          You retain ownership of content you upload (photos, descriptions). By uploading content,
          you grant BidOnDent a license to use it for platform operations, including displaying it
          to body shops and insurers for bid and claim processing.
        </p>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">8. Limitation of Liability</h2>
        <p className="text-slate-300 leading-relaxed mb-5">
          BidOnDent is a marketplace facilitator. We are not liable for the quality of repairs,
          accuracy of bids, or disputes between users. Our liability is limited to the extent
          permitted by applicable law.
        </p>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">9. Termination</h2>
        <p className="text-slate-300 leading-relaxed mb-5">
          We may suspend or terminate your account if you violate these terms. You may delete your
          account at any time through the Account settings. Upon termination, your right to use the
          platform ceases immediately.
        </p>

        <h2 className="text-xl font-semibold text-slate-100 mb-3">10. Changes to Terms</h2>
        <p className="text-slate-300 leading-relaxed mb-5">
          We may update these terms from time to time. We will notify users of material changes.
          Continued use after changes constitutes acceptance of the updated terms.
        </p>

        <div className="rounded-xl border border-blue-400/20 bg-blue-500/10 p-4 mb-6">
          <p className="text-blue-200 text-sm leading-relaxed">
            <span className="font-semibold">Questions?</span> If you have any questions about these
            Terms of Service, please contact us at{" "}
            <span className="font-semibold">bidondent@gmail.com</span>.
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-white/[0.12] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <a
            href="mailto:bidondent@gmail.com"
            className="text-blue-400 font-medium hover:text-blue-300 transition-colors"
          >
            Contact: bidondent@gmail.com
          </a>
          <button
            onClick={onBackToHome}
            className="bd-glass-control inline-flex items-center justify-center px-4 py-2.5"
          >
            Back to BidOnDent
          </button>
        </div>
      </div>
    </main>
  );
}
