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

export default function BusinessInquirySection({
  isLightAppearance = false,
}: {
  isLightAppearance?: boolean;
}) {
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
      className="py-10 md:py-16 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #e6ecfa 0%, #eaedfc 35%, #e4ebfb 70%, #e2e9f8 100%)"
          : "linear-gradient(180deg, #071828 0%, #0a2036 50%, #081a30 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-blue-300/25" : "via-blue-400/15"} to-transparent`}
      />
      {/* Atmospheric depth */}
      {isLightAppearance ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_60%_-5%,rgba(99,102,241,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_25%_80%,rgba(59,130,246,0.06),transparent_55%)]" />
          <div className="absolute bottom-0 left-[30%] w-48 h-48 bg-indigo-300/[0.05] rounded-full blur-[100px]" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.025)_1px,transparent_1px)] [background-size:28px_28px] opacity-30" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_60%_-5%,rgba(59,130,246,0.08),transparent_55%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_25%_85%,rgba(37,99,235,0.05),transparent_55%)]" />
          <div className="absolute top-0 right-1/3 w-64 h-64 bg-blue-500/[0.05] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-[20%] w-56 h-56 bg-blue-400/[0.03] rounded-full blur-[100px]" />
        </>
      )}

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-20 right-[7%] animate-orb-drift"
        style={{ animationDelay: "1s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-blue-400/25" : "bg-blue-400/40"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 18px 5px rgba(59,130,246,0.12)"
              : "0 0 22px 7px rgba(59,130,246,0.2)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute bottom-28 left-[5%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "4s" }}
      >
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center ${isLightAppearance ? "bg-blue-100/55 border border-blue-200/40" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 16px rgba(59,130,246,0.1)"
              : "0 0 20px rgba(59,130,246,0.12)",
          }}
        >
          <Building2
            className={`w-4 h-4 ${isLightAppearance ? "text-blue-500/60" : "text-blue-400/50"}`}
          />
        </div>
      </div>
      <div
        className="hidden md:block absolute top-48 left-[3%] animate-orb-glow"
        style={{ animationDelay: "6s" }}
      >
        <div
          className={`w-3 h-3 rounded-full ${isLightAppearance ? "bg-indigo-400/20" : "bg-blue-400/30"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 14px 3px rgba(99,102,241,0.08)"
              : "0 0 18px 5px rgba(59,130,246,0.12)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative">
        <div
          className={`text-center mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${isLightAppearance ? "border border-blue-200/60 bg-white/80 text-blue-700 backdrop-blur-sm" : "border border-blue-400/20 bg-blue-500/10 text-blue-200 backdrop-blur-sm"}`}
          >
            <span
              className={`w-2 h-2 rounded-full mr-2 ${isLightAppearance ? "bg-blue-500" : "bg-blue-400"}`}
            />
            Growth &amp; Partnerships
          </span>
          <h3
            className={`text-2xl sm:text-4xl font-bold mt-5 mb-3 ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
          >
            Shop Signup and Insurer Partnerships
          </h3>
          <p
            className={`text-base sm:text-xl leading-relaxed max-w-3xl mx-auto ${isLightAppearance ? "text-slate-600" : "text-blue-100/70"}`}
          >
            Submit your information to join the BidOnDent network. Every request is reviewed and
            confirmed by our team.
          </p>
        </div>

        <div
          className={`rounded-2xl p-6 md:p-8 ${isLightAppearance ? "bg-white/70 border border-blue-100/50 backdrop-blur-sm shadow-sm" : "border border-blue-400/15 backdrop-blur-sm rounded-2xl"}`}
          style={
            isLightAppearance
              ? {}
              : {
                  background:
                    "linear-gradient(180deg, rgba(10, 18, 35, 0.86) 0%, rgba(8, 14, 28, 0.82) 100%)",
                  boxShadow:
                    "0 14px 36px rgba(3, 10, 24, 0.42), inset 0 1px 0 rgba(59, 130, 246, 0.10)",
                }
          }
        >
          {!formOpen ? (
            /* ── Gateway: choose your role before the form appears ── */
            <div className="py-4">
              <p
                className={`text-center mb-8 max-w-lg mx-auto ${isLightAppearance ? "text-slate-600" : "text-blue-100/70"}`}
              >
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
                  className={`group relative flex items-center gap-4 rounded-2xl px-6 py-5 text-left border transition-all duration-200 sm:min-w-[260px] ${isLightAppearance ? "border-blue-200/50 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300/60" : "border-blue-400/20 bg-white/5 hover:bg-white/10 hover:border-blue-400/40"}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#003d82] flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-bold text-lg ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
                    >
                      Join as a Shop
                    </div>
                    <div
                      className={`text-sm mt-0.5 ${isLightAppearance ? "text-slate-500" : "text-blue-100/65"}`}
                    >
                      Get listed and start receiving bids
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-5 h-5 group-hover:translate-x-0.5 transition-all duration-200 ${isLightAppearance ? "text-blue-400 group-hover:text-blue-600" : "text-blue-300/60 group-hover:text-blue-300"}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveForm("insurer");
                    setFormOpen(true);
                    setSubmitMessage("");
                  }}
                  className={`group relative flex items-center gap-4 rounded-2xl px-6 py-5 text-left border transition-all duration-200 sm:min-w-[260px] ${isLightAppearance ? "border-blue-200/50 bg-blue-50/50 hover:bg-blue-50 hover:border-blue-300/60" : "border-blue-400/20 bg-white/5 hover:bg-white/10 hover:border-blue-400/40"}`}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#1e3a5f] flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-bold text-lg ${isLightAppearance ? "text-slate-900" : "text-slate-100"}`}
                    >
                      Partner as Insurer
                    </div>
                    <div
                      className={`text-sm mt-0.5 ${isLightAppearance ? "text-slate-500" : "text-blue-100/65"}`}
                    >
                      Reduce claims costs via our network
                    </div>
                  </div>
                  <ArrowRight
                    className={`w-5 h-5 group-hover:translate-x-0.5 transition-all duration-200 ${isLightAppearance ? "text-blue-400 group-hover:text-blue-600" : "text-blue-300/60 group-hover:text-blue-300"}`}
                  />
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
                        ? "bg-blue-600 text-white"
                        : isLightAppearance
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-white/10 text-blue-100/80 hover:bg-white/15"
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
                        ? "bg-blue-600 text-white"
                        : isLightAppearance
                          ? "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          : "bg-white/10 text-blue-100/80 hover:bg-white/15"
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
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${isLightAppearance ? "text-slate-500 hover:text-slate-800" : "text-blue-100/60 hover:text-blue-100"}`}
                >
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </button>
              </div>

              {activeForm === "shop" ? (
                <BusinessInquiryShopForm
                  shopForm={shopForm}
                  isSubmitting={isSubmitting}
                  isLightAppearance={isLightAppearance}
                  onUpdate={setShopForm}
                  onSubmit={handleShopSubmit}
                />
              ) : (
                <BusinessInquiryInsurerForm
                  insurerForm={insurerForm}
                  isSubmitting={isSubmitting}
                  isLightAppearance={isLightAppearance}
                  onUpdate={setInsurerForm}
                  onSubmit={handleInsurerSubmit}
                />
              )}

              {submitMessage && (
                <div
                  className={`mt-4 p-3 rounded-lg text-sm font-medium ${
                    submitMessage.startsWith("✓")
                      ? isLightAppearance
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25"
                      : isLightAppearance
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-red-500/15 text-red-300 border border-red-400/25"
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
