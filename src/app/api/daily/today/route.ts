import { ok, requireAuth } from "@/lib/api";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const { session, response } = await requireAuth();
  if (!session) return response!;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  // Get today's habits for this user
  const habits = await prisma.dailyHabit.findMany({
    where: {
      date: { gte: todayStart, lt: todayEnd },
      weeklyTask: {
        milestone: {
          annualPlan: { userId: session.user.id },
        },
      },
    },
    include: {
      weeklyTask: {
        select: { id: true, title: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  // Get this week's uncompleted tasks for this user
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const tasks = await prisma.weeklyTask.findMany({
    where: {
      weekStart: { gte: weekStart, lt: weekEnd },
      milestone: {
        annualPlan: { userId: session.user.id },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return ok({ date: todayStart.toISOString(), habits, tasks });
}
