import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let rateLimiter: Ratelimit | null = null;

export function getRateLimiter() {
  if (rateLimiter) return rateLimiter;

  // Only initialize if Redis credentials are provided
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn("Upstash Redis not configured - rate limiting disabled");
    return null;
  }

  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  });

  rateLimiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "1 m"),
    analytics: true,
    prefix: "@upstash/ratelimit",
  });

  return rateLimiter;
}

export async function checkRateLimit(identifier: string) {
  const limiter = getRateLimiter();

  if (!limiter) {
    // If no rate limiter configured, allow all requests
    return { success: true, limit: 0, remaining: 0, reset: 0 };
  }

  return await limiter.limit(identifier);
}
