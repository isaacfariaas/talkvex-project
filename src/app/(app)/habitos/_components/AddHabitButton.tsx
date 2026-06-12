"use client";

import { Plus } from "lucide-react";

export function AddHabitButton() {
  return (
    <button
      disabled
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold opacity-50 cursor-not-allowed"
      style={{
        background: "hsl(var(--muted))",
        color: "hsl(var(--muted-foreground))",
      }}
      title="Hábitos são criados automaticamente ao gerar um plano"
    >
      <Plus size={16} />
      Adicionar Hábito
    </button>
  );
}
