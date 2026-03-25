/**
 * ============================================================================
 * BIDONDENT SERVICES - CENTRALIZED EXPORTS
 * ============================================================================
 *
 * Import all services from one location for convenience:
 *
 * import {
 *   realtimeBidService,
 *   performanceOptimizer,
 *   storageService,
 *   supabase
 * } from './services';
 *
 * ============================================================================
 */

// ============================================================================
// SUPABASE CLIENT & DATABASE FUNCTIONS
// ============================================================================

export { supabase } from "./supabaseService";

// Profile operations
export { getProfile, saveProfile, type Profile } from "./supabaseService";

// Vehicle operations
export { getVehicles, saveVehicle, deleteVehicle, type Vehicle } from "./supabaseService";

// Damage report operations
export {
  getDamageReports,
  getAllDamageReports,
  saveDamageReport,
  deleteDamageReport,
  type DamageReport,
} from "./supabaseService";

// Bid operations (NEW!)
export {
  getBidsForReport,
  submitBid,
  updateBidStatus,
  getMyBids,
  deleteBid,
  type Bid,
} from "./supabaseService";

// Intake operations
export { submitShopInterest, submitInsurerInterest } from "./supabase/intake";

// Workflow operations
export {
  logWorkflowEvent,
  createJobAssignment,
  updateJobAssignmentStatus,
} from "./supabaseService";

// Storage operations
export { uploadPhoto, deletePhoto } from "./supabaseService";

// ============================================================================
// REAL-TIME SERVICES (NEW!)
// ============================================================================

export {
  realtimeBidService,
  RealtimeBidService,
  type BidCallback,
  type BidUpdateCallback,
  type BidDeleteCallback,
  type ConnectionStatusCallback,
} from "./realtime/RealtimeBidService";

// ============================================================================
// PERFORMANCE OPTIMIZATION (NEW!)
// ============================================================================

export { performanceOptimizer, PerformanceOptimizer } from "./performance/PerformanceOptimizer";

// ============================================================================
// CLOUD STORAGE ABSTRACTION (NEW!)
// ============================================================================

export { storageService, StorageService } from "./storage/StorageService";

export { SupabaseStorageAdapter } from "./storage/SupabaseStorageAdapter";

export type {
  IStorageProvider,
  UploadOptions,
  UploadResult,
  DeleteOptions,
  DeleteResult,
  ListOptions,
  ListResult,
  SignedUrlOptions,
  SignedUrlResult,
  StorageFile,
  StorageProviderType,
  StorageConfig,
} from "./storage/types";

// ============================================================================
// CONVENIENCE BUNDLES
// ============================================================================

import { realtimeBidService as _realtimeBidService } from "./realtime/RealtimeBidService";
import { performanceOptimizer as _performanceOptimizer } from "./performance/PerformanceOptimizer";
import { storageService as _storageService } from "./storage/StorageService";

/**
 * All real-time services
 */
export const realtime = {
  bidService: _realtimeBidService,
};

/**
 * All performance services
 */
export const performance = {
  optimizer: _performanceOptimizer,
};

/**
 * All storage services
 */
export const storage = {
  service: _storageService,
};

// ============================================================================
// VERSION & INFO
// ============================================================================

export const BIDONDENT_SERVICES_VERSION = "2.0.0";

export const features = {
  realtimeBids: true,
  performanceOptimization: true,
  cloudAgnosticStorage: true,
  supabasePro: true,
};

if (import.meta.env.DEV) console.log("BidOnDent Services v2.0.0 loaded", features);
