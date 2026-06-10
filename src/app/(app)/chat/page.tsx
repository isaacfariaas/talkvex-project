import { Sparkles } from "lucide-react";

export default function ChatPage() {
  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          IA Talkvex
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Converse com sua IA de coaching.
        </p>
      </div>
      <div className="rounded-xl border p-10 text-center"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
        <Sparkles size={40} className="mx-auto mb-4" style={{ color: "hsl(var(--accent))" }} />
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Chat com IA — em breve.
        </p>
      </div>
    </div>
  );
}
