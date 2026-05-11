"use client";

import { useState } from "react";
import { Paintbrush, Zap, Save, CheckCircle } from "lucide-react";

interface CustomizationClientProps {
  initialSettings: { theme: string; primaryColor: string };
  token: string;
}

const COLORS = [
  { id: "indigo", label: "Índigo", class: "bg-indigo-500", ring: "ring-indigo-500" },
  { id: "violet", label: "Violeta", class: "bg-violet-500", ring: "ring-violet-500" },
  { id: "emerald", label: "Esmeralda", class: "bg-emerald-500", ring: "ring-emerald-500" },
  { id: "rose", label: "Rosa", class: "bg-rose-500", ring: "ring-rose-500" },
  { id: "amber", label: "Ámbar", class: "bg-amber-500", ring: "ring-amber-500" },
  { id: "sky", label: "Cielo", class: "bg-sky-500", ring: "ring-sky-500" },
];

export function CustomizationClient({ initialSettings, token }: CustomizationClientProps) {
  const [settings, setSettings] = useState(initialSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("http://localhost:3001/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(settings),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 lg:p-10 w-full">
      <header className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Personalización Institucional</h2>
          <p className="text-neutral-400">Adapta la apariencia de la plataforma para tu organización.</p>
        </div>
        <button onClick={handleSave} disabled={saving}
          className={`flex items-center gap-2 font-medium py-2 px-5 rounded-lg transition-all ${
            saved ? "bg-emerald-500 text-white" : "bg-indigo-500 hover:bg-indigo-600 text-white"
          } disabled:opacity-60`}>
          {saved ? <><CheckCircle size={16}/> Guardado</> : <><Save size={16}/>{saving ? "Guardando..." : "Guardar Cambios"}</>}
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-indigo-500/10 rounded-xl"><Paintbrush className="text-indigo-400" size={20} /></div>
            <h3 className="text-xl font-semibold text-white">Apariencia Visual</h3>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">Modo de Color</label>
              <div className="grid grid-cols-2 gap-4">
                {["dark", "light"].map(mode => (
                  <button key={mode} onClick={() => setSettings(s => ({ ...s, theme: mode }))}
                    className={`px-4 py-3 border rounded-lg font-medium transition-all ${
                      settings.theme === mode
                        ? "border-indigo-500 bg-indigo-500/10 text-white"
                        : "border-white/10 bg-white/5 text-neutral-400 hover:text-white hover:border-white/20"
                    }`}>
                    {mode === "dark" ? "🌙 Modo Oscuro" : "☀️ Modo Claro"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-3">Color Primario Institucional</label>
              <div className="flex flex-wrap gap-3">
                {COLORS.map(color => (
                  <button key={color.id} onClick={() => setSettings(s => ({ ...s, primaryColor: color.id }))}
                    title={color.label}
                    className={`w-10 h-10 rounded-full ${color.class} transition-all hover:scale-110 ${
                      settings.primaryColor === color.id ? `ring-2 ${color.ring} ring-offset-2 ring-offset-neutral-950 scale-110` : ""
                    }`} />
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-2">Color seleccionado: <span className="text-white capitalize">{settings.primaryColor}</span></p>
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-3 bg-violet-500/10 rounded-xl"><Zap className="text-violet-400" size={20} /></div>
            <h3 className="text-xl font-semibold text-white">Plugins Activos</h3>
          </div>

          <div className="space-y-4">
            {[
              { name: "Motor OCR Inteligente", desc: "Auto-calificación de evidencias mediante Tesseract", active: true },
              { name: "Exportación ExcelJS", desc: "Reportes descargables en formato nativo", active: true },
              { name: "Módulo Anti-Plagio", desc: "Verificación de texto comparado con internet", active: false },
              { name: "Integración WhatsApp", desc: "Entrega de evidencias vía WhatsApp Business API", active: false },
            ].map((plugin) => (
              <div key={plugin.name} className="flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl">
                <div>
                  <h4 className="text-white font-medium">{plugin.name}</h4>
                  <p className="text-sm text-neutral-400">{plugin.desc}</p>
                </div>
                <div className={`w-12 h-6 rounded-full relative transition-colors cursor-pointer ${plugin.active ? "bg-indigo-500" : "bg-neutral-600"}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${plugin.active ? "right-1" : "left-1"}`} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
