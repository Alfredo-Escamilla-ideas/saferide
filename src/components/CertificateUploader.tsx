"use client";

import { useState, useCallback } from "react";
import { Shield, Upload, CheckCircle, XCircle, Loader2, Eye, EyeOff } from "lucide-react";

interface CertificateData {
  name: string;
  dni: string;
  issuer: string;
  validTo: string;
}

interface CertificateUploaderProps {
  onVerified: (data: CertificateData, file: File, password: string) => void;
  onError?: (msg: string) => void;
}

export default function CertificateUploader({ onVerified, onError }: CertificateUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "verifying" | "ok" | "error">("idle");
  const [certData, setCertData] = useState<CertificateData | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFile = useCallback((f: File) => {
    const ext = f.name.split(".").pop()?.toLowerCase();
    if (!["p12", "pfx"].includes(ext || "")) {
      setErrorMsg("El archivo debe ser .p12 o .pfx");
      setStatus("error");
      return;
    }
    setFile(f);
    setStatus("idle");
    setCertData(null);
    setErrorMsg("");
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const verify = async () => {
    if (!file) return;
    setStatus("verifying");
    setErrorMsg("");

    const fd = new FormData();
    fd.append("certificate", file);
    fd.append("password", password);

    try {
      const res = await fetch("/api/auth/verify-certificate", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        setStatus("error");
        setErrorMsg(json.error || "Error al verificar el certificado");
        onError?.(json.error);
        return;
      }

      setCertData(json.data);
      setStatus("ok");
      onVerified(json.data, file, password);
    } catch {
      setStatus("error");
      setErrorMsg("Error de conexión. Inténtalo de nuevo.");
    }
  };

  return (
    <div className="space-y-4">
      {/* Zona de drop */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all cursor-pointer
          ${isDragging ? "border-purple-500 bg-purple-50" : "border-gray-200 hover:border-purple-300 hover:bg-purple-50/50"}
          ${status === "ok" ? "border-green-400 bg-green-50" : ""}
          ${status === "error" ? "border-red-300 bg-red-50" : ""}
        `}
        onClick={() => document.getElementById("cert-input")?.click()}
      >
        <input
          id="cert-input"
          type="file"
          accept=".p12,.pfx"
          className="hidden"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
        />

        {status === "ok" ? (
          <div className="flex flex-col items-center gap-2">
            <CheckCircle className="w-12 h-12 text-green-500" />
            <p className="font-semibold text-green-700">Certificado verificado</p>
            <p className="text-sm text-gray-500">{file?.name}</p>
          </div>
        ) : status === "error" && file ? (
          <div className="flex flex-col items-center gap-2">
            <XCircle className="w-12 h-12 text-red-400" />
            <p className="font-semibold text-red-600">Error en el certificado</p>
            <p className="text-sm text-gray-500">{file.name}</p>
          </div>
        ) : file ? (
          <div className="flex flex-col items-center gap-2">
            <Shield className="w-12 h-12 text-purple-400" />
            <p className="font-semibold text-gray-700">{file.name}</p>
            <p className="text-sm text-gray-400">Introduce la contraseña y verifica</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-gray-300" />
            <div>
              <p className="font-semibold text-gray-600">Arrastra tu certificado aquí</p>
              <p className="text-sm text-gray-400 mt-1">o haz clic para seleccionarlo</p>
            </div>
            <span className="text-xs bg-gray-100 text-gray-500 px-3 py-1 rounded-full">
              Formatos: .p12 · .pfx (DNIe / FNMT)
            </span>
          </div>
        )}
      </div>

      {/* Contraseña del certificado */}
      {file && status !== "ok" && (
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && verify()}
            placeholder="Contraseña del certificado (déjala vacía si no tiene)"
            className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      )}

      {/* Error */}
      {errorMsg && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl flex items-start gap-2">
          <XCircle className="w-4 h-4 shrink-0 mt-0.5" /> {errorMsg}
        </p>
      )}

      {/* Datos del certificado verificado */}
      {certData && status === "ok" && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Nombre</span>
            <span className="font-semibold text-gray-800">{certData.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">DNI/NIE</span>
            <span className="font-semibold text-gray-800">{certData.dni || "No extraído"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Emisor</span>
            <span className="font-semibold text-gray-800">{certData.issuer}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Válido hasta</span>
            <span className="font-semibold text-gray-800">
              {new Date(certData.validTo).toLocaleDateString("es-ES")}
            </span>
          </div>
        </div>
      )}

      {/* Botón verificar */}
      {file && status !== "ok" && (
        <button
          onClick={verify}
          disabled={status === "verifying"}
          className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {status === "verifying" ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Verificando...
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" /> Verificar certificado
            </>
          )}
        </button>
      )}
    </div>
  );
}
