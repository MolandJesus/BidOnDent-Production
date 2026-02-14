/**
 * Authentication Route Handlers
 * User login tracking and account deletion
 */

/**
 * Track user login activity
 */
export async function handleTrackLogin(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const body = await req.json()
    const { email, user_id } = body

    if (!email && !user_id) {
      return respond({ error: 'Missing email or user_id' }, 400)
    }

    let query = supabase.from('profiles').update({
      last_login: new Date().toISOString()
    })

    if (email) {
      query = query.eq('email', email)
    } else if (user_id) {
      query = query.eq('user_id', user_id)
    }

    const { error: updateError } = await query

    if (updateError) {
      return respond({ error: updateError.message }, 500)
    }

    return respond({ success: true })
  } catch (error: any) {
    return respond({ error: error.message }, 500)
  }
}

/**
 * Delete user account (requires user authentication)
 */
export async function handleDeleteAccount(
  req: Request,
  supabase: any,
  supabaseAuth: any,
  respond: Function
): Promise<Response> {
  try {
    const authHeader = req.headers.get('Authorization')

    if (!authHeader) {
      return respond({ error: 'No Authorization header provided' }, 401)
    }

    const token = authHeader.replace('Bearer ', '')

    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(token)

    if (authError || !user) {
      return respond(
        {
          error: 'Unauthorized',
          details: authError?.message || 'Invalid token'
        },
        401
      )
    }

    // Fetch profile to check restrictions
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('email, account_type, is_admin')
      .eq('user_id', user.id)
      .maybeSingle()

    if (profileError) {
      return respond({ error: 'Failed to fetch profile' }, 500)
    }

    // Prevent deletion of admin accounts
    if (profile?.is_admin) {
      return respond({ error: 'Admin accounts cannot be deleted' }, 403)
    }

    // Delete auth user (cascade will handle related data)
    const { error: authDeleteError } = await supabase.auth.admin.deleteUser(user.id)

    if (authDeleteError) {
      return respond(
        {
          error: 'Failed to delete authentication account',
          details: authDeleteError.message
        },
        500
      )
    }

    // Explicitly delete profile
    await supabase.from('profiles').delete().eq('user_id', user.id)

    // Clean up related data
    await supabase.from('bids').delete().eq('user_id', user.id)
    await supabase.from('damage_reports').delete().eq('user_id', user.id)
    await supabase.from('vehicles').delete().eq('user_id', user.id)

    return respond({
      success: true,
      message: 'Account deleted successfully'
    })
  } catch (error: any) {
    return respond({ error: error.message || 'Failed to delete account' }, 500)
  }
}
