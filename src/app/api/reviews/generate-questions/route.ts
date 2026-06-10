import { NextRequest } from "next/server";
import { z } from "zod";
import { ok, err, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { generateWithRetry } from "@/lib/claude";
import {
  SYSTEM_REVIEW_QUESTIONS,
  buildReviewQuestionsPrompt,
} from "@/lib/prompts";

const schema = z.object({
  goalId: z.string().min(1),
  weekSummary: z.string().optional().default("Semana em andamento"),
});

interface ReviewQuestionsOutput {
  questions: {
    category: string;
    question: string;
    hint: string;
  }[];
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

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

  const { goalId, weekSummary } = parsed.data;

  const goal = await prisma.goal.findUnique({ where: { id: goalId } });
  if (!goal) return err("Meta não encontrada", 404);
  if (goal.userId !== session.user.id) return err("Não autorizado", 403);

  const result = await generateWithRetry<ReviewQuestionsOutput>(
    SYSTEM_REVIEW_QUESTIONS,
    buildReviewQuestionsPrompt(goal.title, weekSummary),
    session.user.id,
    goal.id
  );

  return ok(result.data);
}
