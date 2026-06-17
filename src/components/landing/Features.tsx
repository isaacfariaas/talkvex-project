import { Target, Flame, Brain, CheckCircle, TrendingUp, Users } from "lucide-react";

const features = [
  {
    icon: Target,
    title: "Metas bem estruturadas",
    description:
      "Defina objetivos anuais e deixe a IA criar um plano detalhado com marcos trimestrais e tarefas semanais.",
    color: "blue",
  },
  {
    icon: Flame,
    title: "Foco no que importa",
    description:
      "Acompanhe suas tarefas semanais e mantenha o foco nos hábitos que realmente fazem a diferença.",
    color: "orange",
  },
  {
    icon: Brain,
    title: "IA que te entende",
    description:
      "Nossa inteligência artificial aprende seus padrões e sugere ajustes personalizados para maximizar seus resultados.",
    color: "purple",
  },
  {
    icon: TrendingUp,
    title: "Progresso visual",
    description:
      "Visualize seu crescimento com gráficos e métricas que mostram o quanto você já evoluiu.",
    color: "green",
  },
  {
    icon: CheckCircle,
    title: "Hábitos consistentes",
    description:
      "Construa rotinas sólidas com rastreamento diário e lembretes inteligentes.",
    color: "indigo",
  },
  {
    icon: Users,
    title: "Comunidade motivada",
    description:
      "Conecte-se com outras pessoas que compartilham objetivos semelhantes e celebrem conquistas juntos.",
    color: "pink",
  },
];

const colorClasses = {
  blue: "bg-blue-100 text-blue-600",
  orange: "bg-orange-100 text-orange-600",
  purple: "bg-purple-100 text-purple-600",
  green: "bg-green-100 text-green-600",
  indigo: "bg-indigo-100 text-indigo-600",
  pink: "bg-pink-100 text-pink-600",
};

export function Features() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Tudo que você precisa para alcançar suas metas
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Ferramentas poderosas e intuitivas que transformam planejamento em ação
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div
                className={`w-12 h-12 ${colorClasses[feature.color as keyof typeof colorClasses]} rounded-xl flex items-center justify-center mb-6`}
              >
                <Icon size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                {feature.title}
              </h3>
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
