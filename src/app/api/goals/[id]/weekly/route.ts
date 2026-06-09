import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return err("Meta não encontrada", 404);
  if (goal.userId !== session.user.id) return err("Não autorizado", 403);

  const annualPlan = await prisma.annualPlan.findFirst({
    where: { goalId: id, userId: session.user.id },
    orderBy: { year: "desc" },
  });

  if (!annualPlan) return err("Plano anual não encontrado", 404);

  const milestoneIds = (
    await prisma.quarterlyMilestone.findMany({
      where: { annualPlanId: annualPlan.id },
      select: { id: true },
    })
  ).map((m) => m.id);

  const weekParam = req.nextUrl.searchParams.get("week");

  const tasks = await prisma.weeklyTask.findMany({
    where: {
      milestoneId: { in: milestoneIds },
      ...(weekParam ? { weekStart: new Date(weekParam) } : {}),
    },
    orderBy: { weekStart: "asc" },
    include: { dailyHabits: true },
  });

  return ok(tasks);
}
