"use client";

import { useState } from "react";
import { Users, UserPlus, Trash2, Pencil } from "lucide-react";
import { CreateUserModal } from "@/components/modals/CreateUserModal";
import { EditUserModal } from "@/components/modals/EditUserModal";

interface User {
  id: string;
  name: string;
  nombre?: string;
  apellidoPaterno?: string;
  apellidoMaterno?: string;
  email: string;
  role: string;
  matricula?: string;
  semester?: string;
  group?: string;
  createdAt: string;
}

interface UsersClientProps {
  initialUsers: User[];
  token: string;
}

export function UsersClient({ initialUsers, token }: UsersClientProps) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");

  const handleUserCreated = (newUser: unknown) => {
    setUsers(prev => [newUser as User, ...prev]);
    setShowCreateModal(false);
  };

  const handleUserUpdated = (updated: unknown) => {
    const u = updated as User;
    setUsers(prev => prev.map(x => x.id === u.id ? u : x));
    setEditTarget(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar a "${name}"? Esta acción no se puede deshacer.`)) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`http://localhost:3001/api/users/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error: string }).error || "Error al eliminar");
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const roleStyles: Record<string, string> = {
    ADMIN:   "bg-rose-500/10 text-rose-400 border-rose-500/20",
    TEACHER: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    STUDENT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const roleLabels: Record<string, string> = {
    ADMIN:   "Administrador",
    TEACHER: "Docente",
    STUDENT: "Estudiante",
  };

  const idLabel: Record<string, string> = {
    ADMIN:   "ID Admin",
    TEACHER: "ID Docente",
    STUDENT: "Matrícula",
  };

  return (
    <>
      {showCreateModal && (
        <CreateUserModal token={token} onClose={() => setShowCreateModal(false)} onSuccess={handleUserCreated} />
      )}
      {editTarget && (
        <EditUserModal user={editTarget} token={token} onClose={() => setEditTarget(null)} onSuccess={handleUserUpdated} />
      )}

      <div className="p-6 lg:p-10 w-full">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Gestión de Usuarios</h2>
            <p className="text-neutral-400">Administra a los docentes y alumnos de la institución.</p>
          </div>
          <button onClick={() => setShowCreateModal(true)}
            className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
            <UserPlus size={18} /> Nuevo Usuario
          </button>
        </header>

        {deleteError && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            ⚠️ {deleteError}
          </div>
        )}

        {/* Counters */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {(["ADMIN","TEACHER","STUDENT"] as const).map(role => (
            <div key={role} className="glass-card p-5 flex items-center gap-4">
              <div className={`p-2.5 rounded-xl ${role === "ADMIN" ? "bg-rose-500/10" : role === "TEACHER" ? "bg-indigo-500/10" : "bg-emerald-500/10"}`}>
                <Users size={18} className={role === "ADMIN" ? "text-rose-400" : role === "TEACHER" ? "text-indigo-400" : "text-emerald-400"} />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">{users.filter(u => u.role === role).length}</p>
                <p className="text-sm text-neutral-400">{roleLabels[role]}s</p>
              </div>
            </div>
          ))}
        </div>

        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-neutral-300">
              <thead className="bg-white/5 text-neutral-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Nombre completo</th>
                  <th className="px-6 py-4 font-medium">Correo institucional</th>
                  <th className="px-6 py-4 font-medium">ID / Matrícula</th>
                  <th className="px-6 py-4 font-medium">Rol</th>
                  <th className="px-6 py-4 font-medium">Sem. / Grupo</th>
                  <th className="px-6 py-4 font-medium">Registro</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {users.map(user => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{user.name}</p>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-neutral-300">{user.email}</td>
                    <td className="px-6 py-4">
                      {user.matricula ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          {user.matricula}
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                      <p className="text-xs text-neutral-600 mt-0.5">{idLabel[user.role]}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${roleStyles[user.role] || ""}`}>
                        {roleLabels[user.role] || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.semester && user.group
                        ? <span className="text-indigo-300">Sem. {user.semester} / Grp. {user.group}</span>
                        : <span className="text-neutral-600">—</span>}
                    </td>
                    <td className="px-6 py-4 text-neutral-400">{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => setEditTarget(user)} title="Editar"
                          className="p-2 rounded-lg text-neutral-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => handleDelete(user.id, user.name)} disabled={deletingId === user.id}
                          title="Eliminar"
                          className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors disabled:opacity-30">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={7} className="px-6 py-10 text-center text-neutral-500">No hay usuarios registrados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
