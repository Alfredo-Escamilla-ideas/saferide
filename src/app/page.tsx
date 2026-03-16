import Link from "next/link";
import {
  Shield,
  Car,
  Star,
  MapPin,
  ArrowRight,
  CheckCircle,
  Users,
  Lock,
} from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* ── Navbar ─────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-purple-100">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-purple-600 rounded-full flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-purple-700">SafeRide</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#como-funciona" className="hover:text-purple-600 transition-colors">
              Cómo funciona
            </a>
            <a href="#beneficios" className="hover:text-purple-600 transition-colors">
              Beneficios
            </a>
            <a href="#conductoras" className="hover:text-purple-600 transition-colors">
              Conviértete en conductora
            </a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="text-sm text-purple-700 font-medium hover:underline"
            >
              Entrar
            </Link>
            <Link
              href="/auth/register"
              className="text-sm bg-purple-600 text-white px-4 py-2 rounded-full hover:bg-purple-700 transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-24 px-6 bg-gradient-to-br from-purple-50 via-white to-fuchsia-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block bg-purple-100 text-purple-700 text-sm font-semibold px-4 py-1.5 rounded-full mb-6">
              🚗 Alcorcón · Madrid
            </span>
            <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 leading-tight mb-6">
              Conductoras y pasajeras.{" "}
              <span className="text-purple-600">Un viaje seguro.</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 leading-relaxed">
              SafeRide es la plataforma de transporte exclusiva para mujeres.
              Viaja con confianza sabiendo que tu conductora ha verificado su
              identidad con certificado digital oficial.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/auth/register?role=passenger"
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-200"
              >
                Pedir un viaje <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/auth/register?role=driver"
                className="flex items-center justify-center gap-2 border-2 border-purple-600 text-purple-600 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all"
              >
                Ser conductora
              </Link>
            </div>
          </div>

          {/* Tarjeta visual */}
          <div className="relative flex justify-center">
            <div className="bg-white rounded-3xl shadow-2xl shadow-purple-100 p-8 w-80 border border-purple-50">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-fuchsia-400 flex items-center justify-center text-white text-2xl font-bold">
                  M
                </div>
                <div>
                  <p className="font-semibold text-gray-800">María González</p>
                  <div className="flex items-center gap-1 text-yellow-400 text-sm">
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <Star className="w-4 h-4 fill-yellow-400" />
                    <span className="text-gray-500 ml-1">5.0</span>
                  </div>
                  <p className="text-xs text-gray-400">Toyota Corolla · 3842 MKL</p>
                </div>
              </div>
              <div className="bg-purple-50 rounded-2xl p-4 mb-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-2 h-2 rounded-full bg-purple-600 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500">Recogida</p>
                    <p className="text-sm font-medium text-gray-800">
                      C/ Mayor, 12 · Alcorcón
                    </p>
                  </div>
                </div>
                <div className="w-0.5 h-4 bg-purple-200 ml-1 mb-3" />
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-fuchsia-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Destino</p>
                    <p className="text-sm font-medium text-gray-800">
                      Hospital de Alcorcón
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">4,80 €</span>
                <span className="flex items-center gap-1 text-xs text-green-600 bg-green-50 px-3 py-1.5 rounded-full font-medium">
                  <CheckCircle className="w-3.5 h-3.5" /> Verificada
                </span>
              </div>
            </div>

            {/* Badge flotante */}
            <div className="absolute -bottom-4 -left-4 bg-purple-600 text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-lg">
              🔒 Certificado digital verificado
            </div>
          </div>
        </div>
      </section>

      {/* ── Cómo funciona ──────────────────────────────────────────────── */}
      <section id="como-funciona" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Así de sencillo
            </h2>
            <p className="text-gray-500 text-lg">
              En tres pasos tienes tu viaje listo
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: <Lock className="w-7 h-7 text-purple-600" />,
                title: "Regístrate con tu certificado digital",
                desc: "Usa tu certificado digital oficial (DNIe o FNMT) para verificar tu identidad. Solo mujeres verificadas pueden usar SafeRide.",
              },
              {
                step: "02",
                icon: <MapPin className="w-7 h-7 text-purple-600" />,
                title: "Indica tu destino",
                desc: "Introduce el punto de recogida y tu destino. Te mostramos conductoras disponibles cerca de ti en tiempo real.",
              },
              {
                step: "03",
                icon: <Car className="w-7 h-7 text-purple-600" />,
                title: "Viaja segura",
                desc: "Tu conductora verificada llega, compartes el viaje en tiempo real con quien quieras y llegas a tu destino con tranquilidad.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="relative bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow"
              >
                <span className="absolute top-6 right-6 text-5xl font-black text-purple-50">
                  {item.step}
                </span>
                <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center mb-6">
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {item.title}
                </h3>
                <p className="text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Beneficios ─────────────────────────────────────────────────── */}
      <section id="beneficios" className="py-24 px-6 bg-purple-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Diseñado para que viajes sin preocuparte
            </h2>
            <div className="space-y-5">
              {[
                {
                  icon: <Shield className="w-5 h-5 text-purple-600" />,
                  title: "Identidad verificada con certificado oficial",
                  desc: "Cada usuaria, conductora y pasajera, ha verificado su identidad con el DNIe o certificado FNMT.",
                },
                {
                  icon: <Users className="w-5 h-5 text-purple-600" />,
                  title: "Comunidad exclusivamente femenina",
                  desc: "Solo mujeres. Sin excepciones. Un espacio seguro donde puedes viajar tranquila.",
                },
                {
                  icon: <MapPin className="w-5 h-5 text-purple-600" />,
                  title: "Compartir viaje en tiempo real",
                  desc: "Comparte tu ubicación en tiempo real con quien quieras durante el trayecto.",
                },
                {
                  icon: <Star className="w-5 h-5 text-purple-600" />,
                  title: "Sistema de valoraciones transparente",
                  desc: "Todas las usuarias se valoran mutuamente. Conductoras con baja puntuación son revisadas.",
                },
              ].map((b) => (
                <div key={b.title} className="flex gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-sm">
                    {b.icon}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 mb-1">{b.title}</p>
                    <p className="text-gray-500 text-sm leading-relaxed">{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div
            id="conductoras"
            className="bg-white rounded-3xl p-8 shadow-lg border border-purple-100"
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              ¿Quieres ser conductora?
            </h3>
            <p className="text-gray-500 mb-6">
              Genera ingresos extra conduciendo en tus ratos libres. Tú pones los
              horarios.
            </p>
            <ul className="space-y-3 mb-8">
              {[
                "Registro rápido con certificado digital",
                "Tú eliges cuándo y cuánto trabajas",
                "Cobro semanal directo a tu cuenta",
                "Soporte 24/7 para conductoras",
                "Comunidad de apoyo entre conductoras",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-purple-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <Link
              href="/auth/register?role=driver"
              className="block text-center bg-purple-600 text-white py-4 rounded-2xl font-semibold hover:bg-purple-700 transition-colors"
            >
              Empezar como conductora
            </Link>
          </div>
        </div>
      </section>

      {/* ── CTA final ──────────────────────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-br from-purple-700 to-fuchsia-700 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
            Tu seguridad no es opcional
          </h2>
          <p className="text-purple-200 text-lg mb-10">
            Únete a SafeRide y viaja como mereces: con confianza, con dignidad y
            sin miedo.
          </p>
          <Link
            href="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-purple-700 px-10 py-4 rounded-full text-lg font-bold hover:bg-purple-50 transition-colors shadow-xl"
          >
            Crear mi cuenta gratis <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className="bg-gray-900 text-gray-400 py-10 px-6 text-center text-sm">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-white font-semibold">SafeRide</span>
        </div>
        <p>© 2026 SafeRide · Alcorcón, Madrid · Todos los derechos reservados</p>
        <div className="flex justify-center gap-6 mt-3">
          <a href="/privacidad" className="hover:text-white transition-colors">Privacidad</a>
          <a href="/terminos" className="hover:text-white transition-colors">Términos</a>
          <a href="/contacto" className="hover:text-white transition-colors">Contacto</a>
        </div>
      </footer>
    </main>
  );
}
