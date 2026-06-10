import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { generateWithRetry } from "@/lib/claude";
import { SYSTEM_PLAN_READJUST, buildReadjustPrompt } from "@/lib/prompts";

const schema = z.object({
  goalId: z.string().min(1),
});

interface PlanReadjustOutput {
  assessment: string;
  adjustments: {
    type: string;
    target: string;
    reason: string;
    newContent: string | null;
  }[];
  nextWeekFocus: string;
  motivationalMessage: string;
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;

  const review = await prisma.weeklyReview.findUnique({ where: { id } });
  if (!review) return err("Revisão não encontrada", 404);
  if (review.userId !== session.user.id) return err("Não autorizado", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido");
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues.map((e) => e.message).join("; "), 422);
  }

  const goal = await prisma.goal.findUnique({ where: { id: parsed.data.goalId } });
  if (!goal) return err("Meta não encontrada", 404);
  if (goal.userId !== session.user.id) return err("Não autorizado", 403);

  const annualPlan = await prisma.annualPlan.findFirst({
    where: { goalId: goal.id, userId: session.user.id },
    orderBy: { year: "desc" },
  });

  const currentPlanSummary = annualPlan?.summary ?? goal.description ?? goal.title;

  const result = await generateWithRetry<PlanReadjustOutput>(
    SYSTEM_PLAN_READJUST,
    buildReadjustPrompt(goal.title, review, currentPlanSummary),
    session.user.id,
    goal.id
  );

  return ok(result.data);
}
