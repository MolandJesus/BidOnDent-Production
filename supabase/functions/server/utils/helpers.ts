/**
 * Utility Helpers
 * Common functions used across all route handlers
 */

import { corsHeaders } from './constants.ts'

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
