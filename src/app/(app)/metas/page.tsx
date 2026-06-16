import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Target, Plus, ArrowRight, CheckCircle2, PauseCircle } from "lucide-react";

const CATEGORY_LABELS: Record<string, string> = {
  carreira: "Carreira",
  negocios: "Negócios",
  saude: "Saúde",
  financas: "Finanças",
  educacao: "Educação",
  pessoal: "Pessoal",
};

const STATUS_CONFIG = {
  ACTIVE: { label: "Ativa", color: "hsl(var(--success))" },
  COMPLETED: { label: "Concluída", color: "hsl(var(--primary))" },
  PAUSED: { label: "Pausada", color: "hsl(var(--warning))" },
  CANCELLED: { label: "Cancelada", color: "hsl(var(--muted-foreground))" },
};

export default async function MetasPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const goals = await prisma.goal.findMany({
    where: { userId: session.user.id },
    include: {
      annualPlans: {
        include: {
          milestones: {
            include: {
              weeklyTasks: { select: { id: true, completed: true } },
            },
          },
        },
        take: 1,
        orderBy: { year: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  function calcProgress(goal: (typeof goals)[0]) {
    const plan = goal.annualPlans[0];
    if (!plan) return 0;
    const allTasks = plan.milestones.flatMap((m: any) => m.weeklyTasks);
    if (allTasks.length === 0) return 0;
    return Math.round((allTasks.filter((t: any) => t.completed).length / allTasks.length) * 100);
  }

  const active = goals.filter((g: any) => g.status === "ACTIVE");
  const others = goals.filter((g: any) => g.status !== "ACTIVE");

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
            Suas metas
          </h1>
          <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
            {active.length} ativa{active.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/nova-meta"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          <Plus size={16} />
          Nova meta
        </Link>
      </div>

      {goals.length === 0 ? (
        <div
          className="rounded-xl border p-10 text-center"
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
            Criar minha primeira meta →
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Active goals */}
          {active.length > 0 && (
            <section>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {active.map((goal) => {
                  const progress = calcProgress(goal);
                  const hasPlan = goal.annualPlans.length > 0;
                  const statusCfg = STATUS_CONFIG[goal.status];
                  return (
                    <Link
                      key={goal.id}
                      href={hasPlan ? `/metas/${goal.id}/plano` : `/metas/${goal.id}`}
                      className="rounded-xl border p-5 block transition-all hover:opacity-90 hover:scale-[1.01]"
                      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 pr-2">
                          <p className="text-sm font-medium leading-snug" style={{ color: "hsl(var(--foreground))" }}>
                            {goal.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                              {CATEGORY_LABELS[goal.category] ?? goal.category}
                            </span>
                            <span style={{ color: "hsl(var(--muted-foreground))" }}>·</span>
                            <span className="text-xs font-medium" style={{ color: statusCfg.color }}>
                              {statusCfg.label}
                            </span>
                          </div>
                        </div>
                        <span className="text-lg font-bold shrink-0" style={{ color: "hsl(var(--primary))" }}>
                          {progress}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="h-2 rounded-full overflow-hidden mb-3" style={{ background: "hsl(var(--border))" }}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${progress}%`, background: `hsl(var(--primary))` }}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        {goal.deadline && (
                          <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                            Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR", { month: "short", year: "numeric" })}
                          </span>
                        )}
                        {!hasPlan ? (
                          <span className="text-xs flex items-center gap-1 ml-auto" style={{ color: "hsl(var(--accent))" }}>
                            Gerar plano com IA <ArrowRight size={12} />
                          </span>
                        ) : (
                          <span className="text-xs flex items-center gap-1 ml-auto" style={{ color: "hsl(var(--muted-foreground))" }}>
                            Ver plano <ArrowRight size={12} />
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Other goals */}
          {others.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"
                style={{ color: "hsl(var(--muted-foreground))" }}>
                <PauseCircle size={14} />
                Outras metas
              </h2>
              <div className="space-y-2">
                {others.map((goal) => {
                  const progress = calcProgress(goal);
                  const statusCfg = STATUS_CONFIG[goal.status];
                  return (
                    <Link
                      key={goal.id}
                      href={`/metas/${goal.id}`}
                      className="flex items-center gap-4 p-4 rounded-xl border transition-opacity hover:opacity-80"
                      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
                    >
                      <CheckCircle2 size={16} style={{ color: statusCfg.color, flexShrink: 0 }} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {goal.title}
                        </p>
                      </div>
                      <span className="text-xs font-medium shrink-0" style={{ color: statusCfg.color }}>
                        {progress}% · {statusCfg.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
