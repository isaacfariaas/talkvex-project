import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Talkvex — Da meta à rotina, com IA.",
  description: "Transforme qualquer meta em um plano de ação completo — com tarefas diárias, hábitos e revisões semanais guiadas por IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Force rebuild
  return (
    <html lang="pt-BR" className="h-full">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
