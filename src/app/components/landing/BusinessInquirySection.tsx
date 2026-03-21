import { FormEvent, useState } from "react";
import { ArrowRight, Building2, ChevronLeft, Shield, Send } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { submitInsurerInterest, submitShopInterest } from "../../services/supabase/intake";

type ShopForm = {
  shopName: string;
  dmvRegistrationNumber: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  website: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
};

type InsurerForm = {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  notes: string;
};

const initialShopForm: ShopForm = {
  shopName: "",
  dmvRegistrationNumber: "",
  contactPerson: "",
  email: "",
  phoneNumber: "",
  website: "",
  address: "",
  city: "",
  state: "",
  zipCode: "",
};

const initialInsurerForm: InsurerForm = {
  companyName: "",
  contactPerson: "",
  email: "",
  phoneNumber: "",
  notes: "",
};

export default function BusinessInquirySection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const [activeForm, setActiveForm] = useState<"shop" | "insurer">("shop");
  const [shopForm, setShopForm] = useState<ShopForm>(initialShopForm);
  const [insurerForm, setInsurerForm] = useState<InsurerForm>(initialInsurerForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const formatZipCode = (value: string) => {
    return value.replace(/\D/g, "").slice(0, 5);
  };

  const validateShopForm = (): string | null => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(shopForm.email)) {
      return "Please enter a valid email address.";
    }

    // Phone validation (basic: accept 10+ digits)
    const phoneDigits = shopForm.phoneNumber.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return "Please enter a valid phone number with at least 10 digits.";
    }

    // ZIP code validation (5 digits)
    const zipDigits = shopForm.zipCode.replace(/\D/g, "");
    if (zipDigits.length !== 5) {
      return "Please enter a valid 5-digit ZIP code.";
    }

    // DMV registration: at least 3 characters
    if (shopForm.dmvRegistrationNumber.trim().length < 3) {
      return "Please enter a valid DMV registration number.";
    }

    // Website validation (optional but if provided, must be valid)
    if (shopForm.website && shopForm.website.trim()) {
      const urlRegex = /^https?:\/\/.+\..+|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!urlRegex.test(shopForm.website)) {
        return "Please enter a valid website URL.";
      }
    }

    return null;
  };

  const handleShopSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const validationError = validateShopForm();
    if (validationError) {
      setSubmitMessage(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      await submitShopInterest({
        shop_name: shopForm.shopName,
        dmv_registration_number: shopForm.dmvRegistrationNumber,
        contact_person: shopForm.contactPerson,
        email: shopForm.email,
        phone_number: shopForm.phoneNumber,
        website: shopForm.website || undefined,
        address: shopForm.address,
        city: shopForm.city,
        state: shopForm.state,
        zip_code: shopForm.zipCode,
      });

      setShopForm(initialShopForm);
      setSubmitMessage("✓ Shop application submitted successfully. Our team will contact you to confirm onboarding.");
    } catch (error) {
      console.error("Shop submission failed", error);
      setSubmitMessage("⚠ Submission could not be completed right now. Please email bidondent@gmail.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateInsurerForm = (): string | null => {
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(insurerForm.email)) {
      return "Please enter a valid email address.";
    }

    // Phone validation (basic: accept 10+ digits)
    const phoneDigits = insurerForm.phoneNumber.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      return "Please enter a valid phone number with at least 10 digits.";
    }

    return null;
  };

  const handleInsurerSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const validationError = validateInsurerForm();
    if (validationError) {
      setSubmitMessage(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      await submitInsurerInterest({
        company_name: insurerForm.companyName,
        contact_person: insurerForm.contactPerson,
        email: insurerForm.email,
        phone_number: insurerForm.phoneNumber,
        notes: insurerForm.notes || undefined,
      });

      setInsurerForm(initialInsurerForm);
      setSubmitMessage("✓ Partnership request submitted successfully. Our insurer team will follow up shortly.");
    } catch (error) {
      console.error("Insurer submission failed", error);
      setSubmitMessage("⚠ Request could not be submitted right now. Please email bidondent@gmail.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="business-inquiry" className="py-20 bg-slate-50" ref={sectionRef}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`text-center mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Growth & Partnerships
          </span>
          <h3 className="text-4xl font-bold mt-5 mb-3">Shop Signup and Insurer Partnerships</h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Submit your information to join the BidOnDent network. Every request is reviewed and
            confirmed by our team.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm">
          {!formOpen ? (
            /* ── Gateway: choose your role before the form appears ── */
            <div className="py-4">
              <p className="text-center text-slate-600 mb-8 max-w-lg mx-auto">
                Tell us about your business and we will get you set up. Shops go through a quick
                verification review. Insurers are onboarded through our partnership team.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => { setActiveForm("shop"); setFormOpen(true); setSubmitMessage(""); }}
                  className="group relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-left shadow-sm hover:border-slate-950 hover:shadow-md transition-all duration-200 sm:min-w-[260px]"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-slate-950 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-slate-900">Join as a Shop</div>
                    <div className="text-sm text-slate-500 mt-0.5">Get listed and start receiving bids</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-slate-900 group-hover:translate-x-0.5 transition-all duration-200" />
                </button>

                <button
                  type="button"
                  onClick={() => { setActiveForm("insurer"); setFormOpen(true); setSubmitMessage(""); }}
                  className="group relative flex items-center gap-4 rounded-2xl border border-slate-200 bg-white px-6 py-5 text-left shadow-sm hover:border-emerald-600 hover:shadow-md transition-all duration-200 sm:min-w-[260px]"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-slate-900">Partner as Insurer</div>
                    <div className="text-sm text-slate-500 mt-0.5">Reduce claims costs via our network</div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all duration-200" />
                </button>
              </div>
            </div>
          ) : (
          /* ── Form: shown after role is chosen ── */
          <>
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setActiveForm("shop")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeForm === "shop" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    Shop Signup
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveForm("insurer")}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    activeForm === "insurer"
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-700"
                  }`}
                >
                  <span className="inline-flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Insurer Partnership
                  </span>
                </button>
              </div>
              <button
                type="button"
                onClick={() => { setFormOpen(false); setSubmitMessage(""); }}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
            </div>

          {activeForm === "shop" ? (
            <form className="grid md:grid-cols-2 gap-4" onSubmit={handleShopSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Shop Name*</label>
                <input
                  required
                  value={shopForm.shopName}
                  onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                  placeholder="e.g., Smith's Auto Repair"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">DMV Registration#*</label>
                <input
                  required
                  value={shopForm.dmvRegistrationNumber}
                  onChange={(e) =>
                    setShopForm({ ...shopForm, dmvRegistrationNumber: e.target.value })
                  }
                  placeholder="e.g., NY-405821"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person*</label>
                <input
                  required
                  value={shopForm.contactPerson}
                  onChange={(e) => setShopForm({ ...shopForm, contactPerson: e.target.value })}
                  placeholder="e.g., John Smith"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address*</label>
                <input
                  required
                  type="email"
                  value={shopForm.email}
                  onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                  placeholder="owner@shop.com"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number*</label>
                <input
                  required
                  value={shopForm.phoneNumber}
                  onChange={(e) => setShopForm({ ...shopForm, phoneNumber: formatPhoneNumber(e.target.value) })}
                  placeholder="Phone number (10+ digits)"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Website (optional)</label>
                <input
                  value={shopForm.website}
                  onChange={(e) => setShopForm({ ...shopForm, website: e.target.value })}
                  placeholder="www.example-shop.com"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Street Address*</label>
                <input
                  required
                  value={shopForm.address}
                  onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                  placeholder="123 Main Street"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">City*</label>
                <input
                  required
                  value={shopForm.city}
                  onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                  placeholder="e.g., New Rochelle"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">State*</label>
                <input
                  required
                  value={shopForm.state}
                  onChange={(e) => setShopForm({ ...shopForm, state: e.target.value.toUpperCase() })}
                  placeholder="NY"
                  maxLength={2}
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ZIP Code*</label>
                <input
                  required
                  value={shopForm.zipCode}
                  onChange={(e) => setShopForm({ ...shopForm, zipCode: formatZipCode(e.target.value) })}
                  placeholder="10601"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 h-11 rounded-lg bg-slate-900 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-slate-800 transition-colors"
                >
                  Submit Shop Application
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form className="grid md:grid-cols-2 gap-4" onSubmit={handleInsurerSubmit}>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Company Name*</label>
                <input
                  required
                  value={insurerForm.companyName}
                  onChange={(e) => setInsurerForm({ ...insurerForm, companyName: e.target.value })}
                  placeholder="e.g., Acme Insurance"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Contact Person*</label>
                <input
                  required
                  value={insurerForm.contactPerson}
                  onChange={(e) => setInsurerForm({ ...insurerForm, contactPerson: e.target.value })}
                  placeholder="e.g., Jane Doe"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address*</label>
                <input
                  required
                  type="email"
                  value={insurerForm.email}
                  onChange={(e) => setInsurerForm({ ...insurerForm, email: e.target.value })}
                  placeholder="partner@insurance.com"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number*</label>
                <input
                  required
                  value={insurerForm.phoneNumber}
                  onChange={(e) => setInsurerForm({ ...insurerForm, phoneNumber: formatPhoneNumber(e.target.value) })}
                  placeholder="Phone number (10+ digits)"
                  className="w-full h-11 px-3 border border-slate-300 rounded-lg"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Partnership Notes (optional)</label>
                <textarea
                  value={insurerForm.notes}
                  onChange={(e) => setInsurerForm({ ...insurerForm, notes: e.target.value })}
                  placeholder="Tell us about your partnership interests and expectations..."
                  className="w-full min-h-28 px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 h-11 rounded-lg bg-slate-900 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-slate-800 transition-colors"
                >
                  Submit Partnership Request
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {submitMessage && (
            <div className={`mt-4 p-3 rounded-lg text-sm font-medium ${
              submitMessage.startsWith("✓")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}>
              {submitMessage}
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </section>
  );
}
