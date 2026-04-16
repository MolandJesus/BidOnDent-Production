/**
 * In-memory rate limiter for edge function endpoints.
 *
 * Note: State is per warm function instance. On cold starts the counters reset.
 * This is intentional — it's a best-effort abuse deterrent, not a hard limit.
 *
 * Limits:
 * - read:  60 requests / minute per identity+ip
 * - write: 20 requests / minute per identity+ip
 */

type RateLimitEntry = { count: number; resetAt: number };

const _store = new Map<string, RateLimitEntry>();

const LIMITS = {
  read: { max: 60, windowMs: 60_000 },
  write: { max: 20, windowMs: 60_000 },
} as const;

function getIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

/**
 * Extract the JWT `sub` claim from the Authorization header without full
 * cryptographic verification. This is intentional: rate limiting runs before
 * auth verification and only needs a best-effort identity that cannot be
 * trivially spoofed via query params. Full JWT verification happens later
 * per-handler via `requireClerkSession`.
 */
export function extractJwtSubject(req: Request): string | null {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const parts = token.split(".");
  if (parts.length !== 3) return null;
  try {
    const payload = JSON.parse(atob(parts[1]));
    return typeof payload.sub === "string" && payload.sub.length > 0 ? payload.sub : null;
  } catch {
    return null;
  }
}

export function getRateLimitKey(req: Request, identity?: string | null): string {
  const ip = getIp(req);
  return identity ? `${identity}:${ip}` : ip;
}

export function checkRateLimit(
  key: string,
  type: keyof typeof LIMITS
): { allowed: boolean; remaining: number; retryAfterMs: number } {
  const now = Date.now();
  const { max, windowMs } = LIMITS[type];
  const entry = _store.get(key);

  if (!entry || now >= entry.resetAt) {
    _store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: max - 1, retryAfterMs: 0 };
  }

  if (entry.count >= max) {
    return { allowed: false, remaining: 0, retryAfterMs: entry.resetAt - now };
  }

  entry.count += 1;
  return { allowed: true, remaining: max - entry.count, retryAfterMs: 0 };
}

// Periodically prune expired entries to prevent unbounded memory growth
let _lastPrune = Date.now();
export function maybePruneStore(): void {
  const now = Date.now();
  if (now - _lastPrune < 120_000) return; // prune at most every 2 minutes
  _lastPrune = now;
  for (const [key, entry] of _store) {
    if (now >= entry.resetAt) _store.delete(key);
  }
}
