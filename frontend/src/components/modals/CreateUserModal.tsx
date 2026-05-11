"use client";

import { useState } from "react";
import { X, Eye, EyeOff } from "lucide-react";

interface CreateUserModalProps {
  onClose: () => void;
  onSuccess: (user: unknown) => void;
  token: string;
}

export function CreateUserModal({ onClose, onSuccess, token }: CreateUserModalProps) {
  const [form, setForm] = useState({
    nombre: "", apellidoPaterno: "", apellidoMaterno: "",
    password: "", role: "STUDENT", semester: "", group: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error: string }).error || "Error al crear usuario");
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
        <h3 className="text-xl font-bold text-white mb-1">Nuevo Usuario</h3>
        <p className="text-sm text-neutral-400 mb-6">El correo y la matrícula se generarán automáticamente.</p>
        {error && <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name fields */}
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Apellido Paterno <span className="text-rose-400">*</span></label>
              <input required value={form.apellidoPaterno} onChange={e => setForm({...form, apellidoPaterno: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Ej. González" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Apellido Materno</label>
              <input value={form.apellidoMaterno} onChange={e => setForm({...form, apellidoMaterno: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Ej. Ramírez" />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Nombre(s) <span className="text-rose-400">*</span></label>
              <input required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Ej. Ana Lucía" />
            </div>
          </div>

          {/* Auto-email preview */}
          {form.apellidoPaterno && (
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
              📧 Correo: <span className="font-mono">{form.apellidoPaterno.slice(0,2).toLowerCase()}[matrícula]@dcg.edu.mx</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Contraseña <span className="text-rose-400">*</span></label>
            <div className="relative">
              <input required type={showPass ? "text" : "password"} value={form.password}
                onChange={e => setForm({...form, password: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pr-10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="Mínimo 6 caracteres" />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Rol</label>
            <select value={form.role} onChange={e => setForm({...form, role: e.target.value, semester: "", group: ""})}
              className="w-full bg-neutral-800 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50">
              <option value="STUDENT">Estudiante</option>
              <option value="TEACHER">Docente</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>

          {form.role === "STUDENT" && (
            <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Semestre <span className="text-rose-400">*</span></label>
                <input required value={form.semester} onChange={e => setForm({...form, semester: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Ej. 6" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1">Grupo <span className="text-rose-400">*</span></label>
                <input required value={form.group} onChange={e => setForm({...form, group: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="Ej. 601" />
              </div>
              <p className="col-span-2 text-xs text-emerald-400">✓ El alumno se inscribirá automáticamente en materias de su semestre y grupo.</p>
            </div>
          )}

          {(form.role === "TEACHER" || form.role === "ADMIN") && (
            <div className="p-3 bg-indigo-500/5 border border-indigo-500/20 rounded-lg text-xs text-indigo-300">
              🪪 Se generará un ID institucional con prefijo <strong>{form.role === "TEACHER" ? "20" : "10"}XXXX</strong>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60">
              {loading ? "Creando..." : "Crear Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
