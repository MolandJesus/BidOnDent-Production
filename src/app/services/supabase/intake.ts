import { requestSupabaseEdge, SUPABASE_EDGE_ROUTES } from "./runtime";

type ShopInterestPayload = {
  shop_name: string;
  dmv_registration_number: string;
  contact_person: string;
  email: string;
  phone_number: string;
  website?: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
};

type InsurerInterestPayload = {
  company_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  notes?: string;
};

export async function submitShopInterest(payload: ShopInterestPayload) {
  const data = await requestSupabaseEdge<{ submissionId?: string | null }>(
    SUPABASE_EDGE_ROUTES.shopInterest,
    {
      body: JSON.stringify(payload),
      method: "POST",
    }
  );

  return data;
}

export async function submitInsurerInterest(payload: InsurerInterestPayload) {
  const data = await requestSupabaseEdge<{ submissionId?: string | null }>(
    SUPABASE_EDGE_ROUTES.insurerInterest,
    {
      body: JSON.stringify(payload),
      method: "POST",
    }
  );

  return data;
}
