import { Bell, AlertTriangle, CheckCircle, Info } from "lucide-react";

export const metadata = {
  title: "Notificaciones | CheckMate",
};

export default function NotificationsPage() {
  const notifications = [
    { id: 1, type: "success", title: "Nuevo lote procesado", message: "Se han extraído exitosamente 4 evidencias de WhatsApp.", time: "Hace 10 min", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { id: 2, type: "warning", title: "Confianza baja detectada", message: "Una evidencia de 'Carlos Mendoza' necesita revisión manual.", time: "Hace 1 hora", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
    { id: 3, type: "info", title: "Reporte exportado", message: "Juan Pérez descargó el reporte de evidencias en formato Excel.", time: "Hace 3 horas", icon: Info, color: "text-blue-400", bg: "bg-blue-400/10" },
    { id: 4, type: "success", title: "Servicio OCR reiniciado", message: "Actualización de modelos de idioma aplicada correctamente.", time: "Ayer", icon: Bell, color: "text-indigo-400", bg: "bg-indigo-400/10" },
  ];

  return (
    <div className="p-6 lg:p-10 w-full max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Notificaciones</h2>
        <p className="text-neutral-400">
          Historial de alertas del sistema y eventos recientes.
        </p>
      </header>

      <div className="space-y-4">
        {notifications.map((notif) => (
          <div key={notif.id} className="glass-card p-4 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4 transition-colors hover:bg-white/5 cursor-pointer">
            <div className={`p-3 rounded-xl shrink-0 self-start ${notif.bg}`}>
              <notif.icon className={notif.color} size={24} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className="text-lg font-semibold text-white">{notif.title}</h4>
                <span className="text-xs text-neutral-500 whitespace-nowrap ml-4">{notif.time}</span>
              </div>
              <p className="text-neutral-400 text-sm">
                {notif.message}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
