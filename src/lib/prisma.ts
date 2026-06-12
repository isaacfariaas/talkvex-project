import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { logger } from "@/lib/logger";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const SLOW_QUERY_THRESHOLD_MS = 1000;

function attachQueryMonitoring(client: PrismaClient) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (client as any).$on("query", (e: { query: string; duration: number }) => {
    if (e.duration > SLOW_QUERY_THRESHOLD_MS) {
      logger.warn("Slow query detected", {
        query: e.query.slice(0, 200),
        durationMs: e.duration,
      });
    }
  });
  return client;
}

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  const isProd = process.env.NODE_ENV === "production";
  const logLevels = isProd
    ? (["error", "warn"] as const)
    : (["query", "error", "warn"] as const);

  if (!connectionString) {
    logger.warn("DATABASE_URL not set, using basic Prisma client");
    return attachQueryMonitoring(new PrismaClient({ log: [...logLevels] }));
  }

  try {
    const adapter = new PrismaPg({ connectionString });
    return attachQueryMonitoring(new PrismaClient({ adapter, log: [...logLevels] }));
  } catch (error) {
    logger.warn("Failed to create Prisma client with adapter, using basic client", { error });
    return attachQueryMonitoring(new PrismaClient({ log: [...logLevels] }));
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
