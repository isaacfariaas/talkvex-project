import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { BarChart3 } from "lucide-react";

export default async function ProgressoPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id, status: "ACTIVE" },
    include: {
      annualPlans: {
        include: {
          milestones: {
            include: { weeklyTasks: { select: { id: true, completed: true } } },
          },
        },
        take: 1,
      },
    },
  });

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          Sua evolução
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Acompanhe seu progresso em cada meta
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {goals.map((goal) => {
          const plan = goal.annualPlans[0];
          const allTasks = plan?.milestones.flatMap((m) => m.weeklyTasks) ?? [];
          const done = allTasks.filter((t) => t.completed).length;
          const progress = allTasks.length > 0 ? Math.round((done / allTasks.length) * 100) : 0;

          return (
            <div key={goal.id} className="rounded-xl border p-5"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                    {goal.title}
                  </p>
                  {goal.deadline && (
                    <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                    </p>
                  )}
                </div>
                <BarChart3 size={18} style={{ color: "hsl(var(--primary))" }} />
              </div>

              <div className="flex items-center gap-3 mb-2">
                <span className="text-3xl font-bold" style={{ color: "hsl(var(--primary))" }}>
                  {progress}%
                </span>
                <div className="flex-1">
                  <div className="h-3 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000"
                      style={{ width: `${progress}%`, background: "hsl(var(--primary))" }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {done} de {allTasks.length} tarefas concluídas
                  </p>
                </div>
              </div>

              {/* Q breakdown */}
              {plan && (
                <div className="grid grid-cols-4 gap-2 mt-4">
                  {[1, 2, 3, 4].map((q) => {
                    const qTasks = plan.milestones
                      .filter((m) => m.quarter === q)
                      .flatMap((m) => m.weeklyTasks);
                    const qDone = qTasks.filter((t) => t.completed).length;
                    const qPct = qTasks.length > 0 ? Math.round((qDone / qTasks.length) * 100) : 0;
                    const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"];

                    return (
                      <div key={q} className="rounded-lg p-2 text-center"
                        style={{ background: "hsl(var(--secondary))" }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: colors[q - 1] }}>
                          Q{q}
                        </p>
                        <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                          {qPct}%
                        </p>
                        <div className="h-1 rounded-full mt-1" style={{ background: "hsl(var(--border))" }}>
                          <div
                            className="h-full rounded-full"
                            style={{ width: `${qPct}%`, background: colors[q - 1] }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {goals.length === 0 && (
          <div className="text-center py-12" style={{ color: "hsl(var(--muted-foreground))" }}>
            <BarChart3 size={40} className="mx-auto mb-3 opacity-40" />
            <p>Seu progresso aparecerá aqui quando tiver metas ativas.</p>
          </div>
        )}
      </div>
    </div>
  );
}
