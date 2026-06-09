import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

const createGoalSchema = z.object({
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  category: z.string().min(1),
  deadline: z.string().datetime().optional(),
});

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return ok(goals);
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

  const parsed = createGoalSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues.map((e: { message: string }) => e.message).join("; "), 422);
  }

  const goal = await prisma.goal.create({
    data: {
      userId: session.user.id,
      title: parsed.data.title,
      description: parsed.data.description,
      category: parsed.data.category,
      deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : null,
    },
  });

  return ok(goal, 201);
}
