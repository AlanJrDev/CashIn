"use client";

import { Home, PieChart, MessageSquare, User } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { icon: Home, label: "Início", path: "/dashboard" },
    { icon: PieChart, label: "Estatísticas", path: "/dashboard/stats" },
    { icon: MessageSquare, label: "Chat IA", path: "/dashboard/chat" },
    { icon: User, label: "Perfil", path: "/dashboard/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 z-50">
      <nav className="glass-card rounded-3xl p-2 flex justify-between items-center px-4">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          const Icon = item.icon;
          return (
            <Link 
              key={item.path} 
              href={item.path}
              className={`p-3 rounded-2xl flex flex-col items-center gap-1 transition-colors ${
                isActive ? "text-primary" : "text-text-muted hover:text-text-primary"
              }`}
            >
              <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
