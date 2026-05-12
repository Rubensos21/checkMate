"use client";

import { useState } from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Search, CheckCircle, Clock, X, Star, Loader2,
  File, ExternalLink, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Student Read-Only View Modal ───────────────────────────────────────────────────────────
function StudentViewModal({ submission, onClose }: { submission: Submission; onClose: () => void }) {
  const isGraded = submission.status === "APPROVED" && submission.grade != null;
  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-xl p-0 relative overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                submission.isLate
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>{submission.isLate ? "Entrega tardía" : "Entrega a tiempo"}</span>
              {isGraded ? (
                <span className="flex items-center gap-1.5 text-sm font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2.5 py-0.5 rounded-full">
                  <Star size={12} className="text-amber-400 fill-amber-400" />{submission.grade!.toFixed(1)} / 10
                </span>
              ) : (
                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 rounded-full">
                  <Clock size={11} /> Pendiente a revisión
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{submission.assignment?.title}</h3>
            <p className="text-sm text-neutral-500 mt-0.5">{submission.assignment?.course?.title}</p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors ml-4 shrink-0"><X size={20}/></button>
        </div>
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          <div>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-2">Tu entrega</p>
            <FileViewer url={submission.imageUrl || ""} />
          </div>
          {submission.extractedText?.trim() && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs text-neutral-500 mb-1 uppercase tracking-wider font-medium">Tu comentario</p>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{submission.extractedText}</p>
            </div>
          )}
          {isGraded ? (
            <div className="p-4 bg-indigo-500/5 border border-indigo-500/20 rounded-xl">
              <p className="text-xs text-indigo-400 font-medium uppercase tracking-wider mb-2">Retroalimentación del docente</p>
              {submission.feedback
                ? <p className="text-sm text-neutral-300 italic">&ldquo;{submission.feedback}&rdquo;</p>
                : <p className="text-sm text-neutral-600">Sin comentarios adicionales.</p>}
            </div>
          ) : (
            <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl text-center">
              <Clock size={20} className="text-amber-400 mx-auto mb-2"/>
              <p className="text-sm text-amber-400 font-medium">Tu entrega está esperando revisión</p>
              <p className="text-xs text-neutral-500 mt-1">El docente la calificará pronto.</p>
            </div>
          )}
        </div>
        <div className="p-6 border-t border-white/10">
          <button onClick={onClose} className="w-full px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium">Cerrar</button>
        </div>
      </div>
    </div>
  );
}

interface Submission {
  id: string;
  createdAt: string;
  status: string;
  grade?: number | null;
  feedback?: string | null;
  isLate?: boolean;
  confidence?: number;
  imageUrl?: string;
  extractedText?: string;
  user?: { name: string; matricula?: string };
  assignment?: { title: string; course?: { title: string } };
}

// ─── File Viewer ─────────────────────────────────────────────────────────────
function FileViewer({ url }: { url: string }) {
  if (!url || url.includes("placehold.co")) {
    return (
      <div className="flex items-center justify-center h-48 text-neutral-500 bg-white/5 rounded-xl border border-white/10">
        <p className="text-sm">Sin archivo adjunto</p>
      </div>
    );
  }

  const ext = url.split("?")[0].split(".").pop()?.toLowerCase() || "";

  if (["jpg", "jpeg", "png", "gif", "webp"].includes(ext)) {
    return (
      <a href={url} target="_blank" rel="noopener noreferrer">
        <img src={url} alt="Entrega" className="w-full max-h-72 object-contain rounded-xl border border-white/10 hover:opacity-90 transition-opacity" />
      </a>
    );
  }

  if (ext === "pdf") {
    return (
      <iframe src={url} title="PDF" className="w-full h-72 rounded-xl border border-white/10" />
    );
  }

  // For Word, Excel, PPT, ZIP, etc. — show download link
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
      className="flex items-center gap-3 p-4 bg-white/5 border border-indigo-500/30 hover:bg-indigo-500/10 rounded-xl transition-all group">
      <div className="p-3 bg-indigo-500/10 rounded-lg">
        <File size={24} className="text-indigo-400" />
      </div>
      <div>
        <p className="text-white font-medium text-sm group-hover:text-indigo-300 transition-colors">
          Ver / Descargar archivo
        </p>
        <p className="text-xs text-neutral-500 truncate max-w-xs">{url.split("/").pop()}</p>
      </div>
      <ExternalLink size={14} className="text-neutral-500 ml-auto" />
    </a>
  );
}

// ─── Grading Modal ────────────────────────────────────────────────────────────
function GradeModal({
  submission, token, onClose, onGraded
}: {
  submission: Submission; token: string;
  onClose: () => void; onGraded: (updated: Submission) => void;
}) {
  const [grade, setGrade] = useState<string>(submission.grade?.toString() || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const alreadyGraded = submission.status === "APPROVED";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const g = parseFloat(grade);
    if (isNaN(g) || g < 0 || g > 10) { setError("La calificación debe ser entre 0 y 10"); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`http://localhost:3001/api/submissions/${submission.id}/grade`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ grade: g, feedback }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error: string }).error || "Error al calificar");
      onGraded(data as Submission);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl p-0 relative overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                submission.isLate
                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              }`}>
                {submission.isLate ? "Entrega tardía" : "Entrega a tiempo"}
              </span>
              {alreadyGraded && (
                <span className="text-xs px-2.5 py-0.5 rounded-full font-medium border bg-indigo-500/10 text-indigo-400 border-indigo-500/20">
                  Calificada: {submission.grade?.toFixed(1)}/10
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-white">{submission.assignment?.title}</h3>
            <div className="flex items-center gap-2 mt-1 text-sm text-neutral-400">
              <User size={13}/> {submission.user?.name}
              {submission.user?.matricula && <span className="text-amber-400 font-mono text-xs">· {submission.user.matricula}</span>}
              <span className="text-neutral-600">·</span>
              <span>{submission.assignment?.course?.title}</span>
            </div>
            <p className="text-xs text-neutral-600 mt-0.5">
              Entregado el {format(new Date(submission.createdAt), "PPP 'a las' HH:mm", { locale: es })}
            </p>
          </div>
          <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors ml-4 shrink-0">
            <X size={20}/>
          </button>
        </div>

        {/* Body: file viewer + comment */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">
          {/* File viewer */}
          <div>
            <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-2">Trabajo entregado</p>
            <FileViewer url={submission.imageUrl || ""} />
          </div>

          {/* Student comment */}
          {submission.extractedText && submission.extractedText.trim() && (
            <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
              <p className="text-xs text-neutral-500 font-medium uppercase tracking-wider mb-2">Comentario del alumno</p>
              <p className="text-sm text-neutral-300 whitespace-pre-wrap">{submission.extractedText}</p>
            </div>
          )}

          {/* Grade form */}
          {error && <p className="text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">{error}</p>}

          <form id="grade-form" onSubmit={handleSubmit} className="space-y-4 pt-2 border-t border-white/10">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Calificación <span className="text-neutral-500">(0.0 – 10.0)</span>
              </label>
              <input
                type="number" min="0" max="10" step="0.1" required
                value={grade} onChange={e => setGrade(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-3xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="8.5"
              />
              {/* Quick pick */}
              <div className="flex gap-1 mt-2 flex-wrap">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
                  <button key={n} type="button" onClick={() => setGrade(n.toString())}
                    className={`flex-1 min-w-[28px] text-xs font-semibold py-1 rounded transition-colors ${
                      parseFloat(grade) === n
                        ? "bg-indigo-500 text-white"
                        : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                    }`}>{n}</button>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Retroalimentación (opcional)</label>
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
                placeholder="Comentarios para el alumno..." />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10 flex gap-3">
          <button type="button" onClick={onClose}
            className="flex-1 px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium">
            Cancelar
          </button>
          <button type="submit" form="grade-form" disabled={loading}
            className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={15} className="animate-spin"/>Guardando...</> : <><Star size={15}/>{alreadyGraded ? "Actualizar calificación" : "Calificar"}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Table ───────────────────────────────────────────────────────────────
export function SubmissionTable({ data, token, role = "TEACHER" }: { data: Submission[]; token?: string; role?: string }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>(data);
  const [selected, setSelected] = useState<Submission | null>(null);

  const filtered = submissions.filter(item =>
    item.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assignment?.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.assignment?.course?.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGraded = (updated: Submission) => {
    setSubmissions(prev => prev.map(s => s.id === updated.id ? { ...s, ...updated } : s));
    setSelected(prev => prev?.id === updated.id ? { ...prev, ...updated } : prev);
  };

  return (
    <>
      {selected && role !== "STUDENT" && token && (
        <GradeModal submission={selected} token={token}
          onClose={() => setSelected(null)} onGraded={handleGraded} />
      )}
      {selected && role === "STUDENT" && (
        <StudentViewModal submission={selected} onClose={() => setSelected(null)} />
      )}

      <div className="glass-card overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={16}/>
            <input type="text" placeholder="Buscar por alumno, tarea o materia..."
              value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"/>
          </div>
          <div className="flex items-center gap-3 text-xs text-neutral-500 ml-auto">
            <span className="flex items-center gap-1"><Clock size={11} className="text-amber-400"/>{submissions.filter(s => s.status === "PENDING").length} pendientes</span>
            <span className="flex items-center gap-1"><CheckCircle size={11} className="text-emerald-400"/>{submissions.filter(s => s.status === "APPROVED").length} calificadas</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300 min-w-[700px]">
            <thead className="text-xs uppercase bg-white/5 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Fecha entrega</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Alumno</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Actividad · Materia</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Timing</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Estado · Nota</th>
                <th className="px-6 py-4 font-semibold tracking-wider"></th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {filtered.map((item, index) => (
                  <motion.tr key={item.id}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }} transition={{ delay: index * 0.04 }}
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => setSelected(item)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-neutral-400 text-xs">
                      {format(new Date(item.createdAt), "dd MMM, HH:mm", { locale: es })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-medium text-white">{item.user?.name}</p>
                      {item.user?.matricula && (
                        <p className="text-xs text-amber-400 font-mono">{item.user.matricula}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-white">{item.assignment?.title}</p>
                      <p className="text-xs text-neutral-500">{item.assignment?.course?.title}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
                        item.isLate
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      }`}>
                        {item.isLate ? "Tardía" : "A tiempo"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {item.status === "APPROVED" && item.grade != null ? (
                        <span className="flex items-center gap-1.5 text-indigo-300 font-bold">
                          <Star size={13} className="text-amber-400 fill-amber-400"/>
                          {item.grade.toFixed(1)} / 10
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          <Clock size={11}/> Pendiente a revisión
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={e => { e.stopPropagation(); setSelected(item); }}
                        className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 transition-colors whitespace-nowrap">
                        {role === "STUDENT" ? "Ver detalle" : item.status === "APPROVED" ? "Ver / Editar" : "Revisar"}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-14 text-center text-neutral-500">
                    No se encontraron entregas.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
