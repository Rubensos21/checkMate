"use client";

import { cn } from "@/lib/utils";
import { LayoutDashboard, FileText, Settings, Bell, BarChart, LogOut, Paintbrush, Users } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useEffect, useState } from "react";

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const router = useRouter();
  // mounted flag ensures server and first client render are identical (avoids hydration mismatch)
  const [mounted, setMounted] = useState(false);
  const [role, setRole] = useState("STUDENT");

  useEffect(() => {
    setRole(Cookies.get("userRole") || "STUDENT");
    setMounted(true);
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("userRole");
    Cookies.remove("userName");
    Cookies.remove("userId");
    router.push("/login");
  };

  const getRoutes = (r: string) => {
    const base = [{ name: "Dashboard", href: "/", icon: LayoutDashboard }];
    if (r === "ADMIN") return [
      ...base,
      { name: "Usuarios", href: "/users", icon: Users },
      { name: "Cursos Generales", href: "/courses", icon: FileText },
      { name: "Seguimiento Global", href: "/reports", icon: BarChart },
      { name: "Personalización", href: "/customization", icon: Paintbrush },
    ];
    if (r === "TEACHER") return [
      ...base,
      { name: "Mis Cursos", href: "/courses", icon: FileText },
      { name: "Evaluar Entregas", href: "/grades", icon: Settings },
      { name: "Progreso Alumnos", href: "/reports", icon: BarChart },
    ];
    return [
      ...base,
      { name: "Mis Materias", href: "/courses", icon: FileText },
      { name: "Mis Calificaciones", href: "/grades", icon: Settings },
    ];
  };

  // Shared aside shell (always the same on server + first client render)
  const shell = (children: React.ReactNode) => (
    <aside className={cn("flex flex-col w-64 glass border-r border-white/10 h-screen sticky top-0 px-4 py-8 shrink-0", className)}>
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shrink-0">
          <span className="text-white font-bold text-lg">D</span>
        </div>
        <h2 className="text-sm font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400 leading-tight">
          Dynamic Cooperation Group
        </h2>
      </div>
      {children}
    </aside>
  );

  // Before mount: render skeleton nav to match server HTML exactly
  if (!mounted) {
    return shell(
      <nav className="flex-1 space-y-1">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
        ))}
      </nav>
    );
  }

  const routes = getRoutes(role);

  return shell(
    <>
      <nav className="flex-1 space-y-1">
        {routes.map((route) => {
          const isActive = pathname === route.href || (route.href !== "/" && pathname.startsWith(route.href));
          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-all text-sm",
                isActive
                  ? "bg-indigo-500/15 text-white border border-indigo-500/20"
                  : "text-neutral-400 hover:text-white hover:bg-white/5"
              )}
            >
              <route.icon size={18} className={isActive ? "text-indigo-400" : ""} />
              {route.name}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10 space-y-1">
        <Link
          href="/notifications"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all font-medium text-sm",
            pathname === "/notifications"
              ? "bg-white/10 text-white"
              : "text-neutral-400 hover:text-white hover:bg-white/5"
          )}
        >
          <Bell size={18} className={pathname === "/notifications" ? "text-indigo-400" : ""} />
          Notificaciones
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg transition-all font-medium text-sm text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut size={18} />
          Cerrar Sesión
        </button>
      </div>
    </>
  );
}
