import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

const patchTaskSchema = z.object({
  completed: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;

  const task = await prisma.weeklyTask.findUnique({
    where: { id },
    include: {
      milestone: {
        include: { annualPlan: { select: { userId: true } } },
      },
    },
  });

  if (!task) return err("Tarefa não encontrada", 404);

  const ownerId = task.milestone?.annualPlan?.userId;
  if (ownerId !== session.user.id) return err("Não autorizado", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido");
  }

  const parsed = patchTaskSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues.map((e: { message: string }) => e.message).join("; "), 422);
  }

  const updated = await prisma.weeklyTask.update({
    where: { id },
    data: { completed: parsed.data.completed },
  });

  return ok(updated);
}
