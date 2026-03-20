import { FormEvent, useState } from "react";
import { Building2, Shield, Send } from "lucide-react";
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

  const handleShopSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

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
      setSubmitMessage("Shop application submitted. Our team will contact you to confirm onboarding.");
    } catch (error) {
      console.error("Shop submission failed", error);
      setSubmitMessage("Submission could not be completed right now. Please email partnerships@bidondent.com.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInsurerSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage("");

    try {
      await submitInsurerInterest({
        company_name: insurerForm.companyName,
        contact_person: insurerForm.contactPerson,
        email: insurerForm.email,
        phone_number: insurerForm.phoneNumber,
        notes: insurerForm.notes || undefined,
      });

      setInsurerForm(initialInsurerForm);
      setSubmitMessage("Partnership request submitted. Our insurer team will follow up shortly.");
    } catch (error) {
      console.error("Insurer submission failed", error);
      setSubmitMessage("Request could not be submitted right now. Please email partnerships@bidondent.com.");
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
          <div className="flex gap-3 mb-6">
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

          {activeForm === "shop" ? (
            <form className="grid md:grid-cols-2 gap-4" onSubmit={handleShopSubmit}>
              <input
                required
                value={shopForm.shopName}
                onChange={(e) => setShopForm({ ...shopForm, shopName: e.target.value })}
                placeholder="Shop Name"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                value={shopForm.dmvRegistrationNumber}
                onChange={(e) =>
                  setShopForm({ ...shopForm, dmvRegistrationNumber: e.target.value })
                }
                placeholder="DMV Registration Number"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                value={shopForm.contactPerson}
                onChange={(e) => setShopForm({ ...shopForm, contactPerson: e.target.value })}
                placeholder="Contact Person"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                type="email"
                value={shopForm.email}
                onChange={(e) => setShopForm({ ...shopForm, email: e.target.value })}
                placeholder="Email Address"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                value={shopForm.phoneNumber}
                onChange={(e) => setShopForm({ ...shopForm, phoneNumber: e.target.value })}
                placeholder="Phone Number"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                value={shopForm.website}
                onChange={(e) => setShopForm({ ...shopForm, website: e.target.value })}
                placeholder="Website"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                value={shopForm.address}
                onChange={(e) => setShopForm({ ...shopForm, address: e.target.value })}
                placeholder="Address"
                className="h-11 px-3 border border-slate-300 rounded-lg md:col-span-2"
              />
              <input
                required
                value={shopForm.city}
                onChange={(e) => setShopForm({ ...shopForm, city: e.target.value })}
                placeholder="City"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                value={shopForm.state}
                onChange={(e) => setShopForm({ ...shopForm, state: e.target.value })}
                placeholder="State"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                value={shopForm.zipCode}
                onChange={(e) => setShopForm({ ...shopForm, zipCode: e.target.value })}
                placeholder="ZIP Code"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 h-11 rounded-lg bg-slate-900 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  Submit Shop Application
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          ) : (
            <form className="grid md:grid-cols-2 gap-4" onSubmit={handleInsurerSubmit}>
              <input
                required
                value={insurerForm.companyName}
                onChange={(e) => setInsurerForm({ ...insurerForm, companyName: e.target.value })}
                placeholder="Company Name"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                value={insurerForm.contactPerson}
                onChange={(e) => setInsurerForm({ ...insurerForm, contactPerson: e.target.value })}
                placeholder="Contact Person"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                type="email"
                value={insurerForm.email}
                onChange={(e) => setInsurerForm({ ...insurerForm, email: e.target.value })}
                placeholder="Email Address"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <input
                required
                value={insurerForm.phoneNumber}
                onChange={(e) => setInsurerForm({ ...insurerForm, phoneNumber: e.target.value })}
                placeholder="Phone Number"
                className="h-11 px-3 border border-slate-300 rounded-lg"
              />
              <textarea
                value={insurerForm.notes}
                onChange={(e) => setInsurerForm({ ...insurerForm, notes: e.target.value })}
                placeholder="Partnership Notes"
                className="min-h-28 px-3 py-2 border border-slate-300 rounded-lg md:col-span-2"
              />

              <div className="md:col-span-2 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full md:w-auto px-6 h-11 rounded-lg bg-slate-900 text-white font-semibold inline-flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  Submit Partnership Request
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}

          {submitMessage && <p className="mt-4 text-sm text-slate-700">{submitMessage}</p>}
        </div>
      </div>
    </section>
  );
}
