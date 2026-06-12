import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { ok, err, requireAuth } from "@/lib/api";
import { generateWithRetry } from "@/lib/claude";
import {
  SYSTEM_ANNUAL_PLAN,
  SYSTEM_WEEKLY_TASKS,
  SYSTEM_DAILY_HABITS,
  buildAnnualPlanPrompt,
  buildWeeklyTasksPrompt,
  buildDailyHabitsPrompt,
} from "@/lib/prompts";

const bodySchema = z.object({
  deadlineMonths: z.number().int().min(1).max(60).optional().default(12),
});

interface PlanMilestone {
  month: number;
  quarter: number;
  title: string;
  description: string;
  targetDate: string;
}

interface AnnualPlanResult {
  title: string;
  summary: string;
  milestones: PlanMilestone[];
}

interface WeekTask {
  title: string;
  description: string;
  priority: string;
}

interface Week {
  weekNumber: number;
  weekStart: string;
  tasks: WeekTask[];
}

interface WeeklyTasksResult {
  weeks: Week[];
}

interface Habit {
  title: string;
  description: string;
  frequency: string;
}

interface DailyHabitsResult {
  habits: Habit[];
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;
  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return err("Meta não encontrada", 404);
  if (goal.userId !== session.user.id) return err("Não autorizado", 403);

  // Fetch user's API key
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { anthropicApiKey: true },
  });

  const apiKey = user?.anthropicApiKey || process.env.ANTHROPIC_API_KEY;
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

  const currentYear = new Date().getFullYear();
  const userPrompt = buildAnnualPlanPrompt(
    goal.title,
    goal.description,
    goal.deadline,
    currentYear,
  );

  // Step 1: Generate annual plan
  const planResult = await generateWithRetry<AnnualPlanResult>(
    SYSTEM_ANNUAL_PLAN,
    userPrompt,
    session.user.id,
    goal.id,
    apiKey,
  );

  const plan = planResult.data;

  // Step 2: Save annual plan + milestones
  const annualPlan = await prisma.annualPlan.create({
    data: {
      userId: session.user.id,
      goalId: goal.id,
      year: currentYear,
      title: plan.title,
      summary: plan.summary,
    },
  });

  const milestones = await Promise.all(
    plan.milestones.map((m) =>
      prisma.quarterlyMilestone.create({
        data: {
          annualPlanId: annualPlan.id,
          quarter: m.quarter,
          title: m.title,
          description: m.description,
          targetDate: m.targetDate ? new Date(m.targetDate) : null,
        },
      })
    )
  );

  // Step 3: Generate weekly tasks for first milestone
  const firstMilestone = milestones[0];
  if (firstMilestone) {
    const weeklyPrompt = buildWeeklyTasksPrompt(
      goal.title,
      plan.summary,
      firstMilestone.title,
    );

    try {
      const weeklyResult = await generateWithRetry<WeeklyTasksResult>(
        SYSTEM_WEEKLY_TASKS,
        weeklyPrompt,
        session.user.id,
        goal.id,
        apiKey,
      );

      await Promise.all(
        weeklyResult.data.weeks.map(async (week) => {
          const weekStart = new Date(week.weekStart);
          await Promise.all(
            week.tasks.map((task) =>
              prisma.weeklyTask.create({
                data: {
                  milestoneId: firstMilestone.id,
                  title: task.title,
                  description: task.description,
                  weekStart,
                },
              })
            )
          );
        })
      );
    } catch {
      // Weekly tasks are best-effort; continue if they fail
    }
  }

  // Step 4: Generate daily habits
  try {
    const habitsPrompt = buildDailyHabitsPrompt(goal.title, plan.summary);
    const habitsResult = await generateWithRetry<DailyHabitsResult>(
      SYSTEM_DAILY_HABITS,
      habitsPrompt,
      session.user.id,
      goal.id,
      apiKey,
    );

    // Create daily habits for the next 7 days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstWeekTask = await prisma.weeklyTask.findFirst({
      where: { milestoneId: firstMilestone?.id },
    });

    await Promise.all(
      habitsResult.data.habits.map(async (habit) => {
        const days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          return date;
        });
        await Promise.all(
          days.map((date) =>
            prisma.dailyHabit.create({
              data: {
                weeklyTaskId: firstWeekTask?.id ?? null,
                title: habit.title,
                description: habit.description,
                frequency: habit.frequency ?? "daily",
                date,
                completed: false,
              },
            })
          )
        );
      })
    );
  } catch {
    // Daily habits are best-effort; continue if they fail
  }

  return ok(
    {
      annualPlanId: annualPlan.id,
      title: plan.title,
      summary: plan.summary,
      milestonesCount: milestones.length,
    },
    201
  );
}
