import { ok, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const now = new Date();
  const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [habits, tasks, recentHabits] = await Promise.all([
    prisma.dailyHabit.findMany({
      where: {
        date: { gte: weekStart, lt: weekEnd },
        weeklyTask: { milestone: { annualPlan: { userId: session.user.id } } },
      },
      select: { completed: true, date: true },
    }),
    prisma.weeklyTask.findMany({
      where: {
        weekStart: { gte: weekStart, lt: weekEnd },
        milestone: { annualPlan: { userId: session.user.id } },
      },
      select: { completed: true },
    }),
    // Fetch last 30 days to calculate streak
    prisma.dailyHabit.findMany({
      where: {
        date: {
          gte: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
          lt: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1),
        },
        weeklyTask: { milestone: { annualPlan: { userId: session.user.id } } },
      },
      select: { completed: true, date: true },
      orderBy: { date: "desc" },
    }),
  ]);

  const habitsCompleted = habits.filter((h) => h.completed).length;
  const habitsTotal = habits.length;
  const tasksCompleted = tasks.filter((t) => t.completed).length;
  const tasksTotal = tasks.length;

  // Group habits by day for streak calculation
  const dayMap = new Map<string, { total: number; completed: number }>();
  for (const h of recentHabits) {
    const key = h.date.toISOString().slice(0, 10);
    const entry = dayMap.get(key) ?? { total: 0, completed: 0 };
    entry.total += 1;
    if (h.completed) entry.completed += 1;
    dayMap.set(key, entry);
  }

  // Count consecutive days (going back from today) where at least one habit was completed
  let currentStreak = 0;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  for (let i = 0; i < 30; i++) {
    const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const key = d.toISOString().slice(0, 10);
    const entry = dayMap.get(key);
    if (entry && entry.completed > 0) {
      currentStreak++;
    } else {
      break;
    }
  }

  return ok({
    habitsCompleted,
    habitsTotal,
    tasksCompleted,
    tasksTotal,
    currentStreak,
    weekStart: weekStart.toISOString(),
    weekEnd: weekEnd.toISOString(),
  });
}
