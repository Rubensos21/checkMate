import { cookies } from "next/headers";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import ReportsClient from "./ReportsClient";

export const metadata = {
  title: "Seguimiento | Dynamic Cooperation Group",
};
export const dynamic = "force-dynamic";

async function getData(token: string) {
  const [reportsRes] = await Promise.all([
    fetch("http://localhost:3001/api/reports/system", {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    }),
  ]);
  const reports = reportsRes.ok ? await reportsRes.json() : null;
  return { reports };
}

export default async function ReportsPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value || "";
  const role = cookieStore.get("userRole")?.value || "";

  const { reports } = await getData(token);

  if (!reports) {
    return <div className="p-10 text-white">Error cargando reportes.</div>;
  }

  return (
    <div className="p-6 lg:p-10 w-full">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Seguimiento y Reportes</h2>
          <p className="text-neutral-400">
            Supervisa la actividad y el progreso general de los estudiantes.
          </p>
        </div>
        {(role === "TEACHER" || role === "ADMIN") && (
          <ReportsClient token={token} />
        )}
      </header>

      {/* Metric cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6 border-t-4 border-indigo-500">
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Actividades Registradas</h3>
          <p className="text-4xl font-bold text-white">{reports.metrics.totalActivities}</p>
        </div>
        <div className="glass-card p-6 border-t-4 border-emerald-500">
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Estudiantes Activos</h3>
          <p className="text-4xl font-bold text-white">{reports.metrics.activeStudents}</p>
        </div>
        <div className="glass-card p-6 border-t-4 border-violet-500">
          <h3 className="text-lg font-medium text-neutral-300 mb-2">Cursos Totales</h3>
          <p className="text-4xl font-bold text-white">{reports.metrics.totalCourses}</p>
        </div>
      </div>

      {/* Activity log */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10">
          <h3 className="text-xl font-semibold text-white">Log de Actividad del Sistema</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-neutral-300 min-w-[600px]">
            <thead className="bg-white/5 text-neutral-400">
              <tr>
                <th className="px-6 py-4 font-medium">Fecha y Hora</th>
                <th className="px-6 py-4 font-medium">Usuario</th>
                <th className="px-6 py-4 font-medium">Acción</th>
                <th className="px-6 py-4 font-medium">Detalles</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {reports.logs.map((log: { id: string; createdAt: string; user?: { name: string; role: string }; action: string; details: string }) => (
                <tr key={log.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {format(new Date(log.createdAt), "dd MMM, HH:mm:ss", { locale: es })}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-white font-medium">{log.user?.name}</p>
                    <p className="text-xs text-neutral-500">{log.user?.role}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold tracking-wide">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-neutral-400">{log.details}</td>
                </tr>
              ))}
              {reports.logs.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-neutral-500">
                    No hay registros de actividad.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
