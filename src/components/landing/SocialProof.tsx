import { Star, Users, Target, TrendingUp } from "lucide-react";

const stats = [
  {
    icon: Users,
    value: "10k+",
    label: "Usuários ativos",
  },
  {
    icon: Target,
    value: "50k+",
    label: "Metas alcançadas",
  },
  {
    icon: TrendingUp,
    value: "85%",
    label: "Taxa de sucesso",
  },
  {
    icon: Star,
    value: "4.9/5",
    label: "Avaliação média",
  },
];

const testimonials = [
  {
    name: "Ana Silva",
    role: "Empreendedora",
    content:
      "A Talkvex me ajudou a organizar meus objetivos de negócio e transformá-los em hábitos diários. Em 3 meses já vi resultados incríveis!",
    avatar: "AS",
  },
  {
    name: "Carlos Mendes",
    role: "Desenvolvedor",
    content:
      "Finalmente consegui manter consistência nos meus estudos. A IA sugere ajustes que realmente fazem sentido para minha rotina.",
    avatar: "CM",
  },
  {
    name: "Mariana Costa",
    role: "Designer",
    content:
      "O sistema de marcos trimestrais me deu clareza sobre onde focar. Nunca me senti tão no controle das minhas metas profissionais.",
    avatar: "MC",
  },
];

export function SocialProof() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-3">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            );
          })}
        </div>

        {/* Testimonials */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            O que nossos usuários dizem
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Milhares de pessoas já transformaram suas vidas com a Talkvex
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-gray-700 mb-6 leading-relaxed">
                {testimonial.content}
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">
                    {testimonial.avatar}
                  </span>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-600">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
