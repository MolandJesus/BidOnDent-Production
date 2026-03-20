import { useState } from "react";
import { Check, ArrowRight, Building, Clock, Award } from "lucide-react";
import { motion } from "motion/react";

type ShopOnboardingProps = {
  primaryColor?: string;
  secondaryColor?: string;
  onComplete: (data: any) => void;
};

export default function ShopOnboarding({
  primaryColor = "#003d82",
  secondaryColor = "#00a0e9",
  onComplete
}: ShopOnboardingProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    shopName: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    phone: "",
    website: "",
    hours: "",
    certifications: [] as string[],
    specialties: [] as string[],
    insurance: false,
    estimates: false
  });

  const certificationOptions = [
    "ASE Certified",
    "I-CAR Gold Class",
    "Tesla Certified",
    "BMW Certified",
    "Mercedes Certified",
    "AAA Approved",
    "Porsche Approved"
  ];

  const specialtyOptions = [
    "Collision Repair",
    "Paintless Dent Removal",
    "Frame Straightening",
    "Custom Paint",
    "Luxury Vehicles",
    "Insurance Claims",
    "Fleet Services"
  ];

  const toggleArrayItem = (array: string[], item: string) => {
    if (array.includes(item)) {
      return array.filter(i => i !== item);
    } else {
      return [...array, item];
    }
  };

  const handleNext = () => {
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    onComplete(formData);
  };

  const progress = Math.round((step / 4) * 100);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex justify-between items-center mb-2">
            <h1 className="font-bold">Shop Setup</h1>
            <span className="text-sm text-gray-500">Step {step} of 4</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: primaryColor }}
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-6 max-w-2xl mx-auto">
        {step === 1 && (
          <div>
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Building className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Shop Information</h2>
              <p className="text-gray-600 text-center">Let's start with the basics</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shop Name *
                </label>
                <input
                  type="text"
                  value={formData.shopName}
                  onChange={(e) => setFormData({...formData, shopName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Express Auto Body"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="123 Main St"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="City"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    State *
                  </label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="State"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code *
                </label>
                <input
                  type="text"
                  value={formData.zip}
                  onChange={(e) => setFormData({...formData, zip: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="12345"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => {
                    // Auto-format phone number as (XXX) XXX-XXXX
                    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
                    if (value.length > 10) value = value.slice(0, 10); // Limit to 10 digits

                    let formatted = '';
                    if (value.length > 0) {
                      formatted = '(' + value.substring(0, 3);
                      if (value.length >= 3) {
                        formatted += ') ' + value.substring(3, 6);
                      }
                      if (value.length >= 6) {
                        formatted += '-' + value.substring(6, 10);
                      }
                    }

                    setFormData({...formData, phone: formatted || value});
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Phone number"
                  inputMode="numeric"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Website (Optional)
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="https://yourshop.com"
                />
              </div>
            </div>

            <motion.button
              onClick={handleNext}
              disabled={!formData.shopName || !formData.address || !formData.city || !formData.state || !formData.zip || !formData.phone}
              className="w-full mt-6 py-3 px-4 rounded-md text-white font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: primaryColor }}
              whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0, 61, 130, 0.3)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              Continue
              <ArrowRight className="w-5 h-5 ml-2" />
            </motion.button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Business Hours</h2>
              <p className="text-gray-600 text-center">When are you open for business?</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Business Hours
                </label>
                <input
                  type="text"
                  value={formData.hours}
                  onChange={(e) => setFormData({...formData, hours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Mon-Fri: 8AM-6PM, Sat: 9AM-3PM"
                />
                <p className="text-xs text-gray-500 mt-1">You can edit this later in your profile</p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={handleBack}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded-md text-white font-medium flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0, 61, 130, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ background: `linear-gradient(135deg, ${primaryColor} 0%, ${secondaryColor} 100%)` }}
              >
                <Award className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Certifications</h2>
              <p className="text-gray-600 text-center">Select your certifications and specialties</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Certifications
                </label>
                <div className="flex flex-wrap gap-2">
                  {certificationOptions.map((cert) => (
                    <button
                      key={cert}
                      onClick={() => setFormData({
                        ...formData,
                        certifications: toggleArrayItem(formData.certifications, cert)
                      })}
                      className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                        formData.certifications.includes(cert)
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      {formData.certifications.includes(cert) && (
                        <Check className="w-4 h-4 inline mr-1" />
                      )}
                      {cert}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Specialties
                </label>
                <div className="flex flex-wrap gap-2">
                  {specialtyOptions.map((specialty) => (
                    <button
                      key={specialty}
                      onClick={() => setFormData({
                        ...formData,
                        specialties: toggleArrayItem(formData.specialties, specialty)
                      })}
                      className={`px-3 py-2 rounded-md text-sm border transition-colors ${
                        formData.specialties.includes(specialty)
                          ? "bg-blue-100 border-blue-500 text-blue-700"
                          : "bg-white border-gray-300 text-gray-700"
                      }`}
                    >
                      {formData.specialties.includes(specialty) && (
                        <Check className="w-4 h-4 inline mr-1" />
                      )}
                      {specialty}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={handleBack}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                onClick={handleNext}
                className="flex-1 py-3 px-4 rounded-md text-white font-medium flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0, 61, 130, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                Continue
                <ArrowRight className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div>
            <div className="mb-6">
              <div
                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                style={{ backgroundColor: "#34D399" }}
              >
                <Check className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-center mb-2">Almost Done!</h2>
              <p className="text-gray-600 text-center">Just a few more preferences</p>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium">Accept insurance claims</p>
                  <p className="text-sm text-gray-600">Work directly with insurance companies</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.insurance}
                  onChange={(e) => setFormData({...formData, insurance: e.target.checked})}
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </label>

              <label className="flex items-center justify-between p-4 border border-gray-200 rounded-lg cursor-pointer">
                <div>
                  <p className="font-medium">Provide free estimates</p>
                  <p className="text-sm text-gray-600">Offer complimentary damage assessments</p>
                </div>
                <input
                  type="checkbox"
                  checked={formData.estimates}
                  onChange={(e) => setFormData({...formData, estimates: e.target.checked})}
                  className="w-5 h-5"
                  style={{ accentColor: primaryColor }}
                />
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <motion.button
                onClick={handleBack}
                className="flex-1 py-3 px-4 border border-gray-300 rounded-md font-medium"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Back
              </motion.button>
              <motion.button
                onClick={handleComplete}
                className="flex-1 py-3 px-4 rounded-md text-white font-medium flex items-center justify-center"
                style={{ backgroundColor: primaryColor }}
                whileHover={{ scale: 1.02, boxShadow: "0 10px 30px rgba(0, 61, 130, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.15 }}
              >
                Complete Setup
                <Check className="w-5 h-5 ml-2" />
              </motion.button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
