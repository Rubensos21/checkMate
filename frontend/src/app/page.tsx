import { cookies } from "next/headers";
import { StatCards } from "@/components/dashboard/StatCards";
import { SubmissionTable } from "@/components/dashboard/SubmissionTable";
import Link from "next/link";
import { ArrowRight, BookOpen, Clock, Award } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  const role = cookieStore.get("userRole")?.value || "STUDENT";
  const name = cookieStore.get("userName")?.value || "Usuario";

  let submissions = [];
  let stats = { totalCourses: 0, totalStudents: 0, pendingSubmissions: 0, gradedSubmissions: 0 };
  let courses = [];

  try {
    const headers = { Authorization: `Bearer ${token}` };
    
    if (role === "ADMIN" || role === "TEACHER") {
      const [subRes, statsRes] = await Promise.all([
        fetch('http://localhost:3001/api/submissions', { headers, cache: 'no-store' }),
        fetch('http://localhost:3001/api/submissions/stats', { headers, cache: 'no-store' })
      ]);
      if (subRes.ok) submissions = await subRes.json();
      if (statsRes.ok) stats = await statsRes.json();
    } else {
      // STUDENT
      const [coursesRes, subRes] = await Promise.all([
        fetch('http://localhost:3001/api/courses', { headers, cache: 'no-store' }),
        fetch('http://localhost:3001/api/submissions', { headers, cache: 'no-store' })
      ]);
      if (coursesRes.ok) courses = await coursesRes.json();
      if (subRes.ok) submissions = await subRes.json();
    }
  } catch (error) {
    console.error('Error fetching data', error);
  }

  const safeSubmissions = Array.isArray(submissions) ? submissions : [];
  const safeCourses = Array.isArray(courses) ? courses : [];

  if (role === "STUDENT") {
    const pending = safeSubmissions.filter((s:any) => s.status === 'PENDING').length;
    const graded = safeSubmissions.filter((s:any) => s.status === 'APPROVED' || s.status === 'REJECTED').length;

    return (
      <div className="p-6 lg:p-10 w-full">
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">¡Hola, {name}!</h2>
          <p className="text-neutral-400">Bienvenido a tu panel de estudiante. Aquí está tu resumen.</p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Materias Inscritas</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{safeCourses.length}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-indigo-500/10"><BookOpen className="text-indigo-400" /></div>
          </div>
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Tareas en Revisión</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{pending}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-amber-500/10"><Clock className="text-amber-400" /></div>
          </div>
          <div className="glass-card p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-neutral-400 mb-1">Tareas Calificadas</p>
              <h3 className="text-3xl font-bold text-white tracking-tight">{graded}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-500/10"><Award className="text-emerald-400" /></div>
          </div>
        </div>

        <div className="mb-4">
          <h3 className="text-xl font-semibold text-white mb-4">Mis Entregas Recientes</h3>
          <SubmissionTable data={safeSubmissions.slice(0, 5)} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10 w-full">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          {role === "ADMIN" ? "Panel de Administración" : "Panel del Profesor"}
        </h2>
        <p className="text-neutral-400">
          {role === "ADMIN" ? "Visión general de toda la institución." : "Gestiona tus cursos y revisa las entregas de tus estudiantes."}
        </p>
      </header>

      <StatCards stats={stats} />
      
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Últimas Entregas Recibidas</h3>
          <Link href="/grades" className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors text-sm font-medium">
            Ver todas <ArrowRight size={16} />
          </Link>
        </div>
        <SubmissionTable data={safeSubmissions.slice(0, 5)} />
      </div>
    </div>
  );
}
