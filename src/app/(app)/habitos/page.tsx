import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarHeatmap } from "./_components/CalendarHeatmap";
import { HabitsList } from "./_components/HabitsList";
import { AddHabitButton } from "./_components/AddHabitButton";
import { Flame, Calendar } from "lucide-react";

function calculateStreak(completions: { date: Date; completed: boolean }[]) {
  const sorted = completions
    .filter((c) => c.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (sorted.length === 0) return { current: 0, best: 0 };

  let current = 0;
  let best = 0;
  let temp = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if most recent completion was today or yesterday
  const mostRecent = new Date(sorted[0].date);
  mostRecent.setHours(0, 0, 0, 0);
  const daysSinceRecent = Math.floor((today.getTime() - mostRecent.getTime()) / (24 * 60 * 60 * 1000));

  if (daysSinceRecent <= 1) {
    current = 1;
    for (let i = 1; i < sorted.length; i++) {
      const prev = new Date(sorted[i - 1].date);
      const curr = new Date(sorted[i].date);
      prev.setHours(0, 0, 0, 0);
      curr.setHours(0, 0, 0, 0);
      const diff = Math.floor((prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000));
      if (diff === 1) {
        current++;
      } else {
        break;
      }
    }
  }

  // Calculate best streak
  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(sorted[i - 1].date);
    const curr = new Date(sorted[i].date);
    prev.setHours(0, 0, 0, 0);
    curr.setHours(0, 0, 0, 0);
    const diff = Math.floor((prev.getTime() - curr.getTime()) / (24 * 60 * 60 * 1000));
    if (diff === 1) {
      temp++;
    } else {
      best = Math.max(best, temp);
      temp = 1;
    }
  }
  best = Math.max(best, temp, current);

  return { current, best };
}

export default async function HabitosPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;
  const today = new Date();
  const sixMonthsAgo = new Date(today);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Get all habits from the last 6 months
  const habits = await prisma.dailyHabit.findMany({
    where: {
      date: { gte: sixMonthsAgo },
      weeklyTask: { milestone: { annualPlan: { userId } } },
    },
    include: {
      weeklyTask: {
        select: { id: true, title: true },
      },
    },
    orderBy: { date: "asc" },
  });

  // Group by habit title for consistency tracking
  type Habit = typeof habits[number];
  const habitGroups = habits.reduce((acc: Record<string, { date: Date; completed: boolean }[]>, habit: Habit) => {
    const key = habit.title;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ date: habit.date, completed: habit.completed });
    return acc;
  }, {} as Record<string, { date: Date; completed: boolean }[]>);

  // Calculate overall stats
  const totalDays = habits.length;
  const completedDays = habits.filter((h: Habit) => h.completed).length;
  const completionRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0;

  // Calculate best streak across all habits
  let overallBestStreak = 0;
  let overallCurrentStreak = 0;

  type CompletionEntry = { date: Date; completed: boolean };
  const habitGroupValues = Object.values(habitGroups) as CompletionEntry[][];
  habitGroupValues.forEach((completions) => {
    const { current, best } = calculateStreak(completions);
    overallBestStreak = Math.max(overallBestStreak, best);
    overallCurrentStreak = Math.max(overallCurrentStreak, current);
  });

  // Get unique habit titles with their frequencies
  const habitGroupEntries = Object.entries(habitGroups) as [string, CompletionEntry[]][];
  const uniqueHabits = habitGroupEntries.map(([title, completions]) => {
    const { current, best } = calculateStreak(completions);
    const total = completions.length;
    const completed = completions.filter((c) => c.completed).length;
    return {
      title,
      frequency: "daily" as const,
      current,
      best,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  });

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>
            Seus Hábitos
          </h1>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Acompanhe sua consistência e construa hábitos duradouros
          </p>
        </div>
        <AddHabitButton />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Current Streak */}
        <div
          className="rounded-xl border p-5"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Flame size={18} style={{ color: "hsl(var(--warning))" }} />
            <span className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
              Sequência Atual
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
            {overallCurrentStreak}
            <span className="text-base font-normal ml-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              dias
            </span>
          </p>
        </div>

        {/* Best Streak */}
        <div
          className="rounded-xl border p-5"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
              Recorde
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: "hsl(var(--primary))" }}>
            {overallBestStreak}
            <span className="text-base font-normal ml-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              dias
            </span>
          </p>
        </div>

        {/* Completion Rate */}
        <div
          className="rounded-xl border p-5"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={18} style={{ color: "hsl(var(--success))" }} />
            <span className="text-sm font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
              Taxa de Conclusão
            </span>
          </div>
          <p className="text-3xl font-bold" style={{ color: "hsl(var(--success))" }}>
            {completionRate}%
          </p>
        </div>
      </div>

      {/* Calendar Heatmap */}
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>
          Histórico de Consistência
        </h2>
        <CalendarHeatmap habits={habits.map((h: Habit) => ({ date: h.date, completed: h.completed }))} />
      </div>

      {/* Habits List */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <h2 className="text-base font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>
          Hábitos Ativos
        </h2>
        <HabitsList habits={uniqueHabits} />
      </div>
    </div>
  );
}
