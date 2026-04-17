/**
 * Application Constants
 * Centralized configuration values and constants
 */

// ============================================================================
// Color Constants
// ============================================================================

export const COLORS = {
  PRIMARY: "#003d82",
  SECONDARY: "#00a0e9",
  SUCCESS: "#10b981",
  ERROR: "#ef4444",
  WARNING: "#f59e0b",
  INFO: "#3b82f6",
  GRAY_50: "#f9fafb",
  GRAY_100: "#f3f4f6",
  GRAY_200: "#e5e7eb",
  GRAY_300: "#d1d5db",
  GRAY_400: "#9ca3af",
  GRAY_500: "#6b7280",
  GRAY_600: "#4b5563",
  GRAY_700: "#374151",
  GRAY_800: "#1f2937",
  GRAY_900: "#111827",
} as const;

// ============================================================================
// Account Types
// ============================================================================

export const ACCOUNT_TYPES = {
  CUSTOMER: "customer",
  SHOP: "shop",
  INSURER: "insurer",
  ADMIN: "admin",
} as const;

// ============================================================================
// Status Constants
// ============================================================================

export const REPORT_STATUS = {
  PENDING: "pending",
  IN_REVIEW: "in-review",
  ACTIVE: "active",
  COMPLETED: "completed",
  CLOSED: "closed",
} as const;

export const CLAIM_STATUS = {
  PENDING: "pending",
  REVIEWING: "reviewing",
  APPROVED: "approved",
  DENIED: "denied",
} as const;

export const SUBMISSION_STATUS = {
  SUBMITTED: "submitted",
  REVIEWING: "reviewing",
  APPROVED: "approved",
  REJECTED: "rejected",
} as const;

export const BID_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
} as const;

// ============================================================================
// Priority Levels
// ============================================================================

export const PRIORITY_LEVELS = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  CRITICAL: "critical",
} as const;

// ============================================================================
// Validation Constants
// ============================================================================

export const VALIDATION = {
  MIN_PASSWORD_LENGTH: 8,
  MIN_PHONE_LENGTH: 10,
  MAX_PHONE_LENGTH: 14,
  ZIP_CODE_LENGTH: 5,
  MAX_FILE_SIZE_MB: 10,
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024,
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
} as const;

// ============================================================================
// API & Route Constants
// ============================================================================

export const API_ROUTES = {
  REPORTS: "/api/reports",
  BIDS: "/api/bids",
  CLAIMS: "/api/claims",
  USERS: "/api/users",
  SHOPS: "/api/shops",
  INSURERS: "/api/insurers",
  INTAKE: "/api/intake",
  ACTIVITY: "/api/activity",
  SEARCH: "/api/search",
} as const;

export const SUPABASE_TABLES = {
  PROFILES: "profiles",
  REPORTS: "reports",
  BIDS: "bids",
  CLAIMS: "claims",
  PUBLIC_PARTNER_SHOPS: "public_partner_shops",
  SHOP_INTEREST_SUBMISSIONS: "shop_interest_submissions",
  INSURER_INTEREST_SUBMISSIONS: "insurer_interest_submissions",
  ACTIVITY_LOGS: "activity_logs",
  WORKFLOW_EVENTS: "workflow_events",
} as const;

// ============================================================================
// Contact Information
// ============================================================================

export const CONTACT = {
  EMAIL: "bidondent@gmail.com",
  PHONE: "Contact support for phone number",
  SUPPORT_EMAIL: "bidondent@gmail.com",
} as const;

// ============================================================================
// UI Configuration
// ============================================================================

export const UI = {
  TOAST_DURATION_MS: 3000,
  ANIMATION_DURATION_MS: 300,
  DEBOUNCE_DELAY_MS: 300,
  LOADING_TIMEOUT_MS: 30000,
  MAX_TOAST_QUEUE: 5,
} as const;

// ============================================================================
// Feature Flags
// ============================================================================

export const FEATURES = {
  ENABLE_REALTIME_BIDS: true,
  ENABLE_CROSS_ACCOUNT_MESSAGING: true,
  ENABLE_ADVANCED_ANALYTICS: false,
  ENABLE_BETA_FEATURES: false,
  ENABLE_DEBUG_PANEL: process.env.NODE_ENV === "development",
} as const;

// ============================================================================
// Map & Geolocation
// ============================================================================

export const MAP = {
  DEFAULT_CENTER_LAT: 40.7128,
  DEFAULT_CENTER_LNG: -74.006,
  DEFAULT_ZOOM: 10,
  SERVICE_RADIUS_MILES: 20,
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  GENERIC: "An error occurred. Please try again.",
  NETWORK: "Network error. Please check your connection.",
  UNAUTHORIZED: "You are not authorized to perform this action.",
  NOT_FOUND: "The requested resource was not found.",
  VALIDATION_ERROR: "Please check your input and try again.",
  PHONE_INVALID: "Please enter a valid phone number (10+ digits).",
  EMAIL_INVALID: "Please enter a valid email address.",
  ZIP_INVALID: "Please enter a valid 5-digit ZIP code.",
  FORM_REQUIRED: "Please fill in all required fields.",
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  FORM_SUBMITTED: "Form submitted successfully!",
  PROFILE_UPDATED: "Profile updated successfully!",
  PASSWORD_CHANGED: "Password changed successfully!",
  CLAIM_CREATED: "Claim created successfully!",
  BID_SUBMITTED: "Bid submitted successfully!",
} as const;

// ============================================================================
// Time Constants
// ============================================================================

export const TIME = {
  MILLISECONDS_PER_SECOND: 1000,
  SECONDS_PER_MINUTE: 60,
  MINUTES_PER_HOUR: 60,
  HOURS_PER_DAY: 24,
  DAYS_PER_WEEK: 7,
  MONTHS_PER_YEAR: 12,
} as const;

// ============================================================================
// Regex Patterns
// ============================================================================

export const PATTERNS = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^\d{10,14}$/,
  ZIP_CODE: /^\d{5}(-\d{4})?$/,
  URL: /^https?:\/\/.+\..+/,
  ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
} as const;

// ============================================================================
// Report Categories
// ============================================================================

export const DAMAGE_CATEGORIES = {
  PAINTLESS_DENT_REMOVAL: "Paintless Dent Removal",
  COLLISION_REPAIR: "Collision Repair",
  DOOR_REPLACEMENT: "Door Replacement",
  WINDOW_REPLACEMENT: "Window Replacement",
  PAINT_REPAIR: "Paint Repair",
  BUMPER_REPAIR: "Bumper Repair",
  HAIL_DAMAGE: "Hail Damage",
  GLASS_REPAIR: "Glass Repair",
  TRIM_REPAIR: "Trim Repair",
  CUSTOM_WORK: "Custom Work",
} as const;

// ============================================================================
// Shop Certifications
// ============================================================================

export const CERTIFICATIONS = {
  ASE_CERTIFIED: "ASE Certified",
  I_CAR_GOLD: "I-CAR Gold Class",
  TESLA_CERTIFIED: "Tesla Certified",
  BMW_CERTIFIED: "BMW Certified",
  MERCEDES_CERTIFIED: "Mercedes Certified",
  AAA_APPROVED: "AAA Approved",
  PORSCHE_APPROVED: "Porsche Approved",
} as const;

// ============================================================================
// Default Values
// ============================================================================

export const DEFAULTS = {
  PAGE_SIZE: 20,
  SEARCH_DEBOUNCE_MS: 300,
  ITEMS_PER_PAGE: 10,
  CACHE_DURATION_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// ============================================================================
// Environment Variables
// ============================================================================

export const ENV = {
  NODE_ENV: process.env.NODE_ENV || "development",
  IS_DEVELOPMENT: process.env.NODE_ENV === "development",
  IS_PRODUCTION: process.env.NODE_ENV === "production",
  IS_STAGING: process.env.NODE_ENV === "staging",
} as const;
