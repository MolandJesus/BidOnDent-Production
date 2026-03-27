import { useState } from "react";
import type { CustomProspect } from "./insurerPartnerShopsUtils";
import type { DashboardAppearanceMode } from "../../routers/dashboard-router-types";

type AddProspectModalProps = {
  primaryColor: string;
  onClose: () => void;
  onSubmit: (prospect: CustomProspect) => void;
  appearanceMode?: DashboardAppearanceMode;
};

const emptyFormData = {
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  specialties: "",
  certifications: "",
};

export default function AddProspectModal({
  primaryColor,
  onClose,
  onSubmit,
  appearanceMode = "map-dark",
}: AddProspectModalProps) {
  const isLight = appearanceMode === "light";
  const [formData, setFormData] = useState(emptyFormData);

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      return;
    }

    const prospect: CustomProspect = {
      id: `manual-${Date.now()}`,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zip: formData.zip,
      specialties: formData.specialties
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      certifications: formData.certifications
        .split(",")
        .map((entry) => entry.trim())
        .filter(Boolean),
      status: "pending",
    };

    onSubmit(prospect);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-4 sm:items-center">
      <div
        className={`max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-2xl bd-glass-card sm:rounded-2xl ${
          isLight ? "bg-white shadow-xl" : ""
        }`}
      >
        <div className="p-4 sm:p-6">
          <h2
            className={`mb-4 text-2xl font-bold ${isLight ? "text-slate-900" : "text-slate-100"}`}
          >
            Add Manual Prospect
          </h2>

          <div className="space-y-4">
            <div>
              <label
                className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Shop Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(event) => setFormData({ ...formData, name: event.target.value })}
                className={`w-full rounded-2xl border px-4 py-2 ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800"
                    : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                }`}
                placeholder="Metro Collision Group"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
                >
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(event) => setFormData({ ...formData, email: event.target.value })}
                  className={`w-full rounded-2xl border px-4 py-2 ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-800"
                      : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                  }`}
                  placeholder="partners@shop.com"
                />
              </div>
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
                >
                  Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(event) => setFormData({ ...formData, phone: event.target.value })}
                  className={`w-full rounded-2xl border px-4 py-2 ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-800"
                      : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                  }`}
                  placeholder="(555) 123-4567"
                />
              </div>
            </div>

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Street Address
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(event) => setFormData({ ...formData, address: event.target.value })}
                className={`w-full rounded-2xl border px-4 py-2 ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800"
                    : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                }`}
                placeholder="1234 Main St"
              />
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
                >
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(event) => setFormData({ ...formData, city: event.target.value })}
                  className={`w-full rounded-2xl border px-4 py-2 ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-800"
                      : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                  }`}
                  placeholder="White Plains"
                />
              </div>
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
                >
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(event) => setFormData({ ...formData, state: event.target.value })}
                  className={`w-full rounded-2xl border px-4 py-2 ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-800"
                      : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                  }`}
                  placeholder="NY"
                  maxLength={2}
                />
              </div>
              <div>
                <label
                  className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
                >
                  ZIP
                </label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(event) => setFormData({ ...formData, zip: event.target.value })}
                  className={`w-full rounded-2xl border px-4 py-2 ${
                    isLight
                      ? "border-slate-200 bg-white text-slate-800"
                      : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                  }`}
                  placeholder="10601"
                />
              </div>
            </div>

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Specialties
              </label>
              <input
                type="text"
                value={formData.specialties}
                onChange={(event) => setFormData({ ...formData, specialties: event.target.value })}
                className={`w-full rounded-2xl border px-4 py-2 ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800"
                    : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                }`}
                placeholder="Collision Repair, ADAS, EV"
              />
            </div>

            <div>
              <label
                className={`mb-2 block text-sm font-medium ${isLight ? "text-slate-700" : "text-slate-300"}`}
              >
                Certifications
              </label>
              <input
                type="text"
                value={formData.certifications}
                onChange={(event) =>
                  setFormData({ ...formData, certifications: event.target.value })
                }
                className={`w-full rounded-2xl border px-4 py-2 ${
                  isLight
                    ? "border-slate-200 bg-white text-slate-800"
                    : "border-slate-300/30 bg-white/[0.08] text-slate-100"
                }`}
                placeholder="I-CAR Gold Class, ASE Certified"
              />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 rounded-2xl py-3 font-medium bd-glass-control--secondary"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.email || !formData.phone}
              className="flex-1 rounded-2xl py-3 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              Add Prospect
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
