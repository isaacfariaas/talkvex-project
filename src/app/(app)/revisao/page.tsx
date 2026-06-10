"use client";

import { useState, useEffect } from "react";
import { ChevronRight, CheckCircle2, Loader2, TrendingUp, Calendar, Target } from "lucide-react";

type ReviewStep = "select-goal" | "questions" | "metrics" | "adjustments" | "report" | "history";

interface Goal {
  id: string;
  title: string;
  description: string | null;
  category: string;
  deadline: string | null;
  status: string;
}

interface Question {
  category: string;
  question: string;
  hint: string;
}

interface Answer {
  question: string;
  answer: string;
  rating: number;
}

interface WeeklyMetrics {
  habitsCompleted: number;
  habitsTotal: number;
  tasksCompleted: number;
  tasksTotal: number;
  currentStreak: number;
}

interface Adjustment {
  type: string;
  target: string;
  reason: string;
  newContent: string | null;
}

interface Suggestions {
  assessment: string;
  adjustments: Adjustment[];
  nextWeekFocus: string;
  motivationalMessage: string;
}

export default function RevisaoPage() {
  const [step, setStep] = useState<ReviewStep>("select-goal");
  const [goals, setGoals] = useState<Goal[]>([]);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [metrics, setMetrics] = useState<WeeklyMetrics | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviewId, setReviewId] = useState<string | null>(null);
  const [pastReviews, setPastReviews] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    loadGoals();
    loadWeeklyMetrics();
  }, []);

  const loadGoals = async () => {
    try {
      const res = await fetch("/api/goals");
      if (!res.ok) throw new Error("Erro ao carregar metas");
      const data = await res.json();
      setGoals(data);
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar metas");
    }
  };

  const loadWeeklyMetrics = async () => {
    try {
      const res = await fetch("/api/metrics/weekly");
      if (!res.ok) throw new Error("Erro ao carregar métricas");
      const data = await res.json();
      setMetrics({
        habitsCompleted: data.habitsCompleted,
        habitsTotal: data.habitsTotal,
        tasksCompleted: data.tasksCompleted,
        tasksTotal: data.tasksTotal,
        currentStreak: data.currentStreak,
      });
    } catch (err) {
      console.error(err);
    }
  };

  const openHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await fetch("/api/reviews");
      if (!res.ok) throw new Error("Erro ao carregar histórico");
      const data = await res.json();
      setPastReviews(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingHistory(false);
    }
    setStep("history");
  };

  const startReview = async (goal: Goal) => {
    setSelectedGoal(goal);
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/reviews/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goalId: goal.id,
          weekSummary: "Semana em andamento",
        }),
      });

      if (!res.ok) throw new Error("Erro ao gerar perguntas");
      const data = await res.json();
      setQuestions(data.questions || []);
      setAnswers(data.questions.map((q: Question) => ({
        question: q.question,
        answer: "",
        rating: 3
      })));
      setStep("questions");
    } catch (err) {
      console.error(err);
      setError("Erro ao gerar perguntas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const submitAnswers = async () => {
    if (!selectedGoal) return;
    setLoading(true);
    setError(null);

    try {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const avgRating = answers.reduce((sum, a) => sum + a.rating, 0) / answers.length;

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart: weekStart.toISOString(),
          weekEnd: weekEnd.toISOString(),
          rating: Math.round(avgRating),
          wins: answers.find(a => a.question.toLowerCase().includes("conquista"))?.answer || "",
          challenges: answers.find(a => a.question.toLowerCase().includes("desafio"))?.answer || "",
          nextWeekPlan: answers.find(a => a.question.toLowerCase().includes("próxima"))?.answer || "",
        }),
      });

      if (!res.ok) throw new Error("Erro ao salvar revisão");
      const review = await res.json();
      setReviewId(review.id);

      const adjustRes = await fetch(`/api/reviews/${review.id}/adjust`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goalId: selectedGoal.id }),
      });

      if (!adjustRes.ok) throw new Error("Erro ao gerar ajustes");
      const adjustData = await adjustRes.json();
      setSuggestions(adjustData);
      setStep("adjustments");
    } catch (err) {
      console.error(err);
      setError("Erro ao processar respostas. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const updateAnswer = (index: number, field: "answer" | "rating", value: string | number) => {
    const updated = [...answers];
    updated[index] = { ...updated[index], [field]: value };
    setAnswers(updated);
  };

  const renderSelectGoal = () => (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          Revisão Semanal
        </h1>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          5 minutos que valem a semana toda
        </p>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-lg" style={{ background: "hsl(var(--destructive) / 0.1)", color: "hsl(var(--destructive))" }}>
          {error}
        </div>
      )}

      <div className="space-y-3">
        {goals.filter(g => g.status === "ACTIVE").map((goal) => (
          <button
            key={goal.id}
            onClick={() => startReview(goal)}
            disabled={loading}
            className="w-full text-left p-4 rounded-xl border transition-all hover:shadow-md disabled:opacity-50"
            style={{
              background: "hsl(var(--card))",
              borderColor: "hsl(var(--border))",
            }}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target size={16} style={{ color: "hsl(var(--accent))" }} />
                  <h3 className="font-semibold" style={{ color: "hsl(var(--foreground))" }}>
                    {goal.title}
                  </h3>
                </div>
                {goal.description && (
                  <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                    {goal.description}
                  </p>
                )}
                {goal.deadline && (
                  <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    <Calendar size={12} />
                    <span>Prazo: {new Date(goal.deadline).toLocaleDateString("pt-BR")}</span>
                  </div>
                )}
              </div>
              <ChevronRight size={20} style={{ color: "hsl(var(--muted-foreground))" }} />
            </div>
          </button>
        ))}
      </div>

      {goals.filter(g => g.status === "ACTIVE").length === 0 && (
        <div className="text-center py-12 rounded-xl border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <Target size={40} className="mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            Nenhuma meta ativa encontrada
          </p>
        </div>
      )}

      <button
        onClick={openHistory}
        disabled={loadingHistory}
        className="w-full mt-4 py-3 rounded-lg font-medium border flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          background: "hsl(var(--background))",
          borderColor: "hsl(var(--border))",
          color: "hsl(var(--muted-foreground))",
        }}
      >
        {loadingHistory ? <Loader2 size={16} className="animate-spin" /> : <Calendar size={16} />}
        Ver Histórico de Revisões
      </button>
    </div>
  );

  const renderQuestions = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          Reflexão da Semana
        </h2>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Meta: {selectedGoal?.title}
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((q, idx) => (
          <div key={idx} className="p-4 rounded-xl border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <div className="mb-3">
              <span className="text-xs font-medium px-2 py-1 rounded"
                style={{ background: "hsl(var(--accent) / 0.1)", color: "hsl(var(--accent))" }}>
                {q.category.replace("_", " ").toUpperCase()}
              </span>
            </div>
            <p className="font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>
              {q.question}
            </p>
            {q.hint && (
              <p className="text-xs mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
                💡 {q.hint}
              </p>
            )}
            <textarea
              value={answers[idx]?.answer || ""}
              onChange={(e) => updateAnswer(idx, "answer", e.target.value)}
              placeholder="Sua resposta..."
              className="w-full p-3 rounded-lg border resize-none"
              style={{
                background: "hsl(var(--background))",
                borderColor: "hsl(var(--border))",
                color: "hsl(var(--foreground))",
              }}
              rows={3}
            />
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
                Avaliação:
              </span>
              {[1, 2, 3, 4, 5].map((rating) => (
                <button
                  key={rating}
                  onClick={() => updateAnswer(idx, "rating", rating)}
                  className="w-8 h-8 rounded-full border transition-all"
                  style={{
                    background: answers[idx]?.rating >= rating ? "hsl(var(--accent))" : "transparent",
                    borderColor: "hsl(var(--border))",
                    color: answers[idx]?.rating >= rating ? "white" : "hsl(var(--muted-foreground))",
                  }}
                >
                  {rating}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {metrics && (
        <div className="mt-6 p-4 rounded-xl border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <h3 className="font-semibold mb-3" style={{ color: "hsl(var(--foreground))" }}>
            Métricas da Semana
          </h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold" style={{ color: "hsl(var(--accent))" }}>
                {metrics.habitsTotal > 0
                  ? Math.round((metrics.habitsCompleted / metrics.habitsTotal) * 100)
                  : 0}%
              </div>
              <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                Hábitos
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "hsl(var(--accent))" }}>
                {metrics.tasksCompleted}/{metrics.tasksTotal}
              </div>
              <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                Tarefas
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ color: "hsl(var(--accent))" }}>
                {metrics.currentStreak}
              </div>
              <div className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                Sequência
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        onClick={submitAnswers}
        disabled={loading || answers.some(a => !a.answer.trim())}
        className="mt-6 w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        style={{
          background: "hsl(var(--accent))",
          color: "white",
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Analisando...
          </>
        ) : (
          <>
            Gerar Ajustes
            <ChevronRight size={18} />
          </>
        )}
      </button>
    </div>
  );

  const renderAdjustments = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          Ajustes Sugeridos
        </h2>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Claude analisou suas respostas
        </p>
      </div>

      {suggestions && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <h3 className="font-semibold mb-2 flex items-center gap-2" style={{ color: "hsl(var(--foreground))" }}>
              <TrendingUp size={18} style={{ color: "hsl(var(--accent))" }} />
              Avaliação do Progresso
            </h3>
            <p style={{ color: "hsl(var(--muted-foreground))" }}>
              {suggestions.assessment}
            </p>
          </div>

          {suggestions.adjustments.length > 0 && (
            <div className="p-4 rounded-xl border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
              <h3 className="font-semibold mb-3" style={{ color: "hsl(var(--foreground))" }}>
                Ajustes Recomendados
              </h3>
              <div className="space-y-3">
                {suggestions.adjustments.map((adj, idx) => (
                  <div key={idx} className="p-3 rounded-lg" style={{ background: "hsl(var(--accent) / 0.05)" }}>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="mt-0.5" style={{ color: "hsl(var(--accent))" }} />
                      <div className="flex-1">
                        <p className="font-medium text-sm" style={{ color: "hsl(var(--foreground))" }}>
                          {adj.type.toUpperCase()}: {adj.target}
                        </p>
                        <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                          {adj.reason}
                        </p>
                        {adj.newContent && (
                          <p className="text-xs mt-2 p-2 rounded" style={{ background: "hsl(var(--background))" }}>
                            {adj.newContent}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="p-4 rounded-xl border" style={{ background: "hsl(var(--accent) / 0.1)", borderColor: "hsl(var(--accent))" }}>
            <h3 className="font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>
              Foco da Próxima Semana
            </h3>
            <p style={{ color: "hsl(var(--foreground))" }}>
              {suggestions.nextWeekFocus}
            </p>
          </div>

          <div className="p-4 rounded-xl text-center" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <p className="italic" style={{ color: "hsl(var(--muted-foreground))" }}>
              "{suggestions.motivationalMessage}"
            </p>
          </div>
        </div>
      )}

      <button
        onClick={() => setStep("report")}
        className="mt-6 w-full py-3 rounded-lg font-medium flex items-center justify-center gap-2"
        style={{
          background: "hsl(var(--accent))",
          color: "white",
        }}
      >
        Ver Relatório Completo
        <ChevronRight size={18} />
      </button>
    </div>
  );

  const renderReport = () => (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
          Relatório da Revisão
        </h2>
        <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
          Resumo completo da semana
        </p>
      </div>

      <div className="space-y-4">
        <div className="p-6 rounded-xl border text-center" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <CheckCircle2 size={48} className="mx-auto mb-3" style={{ color: "hsl(var(--accent))" }} />
          <h3 className="text-lg font-bold mb-2" style={{ color: "hsl(var(--foreground))" }}>
            Revisão Concluída!
          </h3>
          <p style={{ color: "hsl(var(--muted-foreground))" }}>
            Sua revisão semanal foi salva com sucesso
          </p>
        </div>

        {metrics && (
          <div className="p-4 rounded-xl border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <h3 className="font-semibold mb-3" style={{ color: "hsl(var(--foreground))" }}>
              Performance da Semana
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Hábitos cumpridos</span>
                <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>
                  {metrics.habitsCompleted}/{metrics.habitsTotal} ({metrics.habitsTotal > 0
                    ? Math.round((metrics.habitsCompleted / metrics.habitsTotal) * 100)
                    : 0}%)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Tarefas concluídas</span>
                <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>
                  {metrics.tasksCompleted}/{metrics.tasksTotal}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span style={{ color: "hsl(var(--muted-foreground))" }}>Sequência atual</span>
                <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>
                  {metrics.currentStreak} dias
                </span>
              </div>
            </div>
          </div>
        )}

        <button
          onClick={() => {
            setStep("select-goal");
            setSelectedGoal(null);
            setQuestions([]);
            setAnswers([]);
            setSuggestions(null);
          }}
          className="w-full py-3 rounded-lg font-medium border"
          style={{
            background: "hsl(var(--background))",
            borderColor: "hsl(var(--border))",
            color: "hsl(var(--foreground))",
          }}
        >
          Fazer Nova Revisão
        </button>
      </div>
    </div>
  );

  const renderHistory = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => setStep("select-goal")}
          className="p-2 rounded-lg border"
          style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
        >
          <ChevronRight size={16} style={{ color: "hsl(var(--muted-foreground))", transform: "rotate(180deg)" }} />
        </button>
        <div>
          <h2 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
            Histórico de Revisões
          </h2>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Suas revisões semanais anteriores
          </p>
        </div>
      </div>

      {pastReviews.length === 0 ? (
        <div className="text-center py-12 rounded-xl border" style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <Calendar size={40} className="mx-auto mb-3" style={{ color: "hsl(var(--muted-foreground))" }} />
          <p style={{ color: "hsl(var(--muted-foreground))" }}>Nenhuma revisão encontrada ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pastReviews.map((review) => {
            const weekStart = new Date(review.weekStart);
            const weekEnd = new Date(review.weekEnd);
            return (
              <div
                key={review.id}
                className="p-4 rounded-xl border"
                style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} style={{ color: "hsl(var(--accent))" }} />
                    <span className="font-medium" style={{ color: "hsl(var(--foreground))" }}>
                      {weekStart.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} –{" "}
                      {weekEnd.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                  </div>
                  {review.rating && (
                    <div className="flex items-center gap-1">
                      <TrendingUp size={14} style={{ color: "hsl(var(--accent))" }} />
                      <span className="text-sm font-medium" style={{ color: "hsl(var(--accent))" }}>
                        {review.rating}/10
                      </span>
                    </div>
                  )}
                </div>
                {review.wins && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Conquistas
                    </span>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: "hsl(var(--foreground))" }}>
                      {review.wins}
                    </p>
                  </div>
                )}
                {review.nextWeekPlan && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Plano da Próxima Semana
                    </span>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: "hsl(var(--foreground))" }}>
                      {review.nextWeekPlan}
                    </p>
                  </div>
                )}
                {review.challenges && (
                  <div className="mt-2">
                    <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: "hsl(var(--muted-foreground))" }}>
                      Desafios
                    </span>
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: "hsl(var(--foreground))" }}>
                      {review.challenges}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl mx-auto">
      {step === "select-goal" && renderSelectGoal()}
      {step === "questions" && renderQuestions()}
      {step === "adjustments" && renderAdjustments()}
      {step === "report" && renderReport()}
      {step === "history" && renderHistory()}
    </div>
  );
}
