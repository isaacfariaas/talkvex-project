"use client";

import { useState } from "react";
import { CheckCircle2, Circle, CalendarDays, Target, BarChart3, Flame } from "lucide-react";

interface WeeklyTask {
  id: string;
  title: string;
  description: string | null;
  weekStart: string;
  completed: boolean;
  dailyHabits: { id: string; title: string; completed: boolean }[];
}

interface Milestone {
  id: string;
  quarter: number;
  title: string;
  description: string | null;
  targetDate: string | null;
  completed: boolean;
  weeklyTasks: WeeklyTask[];
}

interface AnnualPlan {
  id: string;
  title: string;
  summary: string | null;
  year: number;
  milestones: Milestone[];
}

const TABS = [
  { id: "anual", label: "Anual", icon: CalendarDays },
  { id: "trimestral", label: "Trimestral", icon: Target },
  { id: "semanal", label: "Semanal", icon: BarChart3 },
  { id: "diario", label: "Diário", icon: Flame },
] as const;

type TabId = (typeof TABS)[number]["id"];

function ProgressBar({ value, color }: { value: number; color?: string }) {
  return (
    <div className="h-2 rounded-full overflow-hidden w-full" style={{ background: "hsl(var(--border))" }}>
      <div
        className="h-full rounded-full transition-all duration-700"
        style={{ width: `${value}%`, background: color ?? "hsl(var(--primary))" }}
      />
    </div>
  );
}

function calcMilestoneProgress(m: Milestone) {
  const all = m.weeklyTasks;
  if (all.length === 0) return 0;
  return Math.round((all.filter((t) => t.completed).length / all.length) * 100);
}

function AnnualView({ plan }: { plan: AnnualPlan }) {
  const quarters = [1, 2, 3, 4];

  return (
    <div className="space-y-6">
      {/* Summary */}
      {plan.summary && (
        <div
          className="rounded-xl p-4 text-sm"
          style={{ background: "hsl(var(--secondary))", color: "hsl(var(--muted-foreground))" }}
        >
          {plan.summary}
        </div>
      )}

      {/* Timeline */}
      <div className="space-y-4">
        {quarters.map((q) => {
          const qMilestones = plan.milestones.filter((m) => m.quarter === q);
          if (qMilestones.length === 0) return null;
          const qProgress = Math.round(
            qMilestones.reduce((sum, m) => sum + calcMilestoneProgress(m), 0) / qMilestones.length
          );
          const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"];

          return (
            <div key={q} className="rounded-xl border p-4"
              style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: colors[q - 1] }}
                  />
                  <span className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                    Q{q} — {["Jan–Mar", "Abr–Jun", "Jul–Set", "Out–Dez"][q - 1]}
                  </span>
                </div>
                <span className="text-sm font-bold" style={{ color: colors[q - 1] }}>
                  {qProgress}%
                </span>
              </div>
              <ProgressBar value={qProgress} color={colors[q - 1]} />
              <div className="mt-3 space-y-1">
                {qMilestones.map((m) => (
                  <div key={m.id} className="flex items-start gap-2">
                    {m.completed ? (
                      <CheckCircle2 size={14} style={{ color: "hsl(var(--success))", marginTop: 2, flexShrink: 0 }} />
                    ) : (
                      <Circle size={14} style={{ color: "hsl(var(--muted-foreground))", marginTop: 2, flexShrink: 0 }} />
                    )}
                    <div>
                      <p className="text-sm" style={{ color: "hsl(var(--foreground))" }}>{m.title}</p>
                      {m.targetDate && (
                        <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                          Prazo: {new Date(m.targetDate).toLocaleDateString("pt-BR", { month: "short", day: "numeric" })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TrimestralView({ plan }: { plan: AnnualPlan }) {
  const quarters = [1, 2, 3, 4];
  const colors = ["hsl(var(--primary))", "hsl(var(--accent))", "hsl(var(--success))", "hsl(var(--warning))"];

  return (
    <div className="space-y-6">
      {quarters.map((q) => {
        const milestones = plan.milestones.filter((m) => m.quarter === q);
        if (milestones.length === 0) return null;
        const allTasks = milestones.flatMap((m) => m.weeklyTasks);
        const qProgress = allTasks.length > 0
          ? Math.round((allTasks.filter((t) => t.completed).length / allTasks.length) * 100)
          : 0;

        return (
          <div key={q} className="rounded-xl border overflow-hidden"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            {/* Quarter header */}
            <div className="px-5 py-4 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                  Trimestre {q}
                </h3>
                <span className="text-sm font-bold" style={{ color: colors[q - 1] }}>
                  {qProgress}%
                </span>
              </div>
              <ProgressBar value={qProgress} color={colors[q - 1]} />
            </div>
            {/* Milestones */}
            <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
              {milestones.map((m) => {
                const mProgress = calcMilestoneProgress(m);
                return (
                  <div key={m.id} className="px-5 py-4">
                    <div className="flex items-start gap-3">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                        style={{ background: colors[q - 1] }}
                      />
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>
                            {m.title}
                          </p>
                          {m.targetDate && (
                            <span className="text-xs ml-2 shrink-0" style={{ color: "hsl(var(--muted-foreground))" }}>
                              {new Date(m.targetDate).toLocaleDateString("pt-BR", { month: "short", year: "2-digit" })}
                            </span>
                          )}
                        </div>
                        {m.description && (
                          <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                            {m.description}
                          </p>
                        )}
                        {m.weeklyTasks.length > 0 && (
                          <div className="mt-2">
                            <ProgressBar value={mProgress} />
                            <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                              {m.weeklyTasks.filter((t) => t.completed).length}/{m.weeklyTasks.length} tarefas
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SemanalView({ plan }: { plan: AnnualPlan }) {
  const allTasks = plan.milestones
    .flatMap((m) => m.weeklyTasks)
    .sort((a, b) => new Date(a.weekStart).getTime() - new Date(b.weekStart).getTime());

  // Group by week
  const byWeek = new Map<string, WeeklyTask[]>();
  for (const task of allTasks) {
    const key = task.weekStart;
    if (!byWeek.has(key)) byWeek.set(key, []);
    byWeek.get(key)!.push(task);
  }

  const now = new Date();

  return (
    <div className="space-y-4">
      {Array.from(byWeek.entries()).map(([weekStart, tasks]) => {
        const weekDate = new Date(weekStart);
        const isPast = weekDate < now;
        const isCurrent = weekDate <= now && new Date(weekStart).getTime() + 7 * 24 * 3600 * 1000 > now.getTime();
        const done = tasks.filter((t) => t.completed).length;

        return (
          <div
            key={weekStart}
            className="rounded-xl border p-4"
            style={{
              background: isCurrent ? "hsl(var(--primary) / 0.05)" : "hsl(var(--card))",
              borderColor: isCurrent ? "hsl(var(--primary) / 0.4)" : "hsl(var(--border))",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {isCurrent && (
                  <span
                    className="text-xs font-semibold px-2 py-0.5 rounded-full"
                    style={{ background: "hsl(var(--primary) / 0.2)", color: "hsl(var(--primary))" }}
                  >
                    Esta semana
                  </span>
                )}
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {weekDate.toLocaleDateString("pt-BR", { day: "numeric", month: "short" })}
                </span>
              </div>
              <span className="text-xs" style={{ color: isPast ? "hsl(var(--success))" : "hsl(var(--muted-foreground))" }}>
                {done}/{tasks.length}
              </span>
            </div>
            <div className="space-y-2">
              {tasks.map((task) => (
                <div key={task.id} className="flex items-start gap-2">
                  {task.completed ? (
                    <CheckCircle2 size={14} style={{ color: "hsl(var(--success))", marginTop: 2, flexShrink: 0 }} />
                  ) : (
                    <Circle size={14} style={{ color: "hsl(var(--muted-foreground))", marginTop: 2, flexShrink: 0 }} />
                  )}
                  <p
                    className="text-sm"
                    style={{
                      color: task.completed ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
                      textDecoration: task.completed ? "line-through" : "none",
                    }}
                  >
                    {task.title}
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DiarioView({ plan }: { plan: AnnualPlan }) {
  const allHabits = plan.milestones
    .flatMap((m) => m.weeklyTasks)
    .flatMap((t) => t.dailyHabits);

  if (allHabits.length === 0) {
    return (
      <p className="text-sm text-center py-8" style={{ color: "hsl(var(--muted-foreground))" }}>
        Nenhum hábito diário configurado ainda.
      </p>
    );
  }

  // De-duplicate by title
  const unique = new Map<string, (typeof allHabits)[0]>();
  for (const h of allHabits) {
    if (!unique.has(h.title)) unique.set(h.title, h);
  }

  return (
    <div className="space-y-3">
      <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
        Hábitos diários do seu plano:
      </p>
      {Array.from(unique.values()).map((habit) => (
        <div
          key={habit.id}
          className="flex items-center gap-3 p-3 rounded-lg"
          style={{ background: "hsl(var(--secondary))" }}
        >
          <CheckCircle2 size={16} style={{ color: "hsl(var(--success))", flexShrink: 0 }} />
          <p className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>
            {habit.title}
          </p>
        </div>
      ))}
      <p className="text-xs pt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
        Marque seus hábitos de hoje na tela{" "}
        <a href="/hoje" style={{ color: "hsl(var(--primary))" }}>Hoje</a>.
      </p>
    </div>
  );
}

export function PlanTabs({ plan }: { plan: AnnualPlan }) {
  const [activeTab, setActiveTab] = useState<TabId>("anual");

  return (
    <div>
      {/* Tab bar */}
      <div
        className="flex border-b mb-6"
        style={{ borderColor: "hsl(var(--border))" }}
      >
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-4 py-3 text-sm font-medium transition-colors relative"
            style={{ color: activeTab === id ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
          >
            <Icon size={14} />
            {label}
            {activeTab === id && (
              <div
                className="absolute bottom-0 left-0 right-0 h-0.5 rounded-t"
                style={{ background: "hsl(var(--primary))" }}
              />
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === "anual" && <AnnualView plan={plan} />}
      {activeTab === "trimestral" && <TrimestralView plan={plan} />}
      {activeTab === "semanal" && <SemanalView plan={plan} />}
      {activeTab === "diario" && <DiarioView plan={plan} />}
    </div>
  );
}
