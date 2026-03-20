/**
 * BidOnDent Edge Function Server
 * Main router that dispatches requests to appropriate handlers
 *
 * BUILD VERSION: 2026-02-13-v8 - Modular architecture refactor
 *
 * Architecture:
 * - config/ - Configuration, constants, Supabase clients
 * - utils/ - Shared utility functions
 * - handlers/ - Route-specific business logic
 */

import { initializeDatabaseTables } from './database_init.tsx'
import { initializeStorageBuckets } from './storage_init.tsx'

// Config and clients
import { corsHeaders, config } from './config/constants.ts'
import { supabase } from './config/clients.ts'
import { stripFunctionPrefix, createResponse } from './utils/helpers.ts'

// Core handlers
import { healthCheck, migrateDatabase } from './handlers/health.ts'
import {
  saveVehicle,
  getVehicles,
  deleteVehicleByPost,
  deleteVehicleByDelete,
} from './handlers/vehicles.ts'
import { createBid, getBids } from './handlers/bids.ts'
import { createReport, getReports, updateReport, deleteReport } from './handlers/reports.ts'

// New modular handlers
import {
  handleAdminSetup,
  handleCheckAdminExists,
  handleCreateUser,
  handleDeleteUser,
  handleGetIntakeOperations,
  handleManageAdmin,
  handleListUsers,
  handleDeleteUsers,
  handleCreateTestAccount,
  handleUpdateIntakeSubmissionStatus,
} from './handlers/admin.ts'
import { handleTrackLogin, handleDeleteAccount } from './handlers/auth.ts'
import {
  handleUploadPhoto,
  handleStorageStats,
  handleCleanupOldReports,
} from './handlers/storage.ts'

// Initialize on startup
console.log(`Edge Function Server Starting - Build: ${config.BUILD_VERSION}`)
;(async () => {
  await initializeDatabaseTables()
  await initializeStorageBuckets()
})()

// Main request handler
Deno.serve(async (req) => {
  // Helper to wrap responses with CORS headers
  const respond = (body: any, status = 200, additionalHeaders: Record<string, string> = {}) =>
    createResponse(body, status, additionalHeaders)

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    })
  }

  const url = new URL(req.url)
  const path = stripFunctionPrefix(url.pathname)

  try {
    // ===== HEALTH & MAINTENANCE ROUTES =====
    if (path === '/make-server-9f243523/health' && req.method === 'GET') {
      return healthCheck(respond)
    }

    if (path === '/make-server-9f243523/migrate-database' && req.method === 'POST') {
      return await migrateDatabase(initializeDatabaseTables, respond)
    }

    // ===== ADMIN ROUTES =====
    if (path === '/make-server-9f243523/admin/setup-admin' && req.method === 'POST') {
      return await handleAdminSetup(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/admin/check-admin-exists' && req.method === 'GET') {
      return await handleCheckAdminExists(supabase, respond)
    }

    if (path === '/make-server-9f243523/admin/create-user' && req.method === 'POST') {
      return await handleCreateUser(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/admin/delete-user' && req.method === 'POST') {
      return await handleDeleteUser(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/admin/manage-admin' && req.method === 'POST') {
      return await handleManageAdmin(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/admin/list-users' && req.method === 'GET') {
      return await handleListUsers(supabase, respond)
    }

    if (path === '/make-server-9f243523/admin/delete-users' && req.method === 'POST') {
      return await handleDeleteUsers(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/admin/create-test-account' && req.method === 'POST') {
      return await handleCreateTestAccount(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/admin/intake-operations' && req.method === 'GET') {
      return await handleGetIntakeOperations(req, supabase, respond)
    }

    if (
      path === '/make-server-9f243523/admin/intake-operations/status' &&
      req.method === 'POST'
    ) {
      return await handleUpdateIntakeSubmissionStatus(req, supabase, respond)
    }

    // ===== AUTH ROUTES =====
    if (path === '/make-server-9f243523/track-login' && req.method === 'POST') {
      return await handleTrackLogin(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/delete-account' && req.method === 'POST') {
      return await handleDeleteAccount(req, supabase, respond)
    }

    // ===== STORAGE ROUTES =====
    if (path === '/make-server-9f243523/upload-photo' && req.method === 'POST') {
      return await handleUploadPhoto(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/storage-stats' && req.method === 'GET') {
      return await handleStorageStats(supabase, respond)
    }

    if (path === '/make-server-9f243523/cleanup-old-reports' && req.method === 'POST') {
      return await handleCleanupOldReports(req, supabase, respond)
    }

    // ===== VEHICLE ROUTES =====
    if (path === '/make-server-9f243523/vehicles' && req.method === 'POST') {
      return await saveVehicle(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/vehicles' && req.method === 'GET') {
      return await getVehicles(req, supabase, respond)
    }

    if ((path === '/make-server-9f243523/delete-vehicle' || path === '/delete-vehicle') &&
        req.method === 'POST') {
      return await deleteVehicleByPost(req, supabase, respond)
    }

    if (path.startsWith('/make-server-9f243523/vehicles/') && req.method === 'DELETE') {
      const vehicleId = path.split('/').pop()
      const clerkUserId = new URL(req.url).searchParams.get('clerkUserId')
      return await deleteVehicleByDelete(vehicleId, clerkUserId, supabase, respond)
    }

    // ===== REPORT ROUTES =====
    if (path === '/make-server-9f243523/bids' && req.method === 'POST') {
      return await createBid(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/bids' && req.method === 'GET') {
      return await getBids(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/reports' && req.method === 'POST') {
      return await createReport(req, supabase, respond)
    }

    if (path === '/make-server-9f243523/reports' && req.method === 'GET') {
      return await getReports(req, supabase, respond)
    }

    if (path.startsWith('/make-server-9f243523/reports/') && req.method === 'PUT') {
      const reportId = path.split('/').pop()
      return await updateReport(req, reportId, supabase, respond)
    }

    if (path.startsWith('/make-server-9f243523/reports/') && req.method === 'DELETE') {
      const reportId = path.split('/').pop()
      const clerkUserId = new URL(req.url).searchParams.get('clerkUserId')
      return await deleteReport(reportId, clerkUserId, supabase, respond)
    }

    // Route not found
    return respond({ error: 'Not found' }, 404)
  } catch (error: any) {
    console.error('Error:', error)
    return respond({ error: 'Internal server error', details: error?.message }, 500)
  }
})
