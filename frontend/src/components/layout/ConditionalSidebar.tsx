"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";

// Pages that should NOT show the Sidebar
const PUBLIC_PATHS = ["/login", "/register"];

export function ConditionalSidebar() {
  const pathname = usePathname();
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) return null;
  return <Sidebar className="hidden lg:flex" />;
}
