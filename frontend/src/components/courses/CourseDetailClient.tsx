"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowLeft, BookOpen, Users, Plus, Clock,
  Trash2, Star, X, Loader2, FileDown
} from "lucide-react";
import { CreateAssignmentModal } from "@/components/modals/CreateAssignmentModal";
import { SubmitAssignmentModal } from "@/components/modals/SubmitAssignmentModal";

interface CourseDetailClientProps {
  course: any;
  initialAssignments: any[];
  token: string;
  userRole: string;
}

// ─── Grade Modal (Teacher) ────────────────────────────────────────────────────
function GradeModal({ submission, onClose, onGraded, token }: {
  submission: any; onClose: () => void;
  onGraded: (updated: any) => void; token: string;
}) {
  const [grade, setGrade] = useState<string>(submission.grade?.toString() || "");
  const [feedback, setFeedback] = useState(submission.feedback || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      if (!res.ok) throw new Error(data.error || "Error al calificar");
      onGraded(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-md p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white"><X size={20}/></button>
        <h3 className="text-xl font-bold text-white mb-1">Calificar Entrega</h3>
        <p className="text-sm text-neutral-400 mb-1">{submission.user?.name}</p>
        <p className="text-xs text-neutral-600 mb-5">{submission.assignment?.title}</p>

        {submission.imageUrl && !/placehold/.test(submission.imageUrl) && (
          <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg flex items-center gap-3">
            <FileDown size={16} className="text-indigo-400 shrink-0"/>
            <a href={submission.imageUrl} target="_blank" rel="noopener noreferrer"
              className="text-sm text-indigo-400 hover:text-indigo-300 truncate transition-colors">
              Ver archivo entregado
            </a>
          </div>
        )}
        {submission.extractedText && submission.extractedText !== "Entrega sin comentario" && (
          <div className="mb-4 p-3 bg-white/5 border border-white/10 rounded-lg">
            <p className="text-xs text-neutral-500 mb-1">Comentario del alumno:</p>
            <p className="text-sm text-neutral-300">{submission.extractedText}</p>
          </div>
        )}

        {error && <p className="mb-3 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-3 py-2">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Calificación <span className="text-neutral-500">(0.0 – 10.0)</span> <span className="text-rose-400">*</span>
            </label>
            <div className="relative">
              <input
                type="number" min="0" max="10" step="0.1" required
                value={grade} onChange={e => setGrade(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white text-2xl font-bold text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                placeholder="8.5"
              />
            </div>
            {/* Visual scale */}
            <div className="flex justify-between mt-2 px-1">
              {[0,1,2,3,4,5,6,7,8,9,10].map(n => (
                <button key={n} type="button"
                  onClick={() => setGrade(n.toString())}
                  className={`text-xs font-medium px-1.5 py-0.5 rounded transition-colors ${
                    parseFloat(grade) === n
                      ? "bg-indigo-500 text-white"
                      : "text-neutral-500 hover:text-white"
                  }`}>{n}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Retroalimentación (opcional)</label>
            <textarea value={feedback} onChange={e => setFeedback(e.target.value)} rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              placeholder="Comentarios para el alumno..." />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium">
              Cancelar
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <><Loader2 size={15} className="animate-spin"/>Guardando...</> : <><Star size={15}/>Calificar</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ─── Submission Status Badge (Student) ───────────────────────────────────────
function SubmissionBadge({ submission, token }: { submission: any; token: string }) {
  const [sub, setSub] = useState(submission);

  // Poll for grade changes every 8 seconds if still pending
  useEffect(() => {
    if (sub.status === "APPROVED") return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:3001/api/submissions/${sub.id}/status`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const updated = await res.json();
          if (updated.grade !== sub.grade || updated.status !== sub.status) {
            setSub((prev: any) => ({ ...prev, ...updated }));
          }
        }
      } catch { /* silent */ }
    }, 8000);
    return () => clearInterval(interval);
  }, [sub.id, sub.status, sub.grade, token]);

  const isGraded = sub.status === "APPROVED" && sub.grade != null;

  return (
    <div className="flex flex-col items-end gap-1">
      {/* Delivery timing badge */}
      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${
        sub.isLate
          ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
          : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      }`}>
        {sub.isLate ? "Entrega tardía" : "Entrega a tiempo"}
      </span>
      {/* Status / Grade badge */}
      {isGraded ? (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-bold border bg-indigo-500/10 text-indigo-300 border-indigo-500/20">
          <Star size={13} className="text-amber-400 fill-amber-400"/>
          {sub.grade.toFixed(1)} / 10
        </span>
      ) : (
        <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse">
          <Clock size={11}/>
          Pendiente a revisión
        </span>
      )}
      {sub.feedback && isGraded && (
        <p className="text-xs text-neutral-500 max-w-[220px] text-right italic mt-0.5">"{sub.feedback}"</p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function CourseDetailClient({ course, initialAssignments, token, userRole }: CourseDetailClientProps) {
  const [assignments, setAssignments] = useState<any[]>(initialAssignments);
  const [showCreateAssignment, setShowCreateAssignment] = useState(false);
  const [submitTarget, setSubmitTarget] = useState<any | null>(null);
  const [gradeTarget, setGradeTarget] = useState<any | null>(null);

  const handleAssignmentCreated = (a: any) => {
    setAssignments(prev => [a, ...prev]);
    setShowCreateAssignment(false);
  };

  const handleSubmitted = (submission: any) => {
    setAssignments(prev =>
      prev.map(a => a.id === submission.assignmentId ? { ...a, mySubmission: submission } : a)
    );
    setSubmitTarget(null);
  };

  const handleGraded = (updated: any) => {
    setAssignments(prev =>
      prev.map(a => {
        const submissions = a.submissions?.map((s: any) =>
          s.id === updated.id ? { ...s, ...updated } : s
        );
        return { ...a, submissions };
      })
    );
    setGradeTarget(null);
  };

  const deleteAssignment = async (id: string) => {
    if (!confirm("¿Eliminar esta actividad? También se eliminarán todas sus entregas.")) return;
    await fetch(`http://localhost:3001/api/assignments/${id}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  const canManage = userRole === "ADMIN" || userRole === "TEACHER";

  return (
    <>
      {showCreateAssignment && (
        <CreateAssignmentModal courseId={course.id} token={token}
          onClose={() => setShowCreateAssignment(false)} onSuccess={handleAssignmentCreated} />
      )}
      {submitTarget && (
        <SubmitAssignmentModal assignmentId={submitTarget.id} assignmentTitle={submitTarget.title}
          token={token} onClose={() => setSubmitTarget(null)} onSuccess={handleSubmitted} />
      )}
      {gradeTarget && (
        <GradeModal submission={gradeTarget} token={token}
          onClose={() => setGradeTarget(null)} onGraded={handleGraded} />
      )}

      <div className="p-6 lg:p-10 w-full">
        <Link href="/courses" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-6 text-sm font-medium">
          <ArrowLeft size={16}/> Volver a Cursos
        </Link>

        <div className="glass-card p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">{course.title}</h2>
              <p className="text-neutral-400 mb-3">{course.description}</p>
              <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
                {course.instructor && <span className="flex items-center gap-1.5"><BookOpen size={14}/>{course.instructor.name}</span>}
                <span className="flex items-center gap-1.5"><Users size={14}/>{course.enrollments?.length ?? 0} inscritos</span>
                {course.semester && <span className="text-indigo-400 text-xs font-medium">Sem. {course.semester} / Grp. {course.group}</span>}
              </div>
            </div>
            {canManage && (
              <button onClick={() => setShowCreateAssignment(true)}
                className="shrink-0 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
                <Plus size={18}/> Nueva Actividad
              </button>
            )}
          </div>
        </div>

        {canManage && course.enrollments?.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4">Alumnos Inscritos</h3>
            <div className="flex flex-wrap gap-2">
              {course.enrollments.map((e: any) => (
                <span key={e.user?.id} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-neutral-300">
                  {e.user?.name}
                </span>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-xl font-semibold text-white mb-4">Actividades del Curso</h3>
          {assignments.length === 0 ? (
            <div className="glass-card p-10 text-center">
              <BookOpen size={40} className="text-neutral-600 mx-auto mb-3"/>
              <p className="text-neutral-400">No hay actividades publicadas aún.</p>
              {canManage && <p className="text-sm text-neutral-500 mt-1">Haz clic en "Nueva Actividad" para crear una.</p>}
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map((assignment: any) => {
                const isPast = new Date(assignment.dueDate) < new Date();
                const mySubmission = assignment.mySubmission;
                // For teacher: count pending vs graded
                const subs: any[] = assignment.submissions || [];
                const pendingCount = subs.filter((s: any) => s.status === "PENDING").length;
                const gradedCount = subs.filter((s: any) => s.status === "APPROVED").length;

                return (
                  <div key={assignment.id} className="glass-card p-5 flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h4 className="text-white font-semibold">{assignment.title}</h4>
                        {isPast && (
                          <span className="text-xs bg-neutral-500/10 text-neutral-400 border border-neutral-500/20 px-2 py-0.5 rounded-full">
                            Plazo cerrado
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-neutral-400 mb-2">{assignment.description}</p>
                      <p className="text-xs text-neutral-500 flex items-center gap-1">
                        <Clock size={12}/> Entrega: {format(new Date(assignment.dueDate), "PPP 'a las' HH:mm", { locale: es })}
                      </p>
                      {canManage && (
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-xs text-amber-400">{pendingCount} pendientes de revisión</span>
                          <span className="text-xs text-emerald-400">{gradedCount} calificadas</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {/* STUDENT view */}
                      {userRole === "STUDENT" && (
                        mySubmission
                          ? <SubmissionBadge submission={mySubmission} token={token} />
                          : (
                            <button onClick={() => setSubmitTarget(assignment)}
                              className={`text-sm font-medium px-4 py-2 rounded-lg transition-colors ${
                                isPast
                                  ? "bg-rose-500/10 border border-rose-500/30 text-rose-400 hover:bg-rose-500/20"
                                  : "bg-indigo-500 hover:bg-indigo-600 text-white"
                              }`}>
                              {isPast ? "Entrega tardía" : "Entregar"}
                            </button>
                          )
                      )}

                      {/* TEACHER / ADMIN view: list submissions to grade */}
                      {canManage && subs.length > 0 && (
                        <div className="flex flex-col gap-1.5 min-w-[200px]">
                          {subs.slice(0, 4).map((s: any) => (
                            <button key={s.id} onClick={() => setGradeTarget({ ...s, assignment })}
                              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:opacity-90 ${
                                s.status === "APPROVED"
                                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                                  : s.isLate
                                  ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                                  : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}>
                              <span className="truncate">{s.user?.name || "Alumno"}</span>
                              <span className="shrink-0 font-bold">
                                {s.status === "APPROVED" ? `${s.grade?.toFixed(1)}/10` : s.isLate ? "Tardía" : "Revisar"}
                              </span>
                            </button>
                          ))}
                          {subs.length > 4 && (
                            <p className="text-xs text-neutral-500 text-center">+{subs.length - 4} más</p>
                          )}
                        </div>
                      )}

                      {canManage && (
                        <button onClick={() => deleteAssignment(assignment.id)}
                          className="p-2 rounded-lg text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                          <Trash2 size={16}/>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
