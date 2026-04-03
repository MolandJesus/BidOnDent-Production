/**
 * Damage Report CRUD Route Handlers
 * Handles all damage report-related operations (create, read, update, delete)
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  ensureClerkUserMatchesSession,
  requireClerkSession,
  requireMarketplaceContext,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";
import { hydrateSignedStorageUrls } from "../utils/storage.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

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
    latitude: typeof report.latitude === 'number' ? report.latitude : null,
    longitude: typeof report.longitude === 'number' ? report.longitude : null,
    photo_urls: report.photo_urls || [],
    insurance_claim: report.insurance_claim || false,
    insurance_company: report.insurance_company || null,
    preferred_contact: report.preferred_contact || 'email',
    additional_notes: report.additional_notes,
    status: report.status || 'pending',
  };
}

async function hydrateReport(record: any, supabase: SupabaseClient) {
  return {
    ...record,
    photo_urls: await hydrateSignedStorageUrls(
      supabase,
      Array.isArray(record?.photo_urls) ? record.photo_urls : []
    ),
  };
}

export async function createReport(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const session = await requireClerkSession(req, { requireEmail: false });
    const { clerkUserId, report } = body;
    const authenticatedClerkUserId = ensureClerkUserMatchesSession(
      session,
      clerkUserId || null
    );

    const requiredFields = ['vehicle_make', 'vehicle_model', 'vehicle_year', 'damage_type', 'damage_location'] as const;
    for (const field of requiredFields) {
      if (!report?.[field]) {
        return respond({ error: `Missing required field: ${field}` }, 400);
      }
    }

    const { data, error } = await supabase
      .from('damage_reports')
      .insert(buildReportPayload(authenticatedClerkUserId, report))
      .select()
      .single();

    if (error) {
      console.error('Error saving damage report:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      success: true,
      report: data ? await hydrateReport(data, supabase) : null,
    });
  } catch (error: any) {
    console.error('Error in save damage report endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function getReports(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const session = await requireClerkSession(req, { requireEmail: false });
    const clerkUserId = ensureClerkUserMatchesSession(
      session,
      url.searchParams.get('clerkUserId')
    );

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

    return respond({
      reports: await Promise.all((data || []).map((record: any) => hydrateReport(record, supabase))),
    });
  } catch (error: any) {
    console.error('Error in get damage reports endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
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
    const session = await requireClerkSession(req, { requireEmail: false });
    const { clerkUserId, report } = body;

    if (!reportId || !clerkUserId) {
      return respond({ error: 'Missing reportId or clerkUserId' }, 400);
    }
    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    const payload = {
      ...buildReportPayload(authenticatedClerkUserId, report),
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('damage_reports')
      .update(payload)
      .eq('id', reportId)
      .eq('clerk_user_id', authenticatedClerkUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating damage report:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      success: true,
      report: data ? await hydrateReport(data, supabase) : null,
    });
  } catch (error: any) {
    console.error('Error in update damage report endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function getMarketplaceReports(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    await requireMarketplaceContext(req, supabase);

    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching marketplace reports:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({
      reports: await Promise.all((data || []).map((record: any) => hydrateReport(record, supabase))),
    });
  } catch (error: any) {
    console.error('Error in marketplace reports endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Marketplace access required")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}

export async function deleteReport(
  req: Request,
  reportId: string | undefined,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false });
    const url = new URL(req.url);
    const clerkUserId = url.searchParams.get("clerkUserId");

    if (!reportId || !clerkUserId) {
      return respond({ error: 'Missing reportId or clerkUserId' }, 400);
    }

    const authenticatedClerkUserId = ensureClerkUserMatchesSession(session, clerkUserId);

    const { error } = await supabase
      .from('damage_reports')
      .delete()
      .eq('id', reportId)
      .eq('clerk_user_id', authenticatedClerkUserId);

    if (error) {
      console.error('Error deleting report:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    return respond({ success: true, message: 'Report deleted' });
  } catch (error: any) {
    console.error('Error in delete report endpoint:', error);
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : error?.message?.includes("Authenticated user mismatch")
          ? 403
          : 500;
    return respond({ error: sanitizeErrorMessage(error) }, status);
  }
}
