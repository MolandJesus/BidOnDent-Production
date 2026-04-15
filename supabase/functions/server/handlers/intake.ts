import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (
  body: Record<string, unknown>,
  status?: number,
  headers?: Record<string, string>
) => Response;

type ShopInterestPayload = {
  address: string;
  city: string;
  contact_person: string;
  dmv_registration_number: string;
  email: string;
  phone_number: string;
  shop_name: string;
  state: string;
  website?: string;
  zip_code: string;
};

type InsurerInterestPayload = {
  company_name: string;
  contact_person: string;
  email: string;
  notes?: string;
  phone_number: string;
};

function getString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function getOptionalString(value: unknown) {
  const normalized = getString(value);
  return normalized.length > 0 ? normalized : null;
}

function getDigits(value: string) {
  return value.replace(/\D/g, "");
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidWebsite(value: string | null) {
  if (!value) {
    return true;
  }

  return /^https?:\/\/.+\..+|^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value);
}

function parseShopInterestPayload(body: Record<string, unknown>): ShopInterestPayload | null {
  const payload: ShopInterestPayload = {
    address: getString(body.address),
    city: getString(body.city),
    contact_person: getString(body.contact_person),
    dmv_registration_number: getString(body.dmv_registration_number),
    email: getString(body.email).toLowerCase(),
    phone_number: getString(body.phone_number),
    shop_name: getString(body.shop_name),
    state: getString(body.state),
    website: getOptionalString(body.website) || undefined,
    zip_code: getDigits(getString(body.zip_code)),
  };

  if (
    payload.shop_name.length === 0 ||
    payload.contact_person.length === 0 ||
    payload.address.length === 0 ||
    payload.city.length === 0 ||
    payload.state.length === 0 ||
    payload.dmv_registration_number.length < 3 ||
    !isValidEmail(payload.email) ||
    getDigits(payload.phone_number).length < 10 ||
    payload.zip_code.length !== 5 ||
    !isValidWebsite(payload.website || null)
  ) {
    return null;
  }

  return payload;
}

function parseInsurerInterestPayload(body: Record<string, unknown>): InsurerInterestPayload | null {
  const payload: InsurerInterestPayload = {
    company_name: getString(body.company_name),
    contact_person: getString(body.contact_person),
    email: getString(body.email).toLowerCase(),
    notes: getOptionalString(body.notes) || undefined,
    phone_number: getString(body.phone_number),
  };

  if (
    payload.company_name.length === 0 ||
    payload.contact_person.length === 0 ||
    !isValidEmail(payload.email) ||
    getDigits(payload.phone_number).length < 10
  ) {
    return null;
  }

  return payload;
}

export async function submitShopInterest(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const payload = parseShopInterestPayload(body);

    if (!payload) {
      return respond({ error: "Invalid shop interest submission" }, 400);
    }

    const { data, error } = await supabase
      .from("shop_interest_submissions")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    const { error: activityError } = await supabase.from("platform_activity_events").insert({
      event_type: "shop_interest_submitted",
      source: "landing",
      actor_id: payload.email || null,
      object_id: data?.id || null,
      outcome: "success",
      payload: {
        shop_name: payload.shop_name,
        state: payload.state,
        submission_id: data?.id,
        zip_code: payload.zip_code,
      },
    });

    if (activityError) {
      return respond({ error: sanitizeErrorMessage(activityError) }, 500);
    }

    return respond({
      submissionId: data?.id || null,
      success: true,
    });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function submitInsurerInterest(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    let body: Record<string, unknown> = {};

    try {
      body = await req.json();
    } catch {
      return respond({ error: "Invalid JSON in request body" }, 400);
    }

    const payload = parseInsurerInterestPayload(body);

    if (!payload) {
      return respond({ error: "Invalid insurer interest submission" }, 400);
    }

    const { data, error } = await supabase
      .from("insurer_interest_submissions")
      .insert(payload)
      .select("id")
      .single();

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    const { error: activityError } = await supabase.from("platform_activity_events").insert({
      event_type: "insurer_interest_submitted",
      source: "landing",
      actor_id: payload.email || null,
      object_id: data?.id || null,
      outcome: "success",
      payload: {
        company_name: payload.company_name,
        submission_id: data?.id,
      },
    });

    if (activityError) {
      return respond({ error: sanitizeErrorMessage(activityError) }, 500);
    }

    return respond({
      submissionId: data?.id || null,
      success: true,
    });
  } catch (error) {
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}
