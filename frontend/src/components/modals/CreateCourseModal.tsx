"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface Teacher { id: string; name: string; }

interface CreateCourseModalProps {
  onClose: () => void;
  onSuccess: (course: Record<string, unknown>) => void;
  token: string;
  teachers: Teacher[];
  userRole: string;
  userId: string;
}

export function CreateCourseModal({ onClose, onSuccess, token, teachers, userRole, userId }: CreateCourseModalProps) {
  const [form, setForm] = useState({ title: "", description: "", instructorId: userId, semester: "", group: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate instructor for admin role
    if (userRole === "ADMIN" && !form.instructorId) {
      setError("Debes seleccionar un docente para el curso.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error: string }).error || "Error al crear curso");
      onSuccess(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-6">Nuevo Curso</h3>
        {error && <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Título del Curso</label>
            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="Ej. Metodología de la Investigación" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Descripción</label>
            <textarea required value={form.description} onChange={e => setForm({...form, description: e.target.value})}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              placeholder="Breve descripción del contenido del curso..." />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Semestre</label>
              <input required value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Ej. 6" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Grupo</label>
              <input required value={form.group} onChange={e => setForm({...form, group: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Ej. 601" />
            </div>
            <p className="col-span-2 text-xs text-indigo-400">Los alumnos del mismo semestre y grupo se inscribirán automáticamente a este curso.</p>
          </div>

          {userRole === "ADMIN" && (
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">
                Docente Asignado <span className="text-rose-400">*</span>
              </label>
              <select
                value={form.instructorId}
                onChange={e => setForm({...form, instructorId: e.target.value})}
                className={`w-full bg-neutral-800 border rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 ${
                  !form.instructorId ? "border-rose-500/40" : "border-white/10"
                }`}>
                <option value="">— Seleccionar docente obligatorio —</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              {!form.instructorId && (
                <p className="text-xs text-rose-400 mt-1">Este campo es obligatorio para crear el curso.</p>
              )}
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
              {loading ? "Creando..." : "Crear Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
