import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

const patchHabitSchema = z.object({
  completed: z.boolean(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;

  const habit = await prisma.dailyHabit.findUnique({
    where: { id },
    include: {
      weeklyTask: {
        include: {
          milestone: {
            include: { annualPlan: { select: { userId: true } } },
          },
        },
      },
    },
  });

  if (!habit) return err("Hábito não encontrado", 404);

  const ownerId = habit.weeklyTask?.milestone?.annualPlan?.userId;
  if (ownerId !== session.user.id) return err("Não autorizado", 403);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido");
  }

  const parsed = patchHabitSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues.map((e: { message: string }) => e.message).join("; "), 422);
  }

  const updated = await prisma.dailyHabit.update({
    where: { id },
    data: { completed: parsed.data.completed },
  });

  return ok(updated);
}
