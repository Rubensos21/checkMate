"use client";

import { useState } from "react";
import { Bell, AlertCircle, Clock, CheckCircle, BookOpen, RefreshCw, Star, FileText } from "lucide-react";

interface Notification {
  id: string;
  type: "new" | "warning" | "expired" | "review" | "grade";
  title: string;
  body: string;
  dueDate: string;
  course: string;
  student?: string;
}

interface Props {
  initialNotifications: Notification[];
  token: string;
  role: string;
}

const TYPE_CONFIG = {
  new: {
    icon: <BookOpen size={18} />,
    color: "text-indigo-400",
    bg: "bg-indigo-500/10 border-indigo-500/20",
    label: "Nueva actividad",
    dot: "bg-indigo-400",
  },
  warning: {
    icon: <Clock size={18} />,
    color: "text-amber-400",
    bg: "bg-amber-500/10 border-amber-500/20",
    label: "Por vencer",
    dot: "bg-amber-400",
  },
  expired: {
    icon: <AlertCircle size={18} />,
    color: "text-rose-400",
    bg: "bg-rose-500/10 border-rose-500/20",
    label: "Vencida",
    dot: "bg-rose-400",
  },
  review: {
    icon: <FileText size={18} />,
    color: "text-violet-400",
    bg: "bg-violet-500/10 border-violet-500/20",
    label: "Para revisar",
    dot: "bg-violet-400",
  },
  grade: {
    icon: <Star size={18} />,
    color: "text-emerald-400",
    bg: "bg-emerald-500/10 border-emerald-500/20",
    label: "Calificada",
    dot: "bg-emerald-400",
  },
};

const ALL_TABS_STUDENT = ["all", "new", "warning", "expired", "grade"] as const;
const ALL_TABS_TEACHER = ["all", "review"] as const;

const TAB_LABELS: Record<string, string> = {
  all: "Todas",
  new: "Nuevas",
  warning: "Por vencer",
  expired: "Vencidas",
  review: "Para revisar",
  grade: "Calificadas",
};

export default function NotificationsClient({ initialNotifications, token, role }: Props) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(false);

  const tabs = role === "STUDENT" ? ALL_TABS_STUDENT : ALL_TABS_TEACHER;

  const filtered = filter === "all" ? notifications : notifications.filter(n => n.type === filter);

  const refresh = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/export/notifications", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotifications(await res.json());
    } finally {
      setLoading(false);
    }
  };

  const countByType = (type: string) => notifications.filter(n => n.type === type).length;

  return (
    <div className="p-6 lg:p-10 w-full">
      <header className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Notificaciones</h2>
          <p className="text-neutral-400">
            {role === "STUDENT"
              ? "Actividades pendientes, por vencer y vencidas de tus materias."
              : "Entregas de alumnos pendientes de revisión."}
          </p>
        </div>
        <button onClick={refresh} disabled={loading}
          className="flex items-center gap-2 px-4 py-2 border border-white/10 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition-colors text-sm disabled:opacity-50">
          <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          Actualizar
        </button>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {tabs.filter(t => t !== "all").map(type => {
          const cfg = TYPE_CONFIG[type as keyof typeof TYPE_CONFIG];
          const count = countByType(type);
          return (
            <button key={type} onClick={() => setFilter(type)}
              className={`glass-card p-4 text-left transition-all border ${filter === type ? cfg.bg : "border-white/10 hover:bg-white/5"}`}>
              <div className={`flex items-center gap-2 ${cfg.color} mb-2`}>
                {cfg.icon}
                <span className="text-xs font-medium">{cfg.label}</span>
              </div>
              <p className={`text-3xl font-bold ${count > 0 ? cfg.color : "text-neutral-500"}`}>{count}</p>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {tabs.map(tab => (
          <button key={tab} onClick={() => setFilter(tab)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all border ${
              filter === tab
                ? "bg-indigo-500 text-white border-indigo-500"
                : "bg-white/5 text-neutral-400 border-white/10 hover:text-white"
            }`}>
            {TAB_LABELS[tab]}
            {tab !== "all" && countByType(tab) > 0 && (
              <span className="ml-1.5 bg-white/20 text-white text-xs px-1.5 py-0.5 rounded-full">
                {countByType(tab)}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <Bell size={40} className="text-neutral-600 mx-auto mb-3" />
          <p className="text-neutral-400 font-medium">Sin notificaciones</p>
          <p className="text-neutral-600 text-sm mt-1">
            {filter === "all" ? "Todo al día 🎉" : `No hay notificaciones de tipo "${TAB_LABELS[filter]}"`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(n => {
            const cfg = TYPE_CONFIG[n.type];
            return (
              <div key={n.id} className={`glass-card p-5 border ${cfg.bg} flex gap-4 items-start`}>
                <div className={`p-2.5 rounded-xl bg-white/5 shrink-0 ${cfg.color}`}>
                  {cfg.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-xs font-semibold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-neutral-600">·</span>
                    <span className="text-xs text-neutral-500">{n.course}</span>
                  </div>
                  <p className="text-white font-medium">{n.title}</p>
                  <p className="text-sm text-neutral-400 mt-0.5">{n.body}</p>
                  {n.student && <p className="text-xs text-violet-400 mt-1">👤 {n.student}</p>}
                </div>
                <div className={`w-2 h-2 rounded-full shrink-0 mt-2 ${cfg.dot}`} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
