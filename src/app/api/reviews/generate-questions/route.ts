import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";
import { generateWithRetry } from "@/lib/claude";
import { decrypt } from "@/lib/crypto";
import { SYSTEM_REVIEW_QUESTIONS, buildReviewQuestionsPrompt } from "@/lib/prompts";

const bodySchema = z.object({
  goalId: z.string().optional(),
  weekSummary: z.string().optional().default("Revisão semanal de progresso"),
});

interface ReviewQuestion {
  category: string;
  question: string;
  hint?: string;
}

interface ReviewQuestionsResult {
  questions: ReviewQuestion[];
}

export async function POST(req: NextRequest) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  // Fetch user's API key
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { anthropicApiKey: true },
  });

  const apiKey = user?.anthropicApiKey ? decrypt(user.anthropicApiKey) : process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return err("Chave API do Anthropic não configurada. Configure em /configuracoes", 501);
  }

  let body: unknown;
  try {
    body = await req.json().catch(() => ({}));
  } catch {
    body = {};
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return err("Dados inválidos", 422);
  }

  let goalTitle = "minha meta";
  if (parsed.data.goalId) {
    const goal = await prisma.goal.findFirst({
      where: { id: parsed.data.goalId, userId: session.user.id },
    });
    if (goal) goalTitle = goal.title;
  } else {
    const latestGoal = await prisma.goal.findFirst({
      where: { userId: session.user.id, status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
    });
    if (latestGoal) goalTitle = latestGoal.title;
  }

  const userPrompt = buildReviewQuestionsPrompt(goalTitle, parsed.data.weekSummary);

  const result = await generateWithRetry<ReviewQuestionsResult>(
    SYSTEM_REVIEW_QUESTIONS,
    userPrompt,
    session.user.id,
    parsed.data.goalId ?? null,
    apiKey,
  );

  return ok({ questions: result.data.questions });
}
