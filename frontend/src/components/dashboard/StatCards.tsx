import { BookOpen, Users, Clock, CheckCircle } from "lucide-react";

interface Stats {
  totalCourses: number;
  totalStudents: number;
  pendingSubmissions: number;
  gradedSubmissions: number;
}

export function StatCards({ stats }: { stats: Stats }) {
  const cards = [
    { title: "Cursos Activos", value: stats.totalCourses, icon: BookOpen, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Estudiantes", value: stats.totalStudents, icon: Users, color: "text-purple-400", bg: "bg-purple-400/10" },
    { title: "Tareas Pendientes", value: stats.pendingSubmissions, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { title: "Tareas Calificadas", value: stats.gradedSubmissions, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card) => (
        <div key={card.title} className="glass-card p-6 flex items-center justify-between group cursor-default">
          <div>
            <p className="text-sm font-medium text-neutral-400 mb-1">{card.title}</p>
            <h3 className="text-3xl font-bold text-white tracking-tight">{card.value}</h3>
          </div>
          <div className={`p-4 rounded-2xl transition-colors ${card.bg}`}>
            <card.icon size={24} className={card.color} />
          </div>
        </div>
      ))}
    </div>
  );
}
