"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Download, CheckCircle, Clock, XCircle, FileImage, User } from "lucide-react";
import { exportToExcel } from "@/lib/exportUtils";
import { motion, AnimatePresence } from "framer-motion";

export function SubmissionTable({ data }: { data: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  const filteredData = data.filter((item) =>
    item.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assignment?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {

      case "APPROVED":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle size={12} />
          Calificado
        </span>

      case "PENDING":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Clock size={12} />
          Pendiente
        </span>

      case "REJECTED":
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <XCircle size={12} />
          Rechazado
        </span>

      default:
        return <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-neutral-500/10 text-neutral-400 border border-neutral-500/20">
          <Clock size={12} />
          Desconocido
        </span>
    }
  }

  return (
    <div className="glass-card overflow-hidden flex flex-col">
      <div className="p-4 border-b border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={18} />
          <input
            type="text"
            placeholder="Buscar por alumno o tarea..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-neutral-300 min-w-[800px]">
          <thead className="text-xs uppercase bg-white/5 text-neutral-400 sticky top-0 backdrop-blur-xl">
            <tr>
              <th className="px-6 py-4 font-semibold tracking-wider">Fecha</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Entrega</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Alumno</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Tarea (Curso)</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Auto-Calificación (AI)</th>
              <th className="px-6 py-4 font-semibold tracking-wider">Estado</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredData.map((item, index) => (
                <motion.tr
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ delay: index * 0.05 }}
                  key={item.id}
                  className="glass-table-row group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(item.createdAt), "dd MMM, HH:mm")}
                  </td>
                  <td className="px-6 py-4">
                    <div className="w-10 h-10 rounded overflow-hidden border border-white/10 relative group-hover:border-indigo-500/50 transition-colors">
                      <img src={item.imageUrl || "https://placehold.co/100"} alt="Evidencia" className="w-full h-full object-cover" />
                    </div>
                  </td>
                  <td className="px-6 py-4 font-medium text-white">{item.user?.name}</td>
                  <td className="px-6 py-4">{item.assignment?.title}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="w-8">{(item.confidence * 100).toFixed(0)}%</span>
                      <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${item.confidence > 0.8 ? 'bg-emerald-500' : item.confidence > 0.5 ? 'bg-amber-500' : 'bg-rose-500'}`}
                          style={{ width: `${item.confidence * 100}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>

            {filteredData.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-neutral-500">
                  No se encontraron entregas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
