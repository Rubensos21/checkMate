"use client";

import { useState } from "react";
import { X, Upload, Download, CheckCircle, AlertCircle } from "lucide-react";

interface UploadResult {
  successful: Array<{
    row: number;
    user: { id: string; name: string; email: string; matricula: string; role: string };
  }>;
  failed: Array<{
    row: number;
    data: Record<string, unknown>;
    errors: string[];
  }>;
  summary: {
    total: number;
    created: number;
    errors: number;
  };
}

interface BulkUploadModalProps {
  token: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkUploadModal({ token, onClose, onSuccess }: BulkUploadModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"upload" | "results">("upload");

  const handleDownloadTemplate = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/users/bulk/template", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Failed to download template");

      const blob = await res.blob();
        if (blob.type === 'application/json') {
          const data = await blob.text();
          throw new Error(JSON.parse(data).error || "Error al descargar plantilla");
        }
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "plantilla-usuarios.xlsx";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
        setError(err instanceof Error ? err.message : "Error descargando plantilla");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
      selectedFile.type !== "application/vnd.ms-excel"
    ) {
      setError("Por favor selecciona un archivo Excel válido");
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setError("El archivo no debe superar 5MB");
      return;
    }

    setFile(selectedFile);
    setError("");
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Por favor selecciona un archivo");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("http://localhost:3001/api/users/bulk/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Upload failed");

      setResult(data);
      setStep("results");
      if (data.summary.created > 0) {
        setTimeout(() => onSuccess(), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error during upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white">
          <X size={20} />
        </button>

        {step === "upload" ? (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Carga Masiva de Usuarios</h3>
            <p className="text-sm text-neutral-400 mb-6">
              Carga un archivo Excel para registrar múltiples usuarios a la vez.
            </p>

            {error && (
              <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-3">
                {error}
              </p>
            )}

            <div className="space-y-5">
              {/* Download Template */}
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <p className="text-sm text-neutral-300 mb-3">
                  1. Primero, descarga la plantilla Excel con el formato correcto:
                </p>
                <button
                  onClick={handleDownloadTemplate}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
                >
                  <Download size={16} />
                  Descargar Plantilla
                </button>
              </div>

              {/* File Upload */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-sm text-neutral-300 mb-3">
                  2. Completa la plantilla con los datos de los usuarios y cárgala aquí:
                </p>
                <label className="flex items-center justify-center w-full p-6 border-2 border-dashed border-white/20 rounded-lg hover:border-indigo-500/50 transition-colors cursor-pointer bg-white/[0.02]">
                  <div className="text-center">
                    <Upload size={32} className="mx-auto mb-2 text-neutral-400" />
                    <p className="text-sm font-medium text-white">
                      {file ? file.name : "Arrastra o haz clic para seleccionar archivo"}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      Máximo 5MB • Formatos: .xlsx, .xls
                    </p>
                  </div>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".xlsx,.xls"
                    className="hidden"
                  />
                </label>
              </div>

              {/* Instructions */}
              <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                <p className="text-sm font-medium text-white mb-2">Instrucciones de llenado:</p>
                <ul className="text-xs text-neutral-400 space-y-1 list-disc list-inside">
                  <li><strong>Nombre</strong>: Nombre del usuario (requerido)</li>
                  <li><strong>Apellido Paterno</strong>: Primer apellido (requerido)</li>
                  <li><strong>Apellido Materno</strong>: Segundo apellido (opcional)</li>
                  <li><strong>Rol</strong>: STUDENT, TEACHER, o ADMIN (requerido)</li>
                  <li><strong>Semestre</strong>: Solo para estudiantes (ej: 1-6)</li>
                  <li><strong>Grupo</strong>: Solo para estudiantes (ej: 601)</li>
                  <li><strong>Contraseña</strong>: Contraseña temporal (requerido)</li>
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={onClose}
                  className="px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!file || loading}
                  className="flex items-center gap-2 px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Procesando...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Cargar Archivo
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            <h3 className="text-xl font-bold text-white mb-2">Resultados de la Carga</h3>

            {result && (
              <div className="space-y-4">
                {/* Summary */}
                <div className="p-4 bg-white/5 border border-white/10 rounded-lg">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-white">{result.summary.total}</p>
                      <p className="text-xs text-neutral-400 mt-1">Total de filas</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-400">{result.summary.created}</p>
                      <p className="text-xs text-neutral-400 mt-1">Usuarios creados</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-rose-400">{result.summary.errors}</p>
                      <p className="text-xs text-neutral-400 mt-1">Errores</p>
                    </div>
                  </div>
                </div>

                {/* Successful Users */}
                {result.successful.length > 0 && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle size={18} className="text-emerald-400" />
                      <p className="font-medium text-emerald-400">
                        {result.successful.length} usuario{result.successful.length !== 1 ? "s" : ""} creado{result.successful.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.successful.map((item, idx) => (
                        <div key={idx} className="text-xs text-neutral-300 bg-black/20 p-2 rounded">
                          <p className="font-medium">{item.user.name}</p>
                          <p className="text-neutral-500">
                            {item.user.role} • {item.user.matricula} • {item.user.email}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Failed Rows */}
                {result.failed.length > 0 && (
                  <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-lg">
                    <div className="flex items-center gap-2 mb-3">
                      <AlertCircle size={18} className="text-rose-400" />
                      <p className="font-medium text-rose-400">
                        {result.failed.length} fila{result.failed.length !== 1 ? "s" : ""} con error{result.failed.length !== 1 ? "es" : ""}
                      </p>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {result.failed.map((item, idx) => (
                        <div key={idx} className="text-xs text-neutral-300 bg-black/20 p-2 rounded">
                          <p className="font-medium text-rose-400">Fila {item.row}</p>
                          {item.errors.map((err, errIdx) => (
                            <p key={errIdx} className="text-neutral-400">• {err}</p>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 justify-end">
                  <button
                    onClick={onClose}
                    className="px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium"
                  >
                    Cerrar
                  </button>
                  {result.summary.errors > 0 && (
                    <button
                      onClick={() => {
                        setFile(null);
                        setResult(null);
                        setError("");
                        setStep("upload");
                      }}
                      className="px-4 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors font-medium"
                    >
                      Cargar otro archivo
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
