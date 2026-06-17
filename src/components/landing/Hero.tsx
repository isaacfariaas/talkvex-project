import Link from "next/link";
import { Target, ArrowRight } from "lucide-react";

export function Hero() {
  return (
    <>
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
    </>
  );
}
