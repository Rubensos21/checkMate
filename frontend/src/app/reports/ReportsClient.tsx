"use client";

import { useState } from "react";
import { FileDown, ChevronDown, Loader2 } from "lucide-react";

interface ReportsClientProps {
  token: string;
}

const EXPORT_OPTIONS = [
  { label: "Todo el rendimiento", value: "all" },
  { label: "Por alumno", value: "student" },
  { label: "Por materia", value: "course" },
  { label: "Por grupo", value: "group" },
];

export default function ReportsClient({ token }: ReportsClientProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handleDownload = async (by: string) => {
    setLoading(by);
    setOpen(false);
    try {
      const url = by === "all"
        ? `http://localhost:3001/api/export/excel`
        : `http://localhost:3001/api/export/excel?by=${by}`;

      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Error al generar el reporte");

      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      const date = new Date().toISOString().slice(0, 10);
      link.download = `rendimiento_${by}_${date}.xlsx`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      alert("No se pudo generar el reporte Excel.");
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        disabled={!!loading}
        className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-60"
      >
        {loading ? (
          <><Loader2 size={16} className="animate-spin" /> Generando...</>
        ) : (
          <><FileDown size={16} /> Exportar Excel <ChevronDown size={14} className={`transition-transform ${open ? "rotate-180" : ""}`} /></>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 glass-card border border-white/10 rounded-xl py-1 z-30 shadow-xl">
          {EXPORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleDownload(opt.value)}
              className="w-full text-left px-4 py-2.5 text-sm text-neutral-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}

      {/* Close on outside click */}
      {open && (
        <div className="fixed inset-0 z-20" onClick={() => setOpen(false)} />
      )}
    </div>
  );
}
