"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface User {
  id: string;
  name: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  email: string;
  role: string;
  semester?: string;
  group?: string;
}

interface EditUserModalProps {
  user: User;
  token: string;
  onClose: () => void;
  onSuccess: (updated: unknown) => void;
}

export function EditUserModal({ user, token, onClose, onSuccess }: EditUserModalProps) {
  const [form, setForm] = useState({
    nombre: user.nombre || "",
    apellidoPaterno: user.apellidoPaterno || "",
    apellidoMaterno: user.apellidoMaterno || "",
    role: user.role,
    semester: user.semester || "",
    group: user.group || "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`http://localhost:3001/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error: string }).error || "Error al actualizar");
      onSuccess(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-1">Editar Usuario</h3>
        <p className="text-sm text-neutral-400 mb-6 truncate">{user.email}</p>
        {error && <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Apellido Paterno <span className="text-rose-400">*</span></label>
            <input required value={form.apellidoPaterno} onChange={e => setForm({...form, apellidoPaterno: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Apellido Materno</label>
            <input value={form.apellidoMaterno} onChange={e => setForm({...form, apellidoMaterno: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Nombre(s) <span className="text-rose-400">*</span></label>
            <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Nueva contraseña <span className="text-neutral-500">(vacío = no cambiar)</span></label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Rol</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value})}
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="STUDENT">Estudiante</option>
              <option value="TEACHER">Docente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
          {form.role === "STUDENT" && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Semestre</label>
                <input required value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Grupo</label>
                <input required value={form.group} onChange={e => setForm({...form, group: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
              </div>
              <p className="col-span-2 text-xs text-amber-400">⚠️ Si cambias el semestre, se generará una nueva matrícula y correo.</p>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
