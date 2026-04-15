/**
 * Admin Route Handlers
 * Admin account management, user creation, and super-admin operations
 */

import { config } from '../config/constants.ts'
import { requireAdminContext } from '../utils/authz.ts'
import { sanitizeErrorMessage } from '../utils/helpers.ts'

type SubmissionStatus = 'submitted' | 'reviewing' | 'approved' | 'rejected'

function getAdminErrorStatus(error: any) {
  const message = error?.message || ''

  if (message === 'Admin access required') {
    return 403
  }

  if (
    message.startsWith('Failed to verify admin profile') ||
    message.startsWith('Unable to resolve authenticated Clerk email')
  ) {
    return 500
  }

  return 401
}

export type AdminProfileSummary = {
  account_type: string
  clerk_user_id?: string | null
  created_at: string
  email: string
  is_admin?: boolean | null
  name?: string | null
  setup_completed?: boolean | null
  user_id?: string | null
  website_user_key?: string | null
}

/**
 * Setup or update the main admin account (figmaadmin@bidondent.com)
 */
export async function handleAdminSetup(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  return respond(
    {
      error:
        'This bootstrap endpoint is disabled. Create the admin through Clerk using the configured admin email.',
    },
    403
  )
}

/**
 * Check if admin account exists
 */
export async function handleCheckAdminExists(
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const { data: existingAdmin, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('email', config.ADMIN_EMAIL.toLowerCase())
      .eq('is_admin', true)
      .maybeSingle()

    if (error) {
      return respond({ exists: false, error: sanitizeErrorMessage(error) }, 200)
    }

    return respond({
      exists: !!existingAdmin,
      email: 'figmaadmin@bidondent.com',
    })
  } catch (error: any) {
    return respond({ exists: false, error: sanitizeErrorMessage(error) }, 200)
  }
}

/**
 * Create or update a user (admin-only)
 */
export async function handleCreateUser(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase)
    const body = await req.json()
    const { email, password, name, account_type } = body

    if (!email || !password || !account_type) {
      return respond({ error: 'Missing required fields: email, password, account_type' }, 400)
    }

    if (password.length < 6) {
      return respond({ error: 'Password must be at least 6 characters' }, 400)
    }

    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find((u: any) => u.email === email)

    let userId: string
    const isUpdate = !!existingUser

    if (existingUser) {
      userId = existingUser.id
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { name: name || 'Test Account', phone: '', user_type: account_type }
      })
      if (updateError) return respond({ error: sanitizeErrorMessage(updateError) }, 500)
    } else {
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || 'Test Account', phone: '', user_type: account_type }
      })
      if (createError) return respond({ error: sanitizeErrorMessage(createError) }, 500)
      if (!userData.user) return respond({ error: 'No user data returned' }, 500)
      userId = userData.user.id
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        user_id: userId,
        email,
        name: name || 'Test Account',
        phone: '',
        account_type,
        setup_completed: false,
        is_admin: email.toLowerCase() === 'figmaadmin@bidondent.com'
      },
      { onConflict: 'user_id' }
    )

    if (profileError) {
      return respond(
        {
          error: `User ${isUpdate ? 'updated' : 'created'} but profile error: ${sanitizeErrorMessage(profileError)}`,
          userId
        },
        500
      )
    }

    return respond({
      success: true,
      userId,
      email,
      accountType: account_type,
      message: isUpdate ? 'User updated and profile synced' : 'User created successfully'
    })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) || 'Failed to create user' }, status)
  }
}

/**
 * Delete a user by email (admin-only)
 */
export async function handleDeleteUser(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase)
    const body = await req.json()
    const { email } = body

    if (!email) {
      return respond({ error: 'Missing email' }, 400)
    }

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id')
      .eq('email', email)
      .maybeSingle()

    if (profileError || !profiles?.user_id) {
      return respond({ error: 'User not found' }, 404)
    }

    const userId = profiles.user_id

    const { error: deleteAuthError } = await supabase.auth.admin.deleteUser(userId)
    if (deleteAuthError) return respond({ error: sanitizeErrorMessage(deleteAuthError) }, 500)

    await supabase.from('profiles').delete().eq('user_id', userId)

    return respond({ success: true, email, userId })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) }, status)
  }
}

/**
 * Manage admin status (promote/demote)
 */
export async function handleManageAdmin(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const { adminEmail } = await requireAdminContext(req, supabase)
    const body = await req.json()
    const { email: targetEmail, promote } = body

    if (adminEmail !== config.ADMIN_EMAIL.toLowerCase()) {
      return respond({ error: 'Only the super admin can manage admin accounts' }, 403)
    }

    if (!targetEmail || typeof promote !== 'boolean') {
      return respond({ error: 'Missing email or promote parameter' }, 400)
    }

    if (targetEmail?.toLowerCase() === 'figmaadmin@bidondent.com' && !promote) {
      return respond({ error: 'Cannot demote the super admin' }, 403)
    }

    const { data: updatedProfile, error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: promote })
      .eq('email', targetEmail)
      .select()
      .maybeSingle()

    if (updateError || !updatedProfile) {
      return respond({ error: 'Failed to update admin status' }, 500)
    }

    return respond({
      success: true,
      profile: updatedProfile,
      message: `${targetEmail} ${promote ? 'promoted to admin' : 'demoted from admin'}`
    })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) || 'Failed to manage admin' }, status)
  }
}

/**
 * List all users (admin-only)
 */
export async function handleListUsers(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase)
    const { data: authData } = await supabase.auth.admin.listUsers()
    return respond({ users: authData?.users || [] })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) }, status)
  }
}

/**
 * List website profiles for admin dashboards and diagnostics
 */
export async function handleListProfiles(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase)
    const url = new URL(req.url)
    const email = url.searchParams.get('email')?.trim().toLowerCase() || null

    let query = supabase
      .from('profiles')
      .select(
        'email, name, account_type, user_id, clerk_user_id, website_user_key, created_at, setup_completed, is_admin'
      )
      .order('created_at', { ascending: false })

    if (email) {
      query = query.eq('email', email)
    }

    const { data, error } = await query

    if (error) {
      return respond({ error: sanitizeErrorMessage(error) }, 500)
    }

    return respond({
      profiles: (data || []) as AdminProfileSummary[],
      success: true,
    })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) }, status)
  }
}

/**
 * Bulk delete users (admin-only)
 */
export async function handleDeleteUsers(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase)
    const body = await req.json()
    const { userIds } = body

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return respond({ error: 'userIds array is required' }, 400)
    }

    let deleted = 0
    const errors = []

    for (const userId of userIds) {
      try {
        const { error: authError } = await supabase.auth.admin.deleteUser(userId)
        if (authError) {
          errors.push({ userId, error: sanitizeErrorMessage(authError) })
        } else {
          deleted++
        }
      } catch (error: any) {
        errors.push({ userId, error: sanitizeErrorMessage(error) })
      }
    }

    return respond({
      deleted,
      requested: userIds.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) }, status)
  }
}

/**
 * Create test account (admin-only)
 */
export async function handleCreateTestAccount(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase)
    const body = await req.json()
    const { email, password, userType } = body

    if (!email || !password || !userType) {
      return respond({ error: 'email, password, and userType are required' }, 400)
    }

    const { data: userData, error: createError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name: `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
        user_type: userType,
        created_by_admin: true
      }
    })

    if (createError || !userData.user) {
      return respond({ error: createError?.message || 'Failed to create user' }, 500)
    }

    const { error: profileError } = await supabase.from('profiles').insert({
      user_id: userData.user.id,
      email,
      name: `Test ${userType.charAt(0).toUpperCase() + userType.slice(1)}`,
      account_type: userType,
      setup_completed: true
    })

    if (profileError) {
      return respond({ error: sanitizeErrorMessage(profileError) }, 500)
    }

    return respond({
      success: true,
      userId: userData.user.id,
      email,
      userType
    })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) }, status)
  }
}

/**
 * Load intake submissions and recent activity for admin review.
 */
export async function handleGetIntakeOperations(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    await requireAdminContext(req, supabase)

    const [shopsResult, insurersResult, eventsResult] = await Promise.all([
      supabase
        .from('shop_interest_submissions')
        .select('id, shop_name, contact_person, email, state, status, created_at')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('insurer_interest_submissions')
        .select('id, company_name, contact_person, email, status, created_at')
        .order('created_at', { ascending: false })
        .limit(25),
      supabase
        .from('platform_activity_events')
        .select('id, event_type, source, actor_id, object_id, outcome, created_at')
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (shopsResult.error || insurersResult.error || eventsResult.error) {
      return respond(
        {
          error:
            sanitizeErrorMessage(shopsResult.error) ||
            sanitizeErrorMessage(insurersResult.error) ||
            sanitizeErrorMessage(eventsResult.error) ||
            'Failed to load intake operations data',
        },
        500
      )
    }

    return respond({
      shopSubmissions: shopsResult.data || [],
      insurerSubmissions: insurersResult.data || [],
      activityEvents: eventsResult.data || [],
    })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) || 'Failed to load intake operations' }, status)
  }
}

/**
 * Update an intake submission review status and log the workflow event.
 */
export async function handleUpdateIntakeSubmissionStatus(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const { adminEmail } = await requireAdminContext(req, supabase)
    const body = await req.json()
    const { table, id, status } = body

    const isValidTable =
      table === 'shop_interest_submissions' || table === 'insurer_interest_submissions'
    const isValidStatus =
      status === 'submitted' ||
      status === 'reviewing' ||
      status === 'approved' ||
      status === 'rejected'

    if (!isValidTable || typeof id !== 'string' || !isValidStatus) {
      return respond(
        {
          error:
            'table, id, and status are required. Valid tables: shop_interest_submissions, insurer_interest_submissions.',
        },
        400
      )
    }

    const { data: updatedSubmission, error: updateError } = await supabase
      .from(table)
      .update({ status: status as SubmissionStatus })
      .eq('id', id)
      .select('id, status')
      .maybeSingle()

    if (updateError) {
      return respond({ error: sanitizeErrorMessage(updateError) }, 500)
    }

    if (!updatedSubmission) {
      return respond({ error: 'Submission not found' }, 404)
    }

    const { error: activityError } = await supabase.from('platform_activity_events').insert({
      event_type: `${table}_status_updated`,
      source: 'admin-ops',
      actor_id: adminEmail,
      object_id: id,
      outcome: 'success',
      payload: {
        submission_id: id,
        new_status: status,
        admin_email: adminEmail,
      },
    })

    if (activityError) {
      return respond({ error: sanitizeErrorMessage(activityError) }, 500)
    }

    return respond({
      success: true,
      submission: updatedSubmission,
    })
  } catch (error: any) {
    const status = getAdminErrorStatus(error)
    return respond({ error: sanitizeErrorMessage(error) || 'Failed to update submission status' }, status)
  }
}
