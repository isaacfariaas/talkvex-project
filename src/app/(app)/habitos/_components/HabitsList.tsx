"use client";

import { Flame, TrendingUp } from "lucide-react";

interface Habit {
  title: string;
  frequency: "daily" | "weekdays" | "custom";
  current: number;
  best: number;
  completionRate: number;
}

function getFrequencyLabel(frequency: string) {
  const labels: Record<string, string> = {
    daily: "Diário",
    weekdays: "Dias úteis",
    custom: "Personalizado",
  };
  return labels[frequency] || frequency;
}

export function HabitsList({ habits }: { habits: Habit[] }) {
  if (habits.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Você ainda não tem hábitos ativos.
        </p>
        <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Hábitos são gerados automaticamente quando você cria um plano.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {habits.map((habit) => (
        <div
          key={habit.title}
          className="p-4 rounded-lg border"
          style={{
            background: "hsl(var(--secondary))",
            borderColor: "hsl(var(--border))",
          }}
        >
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold mb-1" style={{ color: "hsl(var(--foreground))" }}>
                {habit.title}
              </h3>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {getFrequencyLabel(habit.frequency)}
              </p>
            </div>
            <div
              className="px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background:
                  habit.completionRate >= 80
                    ? "hsl(var(--success) / 0.15)"
                    : habit.completionRate >= 50
                      ? "hsl(var(--warning) / 0.15)"
                      : "hsl(var(--destructive) / 0.15)",
                color:
                  habit.completionRate >= 80
                    ? "hsl(var(--success))"
                    : habit.completionRate >= 50
                      ? "hsl(var(--warning))"
                      : "hsl(var(--destructive))",
              }}
            >
              {habit.completionRate}%
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div
              className="flex items-center gap-2 p-2.5 rounded-md"
              style={{ background: "hsl(var(--card))" }}
            >
              <Flame size={16} style={{ color: "hsl(var(--warning))" }} />
              <div>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Sequência Atual
                </p>
                <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                  {habit.current} dias
                </p>
              </div>
            </div>

            <div
              className="flex items-center gap-2 p-2.5 rounded-md"
              style={{ background: "hsl(var(--card))" }}
            >
              <TrendingUp size={16} style={{ color: "hsl(var(--primary))" }} />
              <div>
                <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Melhor
                </p>
                <p className="text-sm font-bold" style={{ color: "hsl(var(--foreground))" }}>
                  {habit.best} dias
                </p>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
