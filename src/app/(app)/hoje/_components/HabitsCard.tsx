"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";
import confetti from "canvas-confetti";

interface Habit {
  id: string;
  title: string;
  completed: boolean;
  weeklyTask: { id: string; title: string } | null;
}

export function HabitsCard({ habits: initial }: { habits: Habit[] }) {
  const [habits, setHabits] = useState(initial);
  const [justCompleted, setJustCompleted] = useState<string | null>(null);

  async function toggle(id: string, completed: boolean) {
    const newCompleted = !completed;

    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, completed: newCompleted } : h))
    );

    if (newCompleted) {
      setJustCompleted(id);
      setTimeout(() => setJustCompleted(null), 600);

      // Check if all habits are now completed
      const willAllBeCompleted = habits.every((h) => h.id === id || h.completed);
      if (willAllBeCompleted && habits.length > 0) {
        // Fire confetti!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#10b981", "#34d399", "#6ee7b7"],
        });
      }
    }

    await fetch(`/api/daily/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: newCompleted }),
    });
  }

  if (habits.length === 0) {
    return (
      <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
        Nenhum hábito para hoje.
      </p>
    );
  }

  const done = habits.filter((h) => h.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium" style={{ color: "hsl(var(--muted-foreground))" }}>
          {done}/{habits.length} concluídos hoje
        </span>
        <div className="flex-1 ml-3 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${habits.length > 0 ? (done / habits.length) * 100 : 0}%`,
              background: "hsl(var(--success))",
            }}
          />
        </div>
      </div>
      {habits.map((habit) => (
        <button
          key={habit.id}
          onClick={() => toggle(habit.id, habit.completed)}
          className="w-full flex items-center gap-3 p-3 rounded-lg text-left transition-all duration-300 hover:scale-[1.02]"
          style={{
            background: habit.completed ? "hsl(var(--success) / 0.1)" : "hsl(var(--secondary))",
            transform: justCompleted === habit.id ? "scale(1.05)" : "scale(1)",
          }}
        >
          {habit.completed ? (
            <CheckCircle2
              size={18}
              style={{ color: "hsl(var(--success))", flexShrink: 0 }}
              className={justCompleted === habit.id ? "animate-bounce" : ""}
            />
          ) : (
            <Circle size={18} style={{ color: "hsl(var(--muted-foreground))", flexShrink: 0 }} />
          )}
          <span
            className="text-sm font-medium transition-all duration-300"
            style={{
              color: habit.completed ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
              textDecoration: habit.completed ? "line-through" : "none",
            }}
          >
            {habit.title}
          </span>
        </button>
      ))}
    </div>
  );
}
