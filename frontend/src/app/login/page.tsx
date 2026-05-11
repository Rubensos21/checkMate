"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Lock, Mail, ArrowRight } from "lucide-react";
import Cookies from "js-cookie";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://localhost:3001/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        throw new Error("Credenciales inválidas");
      }

      const data = await res.json();
      Cookies.set("token", data.token, { expires: 1 });
      Cookies.set("userRole", data.user.role, { expires: 1 });
      Cookies.set("userName", data.user.name, { expires: 1 });
      Cookies.set("userId", data.user.id, { expires: 1 });

      router.push("/");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Credenciales inválidas");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 p-4 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-[128px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card w-full max-w-md p-8 relative z-10"
      >
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-xl bg-indigo-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-2xl">C</span>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Dynamic Cooperation Group</h1>
          <p className="text-neutral-400 text-sm">Ingresa tus credenciales para acceder a la plataforma</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Correo Electrónico</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="tu@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1.5">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 mt-6"
          >
            Iniciar Sesión
            <ArrowRight size={18} />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-white/10 text-xs text-neutral-500 text-center">
          <p className="mb-3 font-medium text-neutral-400">Credenciales de prueba</p>
          <div className="space-y-2 text-left">
            <div className="flex justify-between gap-4 p-2.5 bg-white/5 rounded-lg">
              <span className="text-rose-400 font-medium">Admin</span>
              <span className="font-mono">ad107137@dcg.edu.mx</span>
            </div>
            <div className="flex justify-between gap-4 p-2.5 bg-white/5 rounded-lg">
              <span className="text-indigo-400 font-medium">Docente</span>
              <span className="font-mono">cr205973@dcg.edu.mx</span>
            </div>
            <div className="flex justify-between gap-4 p-2.5 bg-white/5 rounded-lg">
              <span className="text-emerald-400 font-medium">Alumno</span>
              <span className="font-mono">so496825@dcg.edu.mx</span>
            </div>
            <p className="text-center text-neutral-600 mt-1">Contraseña: <span className="font-mono text-neutral-400">password123</span></p>
            <p className="text-center text-neutral-600">También puedes usar la <span className="text-amber-400">matrícula</span> como usuario</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
