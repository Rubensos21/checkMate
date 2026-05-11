"use client";

import { useState, useRef } from "react";
import { X, Upload, Link, FileText, Image, File, CheckCircle, Loader2 } from "lucide-react";

interface SubmitAssignmentModalProps {
  assignmentId: string;
  assignmentTitle: string;
  onClose: () => void;
  onSuccess: (submission: unknown) => void;
  token: string;
}

type UploadMode = "file" | "url";

const FILE_ICON: Record<string, React.ReactNode> = {
  "image": <Image size={16} className="text-emerald-400" />,
  "application/pdf": <FileText size={16} className="text-rose-400" />,
  "application": <File size={16} className="text-indigo-400" />,
};

const getFileIcon = (mime: string) => {
  if (mime.startsWith("image/")) return FILE_ICON["image"];
  if (mime === "application/pdf") return FILE_ICON["application/pdf"];
  return FILE_ICON["application"];
};

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

export function SubmitAssignmentModal({
  assignmentId, assignmentTitle, onClose, onSuccess, token
}: SubmitAssignmentModalProps) {
  const [mode, setMode] = useState<UploadMode>("file");
  const [comment, setComment] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploadedUrl, setUploadedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload file to backend, get URL back
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setUploadedUrl("");
    setError("");
    setUploading(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append("file", selected);

      // Use XMLHttpRequest to track progress
      const url = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "http://localhost:3001/api/upload");
        xhr.setRequestHeader("Authorization", `Bearer ${token}`);
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
        };
        xhr.onload = () => {
          if (xhr.status === 200) {
            const res = JSON.parse(xhr.responseText);
            resolve(res.url);
          } else {
            const res = JSON.parse(xhr.responseText);
            reject(new Error(res.error || "Error al subir archivo"));
          }
        };
        xhr.onerror = () => reject(new Error("Error de red al subir el archivo"));
        xhr.send(formData);
      });

      setUploadedUrl(url);
      setUploadProgress(100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al subir");
      setFile(null);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalUrl = mode === "url" ? urlInput : uploadedUrl;
    if (!comment.trim() && !finalUrl) {
      setError("Agrega un comentario o adjunta un archivo/URL.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("http://localhost:3001/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          assignmentId,
          comment,
          imageUrl: finalUrl || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error((data as { error: string }).error || "Error al entregar");
      onSuccess(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="glass-card w-full max-w-lg p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-neutral-400 hover:text-white transition-colors">
          <X size={20} />
        </button>
        <h3 className="text-xl font-bold text-white mb-1">Entregar Actividad</h3>
        <p className="text-sm text-neutral-400 mb-6 truncate">{assignmentTitle}</p>

        {error && (
          <p className="mb-4 text-sm text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Comentario / Respuesta
            </label>
            <textarea
              value={comment}
              onChange={e => setComment(e.target.value)}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 resize-none"
              placeholder="Describe tu entrega o incluye tu respuesta aquí..."
            />
          </div>

          {/* Mode toggle */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Adjunto (opcional)
            </label>
            <div className="flex rounded-lg overflow-hidden border border-white/10 mb-3">
              <button type="button" onClick={() => setMode("file")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                  mode === "file" ? "bg-indigo-500 text-white" : "bg-white/5 text-neutral-400 hover:text-white"
                }`}>
                <Upload size={15} /> Subir archivo
              </button>
              <button type="button" onClick={() => setMode("url")}
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium transition-colors ${
                  mode === "url" ? "bg-indigo-500 text-white" : "bg-white/5 text-neutral-400 hover:text-white"
                }`}>
                <Link size={15} /> URL / Link
              </button>
            </div>

            {mode === "file" ? (
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg,.gif,.webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {!file ? (
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full border-2 border-dashed border-white/15 hover:border-indigo-500/50 rounded-xl py-8 flex flex-col items-center gap-2 text-neutral-400 hover:text-indigo-300 transition-all">
                    <Upload size={28} />
                    <span className="text-sm font-medium">Haz clic para seleccionar un archivo</span>
                    <span className="text-xs text-neutral-600">PDF, Word, Excel, PPT, imágenes, ZIP · máx. 20 MB</span>
                  </button>
                ) : (
                  <div className="border border-white/10 rounded-xl p-4 bg-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/10 rounded-lg shrink-0">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white font-medium truncate">{file.name}</p>
                        <p className="text-xs text-neutral-500">{formatBytes(file.size)}</p>
                      </div>
                      {uploading ? (
                        <Loader2 size={16} className="text-indigo-400 animate-spin shrink-0" />
                      ) : uploadedUrl ? (
                        <CheckCircle size={16} className="text-emerald-400 shrink-0" />
                      ) : null}
                    </div>
                    {uploading && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-neutral-500 mb-1">
                          <span>Subiendo...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-indigo-500 rounded-full transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                    {uploadedUrl && (
                      <p className="text-xs text-emerald-400 mt-2">✓ Archivo listo para entregar</p>
                    )}
                    <button type="button" onClick={() => { setFile(null); setUploadedUrl(""); setUploadProgress(0); if (fileRef.current) fileRef.current.value = ""; }}
                      className="text-xs text-neutral-500 hover:text-rose-400 mt-2 transition-colors">
                      Cambiar archivo
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div>
                <input
                  type="url"
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="https://drive.google.com/... o cualquier enlace"
                />
                <p className="text-xs text-neutral-500 mt-1.5">
                  Puedes pegar un link de Google Drive, Dropbox, GitHub, etc.
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2.5 border border-white/10 text-neutral-300 rounded-lg hover:bg-white/5 transition-colors font-medium">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || uploading || (mode === "file" && !!file && !uploadedUrl)}
              className="flex-1 bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? <><Loader2 size={15} className="animate-spin" /> Enviando...</> : "Entregar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
