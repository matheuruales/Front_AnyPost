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
        {/* Fondos mejorados con más movimiento */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900" />
        <div className="fixed inset-0 opacity-50">
          <div className="absolute -top-10 left-10 w-96 h-96 bg-purple-600/25 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 right-[10%] w-[28rem] h-[28rem] bg-pink-500/20 rounded-full blur-3xl animate-float-medium" />
          <div className="absolute -bottom-24 left-[30%] w-[32rem] h-[32rem] bg-orange-500/15 rounded-full blur-3xl animate-float-slow" />
          <div className="absolute top-20 right-1/4 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        </div>

        {/* Partículas flotantes */}
        <div className="fixed inset-0 opacity-30">
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${15 + Math.random() * 10}s`
              }}
            />
          ))}
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-8">
          {/* Navbar mejorada */}
          <header className="flex items-center justify-between py-4">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:shadow-purple-500/50 transition-all duration-300 group-hover:scale-105">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <div className="leading-tight">
                <p className="text-white font-bold text-xl bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  AnyPost
                </p>
                <p className="text-xs text-white/60">IA para creadores</p>
              </div>
            </Link>

            <div className="flex items-center gap-3">
              {!currentUser && (
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-200 px-4 py-2 rounded-xl hover:bg-white/10 transition-all duration-200 hover:scale-105"
                >
                  Iniciar sesión
                </Link>
              )}
              <Link
                to={primaryCta.to}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50 hover:scale-[1.02] transition-all duration-300 hover:translate-y-[-2px]"
              >
                {primaryCta.label}
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </header>

          {/* Hero section mejorada */}
          <section className="mt-20 grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur-xl shadow-lg">
                <span className="h-2 w-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
                Multiredes sin esfuerzo
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
                  Publica en
                </span>
                <br />
                <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                  todas tus redes
                </span>
              </h1>
              
              <p className="text-xl text-gray-300 max-w-2xl leading-relaxed">
                AnyPost es la plataforma que te permite crear, programar y publicar contenido en múltiples redes sociales al mismo tiempo, ahorrándote horas de trabajo.
              </p>
              
              <p className="text-gray-200 max-w-2xl leading-relaxed">
                Con AnyPost solo escribes tu post una vez, subes tu imagen o video y seleccionas tus redes favoritas. Nosotros nos encargamos de enviarlo a cada plataforma con la mejor calidad.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <Link
                  to={primaryCta.to}
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-purple-500/30"
                >
                  {primaryCta.label}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
                
                <Link
                  to={secondaryCta.to}
                  className="group inline-flex items-center gap-3 rounded-2xl border border-white/20 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] backdrop-blur-xl"
                >
                  {secondaryCta.label}
                </Link>
                
                <div className="flex items-center gap-4 text-sm text-gray-400">
                  <div className="flex -space-x-3">
                    {[...Array(3)].map((_, i) => (
                      <div
                        key={i}
                        className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border-2 border-gray-900 flex items-center justify-center text-xs text-white font-bold shadow-lg"
                        style={{
                          background: `linear-gradient(45deg, ${['#8B5CF6', '#F59E0B', '#06B6D4'][i]}, ${['#EC4899', '#84CC16', '#3B82F6'][i]})`
                        }}
                      >
                        {['A', 'I', '+'][i]}
                      </div>
                    ))}
                  </div>
                  <span className="text-gray-300">+3K creadores ya usan AnyPost</span>
                </div>
              </div>

              {/* Features grid mejorada */}
              <div className="grid sm:grid-cols-3 gap-4 text-sm">
                {[
                  { icon: '⚡', text: 'Ahorra tiempo gestionando todo desde un solo panel.' },
                  { icon: '📊', text: 'Visualiza el estado de tus publicaciones y su rendimiento.' },
                  { icon: '☁️', text: 'Tus archivos se guardan de forma segura en la nube.' },
                ].map((item, index) => (
                  <div
                    key={item.text}
                    className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:bg-white/10 hover:scale-[1.02] group"
                  >
                    <span className="text-2xl transition-transform group-hover:scale-110" aria-hidden>
                      {item.icon}
                    </span>
                    <p className="text-gray-200 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Panel de demostración mejorado */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-3xl animate-pulse" />
              <div className="relative rounded-3xl border border-white/20 bg-white/10 backdrop-blur-2xl shadow-2xl shadow-purple-500/30 p-8 overflow-hidden">
                <div className="absolute inset-x-0 -top-32 h-64 bg-gradient-to-r from-purple-600/40 via-pink-500/40 to-orange-400/40 blur-3xl" />
                
                {/* Header del panel */}
                <div className="relative mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span className="text-xs uppercase tracking-[0.2em] text-white/80 font-semibold">Panel IA</span>
                  </div>
                  <span className="text-xs text-white/60 bg-white/5 px-3 py-1 rounded-full">Tiempo real</span>
                </div>

                {/* Contenido del panel */}
                <div className="relative space-y-6">
                  {/* Card principal */}
                  <div className="rounded-2xl border border-white/10 bg-black/60 p-6 space-y-4 backdrop-blur-xl">
                    <div className="flex items-center justify-between">
                      <p className="text-white font-bold text-lg">Generador de copies</p>
                      <span className="text-xs text-green-400 bg-green-400/10 px-3 py-1.5 rounded-xl font-medium">Listo</span>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      "Lanza tu nuevo producto con una campaña en 3 clicks que conecta con tu audiencia."
                    </p>
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      {[
                        { label: 'Platforms', value: 'Instagram, TikTok, X', color: 'text-purple-300' },
                        { label: 'Tono', value: 'Creativo + Breve', color: 'text-pink-300' },
                        { label: 'Entrega', value: 'Programado', color: 'text-orange-300' },
                      ].map((item, index) => (
                        <div
                          key={item.label}
                          className="rounded-xl bg-white/5 border border-white/10 p-3 backdrop-blur-xl transition-all duration-300 hover:bg-white/10"
                        >
                          <p className="text-white font-semibold mb-1">{item.label}</p>
                          <p className={`${item.color} font-medium`}>{item.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Card de métricas */}
                  <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-600/30 to-orange-500/30 p-6 backdrop-blur-xl">
                    <p className="text-sm text-white/90 leading-relaxed">
                      Ahorra hasta <span className="text-white font-bold text-lg">8h/semana</span> automatizando tu pipeline creativo.
                    </p>
                    <div className="mt-3 flex items-center gap-2">
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full w-3/4" />
                      </div>
                      <span className="text-xs text-white/70">75% eficiencia</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features section mejorada */}
          <section className="mt-32">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-white mb-4">
                Todo lo que necesitas para{' '}
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  crecer en redes
                </span>
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Herramientas poderosas diseñadas específicamente para creadores de contenido
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {[
                {
                  title: 'Sube una vez, publica en todas',
                  desc: 'Instagram, TikTok, Facebook, YouTube, X, LinkedIn y más desde un solo flujo.',
                  icon: (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 12h16M4 16h10" />
                  ),
                  gradient: 'from-purple-500 to-pink-500'
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
                  gradient: 'from-pink-500 to-orange-500'
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
                  gradient: 'from-orange-500 to-purple-500'
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl p-8 shadow-2xl shadow-purple-500/10 hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] hover:border-white/20"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  
                  <div className="relative space-y-4">
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        {feature.icon}
                      </svg>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                      {feature.title}
                    </h3>
                    
                    <p className="text-gray-300 text-lg leading-relaxed">{feature.desc}</p>
                    
                    <div className="pt-4">
                      <div className="w-8 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover:w-12 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA final mejorado */}
          <section className="mt-32">
            <div className="relative overflow-hidden rounded-3xl border border-white/20 bg-gradient-to-r from-purple-700/40 via-pink-600/40 to-orange-500/40 p-12 backdrop-blur-2xl shadow-2xl shadow-purple-600/30">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/0 to-white/10 opacity-40" />
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl" />
              
              <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                <div className="flex-1">
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70 font-semibold">Publica sin fricción</p>
                  <h3 className="text-4xl font-bold text-white mt-3">
                    AnyPost es tu centro de control{' '}
                    <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                      multired
                    </span>
                  </h3>
                  <p className="text-gray-200 text-lg mt-4 max-w-2xl leading-relaxed">
                    Sube tu contenido una sola vez, elige redes y deja que nosotros lo llevemos a cada plataforma con la mejor calidad.
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <Link
                    to={primaryCta.to}
                    className="group inline-flex items-center gap-3 rounded-2xl bg-white text-gray-900 px-8 py-4 text-sm font-bold uppercase tracking-wide shadow-2xl hover:scale-[1.02] transition-all duration-300 hover:shadow-white/20"
                  >
                    {primaryCta.label}
                    <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  {!currentUser && (
                    <Link
                      to="/login"
                      className="group inline-flex items-center gap-3 rounded-2xl border border-white/40 bg-white/5 px-8 py-4 text-sm font-semibold text-white backdrop-blur-xl hover:bg-white/10 transition-all duration-300 hover:scale-[1.02]"
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

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-30px) scale(1.05); }
        }
        @keyframes float-medium {
          0%, 100% { transform: translateX(0px) translateY(0px); }
          50% { transform: translateX(10px) translateY(-15px); }
        }
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-float-slow { animation: float-slow 8s ease-in-out infinite; }
        .animate-float-medium { animation: float-medium 7s ease-in-out infinite; }
      `}</style>
    </Layout>
  );
};

export default Landing;