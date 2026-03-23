export type ShopForm = {
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

export type InsurerForm = {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  notes: string;
};

export const initialShopForm: ShopForm = {
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

export const initialInsurerForm: InsurerForm = {
  companyName: "",
  contactPerson: "",
  email: "",
  phoneNumber: "",
  notes: "",
};

export function formatPhoneNumber(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
}

export function formatZipCode(value: string): string {
  return value.replace(/\D/g, "").slice(0, 5);
}

export function validateShopForm(shopForm: ShopForm): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(shopForm.email)) {
    return "Please enter a valid email address.";
  }

  const phoneDigits = shopForm.phoneNumber.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return "Please enter a valid phone number with at least 10 digits.";
  }

  const zipDigits = shopForm.zipCode.replace(/\D/g, "");
  if (zipDigits.length !== 5) {
    return "Please enter a valid 5-digit ZIP code.";
  }

  if (shopForm.dmvRegistrationNumber.trim().length < 3) {
    return "Please enter a valid DMV registration number.";
  }

  if (shopForm.website && shopForm.website.trim()) {
    const urlRegex = /^https?:\/\/.+\..+|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!urlRegex.test(shopForm.website)) {
      return "Please enter a valid website URL.";
    }
  }

  return null;
}

export function validateInsurerForm(insurerForm: InsurerForm): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(insurerForm.email)) {
    return "Please enter a valid email address.";
  }

  const phoneDigits = insurerForm.phoneNumber.replace(/\D/g, "");
  if (phoneDigits.length < 10) {
    return "Please enter a valid phone number with at least 10 digits.";
  }

  return null;
}
