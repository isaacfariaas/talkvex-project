import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  // Only allow users whose email matches ADMIN_EMAIL env var
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail || session.user.email !== adminEmail) {
    return NextResponse.json({ error: "Acesso negado" }, { status: 403 });
  }

  try {
    const [
      totalUsers,
      activeUsersLast7d,
      totalGoals,
      activeGoals,
      generationsLast24h,
      generationsLast7d,
      tokenUsageLast7d,
      dbLatency,
    ] = await Promise.all([
      prisma.user.count(),

      prisma.user.count({
        where: {
          updatedAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      prisma.goal.count(),

      prisma.goal.count({
        where: { status: "ACTIVE" },
      }),

      prisma.planGenerationLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      }),

      prisma.planGenerationLog.count({
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      prisma.planGenerationLog.aggregate({
        _sum: { tokensOut: true, tokensIn: true },
        where: {
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
      }),

      (async () => {
        const start = Date.now();
        await prisma.$queryRaw`SELECT 1`;
        return Date.now() - start;
      })(),
    ]);

    const metrics = {
      timestamp: new Date().toISOString(),
      users: {
        total: totalUsers,
        activeLast7d: activeUsersLast7d,
      },
      goals: {
        total: totalGoals,
        active: activeGoals,
      },
      claudeUsage: {
        generationsLast24h,
        generationsLast7d,
        inputTokensLast7d: tokenUsageLast7d._sum.tokensIn ?? 0,
        outputTokensLast7d: tokenUsageLast7d._sum.tokensOut ?? 0,
      },
      infrastructure: {
        dbLatencyMs: dbLatency,
        uptimeSeconds: Math.floor(process.uptime()),
        memoryMb: Math.round(process.memoryUsage().rss / 1024 / 1024),
        nodeVersion: process.version,
      },
    };

    logger.info("Monitoring metrics fetched", { adminEmail, totalUsers });

    return NextResponse.json(metrics);
  } catch (error) {
    logger.error("Failed to fetch monitoring metrics", error);
    return NextResponse.json({ error: "Erro ao buscar métricas" }, { status: 500 });
  }
}
