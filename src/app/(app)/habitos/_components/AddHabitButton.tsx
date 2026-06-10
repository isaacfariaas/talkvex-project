"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

export function AddHabitButton() {
  const [isOpen, setIsOpen] = useState(false);

  // For now, this is a placeholder
  // Will be enhanced with a proper dialog/modal in the future
  function handleClick() {
    setIsOpen(true);
    alert("Funcionalidade de adicionar hábito manual em desenvolvimento.\nPor enquanto, hábitos são criados automaticamente ao gerar um plano.");
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
      style={{
        background: "hsl(var(--primary))",
        color: "hsl(var(--primary-foreground))",
      }}
    >
      <Plus size={16} />
      Adicionar Hábito
    </button>
  );
}
