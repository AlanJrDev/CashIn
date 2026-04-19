"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/lib/AppContext";
import { Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user && !pathname.startsWith("/login")) {
      router.push("/");
    }
  }, [user, loading, router, pathname]);

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-[#F8FAFC] flex justify-center md:justify-start">
      {/* Desktop Sidebar (visível apenas md+) */}
      <div className="hidden md:flex flex-col fixed top-0 left-0 bottom-0 w-24 lg:w-64 bg-[#1E293B] border-r border-[#0F172A] p-4 z-50">
        <div className="mb-8 pl-2">
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-[#10B981] hidden lg:block">CashIn</h1>
          <h1 className="text-2xl font-bold font-[family-name:var(--font-outfit)] text-[#10B981] lg:hidden">CI</h1>
        </div>
        <DesktopNav />
      </div>

      {/* Container principal */}
      <div className="w-full flex-1 relative min-h-screen pb-24 md:pb-0 md:pl-24 lg:pl-64">
        
        {/* Conteúdo dinâmico */}
        <div className="md:p-8 w-full">
          {children}
        </div>

        {/* Mobile BottomNav (escondido md+) */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-50">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}

// Subcomponente simples para Desktop Navbar
import { Home, PieChart, MessageSquare, User } from "lucide-react";
import Link from "next/link";

function DesktopNav() {
  const pathname = usePathname();
  const navItems = [
    { icon: Home, label: "Início", path: "/dashboard" },
    { icon: PieChart, label: "Estatísticas", path: "/dashboard/stats" },
    { icon: MessageSquare, label: "Chat IA", path: "/dashboard/chat" },
    { icon: User, label: "Perfil", path: "/dashboard/profile" },
  ];

  return (
    <nav className="flex flex-col gap-4">
      {navItems.map((item) => {
        const isActive = pathname === item.path;
        const Icon = item.icon;
        return (
          <Link
            key={item.path}
            href={item.path}
            className={`flex items-center gap-4 p-3 rounded-xl transition-colors ${
              isActive ? "bg-primary/10 text-primary" : "text-text-muted hover:text-white hover:bg-surface-high"
            }`}
          >
            <Icon size={24} />
            <span className="font-medium hidden lg:block">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
