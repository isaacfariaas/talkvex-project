import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { User, Mail } from "lucide-react";

export default async function ConfiguracoesPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const user = session.user;

  return (
    <div className="px-4 md:px-8 py-6 md:py-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: "hsl(var(--foreground))" }}>
          Configurações
        </h1>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Gerencie suas informações de perfil
        </p>
      </div>

      {/* Profile Information */}
      <div
        className="rounded-xl border p-6 mb-6"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <h2 className="text-lg font-semibold mb-4" style={{ color: "hsl(var(--foreground))" }}>
          Informações do Perfil
        </h2>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <User size={20} className="mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }} />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                Nome
              </label>
              <p className="text-base" style={{ color: "hsl(var(--foreground))" }}>
                {user.name || "Não informado"}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail size={20} className="mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }} />
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                Email
              </label>
              <p className="text-base" style={{ color: "hsl(var(--foreground))" }}>
                {user.email}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for future features */}
      <div
        className="rounded-xl border p-6"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <h2 className="text-lg font-semibold mb-2" style={{ color: "hsl(var(--foreground))" }}>
          Preferências
        </h2>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Funcionalidades adicionais de configuração serão adicionadas em breve.
        </p>
      </div>
    </div>
  );
}
