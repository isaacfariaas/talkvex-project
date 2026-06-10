import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Target, Flame, Plus, ArrowRight } from "lucide-react";
import { HabitsCard } from "./_components/HabitsCard";
import { WeekTasksCard } from "./_components/WeekTasksCard";

function getGreeting(name: string | null | undefined) {
  const hour = new Date().getHours();
  const first = name?.split(" ")[0] ?? "você";
  if (hour < 12) return `Bom dia, ${first}.`;
  if (hour < 18) return `Boa tarde, ${first}.`;
  return `Boa noite, ${first}.`;
}

export default async function HojePage() {
  const session = await auth();
  if (!session) redirect("/login");

  const userId = session.user.id;
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [goals, habits, tasks] = await Promise.all([
    prisma.goal.findMany({
      where: { userId, status: "ACTIVE" },
      include: {
        annualPlans: {
          include: {
            milestones: {
              include: {
                weeklyTasks: { select: { id: true, completed: true } },
              },
            },
          },
          orderBy: { year: "desc" },
          take: 1,
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.dailyHabit.findMany({
      where: {
        date: { gte: todayStart, lt: todayEnd },
        weeklyTask: { milestone: { annualPlan: { userId } } },
      },
      include: { weeklyTask: { select: { id: true, title: true } } },
      orderBy: { createdAt: "asc" },
    }),
    prisma.weeklyTask.findMany({
      where: {
        weekStart: { gte: weekStart, lt: weekEnd },
        milestone: { annualPlan: { userId } },
      },
      orderBy: [{ completed: "asc" }, { createdAt: "asc" }],
    }),
  ]);

  function calcProgress(goal: (typeof goals)[0]) {
    const plan = goal.annualPlans[0];
    if (!plan) return 0;
    const allTasks = plan.milestones.flatMap((m) => m.weeklyTasks);
    if (allTasks.length === 0) return 0;
    return Math.round((allTasks.filter((t) => t.completed).length / allTasks.length) * 100);
  }

  const todayTaskCount = tasks.filter((t) => !t.completed).length;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>
          {getGreeting(session.user?.name)}
        </h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          {todayTaskCount > 0
            ? `Hoje você tem ${todayTaskCount} tarefa${todayTaskCount > 1 ? "s" : ""} para avançar.`
            : "Nenhuma tarefa pendente hoje. Bom trabalho!"}
        </p>
      </div>

      {goals.length === 0 ? (
        /* Zero state */
        <div
          className="rounded-xl border p-8 text-center"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <Target size={40} className="mx-auto mb-4" style={{ color: "hsl(var(--muted-foreground))" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Você ainda não tem nenhuma meta aqui.
          </h2>
          <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            Tudo começa com um objetivo. Qual é o seu?
          </p>
          <Link
            href="/nova-meta"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            <Plus size={16} />
            Criar minha primeira meta
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Active Goals */}
          <div
            className="rounded-xl border p-5 space-y-4"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold flex items-center gap-2"
                style={{ color: "hsl(var(--foreground))" }}>
                <Target size={16} style={{ color: "hsl(var(--primary))" }} />
                Suas metas ativas
              </h2>
              <Link
                href="/nova-meta"
                className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ color: "hsl(var(--primary))" }}
              >
                <Plus size={12} /> Nova
              </Link>
            </div>
            <div className="space-y-3">
              {goals.map((goal) => {
                const progress = calcProgress(goal);
                const hasPlan = goal.annualPlans.length > 0;
                return (
                  <Link
                    key={goal.id}
                    href={hasPlan ? `/metas/${goal.id}/plano` : `/metas/${goal.id}`}
                    className="block p-3 rounded-lg transition-colors hover:opacity-90"
                    style={{ background: "hsl(var(--secondary))" }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium leading-snug pr-2" style={{ color: "hsl(var(--foreground))" }}>
                        {goal.title}
                      </p>
                      <span className="text-xs font-bold shrink-0" style={{ color: "hsl(var(--primary))" }}>
                        {progress}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${progress}%`, background: "hsl(var(--primary))" }}
                      />
                    </div>
                    {!hasPlan && (
                      <p className="text-xs mt-2 flex items-center gap-1" style={{ color: "hsl(var(--accent))" }}>
                        <ArrowRight size={12} />
                        Gerar plano com IA
                      </p>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Weekly Focus */}
          <div
            className="rounded-xl border p-5"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <h2 className="text-base font-semibold flex items-center gap-2 mb-4"
              style={{ color: "hsl(var(--foreground))" }}>
              <Flame size={16} style={{ color: "hsl(var(--warning))" }} />
              Foco da semana
            </h2>
            <WeekTasksCard
              tasks={tasks.map((t) => ({
                id: t.id,
                title: t.title,
                completed: t.completed,
                description: t.description,
              }))}
            />
          </div>

          {/* Daily Habits */}
          <div
            className="rounded-xl border p-5 lg:col-span-2"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold flex items-center gap-2"
                style={{ color: "hsl(var(--foreground))" }}>
                <span style={{ color: "hsl(var(--success))" }}>✓</span>
                Sua rotina de hoje
              </h2>
              <Link
                href="/habitos"
                className="text-xs font-medium flex items-center gap-1 transition-opacity hover:opacity-80"
                style={{ color: "hsl(var(--primary))" }}
              >
                Ver histórico <ArrowRight size={12} />
              </Link>
            </div>
            <HabitsCard
              habits={habits.map((h) => ({
                id: h.id,
                title: h.title,
                completed: h.completed,
                weeklyTask: h.weeklyTask,
              }))}
            />
            {habits.length === 0 && (
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                Seus hábitos diários aparecerão aqui após gerar um plano.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
