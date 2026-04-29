import { ClipboardList, CheckCircle, Clock, XCircle } from "lucide-react";

interface Stats {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export function StatCards({ stats }: { stats: Stats }) {
  const cards = [
    { title: "Total Recibidas", value: stats.total, icon: ClipboardList, color: "text-blue-400", bg: "bg-blue-400/10" },
    { title: "Aprobadas", value: stats.approved, icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { title: "Pendientes", value: stats.pending, icon: Clock, color: "text-amber-400", bg: "bg-amber-400/10" },
    { title: "Rechazadas", value: stats.rejected, icon: XCircle, color: "text-rose-400", bg: "bg-rose-400/10" },
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
