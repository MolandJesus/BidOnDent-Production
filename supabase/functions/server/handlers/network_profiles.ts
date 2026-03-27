/**
 * Provider-agnostic shop and insurer profile handlers.
 * These routes key records by website_user_key so Clerk-backed website accounts can persist
 * business directory data without depending on Supabase Auth users.
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

function buildShopProfilePayload(identity: any, profile: any) {
  return {
    about_summary: profile.aboutSummary || null,
    accepts_insurance_claims: !!profile.acceptsInsuranceClaims,
    average_rating: profile.averageRating ?? null,
    average_ticket_value: profile.averageTicketValue ?? null,
    business_address: profile.businessAddress || null,
    business_city: profile.businessCity || null,
    business_hours: profile.businessHours || null,
    business_name: profile.businessName,
    business_phone: profile.businessPhone || null,
    business_state: profile.businessState || null,
    business_zip: profile.businessZip || null,
    certifications: Array.isArray(profile.certifications) ? profile.certifications : [],
    clerk_user_id: identity?.provider === "clerk" ? identity.providerUserId || null : null,
    completion_rate: profile.completionRate ?? null,
    geo_latitude: profile.geoLatitude ?? null,
    geo_longitude: profile.geoLongitude ?? null,
    insurer_programs: Array.isArray(profile.insurerPrograms) ? profile.insurerPrograms : [],
    is_accepting_bids: profile.isAcceptingBids ?? true,
    is_directory_visible: profile.isDirectoryVisible ?? true,
    offers_estimates: !!profile.offersEstimates,
    profile_image_url: profile.profileImageUrl || null,
    response_time_hours: profile.responseTimeHours ?? null,
    specialties: Array.isArray(profile.specialties) ? profile.specialties : [],
    supported_makes: Array.isArray(profile.supportedMakes) ? profile.supportedMakes : [],
    total_reviews: profile.totalReviews ?? null,
    website: profile.website || null,
    website_user_key: identity?.websiteUserKey,
  };
}

function buildInsurerProfilePayload(identity: any, profile: any) {
  return {
    account_connection_notes: Array.isArray(profile.accountConnectionNotes)
      ? profile.accountConnectionNotes
      : [],
    auto_approval: !!profile.autoApproval,
    benefits: Array.isArray(profile.benefits) ? profile.benefits : [],
    claim_types: Array.isArray(profile.claimTypes) ? profile.claimTypes : [],
    clerk_user_id: identity?.provider === "clerk" ? identity.providerUserId || null : null,
    company_address: profile.companyAddress || null,
    company_city: profile.companyCity || null,
    company_name: profile.companyName,
    company_phone: profile.companyPhone || null,
    company_state: profile.companyState || null,
    company_zip: profile.companyZip || null,
    description: profile.description || null,
    digital_claims_experience: profile.digitalClaimsExperience || "standard",
    is_directory_visible: profile.isDirectoryVisible ?? true,
    license_number: profile.licenseNumber || null,
    license_state: profile.licenseState || null,
    max_claim_amount: profile.maxClaimAmount ?? null,
    popular: !!profile.popular,
    preferred_shops: !!profile.preferredShops,
    profile_image_url: profile.profileImageUrl || null,
    repair_program_focus: Array.isArray(profile.repairProgramFocus) ? profile.repairProgramFocus : [],
    website: profile.website || null,
    website_user_key: identity?.websiteUserKey,
  };
}

export async function getShopProfile(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const websiteUserKey = url.searchParams.get("websiteUserKey");

    if (!websiteUserKey) {
      return respond({ error: "Missing websiteUserKey" }, 400);
    }

    const { data, error } = await supabase
      .from("shop_profiles")
      .select("*")
      .eq("website_user_key", websiteUserKey)
      .maybeSingle();

    if (error) {
      console.error("Error fetching shop profile:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      profile: data || null,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in get shop profile endpoint:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function saveShopProfile(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { identity, profile } = body || {};

    if (!identity?.websiteUserKey || !profile?.businessName) {
      return respond({ error: "Missing identity or businessName" }, 400);
    }

    const payload = buildShopProfilePayload(identity, profile);
    const { data, error } = await supabase
      .from("shop_profiles")
      .upsert(payload, {
        onConflict: "website_user_key",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving shop profile:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      profile: data,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in save shop profile endpoint:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function getInsurerProfile(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const websiteUserKey = url.searchParams.get("websiteUserKey");

    if (!websiteUserKey) {
      return respond({ error: "Missing websiteUserKey" }, 400);
    }

    const { data, error } = await supabase
      .from("insurer_profiles")
      .select("*")
      .eq("website_user_key", websiteUserKey)
      .maybeSingle();

    if (error) {
      console.error("Error fetching insurer profile:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      profile: data || null,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in get insurer profile endpoint:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function saveInsurerProfile(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { identity, profile } = body || {};

    if (!identity?.websiteUserKey || !profile?.companyName) {
      return respond({ error: "Missing identity or companyName" }, 400);
    }

    const payload = buildInsurerProfilePayload(identity, profile);
    const { data, error } = await supabase
      .from("insurer_profiles")
      .upsert(payload, {
        onConflict: "website_user_key",
      })
      .select()
      .single();

    if (error) {
      console.error("Error saving insurer profile:", error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      profile: data,
      success: true,
    });
  } catch (error: any) {
    console.error("Error in save insurer profile endpoint:", error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function getDirectoryInventory(
  _req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const [{ data: shops, error: shopsError }, { data: insurers, error: insurersError }] =
      await Promise.all([
        supabase
          .from("shop_profiles")
          .select("*")
          .eq("is_directory_visible", true)
          .order("updated_at", { ascending: false }),
        supabase
          .from("insurer_profiles")
          .select("*")
          .eq("is_directory_visible", true)
          .order("updated_at", { ascending: false }),
      ]);

    if (shopsError || insurersError) {
      console.error("Error fetching directory inventory:", shopsError || insurersError);
      return respond({
        insurers: [],
        shops: [],
        success: true,
      });
    }

    return respond({
      insurers: insurers || [],
      shops: shops || [],
      success: true,
    });
  } catch (error: any) {
    console.error("Error in get directory inventory endpoint:", error);
    return respond({
      insurers: [],
      shops: [],
      success: true,
    });
  }
}
