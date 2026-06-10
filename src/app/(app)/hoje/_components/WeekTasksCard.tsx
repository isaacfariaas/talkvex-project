"use client";

import { useState } from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";

interface WeekTask {
  id: string;
  title: string;
  completed: boolean;
  description: string | null;
}

export function WeekTasksCard({ tasks: initial }: { tasks: WeekTask[] }) {
  const [tasks, setTasks] = useState(initial);

  async function toggle(id: string, completed: boolean) {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t))
    );
    await fetch(`/api/daily/tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !completed }),
    });
  }

  const top3 = tasks.slice(0, 3);

  if (top3.length === 0) {
    return (
      <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
        Nenhuma tarefa esta semana.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {top3.map((task, i) => (
        <button
          key={task.id}
          onClick={() => toggle(task.id, task.completed)}
          className="w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors"
          style={{
            background: task.completed ? "hsl(var(--muted))" : "hsl(var(--secondary))",
          }}
        >
          <div className="flex items-center gap-2 shrink-0 mt-0.5">
            <span
              className="text-xs font-bold w-5 h-5 rounded flex items-center justify-center"
              style={{
                background: task.completed ? "hsl(var(--success) / 0.2)" : "hsl(var(--primary) / 0.2)",
                color: task.completed ? "hsl(var(--success))" : "hsl(var(--primary))",
              }}
            >
              {i + 1}
            </span>
            {task.completed ? (
              <CheckCircle2 size={16} style={{ color: "hsl(var(--success))" }} />
            ) : (
              <Circle size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
            )}
          </div>
          <div className="min-w-0">
            <p
              className="text-sm font-medium leading-snug"
              style={{
                color: task.completed ? "hsl(var(--muted-foreground))" : "hsl(var(--foreground))",
                textDecoration: task.completed ? "line-through" : "none",
              }}
            >
              {task.title}
            </p>
            {task.description && (
              <p className="text-xs mt-0.5 truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                {task.description}
              </p>
            )}
          </div>
        </button>
      ))}
      {tasks.length > 3 && (
        <p className="text-xs pl-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          <Clock size={12} className="inline mr-1" />
          +{tasks.length - 3} mais tarefas esta semana
        </p>
      )}
    </div>
  );
}
