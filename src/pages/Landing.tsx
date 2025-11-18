import React from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const Landing: React.FC = () => {
  const { currentUser } = useAuth();
  const primaryCta = currentUser
    ? { to: '/creator-hub', label: 'Ir al Creator Hub' }
    : { to: '/register', label: 'Comenzar gratis' };
  const secondaryCta = currentUser
    ? { to: '/ai-dashboard', label: 'Explorar IA' }
    : { to: '/login', label: 'Iniciar sesión' };

  return (
    <Layout hideNavbar>
      <div className="relative overflow-hidden">
        {/* Fondos con gradientes animados */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900" />
        <div className="fixed inset-0 opacity-40">
          <div className="absolute -top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute top-1/2 right-[10%] w-[28rem] h-[28rem] bg-pink-500/15 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-24 left-[30%] w-[32rem] h-[32rem] bg-orange-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-10">
          {/* Navbar liviano para la landing */}
          <header className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/25">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="leading-tight">
                <p className="text-white font-semibold text-lg">AnyPost</p>
                <p className="text-xs text-white/60">IA para creadores</p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {!currentUser && (
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-200 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  Iniciar sesión
                </Link>
              )}
              <Link
                to={primaryCta.to}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
              >
                {primaryCta.label}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </header>

          {/* Hero */}
          <section className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                Multiredes sin esfuerzo
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white">
                Publica en todas tus redes desde un solo lugar.
              </h1>
              <p className="text-lg text-gray-300 max-w-2xl">
                AnyPost es la plataforma que te permite crear, programar y publicar contenido en múltiples redes sociales al mismo tiempo, ahorrándote horas de trabajo y manteniendo tu marca siempre activa.
              </p>
              <p className="text-gray-200 max-w-2xl">
                Con AnyPost solo escribes tu post una vez, subes tu imagen o video y seleccionas tus redes favoritas. Nosotros nos encargamos de enviarlo a cada plataforma con la mejor calidad, para que tú solo te preocupes por crear contenido increíble.
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={primaryCta.to}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:scale-[1.02] shadow-lg shadow-purple-500/20"
                >
                  {primaryCta.label}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link
                  to={secondaryCta.to}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                >
                  {secondaryCta.label}
                </Link>
                <div className="flex items-center gap-3 text-sm text-gray-400">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border border-black flex items-center justify-center text-xs text-white font-semibold">
                      A
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-yellow-400 border border-black flex items-center justify-center text-xs text-white font-semibold">
                      I
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 border border-black flex items-center justify-center text-xs text-white font-semibold">
                      +
                    </div>
                  </div>
                  <span>+3K creadores ya usan AnyPost</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-3 text-sm text-gray-100">
                {[
                  { icon: '⚡', text: 'Ahorra tiempo gestionando todo desde un solo panel.' },
                  { icon: '📊', text: 'Visualiza el estado de tus publicaciones y su rendimiento.' },
                  { icon: '☁️', text: 'Tus archivos se guardan de forma segura en la nube.' },
                ].map((item) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur"
                  >
                    <span className="text-lg" aria-hidden>
                      {item.icon}
                    </span>
                    <p className="text-gray-200">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-3xl" />
              <div className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-purple-500/20 p-6 overflow-hidden">
                <div className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-30 blur-3xl" />
                <div className="relative space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs uppercase tracking-[0.2em] text-white/70">Panel IA</span>
                    <span className="text-xs text-white/60">Tiempo real</span>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/50 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-semibold">Generador de copies</p>
                      <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">Listo</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      "Lanza tu nuevo producto con una campaña en 3 clicks que conecta con tu audiencia."
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <p className="text-white font-semibold">Platforms</p>
                        <p className="text-purple-300 mt-1">Instagram, TikTok, X</p>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <p className="text-white font-semibold">Tono</p>
                        <p className="text-purple-300 mt-1">Creativo + Breve</p>
                      </div>
                      <div className="rounded-xl bg-white/5 border border-white/10 p-3">
                        <p className="text-white font-semibold">Entrega</p>
                        <p className="text-purple-300 mt-1">Programado</p>
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-600/20 to-orange-500/20 p-4">
                    <p className="text-sm text-white/80">
                      Ahorra hasta <span className="text-white font-semibold">8h/semana</span> automatizando tu pipeline creativo.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features */}
          <section className="mt-20 grid gap-6 md:grid-cols-3">
            {[
              {
                title: 'Sube una vez, publica en todas',
                desc: 'Instagram, TikTok, Facebook, YouTube, X, LinkedIn y más desde un solo flujo.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 12h16M4 16h10" />
                ),
              },
              {
                title: 'Programación inteligente',
                desc: 'Elige horarios, colabora con tu equipo y deja que AnyPost despache cada pieza con la mejor calidad.',
                icon: (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
                    <rect x="5" y="7" width="14" height="12" rx="2" ry="2" strokeWidth={2} />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 13h-4v4" />
                  </>
                ),
              },
              {
                title: 'Control y rendimiento',
                desc: 'Visualiza estado de publicaciones, KPIs y recomendaciones para que tu marca siga activa.',
                icon: (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4 4 4 4-8 4 6" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16" />
                  </>
                ),
              },
            ].map((feature) => (
              <div
                key={feature.title}
                className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-lg shadow-purple-500/10"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-50" />
                <div className="relative space-y-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center text-white">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      {feature.icon}
                    </svg>
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </section>

          {/* CTA final */}
          <section className="mt-16">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-purple-700/30 via-pink-600/30 to-orange-500/30 p-10 backdrop-blur-xl shadow-xl shadow-purple-600/20">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/0 to-white/10 opacity-40" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Publica sin fricción</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    AnyPost es tu centro de control multired
                  </h3>
                  <p className="text-gray-200 mt-2 max-w-2xl">
                    Sube tu contenido una sola vez, elige redes y deja que nosotros lo llevemos a cada plataforma con la mejor calidad.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    to={primaryCta.to}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-900 px-5 py-3 text-sm font-bold uppercase tracking-wide shadow-lg hover:scale-[1.02] transition"
                  >
                    {primaryCta.label}
                  </Link>
                  {!currentUser && (
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                    >
                      Tengo cuenta
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Landing;
