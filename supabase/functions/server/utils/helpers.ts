/**
 * Utility Helpers
 * Common functions used across all route handlers
 */

import { corsHeaders } from '../config/constants.ts'

export const EdgeErrorCode = {
  MISSING_FIELD: 'MISSING_FIELD',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type EdgeErrorCode = typeof EdgeErrorCode[keyof typeof EdgeErrorCode];

/**
 * Sanitize error messages before sending to client.
 * Removes database schema details, constraint names, and internal paths.
 * Full error is still logged server-side via console.error.
 */
export function sanitizeErrorMessage(error: any): string {
  const message = typeof error === 'string' ? error : error?.message || 'An unexpected error occurred';

  // Patterns that reveal internal schema/infrastructure
  if (/violat|constraint|foreign key|unique|duplicate key|relation "/i.test(message)) {
    return 'The operation could not be completed due to a data conflict.';
  }
  if (/permission denied|row-level security/i.test(message)) {
    return 'You do not have permission to perform this action.';
  }
  if (/column "|table "|schema "/i.test(message)) {
    return 'The operation could not be completed. Please try again.';
  }

  return message;
}

/**
 * Strip Supabase function prefix from request paths
 * Handles both cloud deployment and local testing paths
 * @param pathname Raw pathname from request URL
 * @returns Cleaned route path with leading slash
 */
export function stripFunctionPrefix(pathname: string): string {
  let path = pathname;

  // Remove /functions/v1/ prefix (Supabase cloud deployment)
  if (path.startsWith('/functions/v1/')) {
    path = path.slice('/functions/v1/'.length);
  }

  // Handle /server prefix (local testing)
  if (path.startsWith('/server/')) {
    path = path.slice('/server/'.length);
  }

  if (path.startsWith('/server')) {
    path = path.slice('/server'.length) || '/';
  }

  if (path.startsWith('/make-server-9f243523/')) {
    path = path.slice('/make-server-9f243523'.length);
  } else if (path === '/make-server-9f243523') {
    path = '/';
  }

  if (path.startsWith('/make-server-c3ef122f/')) {
    path = path.slice('/make-server-c3ef122f'.length);
  } else if (path === '/make-server-c3ef122f') {
    path = '/';
  }

  // Ensure leading slash for all routes
  if (!path.startsWith('/')) {
    path = '/' + path;
  }

  return path || '/';
}

/**
 * Response wrapper with CORS headers
 * @param body Response content (string or object)
 * @param status HTTP status code
 * @param additionalHeaders Optional extra headers to merge
 * @returns Response with proper CORS headers
 */
export function createResponse(
  body: any,
  status = 200,
  additionalHeaders: Record<string, string> = {}
): Response {
  return new Response(
    typeof body === 'string' ? body : JSON.stringify(body),
    {
      status,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        ...additionalHeaders,
      }
    }
  );
}
