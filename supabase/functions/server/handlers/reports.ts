/**
 * Damage Report CRUD Route Handlers
 * Handles all damage report-related operations (create, read, delete)
 */

import { SupabaseClient } from "npm:@supabase/supabase-js@2";

type RespondFunction = (body: any, status?: number, headers?: Record<string, string>) => Response;

const REPORT_SELECT = `
  *,
  bids (
    id,
    damage_report_id,
    shop_user_id,
    clerk_shop_user_id,
    shop_name,
    shop_email,
    amount,
    estimated_days,
    description,
    notes,
    status,
    shop_rating,
    shop_reviews,
    shop_distance,
    created_at,
    updated_at
  )
`;

/**
 * POST /reports - Create a new damage report
 * Saves a damage report with associated photos and metadata
 */
export async function createReport(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const clerkUserId = body.clerkUserId ?? body.clerk_user_id;
    const { report } = body;

    if (!clerkUserId) {
      return respond({ error: 'Missing clerkUserId' }, 400);
    }

    // Use service role to bypass RLS and save with clerk_user_id
    const { data, error } = await supabase
      .from('damage_reports')
      .insert({
        clerk_user_id: clerkUserId,
        vehicle_make: report.vehicle_make,
        vehicle_model: report.vehicle_model,
        vehicle_year: report.vehicle_year,
        damage_type: report.damage_type,
        damage_severity: report.damage_severity || 'moderate',
        damage_description: report.damage_description,
        damage_location: report.damage_location,
        photo_urls: report.photo_urls || [],
        insurance_claim: report.insurance_claim || false,
        insurance_company: report.insurance_company,
        preferred_contact: report.preferred_contact || 'email',
        additional_notes: report.additional_notes,
        status: report.status || 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving damage report:', error);
      return respond({ error: error.message }, 500);
    }

    return respond({ success: true, report: data });
  } catch (error: any) {
    console.error('Error in save damage report endpoint:', error);
    return respond({ error: error.message }, 500);
  }
}

/**
 * PUT /reports/:id - Update an existing damage report
 * Updates a report owned by the provided clerk user ID
 */
export async function updateReport(
  req: Request,
  reportId: string | undefined,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const body = await req.json();
    const clerkUserId = body.clerkUserId ?? body.clerk_user_id;
    const { report } = body;

    if (!reportId || !clerkUserId) {
      return respond({ error: 'Missing reportId or clerkUserId' }, 400);
    }

    const { data, error } = await supabase
      .from('damage_reports')
      .update({
        vehicle_id: report.vehicle_id,
        vehicle_make: report.vehicle_make,
        vehicle_model: report.vehicle_model,
        vehicle_year: report.vehicle_year,
        damage_type: report.damage_type,
        damage_severity: report.damage_severity || 'moderate',
        damage_description: report.damage_description,
        damage_location: report.damage_location,
        address: report.address,
        city: report.city,
        state: report.state,
        zip_code: report.zip_code,
        photo_urls: report.photo_urls || [],
        insurance_claim: report.insurance_claim || false,
        insurance_company: report.insurance_company,
        preferred_contact: report.preferred_contact || 'email',
        additional_notes: report.additional_notes,
        status: report.status || 'pending'
      })
      .eq('id', reportId)
      .eq('clerk_user_id', clerkUserId)
      .select()
      .single();

    if (error) {
      console.error('Error updating damage report:', error);
      return respond({ error: error.message }, 500);
    }

    return respond({ success: true, report: data });
  } catch (error: any) {
    console.error('Error in update damage report endpoint:', error);
    return respond({ error: error.message }, 500);
  }
}

/**
 * GET /reports - Retrieve all damage reports for a user
 * Fetches reports associated with the provided clerk user ID
 */
export async function getReports(
  req: Request,
  supabase: SupabaseClient,
  respond: RespondFunction
): Promise<Response> {
  try {
    const url = new URL(req.url);
    const clerkUserId = url.searchParams.get('clerkUserId');
    const scope = url.searchParams.get('scope');

    if (scope === 'marketplace' || scope === 'all') {
      const { data, error } = await supabase
        .from('damage_reports')
        .select(REPORT_SELECT)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching marketplace damage reports:', error);
        return respond({ error: error.message }, 500);
      }

      return respond({ reports: data });
    }

    if (!clerkUserId) {
      return respond({ error: 'Missing clerkUserId' }, 400);
    }

    // Use service role to bypass RLS
    const { data, error } = await supabase
      .from('damage_reports')
      .select(REPORT_SELECT)
      .eq('clerk_user_id', clerkUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching damage reports:', error);
      return respond({ error: error.message }, 500);
    }

    return respond({ reports: data });
  } catch (error: any) {
    console.error('Error in get damage reports endpoint:', error);
    return respond({ error: error.message }, 500);
  }
}

/**
 * DELETE /reports/:id - Delete a damage report
 * Removes a report by ID with clerk_user_id verification
 */
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
      return respond({ error: error.message }, 500);
    }

    return respond({ success: true, message: 'Report deleted' });
  } catch (error: any) {
    console.error('Error in delete report endpoint:', error);
    return respond({ error: error.message }, 500);
  }
}
