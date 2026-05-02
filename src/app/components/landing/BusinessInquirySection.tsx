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
      className="pt-8 pb-12 sm:pt-10 sm:pb-16 md:pt-12 md:pb-20 relative overflow-hidden"
      style={{
        background: isLightAppearance
          ? "linear-gradient(180deg, #f5f7fb 0%, #f8f9fc 35%, #f4f6fb 70%, #f0f4f9 100%)"
          : "linear-gradient(180deg, #071828 0%, #0a2036 50%, #081a30 100%)",
      }}
      ref={sectionRef}
    >
      {/* Edge blend */}
      <div
        className={`absolute -top-px left-0 right-0 h-px bg-gradient-to-r from-transparent ${isLightAppearance ? "via-amber-300/25" : "via-blue-400/25"} to-transparent`}
      />
      {/* Atmospheric depth — wrapped in bloom for scroll-entry animation */}
      <div className={`bd-bloom-atmosphere ${isVisible ? "is-visible" : "is-hidden"}`}>
        {isLightAppearance ? (
          <>
            {/* Subtle dot grid texture */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(200,170,110,0.05)_1px,transparent_1px)] [background-size:28px_28px] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_40%_at_60%_-5%,rgba(210,180,130,0.18),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_25%_80%,rgba(200,165,100,0.14),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_40%_35%_at_45%_50%,rgba(220,185,115,0.13),transparent_50%)]" />
            <div className="absolute bottom-0 left-[30%] w-60 h-60 bg-amber-200/[0.22] rounded-full blur-[110px]" />
            <div className="absolute top-10 right-[20%] w-48 h-48 bg-amber-100/[0.18] rounded-full blur-[120px]" />
          </>
        ) : (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(59,130,246,0.06)_1px,transparent_1px)] [background-size:28px_28px] opacity-80" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_45%_at_60%_-5%,rgba(59,130,246,0.16),transparent_55%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_45%_50%_at_25%_85%,rgba(37,99,235,0.12),transparent_55%)]" />
            <div className="absolute top-0 right-1/3 w-64 h-64 bg-blue-500/[0.15] rounded-full blur-[100px]" />
            <div className="absolute bottom-0 left-[20%] w-56 h-56 bg-blue-400/[0.12] rounded-full blur-[100px]" />
          </>
        )}
      </div>

      {/* Decorative floating orbs */}
      <div
        className="hidden sm:block absolute top-20 right-[7%] animate-orb-drift"
        style={{ animationDelay: "1s" }}
      >
        <div
          className={`w-4 h-4 rounded-full ${isLightAppearance ? "bg-blue-400/30" : "bg-blue-400/40"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 24px 8px rgba(59,130,246,0.15)"
              : "0 0 22px 7px rgba(59,130,246,0.2)",
          }}
        />
      </div>
      <div
        className="hidden lg:flex absolute bottom-28 left-[5%] animate-orb-rotate items-center justify-center"
        style={{ animationDelay: "4s" }}
      >
        <div
          className={`w-10 h-10 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-[rgba(255,251,245,0.45)] border border-[rgba(200,180,150,0.2)] backdrop-blur-sm" : "bg-blue-500/15 border border-blue-400/20"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 22px rgba(59,130,246,0.10), inset 0 1px 0 rgba(255,250,240,0.7)"
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
          className={`w-3 h-3 rounded-full ${isLightAppearance ? "bg-indigo-400/22" : "bg-blue-400/30"}`}
          style={{
            boxShadow: isLightAppearance
              ? "0 0 20px 5px rgba(99,102,241,0.12)"
              : "0 0 18px 5px rgba(59,130,246,0.12)",
          }}
        />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative">
        <div
          className={`text-center mb-6 sm:mb-7 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}
        >
          <span
            className={`inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium ${isLightAppearance ? "border border-[rgba(200,180,150,0.25)] bg-[rgba(255,251,245,0.4)] text-blue-700 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,250,240,0.6)]" : "border border-blue-400/20 bg-blue-500/10 text-blue-200 backdrop-blur-sm"}`}
          >
            <span className="w-2 h-2 rounded-full mr-2 bg-blue-400" />
            Growth &amp; Partnerships
          </span>
          <h3
            className={`text-2xl sm:text-4xl font-bold mt-4 mb-2.5 ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
          >
            Shop Signup and Insurer Partnerships
          </h3>
          <p
            className={`text-base sm:text-lg leading-relaxed max-w-3xl mx-auto ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
          >
            Submit your information to join the BidOnDent network. Every request is reviewed and
            confirmed by our team.
          </p>
        </div>

        <div
          className={`rounded-2xl p-6 md:p-8 ${isLightAppearance ? "border border-[rgba(200,180,150,0.3)] backdrop-blur-sm" : "border border-blue-400/22 backdrop-blur-sm rounded-2xl"}`}
          style={
            isLightAppearance
              ? {
                  background:
                    "linear-gradient(180deg, rgba(255, 253, 248, 0.68) 0%, rgba(250, 247, 240, 0.58) 100%)",
                  boxShadow:
                    "0 14px 44px rgba(0, 0, 0, 0.13), 0 4px 16px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255, 250, 240, 0.92), 0 0 0 1px rgba(200, 180, 150, 0.18)",
                }
              : {
                  background:
                    "linear-gradient(180deg, rgba(10, 18, 35, 0.86) 0%, rgba(8, 14, 28, 0.82) 100%)",
                  boxShadow:
                    "0 14px 36px rgba(3, 10, 24, 0.48), inset 0 1px 0 rgba(59, 130, 246, 0.14), 0 0 0 1px rgba(59, 130, 246, 0.06)",
                }
          }
        >
          {!formOpen ? (
            /* ── Gateway: choose your role before the form appears ── */
            <div className="py-4">
              <p
                className={`text-center mb-8 max-w-lg mx-auto ${isLightAppearance ? "text-slate-500" : "text-blue-100/70"}`}
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
                  className={`group relative flex items-center gap-4 rounded-2xl px-6 py-5 text-left border transition-all duration-200 sm:min-w-[260px] ${isLightAppearance ? "border-[rgba(200,180,150,0.25)] bg-[rgba(255,251,245,0.35)] hover:bg-[rgba(255,251,245,0.55)] hover:border-[rgba(200,180,150,0.3)] backdrop-blur-sm shadow-[0_6px_22px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,250,240,0.65)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]" : "border-blue-400/20 bg-white/5 hover:bg-white/10 hover:border-blue-400/40"}`}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-blue-600" : "bg-[#003d82]"}`}
                  >
                    <Building2 className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-bold text-lg ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
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
                    className={`w-5 h-5 group-hover:translate-x-0.5 transition-all duration-200 ${isLightAppearance ? "text-blue-400/60 group-hover:text-blue-500" : "text-blue-300/60 group-hover:text-blue-300"}`}
                  />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setActiveForm("insurer");
                    setFormOpen(true);
                    setSubmitMessage("");
                  }}
                  className={`group relative flex items-center gap-4 rounded-2xl px-6 py-5 text-left border transition-all duration-200 sm:min-w-[260px] ${isLightAppearance ? "border-[rgba(200,180,150,0.25)] bg-[rgba(255,251,245,0.35)] hover:bg-[rgba(255,251,245,0.55)] hover:border-[rgba(200,180,150,0.3)] backdrop-blur-sm shadow-[0_6px_22px_rgba(0,0,0,0.09),0_2px_6px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,250,240,0.65)] hover:shadow-[0_10px_28px_rgba(0,0,0,0.12)]" : "border-blue-400/20 bg-white/5 hover:bg-white/10 hover:border-blue-400/40"}`}
                >
                  <div
                    className={`flex-shrink-0 w-12 h-12 rounded-[1rem] flex items-center justify-center ${isLightAppearance ? "bg-indigo-600" : "bg-[#1e3a5f]"}`}
                  >
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`font-bold text-lg ${isLightAppearance ? "text-slate-800" : "text-slate-100"}`}
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
                    className={`w-5 h-5 group-hover:translate-x-0.5 transition-all duration-200 ${isLightAppearance ? "text-blue-400/60 group-hover:text-blue-500" : "text-blue-300/60 group-hover:text-blue-300"}`}
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
                  className={`inline-flex items-center gap-1.5 text-sm font-medium transition-colors ${isLightAppearance ? "text-slate-500 hover:text-slate-700" : "text-blue-100/60 hover:text-blue-100"}`}
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
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200/60"
                        : "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25"
                      : isLightAppearance
                        ? "bg-red-50 text-red-700 border border-red-200/60"
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
      {/* Bottom transition — blends into CTA sky-blue */}
      <div
        className={`absolute bottom-0 left-0 right-0 h-28 pointer-events-none ${isLightAppearance ? "bg-gradient-to-b from-transparent to-[#e8f1fc]" : "bg-gradient-to-b from-transparent to-[#0c1e4a]"}`}
      />
    </section>
  );
}
