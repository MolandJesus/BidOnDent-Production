/**
 * Admin Route Handlers
 * Admin account management, user creation, and super-admin operations
 */

import { corsHeaders } from '../config/constants.ts'

/**
 * Setup or update the main admin account (figmaadmin@bidondent.com)
 */
export async function handleAdminSetup(
  req: Request,
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const body = await req.json()
    const { email, password } = body

    if (!email || email.toLowerCase() !== 'figmaadmin@bidondent.com') {
      return respond(
        { error: 'This endpoint is only for setting up figmaadmin@bidondent.com' },
        403
      )
    }

    if (!password || password.length < 6) {
      return respond({ error: 'Password must be at least 6 characters' }, 400)
    }

    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === email.toLowerCase()
    )

    let userId: string

    if (existingUser) {
      userId = existingUser.id
      const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
        password,
        email_confirm: true,
        user_metadata: { name: 'Admin User', phone: '', user_type: 'customer' }
      })
      if (updateError) return respond({ error: updateError.message }, 500)
    } else {
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: 'Admin User', phone: '', user_type: 'customer' }
      })
      if (createError) return respond({ error: createError.message }, 500)
      if (!userData.user) return respond({ error: 'No user data returned' }, 500)
      userId = userData.user.id
    }

    const { error: profileError } = await supabase.from('profiles').upsert(
      {
        user_id: userId,
        email,
        name: 'Admin User',
        phone: '',
        account_type: 'customer',
        setup_completed: false,
        is_admin: true
      },
      { onConflict: 'user_id' }
    )

    if (profileError) return respond({ error: profileError.message }, 500)

    return respond({
      success: true,
      message: 'Admin account created successfully',
      userId
    })
  } catch (error: any) {
    return respond({ error: error.message || 'Failed to set up admin account' }, 500)
  }
}

/**
 * Check if admin account exists
 */
export async function handleCheckAdminExists(
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const { data: existingUsers } = await supabase.auth.admin.listUsers()
    const existingUser = existingUsers?.users?.find(
      (u: any) => u.email?.toLowerCase() === 'figmaadmin@bidondent.com'
    )

    return respond({
      exists: !!existingUser,
      email: 'figmaadmin@bidondent.com',
      totalUsers: existingUsers?.users?.length || 0
    })
  } catch (error: any) {
    return respond({ exists: false, error: error.message }, 200)
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
    const body = await req.json()
    const { email, password, name, account_type, adminEmail } = body

    if (adminEmail?.toLowerCase() !== 'figmaadmin@bidondent.com') {
      return respond({ error: 'Unauthorized' }, 403)
    }

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
      if (updateError) return respond({ error: updateError.message }, 500)
    } else {
      const { data: userData, error: createError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name: name || 'Test Account', phone: '', user_type: account_type }
      })
      if (createError) return respond({ error: createError.message }, 500)
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
          error: `User ${isUpdate ? 'updated' : 'created'} but profile error: ${profileError.message}`,
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
    return respond({ error: error.message || 'Failed to create user' }, 500)
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
    const body = await req.json()
    const { email, adminEmail } = body

    if (adminEmail?.toLowerCase() !== 'figmaadmin@bidondent.com') {
      return respond({ error: 'Unauthorized' }, 403)
    }

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
    if (deleteAuthError) return respond({ error: deleteAuthError.message }, 500)

    await supabase.from('profiles').delete().eq('user_id', userId)

    return respond({ success: true, email, userId })
  } catch (error: any) {
    return respond({ error: error.message }, 500)
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
    const body = await req.json()
    const { email: targetEmail, promote, adminEmail } = body

    if (adminEmail?.toLowerCase() !== 'figmaadmin@bidondent.com') {
      return respond(
        { error: 'Only the super admin can manage admin accounts' },
        403
      )
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
    return respond({ error: error.message || 'Failed to manage admin' }, 500)
  }
}

/**
 * List all users (admin-only)
 */
export async function handleListUsers(
  supabase: any,
  respond: Function
): Promise<Response> {
  try {
    const { data: authData } = await supabase.auth.admin.listUsers()
    return respond({ users: authData?.users || [] })
  } catch (error: any) {
    return respond({ error: error.message }, 500)
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
          errors.push({ userId, error: authError.message })
        } else {
          deleted++
        }
      } catch (error: any) {
        errors.push({ userId, error: error.message })
      }
    }

    return respond({
      deleted,
      requested: userIds.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error: any) {
    return respond({ error: error.message }, 500)
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
      return respond({ error: profileError.message }, 500)
    }

    return respond({
      success: true,
      userId: userData.user.id,
      email,
      userType
    })
  } catch (error: any) {
    return respond({ error: error.message }, 500)
  }
}
