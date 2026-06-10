import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles, Target } from "lucide-react";

export default async function MetaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;

  const goal = await prisma.goal.findUnique({ where: { id } });
  if (!goal || goal.userId !== session.user.id) notFound();

  const hasPlan = await prisma.annualPlan.findFirst({
    where: { goalId: id },
    select: { id: true },
  });

  if (hasPlan) redirect(`/metas/${id}/plano`);

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-2xl">
      <Link
        href="/metas"
        className="inline-flex items-center gap-1 text-sm mb-6 transition-opacity hover:opacity-70"
        style={{ color: "hsl(var(--muted-foreground))" }}
      >
        <ArrowLeft size={14} />
        Metas
      </Link>

      <div
        className="rounded-xl border p-6 mb-6"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <div className="flex items-start gap-3">
          <Target size={20} style={{ color: "hsl(var(--primary))", marginTop: 2 }} />
          <div>
            <h1 className="text-xl font-bold" style={{ color: "hsl(var(--foreground))" }}>
              {goal.title}
            </h1>
            {goal.description && (
              <p className="text-sm mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                {goal.description}
              </p>
            )}
          </div>
        </div>
      </div>

      <div
        className="rounded-xl border p-8 text-center"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <Sparkles size={40} className="mx-auto mb-4" style={{ color: "hsl(var(--accent))" }} />
        <h2 className="text-lg font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>
          Seu plano está pronto para ser gerado
        </h2>
        <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
          A IA vai transformar sua meta em um plano completo com tarefas semanais e hábitos diários.
        </p>
        <Link
          href="/nova-meta"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
          style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
        >
          <Sparkles size={16} />
          Gerar meu plano →
        </Link>
      </div>
    </div>
  );
}
