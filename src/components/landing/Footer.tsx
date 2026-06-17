import Link from "next/link";
import { Target, Mail, MessageCircle, Share2 } from "lucide-react";

const footerLinks = {
  product: [
    { label: "Recursos", href: "#features" },
    { label: "Preços", href: "#pricing" },
    { label: "Casos de uso", href: "#use-cases" },
    { label: "Atualizações", href: "#updates" },
  ],
  company: [
    { label: "Sobre", href: "#about" },
    { label: "Blog", href: "#blog" },
    { label: "Carreiras", href: "#careers" },
    { label: "Contato", href: "#contact" },
  ],
  legal: [
    { label: "Privacidade", href: "#privacy" },
    { label: "Termos", href: "#terms" },
    { label: "Segurança", href: "#security" },
    { label: "Cookies", href: "#cookies" },
  ],
};

const socialLinks = [
  { icon: MessageCircle, href: "#twitter", label: "Twitter" },
  { icon: Share2, href: "#linkedin", label: "LinkedIn" },
  { icon: Share2, href: "#github", label: "GitHub" },
  { icon: Mail, href: "mailto:contato@talkvex.com", label: "Email" },
];

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Target className="text-blue-500" size={28} />
              <span className="text-xl font-bold text-white">Talkvex</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Transforme suas metas em realidade com inteligência artificial.
            </p>
            <div className="flex gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className="w-9 h-9 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produto</h3>
            <ul className="space-y-2">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-4">Empresa</h3>
            <ul className="space-y-2">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              {footerLinks.legal.map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-gray-800 text-center text-sm text-gray-400">
          <p>
            &copy; {new Date().getFullYear()} Talkvex. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
