import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Target, Sparkles } from "lucide-react";
import { PlanTabs } from "./_components/PlanTabs";

export default async function PlanoPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.user.id) notFound();

  const annualPlan = await prisma.annualPlan.findFirst({
    where: { goalId: id, userId: session.user.id },
    orderBy: { year: "desc" },
    include: {
      milestones: {
        orderBy: { quarter: "asc" },
        include: {
          weeklyTasks: {
            orderBy: { weekStart: "asc" },
            include: {
              dailyHabits: { orderBy: { createdAt: "asc" } },
            },
          },
        },
      },
    },
  });

  if (!annualPlan) {
    return (
      <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
        <Link
          href="/metas"
          className="inline-flex items-center gap-1 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          <ArrowLeft size={14} />
          Metas
        </Link>
        <div
          className="rounded-xl border p-10 text-center"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <Sparkles size={40} className="mx-auto mb-4" style={{ color: "hsl(var(--accent))" }} />
          <h2 className="text-lg font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Plano ainda não gerado
          </h2>
          <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            Gere seu plano personalizado com IA para ver o caminho completo.
          </p>
          <Link
            href="/nova-meta"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
          >
            <Sparkles size={16} />
            Gerar plano com IA →
          </Link>
        </div>
      </div>
    );
  }

  const allTasks = annualPlan.milestones.flatMap((m) => m.weeklyTasks);
  const progress =
    allTasks.length > 0
      ? Math.round((allTasks.filter((t) => t.completed).length / allTasks.length) * 100)
      : 0;

  // Serialize dates to strings for client components
  const planData = {
    id: annualPlan.id,
    title: annualPlan.title,
    summary: annualPlan.summary,
    year: annualPlan.year,
    milestones: annualPlan.milestones.map((m) => ({
      id: m.id,
      quarter: m.quarter,
      title: m.title,
      description: m.description,
      targetDate: m.targetDate?.toISOString() ?? null,
      completed: m.completed,
      weeklyTasks: m.weeklyTasks.map((t) => ({
        id: t.id,
        title: t.title,
        description: t.description,
        weekStart: t.weekStart.toISOString(),
        completed: t.completed,
        dailyHabits: t.dailyHabits.map((h) => ({
          id: h.id,
          title: h.title,
          completed: h.completed,
        })),
      })),
    })),
  };

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
      {/* Back link */}
      <Link
        href="/metas"
        className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        <ArrowLeft size={14} />
        Metas
      </Link>

      {/* Goal header */}
      <div
        className="rounded-xl border p-5 mb-6"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-start gap-3">
          <Target size={20} style={{ color: "hsl(var(--primary))", marginTop: 2, flexShrink: 0 }} />
          <div className="flex-1">
            <h1 className="text-lg font-bold leading-snug" style={{ color: "hsl(var(--foreground))" }}>
              {goal.title}
            </h1>
            <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              {annualPlan.title}
            </p>
            {goal.deadline && (
              <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                Prazo:{" "}
                {new Date(goal.deadline).toLocaleDateString("pt-BR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold" style={{ color: "hsl(var(--primary))" }}>
              {progress}%
            </p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>concluído</p>
          </div>
        </div>
        <div className="mt-4 h-2 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
          <div
            className="h-full rounded-full transition-all duration-1000"
            style={{ width: `${progress}%`, background: "hsl(var(--primary))" }}
          />
        </div>
      </div>

      {/* Plan tabs */}
      <div
        className="rounded-xl border p-5"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <PlanTabs plan={planData} />
      </div>
    </div>
  );
}
