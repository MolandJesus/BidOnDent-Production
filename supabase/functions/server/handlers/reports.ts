/**
 * Damage Report CRUD Route Handlers
 * Handles all damage report-related operations (create, read, update, delete)
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { findExistingProfile } from "./profiles.ts";
import { softVerifyClerkMutation } from "../utils/clerk.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

async function resolveReportClerkUserId(
  supabase: SupabaseClient,
  identity: {
    clerkUserId?: string | null;
    email?: string | null;
    websiteUserKey?: string | null;
  }
) {
  if (identity.clerkUserId) {
    return identity.clerkUserId;
  }

  const profile = await findExistingProfile(supabase, identity);
  return profile?.clerk_user_id || null;
}

function buildReportPayload(clerkUserId: string, report: any) {
  return {
    clerk_user_id: clerkUserId,
    vehicle_id: report.vehicle_id || null,
    vehicle_make: report.vehicle_make,
    vehicle_model: report.vehicle_model,
    vehicle_year: report.vehicle_year,
    damage_type: report.damage_type,
    damage_severity: report.damage_severity || 'moderate',
    damage_description: report.damage_description,
    damage_location: report.damage_location,
    address: report.address || null,
    city: report.city || null,
    state: report.state || null,
    zip_code: report.zip_code || null,
    photo_urls: report.photo_urls || [],
    insurance_claim: report.insurance_claim || false,
    insurance_company: report.insurance_company || null,
    preferred_contact: report.preferred_contact || 'email',
    additional_notes: report.additional_notes,
    status: report.status || 'pending',
  };
}

export async function createReport(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { clerkUserId, report } = body;

    if (!clerkUserId) {
      return respond({ error: 'Missing clerkUserId' }, 400);
    }

    const requiredFields = ['vehicle_make', 'vehicle_model', 'vehicle_year', 'damage_type'] as const;
    for (const field of requiredFields) {
      if (!report?.[field]) {
        return respond({ error: `Missing required field: ${field}` }, 400);
      }
    }

    const { mismatch } = await softVerifyClerkMutation(req, clerkUserId);
    if (mismatch) {
      return respond({ error: 'Unauthorized: clerkUserId does not match session' }, 401);
    }

    const { data, error } = await supabase
      .from('damage_reports')
      .insert(buildReportPayload(clerkUserId, report))
      .select()
      .single();

    if (error) {
      console.error('Error saving damage report:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, report: data });
  } catch (error: any) {
    console.error('Error in save damage report endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function getReports(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const clerkUserId = await resolveReportClerkUserId(supabase, {
      clerkUserId: url.searchParams.get('clerkUserId'),
      email: url.searchParams.get('email'),
      websiteUserKey: url.searchParams.get('websiteUserKey'),
    });

    if (!clerkUserId) {
      return respond({ error: 'Missing clerkUserId or equivalent website identity' }, 400);
    }

    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0);

    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching damage reports:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ reports: data });
  } catch (error: any) {
    console.error('Error in get damage reports endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function updateReport(
  req: Request,
  reportId: string | undefined,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const { clerkUserId, report } = body;

    if (!reportId || !clerkUserId) {
      return respond({ error: 'Missing reportId or clerkUserId' }, 400);
    }

    const { mismatch } = await softVerifyClerkMutation(req, clerkUserId);
    if (mismatch) {
      return respond({ error: 'Unauthorized: clerkUserId does not match session' }, 401);
    }

    const payload = {
      ...buildReportPayload(clerkUserId, report),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('damage_reports')
      .update(payload)
      .eq('id', reportId)
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating damage report:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, report: data });
  } catch (error: any) {
    console.error('Error in update damage report endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function getMarketplaceReports(
  _req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace reports:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ reports: data });
  } catch (error: any) {
    console.error('Error in marketplace reports endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}

export async function deleteReport(
  reportId: string | undefined,
  clerkUserId: string | null,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    if (!reportId || !clerkUserId) {
      return respond({ error: 'Missing reportId or clerkUserId' }, 400);
    }

    const { error } = await supabase
      .from('damage_reports')
      .delete()
      .eq('id', reportId)
      .eq('clerk_user_id', clerkUserId);

    if (error) {
      console.error('Error deleting report:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, message: 'Report deleted' });
  } catch (error: any) {
    console.error('Error in delete report endpoint:', error);
    return respond({ error: sanitizeErrorMessage(error) }, 500);
  }
}
