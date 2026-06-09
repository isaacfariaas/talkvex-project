import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { signOut } from "@/lib/auth";

export default async function DashboardPage() {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Dashboard — Sistema de Planejamento de Metas
          </h1>
          <form
            action={async () => {
              "use server";
              await signOut({ redirectTo: "/login" });
            }}
          >
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Sair
            </button>
          </form>
        </div>

        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Bem-vindo(a), {session.user?.name || session.user?.email}!</h2>
          <p className="text-gray-600">
            Você está autenticado com sucesso. O painel de planejamento de metas será desenvolvido aqui.
          </p>
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-semibold text-blue-800">Minhas Metas</h3>
              <p className="text-blue-600 text-sm mt-1">Gerencie seus objetivos</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="font-semibold text-green-800">Plano Anual</h3>
              <p className="text-green-600 text-sm mt-1">Visão de longo prazo</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800">Revisão Semanal</h3>
              <p className="text-purple-600 text-sm mt-1">Reflita e ajuste</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
