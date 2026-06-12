import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  const start = Date.now();

  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    const dbLatencyMs = Date.now() - dbStart;

    const uptimeSeconds = Math.floor(process.uptime());
    const memoryMb = Math.round(process.memoryUsage().rss / 1024 / 1024);

    logger.info("Health check passed", { dbLatencyMs, uptimeSeconds, memoryMb });

    return NextResponse.json({
      status: "ok",
      db: "ok",
      dbLatencyMs,
      uptimeSeconds,
      memoryMb,
      version: process.env.npm_package_version || "unknown",
      timestamp: new Date().toISOString(),
      responseMs: Date.now() - start,
    });
  } catch (error) {
    logger.error("Health check failed", error);

    return NextResponse.json(
      {
        status: "error",
        db: "error",
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
