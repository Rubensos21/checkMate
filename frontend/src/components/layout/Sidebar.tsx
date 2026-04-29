"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Settings, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();

  const routes = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Evidencias", href: "/evidences", icon: FileText },
    { name: "Configuración", href: "/settings", icon: Settings },
  ];

  return (
    <aside className={cn("flex flex-col w-64 glass border-r border-white/10 h-screen sticky top-0 px-4 py-8 shrink-0", className)}>
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
          <span className="text-white font-bold text-lg">C</span>
        </div>
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
          CheckMate
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {routes.map((route) => {
          const isActive = pathname === route.href;
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition-colors",
                isActive 
                  ? "bg-white/10 text-white" 
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <route.icon size={20} className={isActive ? "text-indigo-400" : ""} />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-8 border-t border-white/10">
        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2 w-full rounded-lg transition-colors font-medium",
            pathname === "/notifications"
              ? "bg-white/10 text-white"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Bell size={20} className={pathname === "/notifications" ? "text-indigo-400" : ""} />
          Notificaciones
        </Link>
      </div>
    </aside>
  );
}
