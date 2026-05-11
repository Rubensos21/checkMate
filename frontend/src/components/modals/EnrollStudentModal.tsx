"use client";

import { useState } from "react";
import { X } from "lucide-react";

interface EnrollStudentModalProps {
  courseId: string;
  enrolledIds: string[];
  onClose: () => void;
  onSuccess: (enrollment: any) => void;
  token: string;
}

export function EnrollStudentModal({ courseId, enrolledIds, onClose, onSuccess, token }: EnrollStudentModalProps) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [fetched, setFetched] = useState(false);

  const fetchStudents = async () => {
    if (fetched) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/users?role=STUDENT", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
      setFetched(true);
    } catch {
      setError("Error al cargar estudiantes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch on mount
  if (!fetched && !loading) fetchStudents();

  const enroll = async (userId: string) => {
    setEnrolling(true);
    try {
      const res = await fetch(`http://localhost:3001/api/courses/${courseId}/enroll`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ userId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      onSuccess(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setEnrolling(false);
    }
  };

  const available = students.filter(s => !enrolledIds.includes(s.id));

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-2">Inscribir Alumno</h3>
        <p className="text-sm text-neutral-400 mb-6">Selecciona un estudiante para inscribirlo al curso.</p>
        {error && <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">{error}</p>}
        {loading ? (
          <p className="text-neutral-400 text-center py-4">Cargando estudiantes...</p>
        ) : available.length === 0 ? (
          <p className="text-neutral-400 text-center py-4">No hay estudiantes disponibles para inscribir.</p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {available.map(s => (
              <div key={s.id} className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg">
                <div>
                  <p className="text-white font-medium">{s.name}</p>
                  <p className="text-xs text-neutral-400">{s.email}</p>
                </div>
                <button onClick={() => enroll(s.id)} disabled={enrolling}
                  className="bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors disabled:opacity-60">
                  Inscribir
                </button>
              </div>
            ))}
          </div>
        )}
        <button onClick={onClose} className="mt-4 w-full px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium">
          Cerrar
        </button>
      </div>
    </div>
  );
}
