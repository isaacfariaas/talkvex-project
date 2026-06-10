import { RefreshCw } from "lucide-react";

export default function RevisaoPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          Revisão da semana
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          5 minutos que valem a semana toda.
        </p>
      </div>
      <div className="rounded-xl border p-10 text-center"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <RefreshCw size={40} className="mx-auto mb-4" style={{ color: "hsl(var(--accent))" }} />
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Revisão semanal com IA — em breve.
        </p>
      </div>
    </div>
  );
}
