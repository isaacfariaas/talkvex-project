import { NextRequest } from "next/server";
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

interface AnnualPlanOutput {
  title: string;
  summary: string;
  milestones: {
    month: number;
    quarter: number;
    title: string;
    description: string;
    targetDate: string;
  }[];
}

interface WeeklyTasksOutput {
  weeks: {
    weekNumber: number;
    weekStart: string;
    tasks: {
      title: string;
      description: string;
      priority: string;
    }[];
  }[];
}

interface DailyHabitsOutput {
  habits: {
    title: string;
    description: string;
    frequency: string;
    bestTime: string;
    durationMinutes: number;
  }[];
  dailyRoutine: {
    morning: string[];
    afternoon: string[];
    evening: string[];
  };
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal) return err("Meta não encontrada", 404);
  if (goal.userId !== session.user.id) return err("Não autorizado", 403);

  const currentYear = new Date().getFullYear();

  // Step 1: Generate annual plan with 12 monthly milestones
  const annualResult = await generateWithRetry<AnnualPlanOutput>(
    SYSTEM_ANNUAL_PLAN,
    buildAnnualPlanPrompt(
      goal.title,
      goal.description,
      goal.deadline,
      currentYear
    ),
    session.user.id,
    goal.id
  );

  const annualPlan = await prisma.annualPlan.create({
    data: {
      userId: session.user.id,
      goalId: goal.id,
      year: currentYear,
      title: annualResult.data.title,
      summary: annualResult.data.summary,
    },
  });

  const milestones = await Promise.all(
    annualResult.data.milestones.map((m) =>
      prisma.quarterlyMilestone.create({
        data: {
          annualPlanId: annualPlan.id,
          quarter: m.quarter,
          title: m.title,
          description: m.description,
          targetDate: new Date(m.targetDate),
        },
      })
    )
  );

  // Step 2: Generate weekly tasks for first 4 weeks
  const firstMilestone = milestones[0];
  const weeklyResult = await generateWithRetry<WeeklyTasksOutput>(
    SYSTEM_WEEKLY_TASKS,
    buildWeeklyTasksPrompt(
      goal.title,
      annualResult.data.summary,
      firstMilestone.title
    ),
    session.user.id,
    goal.id
  );

  const weeklyTasks = await Promise.all(
    weeklyResult.data.weeks.flatMap((week) =>
      week.tasks.map((task) =>
        prisma.weeklyTask.create({
          data: {
            milestoneId: firstMilestone.id,
            title: task.title,
            description: task.description,
            weekStart: new Date(week.weekStart),
          },
        })
      )
    )
  );

  // Step 3: Generate daily habits
  const habitsResult = await generateWithRetry<DailyHabitsOutput>(
    SYSTEM_DAILY_HABITS,
    buildDailyHabitsPrompt(goal.title, annualResult.data.summary),
    session.user.id,
    goal.id
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Attach first week's tasks to today's date for each habit
  const firstWeekTaskId = weeklyTasks[0]?.id ?? null;

  await Promise.all(
    habitsResult.data.habits.map((habit) =>
      prisma.dailyHabit.create({
        data: {
          weeklyTaskId: firstWeekTaskId,
          title: habit.title,
          description: habit.description,
          frequency: habit.frequency,
          date: today,
        },
      })
    )
  );

  return ok(
    {
      annualPlan: {
        ...annualPlan,
        milestones,
      },
      weeklyTasks: weeklyResult.data.weeks,
      habits: habitsResult.data.habits,
      dailyRoutine: habitsResult.data.dailyRoutine,
    },
    201
  );
}
