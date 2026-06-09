import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

export async function GET(
  _req: NextRequest,
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
    include: {
      milestones: {
        orderBy: { quarter: "asc" },
        include: {
          weeklyTasks: {
            orderBy: { weekStart: "asc" },
          },
        },
      },
    },
  });

  if (!annualPlan) return err("Plano anual não encontrado", 404);

  return ok(annualPlan);
}
