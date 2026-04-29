import { Save } from "lucide-react";

export const metadata = {
  title: "Configuración | CheckMate",
};

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-10 w-full max-w-4xl">
      <header className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Configuración del Sistema</h2>
        <p className="text-neutral-400">
          Administra las conexiones, webhooks y preferencias de la aplicación.
        </p>
      </header>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Integración con WhatsApp</h3>
          <p className="text-neutral-400 text-sm mb-6">
            Configura la URL y el token para recibir las alertas desde la API de WhatsApp Business.
          </p>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Webhook URL</label>
              <input 
                type="text" 
                defaultValue="https://checkmate-app.com/api/webhook"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Token de Verificación</label>
              <input 
                type="password" 
                defaultValue="my-super-secret-token"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Motor OCR</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-1">Algoritmo Principal</label>
              <select className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 appearance-none">
                <option value="tesseract">Tesseract.js (Local)</option>
                <option value="easyocr">EasyOCR (Python Service)</option>
                <option value="cloud">Google Cloud Vision</option>
              </select>
            </div>
            <div className="flex items-center gap-3 mt-4">
              <input type="checkbox" id="auto-approve" className="rounded bg-white/10 border-transparent text-indigo-500 focus:ring-indigo-500/50 w-5 h-5" defaultChecked />
              <label htmlFor="auto-approve" className="text-sm text-neutral-300">Aprobar automáticamente si la confianza es mayor al 90%</label>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-indigo-500/20">
            <Save size={18} />
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
