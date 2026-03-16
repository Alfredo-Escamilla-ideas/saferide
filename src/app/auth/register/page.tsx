"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Shield, Car, Users, ChevronRight, Loader2, CheckCircle } from "lucide-react";
import CertificateUploader from "@/components/CertificateUploader";

type Step = "role" | "certificate" | "profile" | "done";

interface CertData {
  name: string;
  dni: string;
  issuer: string;
  validTo: string;
}

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<Step>(
    searchParams.get("role") ? "certificate" : "role"
  );
  const [role, setRole] = useState<"driver" | "passenger">(
    (searchParams.get("role") as "driver" | "passenger") || "passenger"
  );
  const [certData, setCertData] = useState<CertData | null>(null);
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPassword, setCertPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehiclePlate, setVehiclePlate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCertVerified = (data: CertData, file: File, password: string) => {
    setCertData(data);
    setCertFile(file);
    setCertPassword(password);
  };

  const handleRegister = async () => {
    if (!certFile || !certData) return;
    if (!phone.trim()) { setError("El teléfono es obligatorio"); return; }
    if (role === "driver" && (!vehicleBrand || !vehicleModel || !vehiclePlate)) {
      setError("Los datos del vehículo son obligatorios para conductoras");
      return;
    }

    setLoading(true);
    setError("");

    const fd = new FormData();
    fd.append("certificate", certFile);
    fd.append("password", certPassword);
    fd.append("role", role);
    fd.append("phone", phone);
    if (role === "driver") {
      fd.append("vehicleBrand", vehicleBrand);
      fd.append("vehicleModel", vehicleModel);
      fd.append("vehiclePlate", vehiclePlate);
    }

    try {
      const res = await fetch("/api/auth/register", { method: "POST", body: fd });
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Error al registrarse");
        setLoading(false);
        return;
      }

      setStep("done");
      setTimeout(() => router.push(role === "driver" ? "/dashboard/driver" : "/dashboard/passenger"), 2000);
    } catch {
      setError("Error de conexión. Inténtalo de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-fuchsia-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold text-purple-700">SafeRide</span>
          </Link>
        </div>

        {/* Indicador de pasos */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {(["role", "certificate", "profile"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all
                ${step === s ? "bg-purple-600 text-white" :
                  (["role", "certificate", "profile"].indexOf(step) > i) ? "bg-purple-200 text-purple-700" :
                  "bg-gray-100 text-gray-400"}`}>
                {(["role", "certificate", "profile"].indexOf(step) > i) ? "✓" : i + 1}
              </div>
              {i < 2 && <div className={`w-8 h-0.5 ${(["role", "certificate", "profile"].indexOf(step) > i) ? "bg-purple-300" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-purple-100 p-8 border border-purple-50">

          {/* ── Paso 1: Rol ─────────────────────────────────────────────── */}
          {step === "role" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">¿Cómo quieres unirte?</h1>
              <p className="text-gray-500 mb-6">Elige tu rol en SafeRide</p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <button
                  onClick={() => setRole("passenger")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${role === "passenger" ? "border-purple-500 bg-purple-50" : "border-gray-100 hover:border-purple-200"}`}
                >
                  <Users className={`w-8 h-8 mb-3 ${role === "passenger" ? "text-purple-600" : "text-gray-400"}`} />
                  <p className="font-semibold text-gray-800">Pasajera</p>
                  <p className="text-xs text-gray-500 mt-1">Solicita viajes seguros</p>
                </button>
                <button
                  onClick={() => setRole("driver")}
                  className={`p-6 rounded-2xl border-2 text-left transition-all ${role === "driver" ? "border-purple-500 bg-purple-50" : "border-gray-100 hover:border-purple-200"}`}
                >
                  <Car className={`w-8 h-8 mb-3 ${role === "driver" ? "text-purple-600" : "text-gray-400"}`} />
                  <p className="font-semibold text-gray-800">Conductora</p>
                  <p className="text-xs text-gray-500 mt-1">Lleva a pasajeras y gana</p>
                </button>
              </div>
              <button
                onClick={() => setStep("certificate")}
                className="w-full bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
              >
                Continuar <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}

          {/* ── Paso 2: Certificado ─────────────────────────────────────── */}
          {step === "certificate" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Verifica tu identidad</h1>
              <p className="text-gray-500 mb-6">
                Sube tu certificado digital (DNIe o FNMT) para verificar tu identidad de forma segura.
              </p>
              <CertificateUploader
                onVerified={handleCertVerified}
                onError={(msg) => setError(msg)}
              />
              {certData && (
                <button
                  onClick={() => setStep("profile")}
                  className="w-full mt-4 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                >
                  Continuar <ChevronRight className="w-4 h-4" />
                </button>
              )}
              <button onClick={() => setStep("role")} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600">
                ← Volver
              </button>
            </>
          )}

          {/* ── Paso 3: Perfil ──────────────────────────────────────────── */}
          {step === "profile" && (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Completa tu perfil</h1>
              <p className="text-gray-500 mb-6">
                Hola, <strong>{certData?.name}</strong>. Solo nos falta un poco más de información.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1.5">Teléfono de contacto</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+34 600 000 000"
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                  />
                </div>

                {role === "driver" && (
                  <>
                    <p className="text-sm font-semibold text-gray-700 pt-2">Datos del vehículo</p>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Marca</label>
                        <input
                          type="text"
                          value={vehicleBrand}
                          onChange={(e) => setVehicleBrand(e.target.value)}
                          placeholder="Toyota"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 block mb-1">Modelo</label>
                        <input
                          type="text"
                          value={vehicleModel}
                          onChange={(e) => setVehicleModel(e.target.value)}
                          placeholder="Corolla"
                          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Matrícula</label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value.toUpperCase())}
                        placeholder="1234 ABC"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-400 uppercase"
                      />
                    </div>
                  </>
                )}
              </div>

              {error && (
                <p className="mt-4 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl">{error}</p>
              )}

              <button
                onClick={handleRegister}
                disabled={loading}
                className="w-full mt-6 bg-purple-600 text-white py-3 rounded-xl font-semibold hover:bg-purple-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Creando cuenta...</>
                ) : (
                  "Crear mi cuenta"
                )}
              </button>
              <button onClick={() => setStep("certificate")} className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600">
                ← Volver
              </button>
            </>
          )}

          {/* ── Paso final: Éxito ───────────────────────────────────────── */}
          {step === "done" && (
            <div className="text-center py-4">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Bienvenida a SafeRide!</h2>
              <p className="text-gray-500">Tu cuenta ha sido creada. Redirigiendo...</p>
            </div>
          )}
        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          ¿Ya tienes cuenta?{" "}
          <Link href="/auth/login" className="text-purple-600 font-medium hover:underline">
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
}
