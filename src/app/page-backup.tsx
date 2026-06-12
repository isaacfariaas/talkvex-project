import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { Target, Flame, Brain, ArrowRight, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await auth();
  if (session) redirect("/hoje");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Target className="text-blue-600" size={28} />
              <span className="text-xl font-bold text-gray-900">Talkvex</span>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
              >
                Entrar
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Começar grátis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Transforme suas{" "}
            <span className="text-blue-600">metas</span> em{" "}
            <span className="text-blue-600">realidade</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Planeje objetivos anuais, divida em marcos trimestrais e transforme em hábitos diários.
            Tudo com a inteligência artificial da Talkvex.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
            >
              Começar agora
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-gray-400 transition-colors"
            >
              Já tenho conta
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-6">
              <Target className="text-blue-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Metas bem estruturadas
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Defina objetivos anuais e deixe a IA criar um plano detalhado com marcos trimestrais
              e tarefas semanais.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-6">
              <Flame className="text-orange-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Foco no que importa
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Acompanhe suas tarefas semanais e mantenha o foco nos hábitos que realmente fazem
              a diferença.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-6">
              <Brain className="text-purple-600" size={24} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Inteligência artificial
            </h3>
            <p className="text-gray-600 leading-relaxed">
              A IA da Talkvex analisa seus objetivos e sugere planos realistas e adaptados ao seu
              ritmo.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-blue-600 rounded-3xl p-12 text-white">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Por que escolher a Talkvex?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Planejamento automático</h4>
                  <p className="text-blue-100">
                    IA cria rotinas personalizadas baseadas nas suas metas
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Acompanhamento diário</h4>
                  <p className="text-blue-100">
                    Visualize progresso e complete hábitos todos os dias
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Marcos trimestrais</h4>
                  <p className="text-blue-100">
                    Divida grandes objetivos em etapas alcançáveis
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle size={24} className="shrink-0 mt-1" />
                <div>
                  <h4 className="font-semibold mb-1">Interface intuitiva</h4>
                  <p className="text-blue-100">
                    Design limpo e fácil de usar, sem distrações
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Pronto para começar?
        </h2>
        <p className="text-xl text-gray-600 mb-8">
          Crie sua conta gratuitamente e transforme suas metas em conquistas.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center justify-center gap-2 px-8 py-4 text-lg font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          Criar conta grátis
          <ArrowRight size={20} />
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 mt-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <Target className="text-blue-600" size={24} />
              <span className="font-bold text-gray-900">Talkvex</span>
            </div>
            <p className="text-sm text-gray-600">
              © 2026 Talkvex. Transformando metas em realidade.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
