import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

// 3D Floating Particle Component
const FloatingParticle: React.FC<{
  delay: number;
  duration: number;
  size: number;
  color: string;
  initialX: number;
  initialY: number;
}> = ({ delay, duration, size, color, initialX, initialY }) => {
  return (
    <div
      className="absolute rounded-full opacity-20"
      style={{
        width: `${size}px`,
        height: `${size}px`,
        background: `radial-gradient(circle, ${color}, transparent)`,
        left: `${initialX}%`,
        top: `${initialY}%`,
        animation: `float3d ${duration}s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        transform: 'translateZ(0)',
      }}
    />
  );
};

// 3D Tilt Card Component
const TiltCard3D: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [transform, setTransform] = useState('');

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    setTransform(
      `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`
    );
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      {children}
    </div>
  );
};

// 3D Logo Component
const Logo3D: React.FC = () => {
  const logoRef = useRef<HTMLDivElement>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!logoRef.current) return;
      const rect = logoRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const rotateX = (e.clientY - centerY) / 20;
      const rotateY = (centerX - e.clientX) / 20;
      setRotation({ x: rotateX, y: rotateY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <Link
      to="/"
      className="flex items-center gap-3"
      ref={logoRef}
      style={{
        transform: `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
        transition: 'transform 0.1s ease-out',
        transformStyle: 'preserve-3d',
      }}
    >
      <div
        className="w-9 h-9 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center shadow-lg shadow-purple-500/25"
        style={{
          transform: 'translateZ(20px)',
        }}
      >
        <span className="text-white font-bold text-lg">A</span>
      </div>
      <div className="leading-tight" style={{ transform: 'translateZ(10px)' }}>
        <p className="text-white font-semibold text-lg">AnyPost</p>
        <p className="text-xs text-white/60">IA para creadores</p>
      </div>
    </Link>
  );
};

// 3D Feature Card
const FeatureCard3D: React.FC<{
  title: string;
  desc: string;
  icon: React.ReactNode;
  index: number;
}> = ({ title, desc, icon, index }) => {
  return (
    <TiltCard3D
      className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 shadow-lg shadow-purple-500/10"
      style={{
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 opacity-50" />
      <div className="relative space-y-3" style={{ transform: 'translateZ(20px)' }}>
        <div
          className="w-12 h-12 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center text-white"
          style={{
            transform: 'translateZ(30px)',
            boxShadow: '0 10px 30px rgba(168, 85, 247, 0.3)',
          }}
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white" style={{ transform: 'translateZ(10px)' }}>
          {title}
        </h3>
        <p className="text-gray-300 text-sm leading-relaxed" style={{ transform: 'translateZ(5px)' }}>
          {desc}
        </p>
      </div>
    </TiltCard3D>
  );
};

// 3D Preview Panel
const PreviewPanel3D: React.FC = () => {
  const panelRef = useRef<HTMLDivElement>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!panelRef.current) return;
      const rect = panelRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      setMousePosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="relative" ref={panelRef}>
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-500/20 via-pink-500/20 to-orange-500/20 blur-3xl"
        style={{
          transform: `translate3d(${mousePosition.x * 0.5}px, ${mousePosition.y * 0.5}px, 0)`,
          transition: 'transform 0.3s ease-out',
        }}
      />
      <TiltCard3D className="relative rounded-3xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl shadow-purple-500/20 p-6 overflow-hidden">
        <div
          className="absolute inset-x-0 -top-24 h-48 bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400 opacity-30 blur-3xl"
          style={{
            transform: `translate3d(${mousePosition.x * 0.3}px, ${mousePosition.y * 0.3}px, 0)`,
          }}
        />
        <div className="relative space-y-4" style={{ transform: 'translateZ(20px)' }}>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-[0.2em] text-white/70">Panel IA</span>
            <span className="text-xs text-white/60">Tiempo real</span>
          </div>
          <div
            className="rounded-2xl border border-white/10 bg-black/50 p-4 space-y-3"
            style={{ transform: 'translateZ(10px)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-white font-semibold">Generador de copies</p>
              <span className="text-xs text-green-400 bg-green-400/10 px-2 py-1 rounded-lg">Listo</span>
            </div>
            <p className="text-sm text-gray-300">
              "Lanza tu nuevo producto con una campaña en 3 clicks que conecta con tu audiencia."
            </p>
            <div className="grid grid-cols-3 gap-3 text-xs text-gray-300">
              {[
                { label: 'Platforms', value: 'Instagram, TikTok, X' },
                { label: 'Tono', value: 'Creativo + Breve' },
                { label: 'Entrega', value: 'Programado' },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-xl bg-white/5 border border-white/10 p-3"
                  style={{
                    transform: `translateZ(${15 + idx * 5}px)`,
                  }}
                >
                  <p className="text-white font-semibold">{item.label}</p>
                  <p className="text-purple-300 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className="rounded-2xl border border-white/10 bg-gradient-to-r from-purple-600/20 to-orange-500/20 p-4"
            style={{ transform: 'translateZ(15px)' }}
          >
            <p className="text-sm text-white/80">
              Ahorra hasta <span className="text-white font-semibold">8h/semana</span> automatizando tu pipeline
              creativo.
            </p>
          </div>
        </div>
      </TiltCard3D>
    </div>
  );
};

const Landing: React.FC = () => {
  const { currentUser } = useAuth();
  const heroRef = useRef<HTMLDivElement>(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const primaryCta = currentUser
    ? { to: '/creator-hub', label: 'Ir al Creator Hub' }
    : { to: '/register', label: 'Comenzar gratis' };
  const secondaryCta = currentUser
    ? { to: '/ai-dashboard', label: 'Explorar IA' }
    : { to: '/login', label: 'Iniciar sesión' };

  // Generate floating particles
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    delay: Math.random() * 5,
    duration: 10 + Math.random() * 10,
    size: 20 + Math.random() * 40,
    color: ['#a855f7', '#ec4899', '#f97316'][Math.floor(Math.random() * 3)],
    initialX: Math.random() * 100,
    initialY: Math.random() * 100,
  }));

  const features = [
    {
      title: 'Publica en múltiples redes',
      desc: 'Sube tu contenido una vez y publícalo en Instagram, TikTok, Facebook, YouTube, X, LinkedIn y más, todo desde un solo lugar.',
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12m6-6H6" />,
    },
    {
      title: 'Gestiona todo desde un panel',
      desc: 'Visualiza el estado de tus publicaciones, programa contenido y mantén un control total sobre todas tus redes sociales.',
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2" />
          <rect x="5" y="7" width="14" height="12" rx="2" ry="2" strokeWidth={2} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 13h-4v4" />
        </>
      ),
    },
    {
      title: 'Almacenamiento seguro',
      desc: 'Tus archivos se guardan de forma segura en la nube, accesibles desde cualquier lugar y siempre protegidos.',
      icon: (
        <>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4-4 4 4 4-8 4 6" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16" />
        </>
      ),
    },
  ];

  return (
    <Layout hideNavbar>
      <style>{`
        @keyframes float3d {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(0deg);
          }
          25% {
            transform: translate3d(20px, -30px, 50px) rotate(90deg);
          }
          50% {
            transform: translate3d(-20px, -60px, 100px) rotate(180deg);
          }
          75% {
            transform: translate3d(20px, -30px, 50px) rotate(270deg);
          }
        }
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translate3d(0, 30px, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }

        @keyframes pulse3d {
          0%, 100% {
            transform: scale3d(1, 1, 1) translateZ(0);
          }
          50% {
            transform: scale3d(1.05, 1.05, 1.05) translateZ(20px);
          }
        }

        .perspective-container {
          perspective: 1000px;
          perspective-origin: center center;
        }

        .transform-3d {
          transform-style: preserve-3d;
        }
      `}</style>
      <div className="relative overflow-hidden perspective-container">
        {/* 3D Background with animated gradients */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900" />
        <div className="fixed inset-0 opacity-40 transform-3d">
          {particles.map((particle) => (
            <FloatingParticle key={particle.id} {...particle} />
          ))}
          <div
            className="absolute -top-10 left-10 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl"
            style={{
              transform: `translate3d(0, ${scrollY * 0.3}px, 0)`,
              animation: 'pulse3d 4s ease-in-out infinite',
            }}
          />
          <div
            className="absolute top-1/2 right-[10%] w-[28rem] h-[28rem] bg-pink-500/15 rounded-full blur-3xl"
            style={{
              transform: `translate3d(0, ${scrollY * 0.2}px, 0)`,
              animation: 'pulse3d 5s ease-in-out infinite 1s',
            }}
          />
          <div
            className="absolute -bottom-24 left-[30%] w-[32rem] h-[32rem] bg-orange-500/10 rounded-full blur-3xl"
            style={{
              transform: `translate3d(0, ${scrollY * 0.4}px, 0)`,
              animation: 'pulse3d 6s ease-in-out infinite 2s',
            }}
          />
        </div>

        {/* Main Content */}
        <div
          className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 pt-10"
          style={{
            transform: `translate3d(0, ${scrollY * 0.1}px, 0)`,
          }}
        >
          {/* 3D Navbar */}
          <header className="flex items-center justify-between transform-3d">
            <Logo3D />
            <div className="flex items-center gap-2" style={{ transform: 'translateZ(10px)' }}>
              {!currentUser && (
                <Link
                  to="/login"
                  className="text-sm font-semibold text-gray-200 px-3 py-2 rounded-lg hover:bg-white/10 transition-colors"
                  style={{ transform: 'translateZ(5px)' }}
                >
                  Iniciar sesión
                </Link>
              )}
              <Link
                to={primaryCta.to}
                className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-purple-500/20 hover:scale-[1.02] transition-transform"
                style={{
                  transform: 'translateZ(10px)',
                  boxShadow: '0 10px 40px rgba(168, 85, 247, 0.3)',
                }}
              >
                {primaryCta.label}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </header>

          {/* Hero Section with 3D Elements */}
          <section
            ref={heroRef}
            className="mt-16 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] items-center transform-3d"
          >
            <div className="space-y-6" style={{ transform: 'translateZ(30px)' }}>
              <span
                className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white/80 backdrop-blur"
                style={{
                  transform: 'translateZ(20px)',
                  animation: 'fadeInUp 0.6s ease-out',
                }}
              >
                <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                Tu centro de control para redes sociales
              </span>
              <h1
                className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight text-white"
                style={{
                  transform: 'translateZ(40px)',
                  textShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
                  animation: 'fadeInUp 0.8s ease-out 0.1s both',
                }}
              >
                Publica en todas tus redes desde{' '}
                <span
                  className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-300 bg-clip-text text-transparent"
                  style={{
                    transform: 'translateZ(50px)',
                    filter: 'drop-shadow(0 0 20px rgba(168, 85, 247, 0.5))',
                  }}
                >
                  un solo lugar
                </span>
              </h1>
              <p
                className="text-lg text-gray-300 max-w-2xl"
                style={{
                  transform: 'translateZ(20px)',
                  animation: 'fadeInUp 1s ease-out 0.2s both',
                }}
              >
                AnyPost es la plataforma que te permite crear, programar y publicar contenido en múltiples redes
                sociales al mismo tiempo, ahorrándote horas de trabajo y manteniendo tu marca siempre activa.
              </p>
              <p
                className="text-base text-gray-400 max-w-2xl"
                style={{
                  transform: 'translateZ(15px)',
                  animation: 'fadeInUp 1.1s ease-out 0.3s both',
                }}
              >
                Con AnyPost solo escribes tu post una vez, subes tu imagen o video y seleccionas tus redes favoritas.
                Nosotros nos encargamos de enviarlo a cada plataforma con la mejor calidad, para que tú solo te
                preocupes por crear contenido increíble.
              </p>
              <div
                className="flex flex-col gap-6"
                style={{
                  transform: 'translateZ(30px)',
                  animation: 'fadeInUp 1.2s ease-out 0.3s both',
                }}
              >
                <div className="flex flex-wrap items-center gap-4">
                  <Link
                    to={primaryCta.to}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-5 py-3 text-sm font-bold uppercase tracking-wide text-white transition hover:scale-[1.02] shadow-lg shadow-purple-500/20"
                    style={{
                      transform: 'translateZ(40px)',
                      boxShadow: '0 15px 50px rgba(168, 85, 247, 0.4)',
                    }}
                  >
                    {primaryCta.label}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <Link
                    to={secondaryCta.to}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                    style={{ transform: 'translateZ(30px)' }}
                  >
                    {secondaryCta.label}
                  </Link>
                </div>

                {/* Benefits Bullets */}
                <div
                  className="space-y-3 max-w-2xl"
                  style={{
                    transform: 'translateZ(25px)',
                    animation: 'fadeInUp 1.3s ease-out 0.4s both',
                  }}
                >
                  <div className="flex items-start gap-3 text-gray-300">
                    <span className="text-xl flex-shrink-0" style={{ transform: 'translateZ(10px)' }}>
                      ⚡
                    </span>
                    <p className="text-sm">
                      Ahorra tiempo gestionando todo desde un solo panel.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-gray-300">
                    <span className="text-xl flex-shrink-0" style={{ transform: 'translateZ(10px)' }}>
                      📊
                    </span>
                    <p className="text-sm">
                      Visualiza el estado de tus publicaciones y su rendimiento.
                    </p>
                  </div>
                  <div className="flex items-start gap-3 text-gray-300">
                    <span className="text-xl flex-shrink-0" style={{ transform: 'translateZ(10px)' }}>
                      ☁️
                    </span>
                    <p className="text-sm">
                      Tus archivos se guardan de forma segura en la nube.
                    </p>
                  </div>
                </div>

                {/* User avatars - moved down */}
                <div
                  className="flex items-center gap-3 text-sm text-gray-400 mt-4"
                  style={{ transform: 'translateZ(20px)' }}
                >
                  <div className="flex -space-x-2">
                    {['A', 'I', '+'].map((letter, idx) => (
                      <div
                        key={idx}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 border border-black flex items-center justify-center text-xs text-white font-semibold"
                        style={{
                          transform: `translateZ(${10 + idx * 5}px) rotateY(${idx * 15}deg)`,
                          animation: `float3d ${3 + idx}s ease-in-out infinite ${idx * 0.2}s`,
                        }}
                      >
                        {letter}
                      </div>
                    ))}
                  </div>
                  <span>+3K creadores ya usan AnyPost</span>
                </div>
              </div>
            </div>

            {/* 3D Preview Panel */}
            <div style={{ transform: 'translateZ(50px)' }}>
              <PreviewPanel3D />
            </div>
          </section>

          {/* 3D Features Section */}
          <section className="mt-20 grid gap-6 md:grid-cols-3 transform-3d">
            {features.map((feature, index) => (
              <FeatureCard3D key={feature.title} {...feature} index={index} />
            ))}
          </section>

          {/* 3D CTA Section */}
          <section className="mt-16 transform-3d">
            <TiltCard3D className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-r from-purple-700/30 via-pink-600/30 to-orange-500/30 p-10 backdrop-blur-xl shadow-xl shadow-purple-600/20">
              <div className="absolute inset-0 bg-gradient-to-r from-white/10 via-white/0 to-white/10 opacity-40" />
              <div
                className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6"
                style={{ transform: 'translateZ(30px)' }}
              >
                <div style={{ transform: 'translateZ(20px)' }}>
                  <p className="text-sm uppercase tracking-[0.2em] text-white/70">Listo para empezar</p>
                  <h3 className="text-3xl font-bold text-white mt-2">
                    Publica en todas tus redes desde un solo lugar
                  </h3>
                  <p className="text-gray-200 mt-2 max-w-2xl">
                    Sube tu contenido una sola vez, elige en qué redes quieres publicarlo y AnyPost se encarga del
                    resto. Ahorra tiempo y mantén tu marca siempre activa.
                  </p>
                </div>
                <div className="flex items-center gap-3" style={{ transform: 'translateZ(30px)' }}>
                  <Link
                    to={primaryCta.to}
                    className="inline-flex items-center gap-2 rounded-xl bg-white text-gray-900 px-5 py-3 text-sm font-bold uppercase tracking-wide shadow-lg hover:scale-[1.02] transition"
                    style={{
                      transform: 'translateZ(40px)',
                      boxShadow: '0 10px 40px rgba(255, 255, 255, 0.2)',
                    }}
                  >
                    {primaryCta.label}
                  </Link>
                  {!currentUser && (
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 rounded-xl border border-white/40 px-5 py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
                      style={{ transform: 'translateZ(20px)' }}
                    >
                      Tengo cuenta
                    </Link>
                  )}
                </div>
              </div>
            </TiltCard3D>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Landing;
