import { supabase } from "./client";

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

async function logPlatformActivity(eventType: string, payload: Record<string, unknown>) {
  const { error } = await supabase.from("platform_activity_events").insert({
    event_type: eventType,
    payload,
    source: "landing",
  });

  if (error) {
    throw error;
  }
}

export async function submitShopInterest(payload: ShopInterestPayload) {
  const { data, error } = await supabase
    .from("shop_interest_submissions")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  await logPlatformActivity("shop_interest_submitted", {
    submission_id: data?.id,
    shop_name: payload.shop_name,
    state: payload.state,
    zip_code: payload.zip_code,
  });

  return data;
}

export async function submitInsurerInterest(payload: InsurerInterestPayload) {
  const { data, error } = await supabase
    .from("insurer_interest_submissions")
    .insert(payload)
    .select("id")
    .single();

  if (error) {
    throw error;
  }

  await logPlatformActivity("insurer_interest_submitted", {
    submission_id: data?.id,
    company_name: payload.company_name,
  });

  return data;
}
