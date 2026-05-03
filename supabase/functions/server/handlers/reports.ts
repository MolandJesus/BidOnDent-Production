/**
 * Damage Report CRUD Route Handlers
 * Handles all damage report-related operations (create, read, update, delete)
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  ensureClerkUserMatchesSession,
  getAuthenticatedProfile,
  requireClerkSession,
  requireMarketplaceContext,
} from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";
import { hydrateSignedStorageUrls } from "../utils/storage.ts";
import { resolveShopGeoReportIds } from "./geographic_matching.ts";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

function buildReportPayload(
  clerkUserId: string,
  report: any,
  options: { includeClientRequestId?: boolean } = {}
) {
  const clientRequestId =
    typeof report?.client_request_id === 'string' && report.client_request_id.trim().length > 0
      ? report.client_request_id.trim()
      : null;

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
    ...(options.includeClientRequestId && clientRequestId
      ? { client_request_id: clientRequestId }
      : {}),
  };
}

function buildPartialReportPayload(
  clerkUserId: string,
  report: Record<string, unknown>
): Record<string, unknown> {
  const payload: Record<string, unknown> = { clerk_user_id: clerkUserId };

  const fieldMap: Record<string, (val: unknown) => unknown> = {
    vehicle_id: (v) => v || null,
    vehicle_make: (v) => v,
    vehicle_model: (v) => v,
    vehicle_year: (v) => v,
    damage_type: (v) => v,
    damage_severity: (v) => v || 'moderate',
    damage_description: (v) => v,
    damage_location: (v) => v,
    address: (v) => v || null,
    city: (v) => v || null,
    state: (v) => v || null,
    zip_code: (v) => v || null,
    latitude: (v) => typeof v === 'number' ? v : null,
    longitude: (v) => typeof v === 'number' ? v : null,
    photo_urls: (v) => v || [],
    insurance_claim: (v) => v || false,
    insurance_company: (v) => v || null,
    preferred_contact: (v) => v || 'email',
    additional_notes: (v) => v,
    status: (v) => v || 'pending',
  };

  for (const [key, transform] of Object.entries(fieldMap)) {
    if (key in report) {
      payload[key] = transform(report[key]);
    }
  }

  return payload;
}

async function hydrateReport(record: any, supabase: SupabaseClient) {
  try {
    // Hydrate signed photo URLs
    const photo_urls = await hydrateSignedStorageUrls(
      supabase,
      Array.isArray(record?.photo_urls) ? record.photo_urls : []
    );

    // Fetch customer profile for marketplace consumers (shops/insurers)
    let customer_name: string | null = null;
    let customer_email: string | null = null;
    let customer_phone: string | null = null;
    if (record?.clerk_user_id) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('name, email, phone')
        .eq('clerk_user_id', record.clerk_user_id)
        .maybeSingle();
      if (profile) {
        customer_name = profile.name || null;
        customer_email = profile.email || null;
        customer_phone = profile.phone || null;
      }
    }

    // Count bids for this report
    let bids_count = 0;
    if (record?.id) {
      const { count } = await supabase
        .from('bids')
        .select('id', { count: 'exact', head: true })
        .eq('damage_report_id', record.id);
      bids_count = count ?? 0;
    }

    return {
      ...record,
      photo_urls,
      customer_name,
      customer_email,
      customer_phone,
      bids_count,
    };
  } catch (err) {
    // If hydration fails for a single report, return it with safe defaults
    // rather than crashing the entire batch.
    //
    // photo_urls fail closed: returning the raw `record.photo_urls` here
    // would leak `storage://...` pointers to the client (LAW #4 violation —
    // the browser cannot render those, and they bypass signed-URL access
    // control). Empty array is the only safe fallback.
    console.error('[hydrateReport] Error hydrating report', record?.id, ':', err);
    return {
      ...record,
      photo_urls: [],
      customer_name: null,
      customer_email: null,
      customer_phone: null,
      bids_count: 0,
    };
  }
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
    const clientRequestId =
      typeof report?.client_request_id === 'string' && report.client_request_id.trim().length > 0
        ? report.client_request_id.trim()
        : null;

    const requiredFields = ['vehicle_make', 'vehicle_model', 'vehicle_year', 'damage_type', 'damage_location'] as const;
    for (const field of requiredFields) {
      if (!report?.[field]) {
        return respond({ error: `Missing required field: ${field}` }, 400);
      }
    }

    const { data, error } = await supabase
      .from('damage_reports')
      .insert({
        ...buildReportPayload(authenticatedClerkUserId, report, { includeClientRequestId: true }),
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505' && clientRequestId) {
        const { data: existingReport, error: existingReportError } = await supabase
          .from('damage_reports')
          .select('*')
          .eq('clerk_user_id', authenticatedClerkUserId)
          .eq('client_request_id', clientRequestId)
          .is('deleted_at', null)
          .maybeSingle();

        if (existingReportError) {
          console.error('Error fetching existing idempotent damage report:', existingReportError);
          return respond({ error: sanitizeErrorMessage(existingReportError) }, 500);
        }

        if (existingReport) {
          return respond({
            success: true,
            report: await hydrateReport(existingReport, supabase),
          });
        }
      }

      console.error('Error saving damage report:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    // Fire-and-forget: log activity event
    supabase.from('platform_activity_events').insert({
      event_type: 'report_submitted',
      source: 'api',
      actor_id: authenticatedClerkUserId,
      object_id: data?.id || null,
      outcome: 'success',
      payload: {
        vehicle: `${report.vehicle_year} ${report.vehicle_make} ${report.vehicle_model}`,
        damage_type: report.damage_type,
      },
    }).then(null, () => {});

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
    const sessionClerkUserId = ensureClerkUserMatchesSession(
      session,
      url.searchParams.get('clerkUserId')
    );
    const profile = await getAuthenticatedProfile(supabase, session);

    const limit = Math.min(Number(url.searchParams.get('limit') ?? 50), 200);
    const offset = Math.max(Number(url.searchParams.get('offset') ?? 0), 0);

    const candidateClerkUserIds = new Set<string>();
    candidateClerkUserIds.add(sessionClerkUserId);
    if (profile?.clerk_user_id) {
      candidateClerkUserIds.add(profile.clerk_user_id);
    }

    const baseQuery = supabase
      .from('damage_reports')
      .select('*')
      .is('deleted_at', null);

    const filteredQuery =
      candidateClerkUserIds.size === 1
        ? baseQuery.eq('clerk_user_id', sessionClerkUserId)
        : baseQuery.in('clerk_user_id', Array.from(candidateClerkUserIds));

    const { data: primaryData, error } = await filteredQuery;

    if (error) {
      console.error('Error fetching damage reports:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    let viaUserId: any[] = [];
    if (profile?.user_id) {
      const userIdResult = await supabase
        .from('damage_reports')
        .select('*')
        .eq('user_id', profile.user_id)
        .is('deleted_at', null);

      if (userIdResult.error) {
        console.error('Error fetching damage reports by user_id:', userIdResult.error);
        return respond({ error: sanitizeErrorMessage(userIdResult.error) }, 500);
      }

      viaUserId = userIdResult.data ?? [];
    }

    const mergedReportsById = new Map<string, any>();
    for (const row of [...(primaryData ?? []), ...viaUserId]) {
      if (typeof row?.id === 'string') {
        mergedReportsById.set(row.id, row);
      }
    }

    const mergedData = Array.from(mergedReportsById.values()).sort((left: any, right: any) =>
      String(right?.created_at ?? '').localeCompare(String(left?.created_at ?? ''))
    );

    const staleIds = mergedData
      .filter((row: any) => row.clerk_user_id !== sessionClerkUserId)
      .map((row: any) => row.id)
      .filter((id: any) => typeof id === 'string');

    if (staleIds.length > 0) {
      await supabase
        .from('damage_reports')
        .update({ clerk_user_id: sessionClerkUserId })
        .in('id', staleIds);
    }

    const data = mergedData.slice(offset, offset + limit);

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
      ...buildPartialReportPayload(authenticatedClerkUserId, report),
      updated_at: new Date().toISOString(),
    };

    console.log('[updateReport] reportId:', reportId, '| authenticatedClerkUserId:', authenticatedClerkUserId, '| payload keys:', Object.keys(payload));

    const { data, error } = await supabase
      .from('damage_reports')
      .update(payload)
      .eq('id', reportId)
      .eq('clerk_user_id', authenticatedClerkUserId)
      .select()
      .maybeSingle();

    console.log('[updateReport] result — data:', data ? `id=${data.id} status=${data.status}` : 'null (0 rows matched)', '| error:', error ? error.message : 'none');

    if (error) {
      console.error('Error updating damage report:', error);
      return respond({ error: sanitizeErrorMessage(error) }, 500);
    }

    if (!data) {
      console.warn('[updateReport] 0 rows updated — reportId or clerk_user_id did not match. reportId:', reportId, 'clerkUserId:', authenticatedClerkUserId);
      return respond({ error: 'Report not found or access denied', success: false, report: null }, 404);
    }

    // Pass 5.5 / Pass 2 (KI-049): when the customer marks the report as completed,
    // propagate to the active job_assignments row so the shop's queue reflects truth.
    // Soft propagation — never fatal to the report update itself.
    if (payload.status === 'completed') {
      const completedAt = new Date().toISOString();
      const { data: assignment, error: assignErr } = await supabase
        .from('job_assignments')
        .update({ status: 'completed', updated_at: completedAt })
        .eq('damage_report_id', reportId)
        .in('status', ['scheduled', 'in_progress', 'awaiting_parts'])
        .is('deleted_at', null)
        .select('id')
        .maybeSingle();

      if (assignErr) {
        console.error('[updateReport] completion propagation to job_assignments failed:', sanitizeErrorMessage(assignErr.message));
      } else if (assignment?.id) {
        // Fire-and-forget activity event linking both objects
        supabase.from('platform_activity_events').insert({
          event_type: 'repair_completed',
          source: 'api',
          actor_id: authenticatedClerkUserId,
          object_id: assignment.id,
          outcome: 'success',
          payload: {
            damage_report_id: reportId,
            job_assignment_id: assignment.id,
            initiated_by: 'customer',
          },
        }).then(null, () => {});
      }
    }

    return respond({
      success: true,
      report: await hydrateReport(data, supabase),
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
    const { profile } = await requireMarketplaceContext(req, supabase);

    // ── Shop: geographic filtering via service areas ──
    if (profile?.account_type === 'shop' && profile.clerk_user_id) {
      const geoReportIds = await resolveShopGeoReportIds(profile.clerk_user_id, supabase);

      if (geoReportIds !== null) {
        // Shop has service areas — return only geo-matched reports (may be empty)
        if (geoReportIds.length === 0) {
          return respond({ reports: [], geoFiltered: true });
        }
        const { data: geoData, error: geoError } = await supabase
          .from('damage_reports')
          .select('*')
          .in('id', geoReportIds)
          .is('deleted_at', null)
          .in('status', ['pending', 'reviewing', 'quoted'])
          .order('created_at', { ascending: false });

        if (geoError) {
          console.error('Error fetching geo-filtered reports:', geoError);
          return respond({ error: sanitizeErrorMessage(geoError) }, 500);
        }
        return respond({
          reports: await Promise.all((geoData || []).map((r: any) => hydrateReport(r, supabase))),
          geoFiltered: true,
        });
      }

      // Fallback: shop has no service areas — return bounded recent biddable reports
      const { data: fallbackData, error: fallbackError } = await supabase
        .from('damage_reports')
        .select('*')
        .is('deleted_at', null)
        .in('status', ['pending', 'reviewing', 'quoted'])
        .order('created_at', { ascending: false })
        .limit(50);

      if (fallbackError) {
        console.error('Error fetching fallback marketplace reports:', fallbackError);
        return respond({ error: sanitizeErrorMessage(fallbackError) }, 500);
      }

      return respond({
        reports: await Promise.all((fallbackData || []).map((r: any) => hydrateReport(r, supabase))),
        geoFiltered: false,
      });
    }

    // ── Insurer / Admin: all reports, bounded ──
    const { data, error } = await supabase
      .from('damage_reports')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(100);

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

    // Block deletion if the report has an accepted bid (fully accepted on both ends)
    const { data: acceptedBids } = await supabase
      .from('bids')
      .select('id')
      .eq('damage_report_id', reportId)
      .eq('status', 'accepted')
      .limit(1);

    if (acceptedBids && acceptedBids.length > 0) {
      return respond({ error: 'Cannot delete a report with an accepted bid' }, 409);
    }

    const { error } = await supabase
      .from('damage_reports')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', reportId)
      .eq('clerk_user_id', authenticatedClerkUserId)
      .is('deleted_at', null);

    if (error) {
      console.error('Error soft-deleting report:', error);
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
