"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  BarChart3,
  RefreshCw,
  Sparkles,
} from "lucide-react";

const navItems = [
  { href: "/hoje", icon: LayoutDashboard, label: "Hoje" },
  { href: "/metas", icon: Target, label: "Metas" },
  { href: "/progresso", icon: BarChart3, label: "Progresso" },
  { href: "/revisao", icon: RefreshCw, label: "Revisão" },
  { href: "/chat", icon: Sparkles, label: "IA" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t flex items-center justify-around px-2 z-50"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
    >
      {navItems.map(({ href, icon: Icon, label }) => {
        const active = pathname === href || pathname.startsWith(href + "/");
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-1 flex-1 py-2"
            style={{ color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))" }}
          >
            <Icon size={20} />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
