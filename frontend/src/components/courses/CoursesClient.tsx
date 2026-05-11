"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Users, Plus, ArrowRight, UserPlus, Trash2 } from "lucide-react";
import { CreateCourseModal } from "@/components/modals/CreateCourseModal";
import { EnrollStudentModal } from "@/components/modals/EnrollStudentModal";

interface CoursesClientProps {
  initialCourses: any[];
  teachers: any[];
  token: string;
  userRole: string;
  userId: string;
}

export function CoursesClient({ initialCourses, teachers, token, userRole, userId }: CoursesClientProps) {
  const [courses, setCourses] = useState<any[]>(initialCourses);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [enrollTarget, setEnrollTarget] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState("");
  const router = useRouter();

  const pageTitle = userRole === "STUDENT" ? "Mis Materias" : userRole === "TEACHER" ? "Mis Cursos" : "Cursos Generales";
  const canCreate = userRole === "ADMIN" || userRole === "TEACHER";
  const canDelete = userRole === "ADMIN";

  const handleCourseCreated = (course: any) => {
    setCourses(prev => [course, ...prev]);
    setShowCreateModal(false);
  };

  const handleEnrolled = (enrollment: any) => {
    setCourses(prev =>
      prev.map(c =>
        c.id === enrollTarget
          ? { ...c, enrollments: [...(c.enrollments || []), enrollment], _count: { ...c._count, enrollments: (c._count?.enrollments || 0) + 1 } }
          : c
      )
    );
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`¿Eliminar el curso "${title}"? Se eliminarán todas sus actividades y entregas.`)) return;
    setDeletingId(id);
    setDeleteError("");
    try {
      const res = await fetch(`http://localhost:3001/api/courses/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al eliminar curso");
      setCourses(prev => prev.filter(c => c.id !== id));
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : "Error al eliminar");
    } finally {
      setDeletingId(null);
    }
  };

  const enrolledIdsForCourse = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return (course?.enrollments || []).map((e: any) => e.user?.id || e.userId);
  };

  return (
    <>
      {showCreateModal && (
        <CreateCourseModal
          token={token}
          teachers={teachers}
          userRole={userRole}
          userId={userId}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCourseCreated}
        />
      )}
      {enrollTarget && (
        <EnrollStudentModal
          courseId={enrollTarget}
          enrolledIds={enrolledIdsForCourse(enrollTarget)}
          token={token}
          onClose={() => setEnrollTarget(null)}
          onSuccess={(e) => { handleEnrolled(e); }}
        />
      )}

      <div className="p-6 lg:p-10 w-full">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{pageTitle}</h2>
            <p className="text-neutral-400">
              {userRole === "STUDENT" ? "Las materias en las que estás inscrito." : "Gestiona y organiza los cursos de la plataforma."}
            </p>
          </div>
          {canCreate && (
            <button onClick={() => setShowCreateModal(true)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2">
              <Plus size={18} /> Nuevo Curso
            </button>
          )}
        </header>

        {deleteError && (
          <div className="mb-6 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
            ⚠️ {deleteError}
          </div>
        )}

        {courses.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <BookOpen size={48} className="text-neutral-600 mx-auto mb-4" />
            <p className="text-neutral-400">No hay cursos disponibles.</p>
            {canCreate && <p className="text-neutral-500 text-sm mt-1">Haz clic en "Nuevo Curso" para comenzar.</p>}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course: any) => (
              <div key={course.id} className="glass-card p-6 flex flex-col group relative">
                {/* Top actions */}
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-indigo-500/10 rounded-xl">
                    <BookOpen size={20} className="text-indigo-400" />
                  </div>
                  <div className="flex items-center gap-1">
                    {userRole === "ADMIN" && (
                      <button onClick={() => setEnrollTarget(course.id)}
                        title="Inscribir alumno"
                        className="p-2 rounded-lg bg-white/5 hover:bg-indigo-500/20 text-neutral-400 hover:text-indigo-400 transition-colors">
                        <UserPlus size={15} />
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        disabled={deletingId === course.id}
                        title="Eliminar curso"
                        className="p-2 rounded-lg bg-white/5 hover:bg-rose-500/10 text-neutral-400 hover:text-rose-400 transition-colors disabled:opacity-30"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-300 transition-colors">{course.title}</h3>
                <p className="text-sm text-neutral-400 mb-3 flex-1 line-clamp-2">{course.description}</p>

                {(course.semester || course.group) && (
                  <p className="text-xs text-indigo-400 mb-3 font-medium">
                    {course.semester && `Semestre ${course.semester}`}{course.semester && course.group && " · "}{course.group && `Grupo ${course.group}`}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-neutral-500 border-t border-white/10 pt-4">
                  <span className="flex items-center gap-1"><Users size={12}/> {course._count?.enrollments ?? 0} alumnos</span>
                  <span className="flex items-center gap-1"><BookOpen size={12}/> {course._count?.assignments ?? 0} actividades</span>
                </div>
                {course.instructor && (
                  <p className="text-xs text-neutral-500 mt-2">Docente: {course.instructor.name}</p>
                )}
                <Link href={`/courses/${course.id}`}
                  className="mt-4 flex items-center justify-center gap-2 w-full bg-white/5 hover:bg-indigo-500/20 border border-white/10 hover:border-indigo-500/30 text-neutral-300 hover:text-indigo-300 rounded-lg py-2 text-sm font-medium transition-all">
                  Ver Curso <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
