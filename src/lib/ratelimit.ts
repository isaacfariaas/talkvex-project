import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Check if Upstash environment variables are set
const hasUpstash = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Rate limiter for login attempts.
 * If Upstash is not configured, it will allow all requests (fail-open in dev).
 */
export const loginRateLimiter = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, "10 m"), // 5 attempts per 10 minutes
      analytics: true,
      prefix: "ratelimit:login",
    })
  : {
      limit: async () => ({ success: true, limit: 0, remaining: 0, reset: 0 }),
    };

/**
 * Global API rate limiter.
 */
export const globalRateLimiter = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(100, "1 m"), // 100 requests per minute
      analytics: true,
      prefix: "ratelimit:global",
    })
  : {
      limit: async () => ({ success: true, limit: 0, remaining: 0, reset: 0 }),
    };
