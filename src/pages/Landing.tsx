import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

// Partículas pre-generadas (para no recalcular en cada render)
const PARTICLES = Array.from({ length: 18 }).map((_, i) => ({
  id: i,
  left: `${Math.random() * 100}%`,
  top: `${Math.random() * 100}%`,
  delay: `${Math.random() * 5}s`,
  duration: `${15 + Math.random() * 10}s`,
}));

const Landing: React.FC = () => {
  const { currentUser } = useAuth();

  const primaryCta = currentUser
    ? { to: '/creator-hub', label: 'Ir al Creator Hub' }
    : { to: '/register', label: 'Comenzar gratis' };

  const secondaryCta = currentUser
    ? { to: '/ai-dashboard', label: 'Explorar IA' }
    : { to: '/login', label: 'Iniciar sesión' };

  // Estado para el cursor que sigue al mouse
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setCursorPos({
      x: e.clientX,
      y: e.clientY,
    });
  };

  const hasCursor = cursorPos.x !== 0 || cursorPos.y !== 0;

  return (
    <Layout hideNavbar>
      <div
        className="relative overflow-hidden min-h-screen"
        onMouseMove={handleMouseMove}
      >
        {/* Fondo principal con degradado */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900 z-0" />

        {/* Manchas de color animadas */}
        <div className="fixed inset-0 opacity-60 z-0">
          <div className="absolute -top-10 left-10 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 right-[10%] w-[28rem] h-[28rem] bg-pink-500/20 rounded-full blur-3xl animate-float-medium" />
          <div className="absolute -bottom-24 left-[30%] w-[32rem] h-[32rem] bg-orange-500/15 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-soft" />
        </div>

        {/* Partículas flotantes */}
        <div className="fixed inset-0 opacity-40 z-0 pointer-events-none">
          {PARTICLES.map((p) => (
            <div
              key={p.id}
              className="absolute w-1 h-1 bg-white/90 rounded-full animate-float"
              style={{
                left: p.left,
                top: p.top,
                animationDelay: p.delay,
                animationDuration: p.duration,
              }}
            />
          ))}
        </div>

        {/* Glow que sigue el puntero (solo desktop) */}
        <div className="pointer-events-none fixed inset-0 z-10 hidden md:block">
          <div
            style={{
              position: 'absolute',
              width: '320px',
              height: '320px',
              borderRadius: '9999px',
              background:
                'radial-gradient(circle at center, rgba(168,85,247,0.65), rgba(236,72,153,0.35), rgba(249,115,22,0))',
              transform: hasCursor
                ? `translate3d(${cursorPos.x - 160}px, ${cursorPos.y - 160}px, 0)`
                : 'translate3d(-9999px, -9999px, 0)',
              transition: 'transform 0.35s ease-out, opacity 0.35s ease-out',
              opacity: hasCursor ? 1 : 0,
              filter: 'blur(28px)',
            }}
          />
          <div
            style={{
              position: 'absolute',
              width: '24px',
              height: '24px',
              borderRadius: '9999px',
              border: '1px solid rgba(248,250,252,0.8)',
              transform: hasCursor
                ? `translate3d(${cursorPos.x - 12}px, ${cursorPos.y - 12}px, 0)`
                : 'translate3d(-9999px, -9999px, 0)',
              transition: 'transform 0.12s ease-out, opacity 0.2s ease-out',
              opacity: hasCursor ? 1 : 0,
              boxShadow: '0 0 24px rgba(248,250,252,0.7)',
              backdropFilter: 'blur(4px)',
            }}
          />
        </div>

        {/* Contenido principal */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-6">
          {/* Navbar */}
          <header className="flex items-center justify-between py-4 animate-fade-down">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/40 group-hover:shadow-purple-500/70 transition-all duration-300 group-hover:scale-110 group-hover:-rotate-3">
                <span className="text-white font-bold text-lg tracking-tight">
                  A
                </span>
                <div className="absolute inset-0 rounded-xl border border-white/20 opacity-0 group-hover:opacity-100 group-hover:animate-pulse-soft" />
              </div>
              <div className="leading-tight">
                <p className="text-white font-bold text-xl bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent group-hover:translate-x-0.5 transition-transform">
                  AnyPost
                </p>
                <p className="text-xs text-white/60 group-hover:text-white/80 transition-colors">
                  IA para creadores
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {!currentUser && (
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-200 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105 hover:-translate-y-0.5"
                >
                  Iniciar sesión
                </Link>
              )}
              <Link
                to={primaryCta.to}
                className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/40 hover:shadow-purple-500/70 hover:scale-[1.04] transition-all duration-300 hover:-translate-y-0.5"
              >
                {primaryCta.label}
                <svg
                  className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            </div>
          </header>

          {/* Hero section */}
          <section className="mt-20 grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            {/* Columna izquierda */}
            <div className="space-y-8 animate-hero" style={{ animationDelay: '0.05s' }}>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.25em] text-white/80 backdrop-blur-xl shadow-lg animate-badge">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse-soft" />
                Multiredes sin esfuerzo
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight space-y-1">
                <span className="block bg-gradient-to-r from-white via-gray-200 to-gray-300 bg-clip-text text-transparent animate-hero" style={{ animationDelay: '0.12s' }}>
                  Publica en
                </span>
                <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-hero" style={{ animationDelay: '0.2s' }}>
                  todas tus redes
                </span>
              </h1>

              <p
                className="text-xl text-gray-300 max-w-2xl leading-relaxed animate-hero"
                style={{ animationDelay: '0.28s' }}
              >
                AnyPost es la plataforma que te permite crear, programar y publicar contenido en múltiples redes sociales al mismo tiempo, ahorrándote horas de trabajo.
              </p>

              <p
                className="text-gray-200 max-w-2xl leading-relaxed animate-hero"
                style={{ animationDelay: '0.35s' }}
              >
                Escribe tu post una sola vez, sube tu imagen o video y selecciona tus redes favoritas. Nosotros nos encargamos de enviarlo a cada plataforma con la mejor calidad.
              </p>

              {/* Botones CTA */}
              <div
                className="flex flex-wrap items-center gap-4 animate-hero"
                style={{ animationDelay: '0.42s' }}
              >
                <Link
                  to={primaryCta.to}
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.05] hover:shadow-2xl hover:shadow-purple-500/40 hover:-translate-y-0.5"
                >
                  {primaryCta.label}
                  <svg
                    className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </Link>

                <Link
                  to={secondaryCta.to}
                  className="group inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:scale-[1.04] hover:-translate-y-0.5 backdrop-blur-xl"
                >
                  {secondaryCta.label}
                  <span className="text-xs text-white/60 group-hover:text-white/90 transition-colors">
                    IA incluida
                  </span>
                </Link>

                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex -space-x-3">
                    {['#8B5CF6', '#F59E0B', '#06B6D4'].map((start, i) => {
                      const end = ['#EC4899', '#84CC16', '#3B82F6'][i];
                      const text = ['A', 'I', '+'][i];
                      return (
                        <div
                          key={text}
                          className="w-10 h-10 rounded-full border-2 border-gray-900 flex items-center justify-center text-xs text-white font-bold shadow-lg animate-orbit"
                          style={{
                            background: `linear-gradient(45deg, ${start}, ${end})`,
                            animationDelay: `${i * 0.15}s`,
                          }}
                        >
                          {text}
                        </div>
                      );
                    })}
                  </div>
                  <span className="text-gray-300">
                    +3K creadores ya usan AnyPost
                  </span>
                </div>
              </div>

              {/* Mini features */}
              <div className="grid sm:grid-cols-3 gap-4 text-sm mt-4">
                {[
                  {
                    icon: '⚡',
                    text: 'Ahorra tiempo gestionando todo desde un solo panel.',
                  },
                  {
                    icon: '📊',
                    text: 'Visualiza el estado de tus publicaciones y su rendimiento.',
                  },
                  {
                    icon: '☁️',
                    text: 'Tus archivos se guardan de forma segura en la nube.',
                  },
                ].map((item, index) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:scale-[1.04] hover:-translate-y-1 group animate-card"
                    style={{ animationDelay: `${0.45 + index * 0.08}s` }}
                  >
                    <span className="text-2xl transition-transform group-hover:scale-125 group-hover:rotate-3" aria-hidden>
                      {item.icon}
                    </span>
                    <p className="text-gray-200 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Columna derecha - Panel demo */}
            <div className="relative animate-hero" style={{ animationDelay: '0.25s' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-3xl animate-pulse-soft" />
              <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-purple-500/40 p-8 overflow-hidden hover:-translate-y-1 hover:scale-[1.01] transition-transform duration-500">
                <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-r from-purple-600/40 via-pink-500/40 to-orange-400/40 blur-3xl" />

                {/* Header del panel */}
                <div className="relative mb-6 flex items-center justify-between animate-fade-down" style={{ animationDelay: '0.35s' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse-soft" />
                    <span className="text-xs uppercase tracking-[0.22em] text-white/80 font-semibold">
                      Panel IA
                    </span>
                  </div>
                  <span className="text-xs text-white/70 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                    Tiempo real
                  </span>
                </div>

                {/* Contenido del panel */}
                <div className="relative space-y-6">
                  {/* Card principal */}
                  <div className="rounded-2xl border border-white/10 bg-black/60 p-6 space-y-4 backdrop-blur-xl animate-card" style={{ animationDelay: '0.4s' }}>
                    <div className="flex items-center justify-between">
                      <p className="text-white font-bold text-lg">
                        Generador de copies
                      </p>
                      <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-xl font-medium">
                        Listo
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      &quot;Lanza tu nuevo producto con una campaña en 3 clicks que conecta con tu audiencia.&quot;
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {[
                        {
                          label: 'Plataformas',
                          value: 'Instagram, TikTok, X',
                          color: 'text-purple-300',
                        },
                        {
                          label: 'Tono',
                          value: 'Creativo + Breve',
                          color: 'text-pink-300',
                        },
                        {
                          label: 'Entrega',
                          value: 'Programado',
                          color: 'text-orange-300',
                        },
                      ].map((item, index) => (
                        <div
                          key={item.label}
                          className="rounded-xl bg-white/5 border border-white/10 p-3 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:-translate-y-1"
                          style={{ transitionDelay: `${index * 0.05}s` }}
                        >
                          <p className="text-white font-semibold mb-1">
                            {item.label}
                          </p>
                          <p className={`${item.color} font-medium`}>
                            {item.value}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card de métricas */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-600/30 to-orange-500/30 p-6 backdrop-blur-xl animate-card" style={{ animationDelay: '0.5s' }}>
                    <p className="text-sm text-white/90 leading-relaxed">
                      Ahorra hasta{' '}
                      <span className="text-white font-bold text-lg">
                        8h/semana
                      </span>{' '}
                      automatizando tu pipeline creativo.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 h-2 rounded-full w-3/4 animate-progress" />
                      </div>
                      <span className="text-xs text-white/80">
                        75% eficiencia
                      </span>
                    </div>
                  </div>

                  {/* Redes conectadas */}
                  <div className="flex flex-wrap gap-2 pt-2 animate-card" style={{ animationDelay: '0.6s' }}>
                    {[
                      { name: 'Instagram', short: 'IG', gradient: 'from-pink-500 to-yellow-400' },
                      { name: 'TikTok', short: 'TT', gradient: 'from-gray-900 to-cyan-400' },
                      { name: 'Facebook', short: 'FB', gradient: 'from-blue-600 to-cyan-500' },
                      { name: 'YouTube', short: 'YT', gradient: 'from-red-500 to-orange-500' },
                      { name: 'X', short: 'X', gradient: 'from-slate-800 to-gray-500' },
                      { name: 'LinkedIn', short: 'IN', gradient: 'from-blue-500 to-indigo-500' },
                    ].map((network, index) => (
                      <span
                        key={network.name}
                        className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:border-white/30 hover:bg-white/10 transition-all duration-300 hover:-translate-y-0.5 hover:scale-105"
                        style={{ transitionDelay: `${index * 0.03}s` }}
                      >
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${network.gradient} text-[10px] font-semibold text-white shadow-lg`}
                        >
                          {network.short}
                        </span>
                        {network.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Sección de features */}
          <section className="mt-32 animate-section">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4 animate-hero" style={{ animationDelay: '0.05s' }}>
                Todo lo que necesitas para{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  crecer en redes
                </span>
              </h2>
              <p
                className="text-xl text-gray-300 max-w-2xl mx-auto animate-hero"
                style={{ animationDelay: '0.12s' }}
              >
                Herramientas poderosas diseñadas específicamente para creadores de contenido.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Sube una vez, publica en todas',
                  desc: 'Instagram, TikTok, Facebook, YouTube, X, LinkedIn y más desde un solo flujo.',
                  icon: (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 7h14" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h12" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 17h8" />
                      <circle cx="18" cy="12" r="2" strokeWidth={2} />
                    </>
                  ),
                  gradient: 'from-purple-500 to-pink-500',
                },
                {
                  title: 'Programación inteligente',
                  desc: 'Elige horarios, colabora con tu equipo y deja que AnyPost despache cada pieza con la mejor calidad.',
                  icon: (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 6V5a3 3 0 013-3h2a3 3 0 013 3v1" />
                      <rect x="5" y="6" width="14" height="13" rx="3" ry="3" strokeWidth={2} />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11v4l3 2" />
                    </>
                  ),
                  gradient: 'from-pink-500 to-orange-500',
                },
                {
                  title: 'Control y rendimiento',
                  desc: 'Visualiza estado de publicaciones, KPIs y recomendaciones para que tu marca siga activa.',
                  icon: (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l3-4 3 3 4-8 3 6" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16" />
                      <circle cx="6" cy="7" r="2" strokeWidth={2} />
                    </>
                  ),
                  gradient: 'from-orange-500 to-purple-500',
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/30 transition-all duration-500 hover:scale-[1.03] hover:-translate-y-2 hover:border-white/20 animate-card"
                  style={{ animationDelay: `${0.15 + index * 0.1}s` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                  <div className="relative space-y-4">
                    <div
                      className={`relative w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}
                    >
                      <div className="absolute inset-0 rounded-2xl bg-white/20 blur-md opacity-0 group-hover:opacity-80 transition-opacity duration-300" />
                      <svg
                        className="relative w-7 h-7"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        {feature.icon}
                      </svg>
                    </div>

                    <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>

                    <p className="text-gray-300 text-lg leading-relaxed">
                      {feature.desc}
                    </p>

                    <div className="pt-4">
                      <div className="flex items-center gap-2 text-xs text-white/70">
                        <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse-soft" />
                        <span>Listo para publicar</span>
                      </div>
                      <div className="mt-2 w-10 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:w-16 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA final */}
          <section className="mt-32 animate-section" style={{ animationDelay: '0.1s' }}>
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-purple-700/40 via-pink-600/40 to-orange-500/40 p-12 backdrop-blur-2xl shadow-2xl shadow-purple-600/40 hover:shadow-purple-600/60 transition-all duration-500 hover:-translate-y-2 hover:scale-[1.01]">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/0 to-white/10 opacity-40" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/25 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-orange-500/25 rounded-full blur-3xl" />

              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1 space-y-4">
                  <p className="text-sm uppercase tracking-[0.24em] text-white/70 font-semibold">
                    Publica sin fricción
                  </p>
                  <h3 className="text-4xl font-bold text-white">
                    AnyPost es tu centro de control{' '}
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      multired
                    </span>
                  </h3>
                  <p className="text-gray-200 text-lg mt-2 max-w-2xl leading-relaxed">
                    Sube tu contenido una sola vez, elige redes y deja que nosotros lo llevemos a cada plataforma con la mejor calidad.
                  </p>
                  <p className="text-sm text-white/70">
                    Compatible con creadores solo, equipos pequeños y agencias.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <Link
                    to={primaryCta.to}
                    className="group inline-flex items-center gap-3 rounded-2xl bg-white text-gray-900 px-8 py-4 text-sm font-bold uppercase tracking-wide shadow-2xl hover:scale-[1.05] transition-all duration-300 hover:shadow-white/20 hover:-translate-y-0.5"
                  >
                    {primaryCta.label}
                    <svg
                      className="w-4 h-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </Link>

                  {!currentUser && (
                    <Link
                      to="/login"
                      className="group inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.04] hover:-translate-y-0.5"
                    >
                      Tengo cuenta
                      <span className="text-xs text-white/70 group-hover:text-white/90 transition-colors">
                        Entrar ahora
                      </span>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Estilos de animación adicionales */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        @keyframes float-slow {
          0%,
          100% {
            transform: translateY(0px) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.05);
          }
        }
        @keyframes float-medium {
          0%,
          100% {
            transform: translateX(0px) translateY(0px);
          }
          50% {
            transform: translateX(10px) translateY(-15px);
          }
        }
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(24px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        @keyframes fade-down {
          0% {
            opacity: 0;
            transform: translateY(-12px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        @keyframes badge-pop {
          0% {
            opacity: 0;
            transform: translateY(12px) scale(0.96);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
        @keyframes card-pop {
          0% {
            opacity: 0;
            transform: translateY(18px) scale(0.97);
          }
          100% {
            opacity: 1;
            transform: translateY(0px) scale(1);
          }
        }
        @keyframes section-fade {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0px);
          }
        }
        @keyframes pulse-soft {
          0%,
          100% {
            opacity: 0.45;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.06);
          }
        }
        @keyframes orbit {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        @keyframes progressGrow {
          0% {
            width: 0%;
          }
          100% {
            width: 75%;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 8s ease-in-out infinite;
        }
        .animate-float-medium {
          animation: float-medium 7s ease-in-out infinite;
        }

        .animate-hero {
          opacity: 0;
          animation: fade-in-up 0.9s ease-out forwards;
        }
        .animate-fade-down {
          opacity: 0;
          animation: fade-down 0.7s ease-out forwards;
        }
        .animate-badge {
          opacity: 0;
          animation: badge-pop 0.7s ease-out forwards;
        }
        .animate-card {
          opacity: 0;
          animation: card-pop 0.7s ease-out forwards;
        }
        .animate-section {
          opacity: 0;
          animation: section-fade 0.9s ease-out forwards;
        }
        .animate-pulse-soft {
          animation: pulse-soft 3.2s ease-in-out infinite;
        }
        .animate-orbit {
          animation: orbit 3.5s ease-in-out infinite;
        }
        .animate-progress {
          animation: progressGrow 1.4s ease-out forwards;
        }
      `}</style>
    </Layout>
  );
};

export default Landing;