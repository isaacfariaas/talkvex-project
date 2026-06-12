import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";

const updateGoalSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  category: z.string().min(1).optional(),
  deadline: z.string().datetime().nullable().optional(),
  status: z.enum(["ACTIVE", "COMPLETED", "PAUSED", "CANCELLED"]).optional(),
});

async function getGoalOrFail(id: string, userId: string) {
  const goal = await prisma.goal.findFirst({ where: { id, userId } });
  if (!goal) return { goal: null, error: err("Meta não encontrada ou não autorizada", 404) };
  return { goal, error: null };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;
  const { goal, error } = await getGoalOrFail(id, session.user.id);
  if (!goal) return error!;

  const fullGoal = await prisma.goal.findFirst({
    where: { id, userId: session.user.id },
    include: {
      annualPlans: {
        include: {
          milestones: {
            include: {
              weeklyTasks: {
                include: { dailyHabits: true },
              },
            },
          },
        },
      },
    },
  });

  return ok(fullGoal);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;
  const { goal, error } = await getGoalOrFail(id, session.user.id);
  if (!goal) return error!;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return err("JSON inválido");
  }

  const parsed = updateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return err(parsed.error.issues.map((e: { message: string }) => e.message).join("; "), 422);
  }

  const updated = await prisma.goal.update({
    where: { id },
    data: {
      ...parsed.data,
      deadline:
        parsed.data.deadline === null
          ? null
          : parsed.data.deadline
          ? new Date(parsed.data.deadline)
          : undefined,
    },
  });

  return ok(updated);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;
  const { goal, error } = await getGoalOrFail(id, session.user.id);
  if (!goal) return error!;

  await prisma.goal.delete({ where: { id } });

  return ok({ deleted: true });
}
