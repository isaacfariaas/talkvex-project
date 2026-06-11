"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, ChevronRight, ArrowLeft } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  { value: "carreira", label: "💼 Carreira" },
  { value: "negocios", label: "🚀 Negócios" },
  { value: "saude", label: "💪 Saúde" },
  { value: "financas", label: "💰 Finanças" },
  { value: "educacao", label: "📚 Educação" },
  { value: "pessoal", label: "🌱 Pessoal" },
];

const DEADLINES = [
  { value: 3, label: "3 meses" },
  { value: 6, label: "6 meses" },
  { value: 12, label: "12 meses" },
  { value: 18, label: "18 meses" },
  { value: 24, label: "2 anos" },
];

const LOADING_MESSAGES = [
  "Analisando sua meta...",
  "Estruturando seu plano anual...",
  "Criando metas trimestrais...",
  "Definindo hábitos e tarefas diárias...",
  "Quase lá...",
];

const PLACEHOLDERS = [
  "Ex: Quero me tornar Tech Lead em 12 meses.",
  "Ex: Quero conseguir uma promoção para gerente até o final do ano.",
  "Ex: Quero lançar meu SaaS e chegar a R$5.000/mês em receita recorrente.",
  "Ex: Quero abrir minha clínica odontológica e atender 20 pacientes por semana.",
  "Ex: Quero fazer uma transição de carreira para UX Design.",
  "Ex: Quero correr uma meia maratona em menos de 2 horas.",
  "Ex: Quero perder 10kg de forma saudável nos próximos 6 meses.",
  "Ex: Quero economizar R$30.000 para dar entrada em um imóvel.",
  "Ex: Quero quitar todas as minhas dívidas do cartão de crédito.",
  "Ex: Quero concluir meu MBA em Gestão de Projetos.",
  "Ex: Quero aprender inglês fluente e tirar certificação C1.",
  "Ex: Quero melhorar meu relacionamento familiar dedicando mais tempo de qualidade.",
];

export default function NovaMetaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("carreira");
  const [deadlineMonths, setDeadlineMonths] = useState(12);
  const [loading, setLoading] = useState(false);
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [error, setError] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(() => Math.floor(Math.random() * PLACEHOLDERS.length));

  useEffect(() => {
    if (!loading) return;
    const interval = setInterval(() => {
      setLoadingMsgIdx((i) => (i + 1) % LOADING_MESSAGES.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx((i) => (i + 1) % PLACEHOLDERS.length);
    }, 3500);
    return () => clearInterval(interval);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setError("");
    setLoading(true);
    setLoadingMsgIdx(0);

    try {
      // Step 1: Create goal
      const deadline = new Date();
      deadline.setMonth(deadline.getMonth() + deadlineMonths);

      const goalRes = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          deadline: deadline.toISOString(),
        }),
      });

      if (!goalRes.ok) {
        const d = await goalRes.json();
        throw new Error(d.error || "Erro ao criar meta");
      }

      const goal = await goalRes.json();

      // Step 2: Generate plan
      const genRes = await fetch(`/api/goals/${goal.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deadlineMonths }),
      });

      if (!genRes.ok) {
        // Plan generation failed, still go to goal page
        router.push(`/metas/${goal.id}`);
        return;
      }

      router.push(`/metas/${goal.id}/plano`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.");
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <div className="text-center max-w-sm">
          {/* Animated spinner */}
          <div className="relative mx-auto mb-8 w-20 h-20">
            <div
              className="absolute inset-0 rounded-full border-4 border-t-transparent animate-spin"
              style={{ borderColor: "hsl(var(--primary) / 0.2)", borderTopColor: "hsl(var(--primary))" }}
            />
            <div
              className="absolute inset-3 rounded-full border-2 border-t-transparent animate-spin"
              style={{
                borderColor: "hsl(var(--accent) / 0.2)",
                borderTopColor: "hsl(var(--accent))",
                animationDirection: "reverse",
                animationDuration: "0.7s",
              }}
            />
            <Sparkles
              size={20}
              className="absolute inset-0 m-auto animate-pulse"
              style={{ color: "hsl(var(--accent))" }}
            />
          </div>

          <h2 className="text-xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Montando seu caminho...
          </h2>
          <p
            key={loadingMsgIdx}
            className="text-sm animate-fade-up"
            style={{ color: "hsl(var(--muted-foreground))" }}
          >
            {LOADING_MESSAGES[loadingMsgIdx]}
          </p>
          <p className="text-xs mt-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            Sua IA está montando um plano personalizado. Isso é só o começo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        <Link
          href="/hoje"
          className="inline-flex items-center gap-1 text-sm mb-8 transition-opacity hover:opacity-70"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          <ArrowLeft size={14} />
          Voltar
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={20} style={{ color: "hsl(var(--accent))" }} />
            <span className="text-xs font-semibold uppercase tracking-widest" style={{ color: "hsl(var(--accent))" }}>
              IA Talkvex
            </span>
          </div>
          <h1 className="text-3xl font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Onde você quer chegar?
          </h1>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Diga sua meta. A IA monta seu caminho.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div
              className="px-4 py-3 rounded-lg text-sm"
              style={{
                background: "hsl(var(--destructive) / 0.1)",
                color: "hsl(var(--destructive))",
                border: "1px solid hsl(var(--destructive) / 0.3)",
              }}
            >
              {error}
            </div>
          )}

          {/* Goal textarea */}
          <div>
            <textarea
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={PLACEHOLDERS[placeholderIdx]}
              rows={3}
              required
              className="w-full px-4 py-3 rounded-lg text-sm resize-none outline-none transition-all"
              style={{
                background: "hsl(var(--card))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))",
                fontFamily: "inherit",
              }}
              onFocus={(e) => (e.target.style.borderColor = "hsl(var(--primary))")}
              onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border))")}
            />
            <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
              Seja específico. Quanto mais detalhe, melhor seu plano.
            </p>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>
              Em quanto tempo você quer chegar lá?
            </label>
            <div className="flex flex-wrap gap-2">
              {DEADLINES.map((d) => (
                <button
                  key={d.value}
                  type="button"
                  onClick={() => setDeadlineMonths(d.value)}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
                  style={{
                    background: deadlineMonths === d.value ? "hsl(var(--primary))" : "hsl(var(--secondary))",
                    color: deadlineMonths === d.value ? "hsl(var(--primary-foreground))" : "hsl(var(--foreground))",
                    border: "1px solid",
                    borderColor: deadlineMonths === d.value ? "hsl(var(--primary))" : "hsl(var(--border))",
                  }}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>
              Área principal:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {CATEGORIES.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className="px-3 py-2 rounded-lg text-sm font-medium transition-all text-left"
                  style={{
                    background: category === c.value ? "hsl(var(--primary) / 0.15)" : "hsl(var(--secondary))",
                    color: category === c.value ? "hsl(var(--primary))" : "hsl(var(--foreground))",
                    border: "1px solid",
                    borderColor: category === c.value ? "hsl(var(--primary) / 0.5)" : "hsl(var(--border))",
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={!title.trim()}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm transition-opacity disabled:opacity-40 hover:opacity-90"
              style={{
                background: "hsl(var(--primary))",
                color: "hsl(var(--primary-foreground))",
              }}
            >
              <Sparkles size={16} />
              Gerar meu plano
              <ChevronRight size={16} />
            </button>
            <p className="text-xs text-center mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>
              Seu plano é criado em segundos. Gratuito para começar.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
