"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Target,
  BarChart3,
  RefreshCw,
  Sparkles,
  Settings,
  Flame,
} from "lucide-react";

const navItems = [
  { href: "/hoje", icon: LayoutDashboard, label: "Hoje" },
  { href: "/metas", icon: Target, label: "Metas" },
  { href: "/progresso", icon: BarChart3, label: "Progresso" },
  { href: "/revisao", icon: RefreshCw, label: "Revisão" },
  { href: "/chat", icon: Sparkles, label: "IA" },
];

interface SidebarProps {
  userName?: string | null;
}

export function Sidebar({ userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 fixed top-0 left-0 h-full border-r"
      style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b" style={{ borderColor: "hsl(var(--border))" }}>
        <Flame size={20} style={{ color: "hsl(var(--primary))" }} />
        <span className="text-lg font-bold tracking-tight" style={{ color: "hsl(var(--primary))" }}>
          TALKVEX
        </span>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors"
              style={{
                color: active ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                background: active ? "hsl(var(--primary) / 0.1)" : "transparent",
                borderLeft: active ? "2px solid hsl(var(--primary))" : "2px solid transparent",
              }}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t flex items-center justify-between"
        style={{ borderColor: "hsl(var(--border))" }}>
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold shrink-0"
            style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}>
            {userName?.[0]?.toUpperCase() ?? "U"}
          </div>
          <span className="text-sm font-medium truncate" style={{ color: "hsl(var(--foreground))" }}>
            {userName ?? "Usuário"}
          </span>
        </div>
        <Link href="/configuracoes">
          <Settings size={16} style={{ color: "hsl(var(--muted-foreground))" }} />
        </Link>
      </div>
    </aside>
  );
}
