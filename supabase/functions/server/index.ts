/**
 * BidOnDent Edge Function Server
 * Canonical route handler for website, dashboard, and map data services.
 *
 * BUILD VERSION: 2026-03-21-v10 - website runtime + storage contract cleanup
 */

import { initializeDatabaseTables } from './database_init.tsx'
import { initializeStorageBuckets } from './storage_init.tsx'
import { corsHeaders, config } from './config/constants.ts'
import { supabase, supabaseAuth } from './config/clients.ts'
import { stripFunctionPrefix, createResponse } from './utils/helpers.ts'
import { healthCheck, migrateDatabase, deepHealthCheck } from './handlers/health.ts'
import {
  saveVehicle,
  getVehicles,
  deleteVehicleByPost,
  deleteVehicleByDelete,
} from './handlers/vehicles.ts'
import {
  createReport,
  deleteReport,
  getMarketplaceReports,
  getReports,
  updateReport,
} from './handlers/reports.ts'
import {
  handleAdminSetup,
  handleCheckAdminExists,
  handleCreateUser,
  handleDeleteUser,
  handleManageAdmin,
  handleListUsers,
  handleListProfiles,
  handleDeleteUsers,
  handleCreateTestAccount,
} from './handlers/admin.ts'
import { handleTrackLogin, handleDeleteAccount } from './handlers/auth.ts'
import {
  handleUploadPhoto,
  handleStorageStats,
  handleCleanupOldReports,
} from './handlers/storage.ts'
import {
  getWebsitePreferences,
  saveWebsitePreferences,
} from './handlers/preferences.ts'
import {
  getWebsiteRelationships,
  saveWebsiteRelationships,
} from './handlers/website_relationships.ts'
import {
  getDirectoryInventory,
  getInsurerProfile,
  getShopProfile,
  saveInsurerProfile,
  saveShopProfile,
} from './handlers/network_profiles.ts'
import { getUserProfile, saveUserProfile } from './handlers/profiles.ts'
import { createBid, getBids, updateBidStatus, deleteBid } from './handlers/bids.ts'
import { getRateLimitKey, checkRateLimit, maybePruneStore } from './utils/rateLimiter.ts'

console.log(`Edge Function Server Starting - Build: ${config.BUILD_VERSION}`)
;(async () => {
  await initializeDatabaseTables()
  await initializeStorageBuckets()
})()

Deno.serve(async (req) => {
  const respond = (body: any, status = 200, additionalHeaders: Record<string, string> = {}) =>
    createResponse(body, status, additionalHeaders)

  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  const url = new URL(req.url)
  const path = stripFunctionPrefix(url.pathname)

  // Rate limiting — applied before route dispatch
  maybePruneStore()
  const isMutation = ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)
  const rateLimitType = isMutation ? 'write' : 'read'
  // Skip rate limiting on OPTIONS, health checks, and migration (internal ops)
  const isExempt = path === '/health' || path === '/health/deep' || path === '/migrate-database'
  if (!isExempt) {
    const identity = url.searchParams.get('clerkUserId') ?? url.searchParams.get('customerClerkUserId') ?? null
    const key = getRateLimitKey(req, identity)
    const { allowed, retryAfterMs } = checkRateLimit(key, rateLimitType)
    if (!allowed) {
      return respond(
        { error: 'Too many requests. Please slow down.', code: 'RATE_LIMITED', retryAfterMs },
        429
      )
    }
  }

  try {
    if (path === '/health' && req.method === 'GET') {
      return healthCheck(respond)
    }

    if (path === '/health/deep' && req.method === 'GET') {
      return await deepHealthCheck(supabase, respond)
    }

    if (path === '/migrate-database' && req.method === 'POST') {
      return await migrateDatabase(initializeDatabaseTables, respond)
    }

    if (path === '/admin/setup-admin' && req.method === 'POST') {
      return await handleAdminSetup(req, supabase, respond)
    }

    if (path === '/admin/check-admin-exists' && req.method === 'GET') {
      return await handleCheckAdminExists(supabase, respond)
    }

    if (path === '/admin/create-user' && req.method === 'POST') {
      return await handleCreateUser(req, supabase, respond)
    }

    if (path === '/admin/delete-user' && req.method === 'POST') {
      return await handleDeleteUser(req, supabase, respond)
    }

    if (path === '/admin/manage-admin' && req.method === 'POST') {
      return await handleManageAdmin(req, supabase, respond)
    }

    if (path === '/admin/list-users' && req.method === 'GET') {
      return await handleListUsers(supabase, respond)
    }

    if (path === '/admin/profiles' && req.method === 'GET') {
      return await handleListProfiles(req, supabase, respond)
    }

    if (path === '/admin/delete-users' && req.method === 'POST') {
      return await handleDeleteUsers(req, supabase, respond)
    }

    if (path === '/admin/create-test-account' && req.method === 'POST') {
      return await handleCreateTestAccount(req, supabase, respond)
    }

    if (path === '/track-login' && req.method === 'POST') {
      return await handleTrackLogin(req, supabase, respond)
    }

    if (path === '/delete-account' && req.method === 'POST') {
      return await handleDeleteAccount(req, supabase, supabaseAuth, respond)
    }

    if (path === '/upload-photo' && req.method === 'POST') {
      return await handleUploadPhoto(req, supabase, respond)
    }

    if (path === '/storage-stats' && req.method === 'GET') {
      return await handleStorageStats(supabase, respond)
    }

    if (path === '/cleanup-old-reports' && req.method === 'POST') {
      return await handleCleanupOldReports(req, supabase, respond)
    }

    if (path === '/website-preferences' && req.method === 'GET') {
      return await getWebsitePreferences(req, supabase, respond)
    }

    if (path === '/website-preferences' && req.method === 'POST') {
      return await saveWebsitePreferences(req, supabase, respond)
    }

    if (path === '/website-relationships' && req.method === 'GET') {
      return await getWebsiteRelationships(req, supabase, respond)
    }

    if (path === '/website-relationships' && req.method === 'POST') {
      return await saveWebsiteRelationships(req, supabase, respond)
    }

    if (path === '/user-profile' && req.method === 'GET') {
      return await getUserProfile(req, supabase, respond)
    }

    if (path === '/user-profile' && req.method === 'POST') {
      return await saveUserProfile(req, supabase, respond)
    }

    if (path === '/shop-profile' && req.method === 'GET') {
      return await getShopProfile(req, supabase, respond)
    }

    if (path === '/shop-profile' && req.method === 'POST') {
      return await saveShopProfile(req, supabase, respond)
    }

    if (path === '/insurer-profile' && req.method === 'GET') {
      return await getInsurerProfile(req, supabase, respond)
    }

    if (path === '/insurer-profile' && req.method === 'POST') {
      return await saveInsurerProfile(req, supabase, respond)
    }

    if (path === '/directory-inventory' && req.method === 'GET') {
      return await getDirectoryInventory(req, supabase, respond)
    }

    if (path === '/vehicles' && req.method === 'POST') {
      return await saveVehicle(req, supabase, respond)
    }

    if (path === '/vehicles' && req.method === 'GET') {
      return await getVehicles(req, supabase, respond)
    }

    if (path === '/delete-vehicle' && req.method === 'POST') {
      return await deleteVehicleByPost(req, supabase, respond)
    }

    if (path.startsWith('/vehicles/') && req.method === 'DELETE') {
      const vehicleId = path.split('/').pop()
      const clerkUserId = url.searchParams.get('clerkUserId')
      return await deleteVehicleByDelete(vehicleId, clerkUserId, supabase, respond)
    }

    if (path === '/reports' && req.method === 'POST') {
      return await createReport(req, supabase, respond)
    }

    if (path === '/reports/marketplace' && req.method === 'GET') {
      return await getMarketplaceReports(req, supabase, respond)
    }

    if (path === '/reports' && req.method === 'GET') {
      return await getReports(req, supabase, respond)
    }

    if (path.startsWith('/reports/') && req.method === 'PUT') {
      const reportId = path.split('/').pop()
      return await updateReport(req, reportId, supabase, respond)
    }

    if (path.startsWith('/reports/') && req.method === 'DELETE') {
      const reportId = path.split('/').pop()
      const clerkUserId = url.searchParams.get('clerkUserId')
      return await deleteReport(reportId, clerkUserId, supabase, respond)
    }

    if (path === '/bids' && req.method === 'POST') {
      return await createBid(req, supabase, respond)
    }

    if (path === '/bids' && req.method === 'GET') {
      return await getBids(req, supabase, respond)
    }

    if (path.startsWith('/bids/') && req.method === 'PUT') {
      const bidId = path.split('/').pop()
      return await updateBidStatus(req, bidId, supabase, respond)
    }

    if (path.startsWith('/bids/') && req.method === 'DELETE') {
      const bidId = path.split('/').pop()
      return await deleteBid(req, bidId, supabase, respond)
    }

    return respond({ error: 'Not found', path }, 404)
  } catch (error: any) {
    console.error('Error:', error)
    return respond({ error: 'Internal server error', details: error?.message }, 500)
  }
})
