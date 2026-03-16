"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Loader2, CheckCircle } from "lucide-react";
import CertificateUploader from "@/components/CertificateUploader";

export default function LoginPage() {
  const router = useRouter();
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPassword, setCertPassword] = useState("");
  const [certVerified, setCertVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const handleVerified = (_: unknown, file: File, password: string) => {
    setCertFile(file);
    setCertPassword(password);
    setCertVerified(true);
    setError("");
  };

  const handleLogin = async () => {
    if (!certFile) return;
    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("certificate", certFile);
    fd.append("password", certPassword);

    try {
      const res = await fetch("/api/auth/login", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Error al iniciar sesión");
        setLoading(false);
        return;
      }

      setDone(true);
      const dest = json.role === "driver" ? "/dashboard/driver" : "/dashboard/passenger";
      setTimeout(() => router.push(dest), 1500);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-purple-700">SafeRide</span>
          </Link>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100 p-8 border border-purple-50">
          {done ? (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenida de nuevo!</h2>
              <p className="text-gray-500">Redirigiendo a tu panel...</p>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Iniciar sesión</h1>
              <p className="text-gray-500 mb-6">
                Usa tu certificado digital para acceder a tu cuenta de forma segura.
              </p>

              <CertificateUploader onVerified={handleVerified} onError={setError} />

              {error && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
              )}

              {certVerified && (
                <button
                  onClick={handleLogin}
                  disabled={loading}
                  className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Entrando...</>
                  ) : (
                    <><Shield className="w-4 h-4" /> Entrar con certificado</>
                  )}
                </button>
              )}
            </>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-purple-600 font-medium hover:underline">
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
}
