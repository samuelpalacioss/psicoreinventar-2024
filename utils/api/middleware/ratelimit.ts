import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import { StatusCodes } from "http-status-codes";

/**
 * Rate limit configurations for different endpoint types
 */

// Default rate limit: 100 requests per 15 minutes
export const defaultRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(100, "15 m"),
  analytics: true,
  prefix: "@ratelimit/default",
});

// Strict rate limit: 10 requests per 15 minutes (for mutations)
export const strictRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "15 m"),
  analytics: true,
  prefix: "@ratelimit/strict",
});

// Auth rate limit: 5 requests per 15 minutes (for auth endpoints)
export const authRateLimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "@ratelimit/auth",
});

/**
 * Get client identifier for rate limiting
 * Uses IP address or fallback to "anonymous"
 */
export function getClientIdentifier(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : request.headers.get("x-real-ip") || "anonymous";
  return ip;
}

/**
 * Apply rate limiting to a request
 *
 * @param request - The Next.js request object
 * @param limiter - The rate limiter to use (default, strict, or auth)
 * @returns NextResponse if rate limit exceeded, null if allowed
 */
export async function applyRateLimit(
  request: NextRequest,
  limiter: Ratelimit = defaultRateLimit
): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request);

  const { success, limit, reset, remaining } = await limiter.limit(identifier);

  // Add rate limit headers to the response
  const headers = {
    "X-RateLimit-Limit": limit.toString(),
    "X-RateLimit-Remaining": remaining.toString(),
    "X-RateLimit-Reset": new Date(reset).toISOString(),
  };

  if (!success) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: "Too many requests. Please try again later.",
          code: "RATE_LIMIT_EXCEEDED",
          retryAfter: new Date(reset).toISOString(),
        },
      },
      {
        status: StatusCodes.TOO_MANY_REQUESTS,
        headers,
      }
    );
  }

  return null;
}

/**
 * Rate limit middleware wrapper for API routes
 * Usage:
 * ```ts
 * export async function GET(request: NextRequest) {
 *   const rateLimitResponse = await withRateLimit(request, strictRateLimit);
 *   if (rateLimitResponse) return rateLimitResponse;
 *   // ... rest of handler
 * }
 * ```
 */
export async function withRateLimit(
  request: NextRequest,
  limiter: Ratelimit = defaultRateLimit
): Promise<NextResponse | null> {
  return applyRateLimit(request, limiter);
}
