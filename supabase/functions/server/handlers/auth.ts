/**
 * Authentication Route Handlers
 * User login tracking and account deletion
 */

import { verifyToken } from "npm:@clerk/backend";
import { requireClerkSession } from "../utils/authz.ts";
import { sanitizeErrorMessage } from "../utils/helpers.ts";

function getAuthorizedParties(req: Request): string[] {
  const parties = new Set<string>();
  const origin = req.headers.get("origin");
  const referer = req.headers.get("referer");

  if (origin) {
    parties.add(origin);
  }

  if (referer) {
    try {
      parties.add(new URL(referer).origin);
    } catch {
      // Ignore malformed referer values.
    }
  }

  return Array.from(parties);
}

/**
 * Track user login activity
 */
export async function handleTrackLogin(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const session = await requireClerkSession(req, { requireEmail: false })

    let query = supabase.from('profiles').update({
      last_login: new Date().toISOString()
    })

    query = query.eq('clerk_user_id', session.clerkUserId)

    const { error: updateError } = await query

    if (updateError) {
      return respond({ error: sanitizeErrorMessage(updateError) }, 500)
    }

    return respond({ success: true })
  } catch (error: any) {
    const status =
      error?.message === "No Authorization header provided" ||
      error?.message?.includes("Authorization header")
        ? 401
        : 500
    return respond({ error: sanitizeErrorMessage(error) }, status)
  }
}

/**
 * Delete user account (requires user authentication)
 */
export async function handleDeleteAccount(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return respond({ error: 'No Authorization header provided' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')
    let body: Record<string, unknown> = {}

    try {
      body = await req.json()
    } catch {
      body = {}
    }

    const requestedClerkUserId =
      typeof body.clerkUserId === 'string' ? body.clerkUserId : null
    const requestedEmail = typeof body.email === 'string' ? body.email.toLowerCase() : null
    const authorizedParties = getAuthorizedParties(req)

    let verifiedToken: Record<string, unknown>

    try {
      verifiedToken = await verifyToken(
        token,
        authorizedParties.length > 0 ? { authorizedParties } : {}
      )
    } catch {
      return respond({ error: 'Unauthorized' }, 401)
    }

    const clerkUserId =
      typeof verifiedToken.sub === 'string' ? verifiedToken.sub : null

    if (!clerkUserId) {
      return respond({ error: 'Unauthorized' }, 401)
    }

    if (requestedClerkUserId && requestedClerkUserId !== clerkUserId) {
      return respond({ error: 'Forbidden' }, 403)
    }

    const profileResult = requestedEmail
      ? await supabase
          .from('profiles')
          .select('user_id, email, account_type, is_admin')
          .eq('email', requestedEmail)
          .maybeSingle()
      : { data: null, error: null }
    const profile = profileResult.data

    if (requestedEmail && profileResult.error) {
      return respond({ error: 'Failed to fetch profile' }, 500)
    }

    // Prevent deletion of admin accounts
    if (profile?.is_admin) {
      return respond({ error: 'Admin accounts cannot be deleted' }, 403)
    }

    // Prevent deletion of test accounts
    const testEmails = [
      'customer.test@bidondent.com',
      'shop.test@bidondent.com',
      'insurer.test@bidondent.com'
    ]
    if (
      (profile?.email && testEmails.includes(profile.email)) ||
      (requestedEmail && testEmails.includes(requestedEmail))
    ) {
      return respond({ error: 'Test accounts cannot be deleted through this method' }, 403)
    }

    const deleteBidsResult = await supabase
      .from('bids')
      .delete()
      .eq('clerk_shop_user_id', clerkUserId)

    if (deleteBidsResult.error) {
      return respond({ error: sanitizeErrorMessage(deleteBidsResult.error) }, 500)
    }

    const deleteReportsResult = await supabase
      .from('damage_reports')
      .delete()
      .eq('clerk_user_id', clerkUserId)

    if (deleteReportsResult.error) {
      return respond({ error: sanitizeErrorMessage(deleteReportsResult.error) }, 500)
    }

    const deleteVehiclesResult = await supabase
      .from('vehicles')
      .delete()
      .eq('clerk_user_id', clerkUserId)

    if (deleteVehiclesResult.error) {
      return respond({ error: sanitizeErrorMessage(deleteVehiclesResult.error) }, 500)
    }

    const deleteAssignmentsResult = await supabase
      .from('job_assignments')
      .delete()
      .or(
        `customer_clerk_user_id.eq.${clerkUserId},shop_clerk_user_id.eq.${clerkUserId},insurer_clerk_user_id.eq.${clerkUserId}`
      )

    if (deleteAssignmentsResult.error) {
      return respond({ error: sanitizeErrorMessage(deleteAssignmentsResult.error) }, 500)
    }

    if (profile?.user_id) {
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(profile.user_id)

      if (authDeleteError) {
        return respond(
          {
            error: 'Failed to delete legacy authentication account',
          },
          500
        )
      }
    }

    if (profile?.email) {
      const deleteProfileResult = await supabase
        .from('profiles')
        .delete()
        .eq('email', profile.email)

      if (deleteProfileResult.error) {
        return respond({ error: sanitizeErrorMessage(deleteProfileResult.error) }, 500)
      }
    }

    return respond({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error: any) {
    return respond({ error: sanitizeErrorMessage(error) || 'Failed to delete account' }, 500)
  }
}
