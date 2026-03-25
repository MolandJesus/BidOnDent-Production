import { FormEvent, useState } from "react";
import { ArrowRight, Building2, ChevronLeft, Shield } from "lucide-react";
import { useScrollAnimation } from "../../hooks/useScrollAnimation";
import { submitInsurerInterest, submitShopInterest } from "../../services/supabase/intake";
import {
  type ShopForm,
  type InsurerForm,
  initialShopForm,
  initialInsurerForm,
  validateShopForm,
  validateInsurerForm,
} from "./businessInquiryUtils";
import BusinessInquiryShopForm from "./BusinessInquiryShopForm";
import BusinessInquiryInsurerForm from "./BusinessInquiryInsurerForm";

export default function BusinessInquirySection() {
  const { ref: sectionRef, isVisible } = useScrollAnimation(0.1);
  const [activeForm, setActiveForm] = useState<"shop" | "insurer">("shop");
  const [shopForm, setShopForm] = useState<ShopForm>(initialShopForm);
  const [insurerForm, setInsurerForm] = useState<InsurerForm>(initialInsurerForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [formOpen, setFormOpen] = useState(false);

  const handleShopSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const validationError = validateShopForm(shopForm);
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
      setSubmitMessage(
        "✓ Shop application submitted successfully. Our team will contact you to confirm onboarding."
      );
    } catch (error) {
      if (import.meta.env.DEV) console.error("Shop submission failed", error);
      setSubmitMessage(
        "⚠ Submission could not be completed right now. Please email bidondent@gmail.com."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInsurerSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    const validationError = validateInsurerForm(insurerForm);
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
      setSubmitMessage(
        "✓ Partnership request submitted successfully. Our insurer team will follow up shortly."
      );
    } catch (error) {
      if (import.meta.env.DEV) console.error("Insurer submission failed", error);
      setSubmitMessage(
        "⚠ Request could not be submitted right now. Please email bidondent@gmail.com."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="business-inquiry"
      className="py-14 md:py-20 bg-gradient-to-b from-[#f5f8fc] to-[#edf3fa]"
      ref={sectionRef}
    >
      <div className="container mx-auto px-4 max-w-6xl">
        <div
          className={`text-center mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span className="inline-flex items-center px-4 py-1.5 rounded-full bd-glass-badge text-sm font-medium">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
            Growth & Partnerships
          </span>
          <h3 className="text-2xl sm:text-4xl font-bold mt-5 mb-3">
            Shop Signup and Insurer Partnerships
          </h3>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Submit your information to join the BidOnDent network. Every request is reviewed and
            confirmed by our team.
          </p>
        </div>

        <div className="bd-glass-card p-6 md:p-8">
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
                  onClick={() => {
                    setActiveForm("shop");
                    setFormOpen(true);
                    setSubmitMessage("");
                  }}
                  className="group relative flex items-center gap-4 bd-glass-card px-6 py-5 text-left hover:border-blue-400 hover:shadow-md transition-all duration-200 sm:min-w-[260px]"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#003d82] flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-slate-900">Join as a Shop</div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      Get listed and start receiving bids
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-200" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveForm("insurer");
                    setFormOpen(true);
                    setSubmitMessage("");
                  }}
                  className="group relative flex items-center gap-4 bd-glass-card px-6 py-5 text-left hover:border-blue-400 hover:shadow-md transition-all duration-200 sm:min-w-[260px]"
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-lg text-slate-900">Partner as Insurer</div>
                    <div className="text-sm text-slate-500 mt-0.5">
                      Reduce claims costs via our network
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all duration-200" />
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
                      activeForm === "shop"
                        ? "bg-slate-900 text-white"
                        : "bg-slate-100 text-slate-700"
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
                  onClick={() => {
                    setFormOpen(false);
                    setSubmitMessage("");
                  }}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              {activeForm === "shop" ? (
                <BusinessInquiryShopForm
                  shopForm={shopForm}
                  isSubmitting={isSubmitting}
                  onUpdate={setShopForm}
                  onSubmit={handleShopSubmit}
                />
              ) : (
                <BusinessInquiryInsurerForm
                  insurerForm={insurerForm}
                  isSubmitting={isSubmitting}
                  onUpdate={setInsurerForm}
                  onSubmit={handleInsurerSubmit}
                />
              )}

              {submitMessage && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                    submitMessage.startsWith("✓")
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
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
