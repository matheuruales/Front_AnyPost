import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';

const actionCards = [
  {
    id: 'upload',
    title: 'Añadir video / imagen desde escritorio',
    label: 'Subir desde tu dispositivo',
    description: 'Carga un video o imagen que ya tengas preparado y continúa con el flujo actual de publicación.',
    glow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]',
    hoverGlow: 'shadow-[0_0_0_1px_rgba(168,85,247,0.3),0_12px_60px_rgba(168,85,247,0.2),0_0_80px_rgba(236,72,153,0.15)]',
    icon: (
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-xl"></div>
        <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 text-2xl text-white backdrop-blur border border-purple-500/30">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M14 2V8H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 18V12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M9 15H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    ),
    navigateTo: '/upload-from-pc',
    cta: 'Añadir desde escritorio',
    gradient: 'from-gray-900/50 via-gray-800/40 to-gray-900/50',
    accentColor: 'from-purple-600 via-pink-600 to-orange-600',
  },
  {
    id: 'ai',
    title: 'Crear con IA (Sora GPT)',
    label: 'Nuevo flujo creativo',
    description: 'Explora ideas, prompts y plantillas generadas por IA. Esta sección es solo un adelanto visual.',
    glow: 'shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]',
    hoverGlow: 'shadow-[0_0_0_1px_rgba(168,85,247,0.3),0_12px_60px_rgba(168,85,247,0.2),0_0_80px_rgba(236,72,153,0.15)]',
    icon: (
      <div className="relative flex h-20 w-20 items-center justify-center">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/30 via-pink-500/30 to-orange-500/30 blur-xl"></div>
        <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600/20 via-pink-600/20 to-orange-600/20 text-2xl text-white backdrop-blur border border-purple-500/30">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    ),
    navigateTo: '/ai-dashboard',
    cta: 'Generar con IA',
    gradient: 'from-gray-900/50 via-gray-800/40 to-gray-900/50',
    accentColor: 'from-purple-600 via-pink-600 to-orange-600',
  },
] as const;

const CreatorHub: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  return (
    <Layout>
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
        
        {/* Animated mesh gradient overlay */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Content wrapper */}
        <div className="relative z-10">
          {/* Main Content */}
          <div className="mx-auto max-w-7xl px-6 py-16">
          {/* Enhanced Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 mb-6 border border-white/10 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                Centro de creación
              </span>
            </div>
            
            <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                ¿Qué quieres hacer
              </span>
              <br />
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                hoy?
              </span>
            </h1>
            
            <p className="text-gray-400 text-xl max-w-2xl mx-auto leading-relaxed">
              Selecciona una opción para comenzar tu próxima{' '}
              <span className="text-white font-medium">creación</span>
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => navigate('/dashboard')}
              className="group relative overflow-hidden rounded-xl bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 border border-white/10 hover:border-white/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                View Video History
              </span>
            </button>
          </div>

          {/* Enhanced Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-20">
            {actionCards.map((card, index) => (
              <button
                key={card.id}
                onClick={() => navigate(card.navigateTo)}
                className={`group relative w-full h-[600px] flex flex-col rounded-3xl bg-gradient-to-br ${card.gradient} p-8 text-left transition-all duration-700 hover:scale-[1.03] border border-white/10 backdrop-blur-xl ${card.glow} hover:${card.hoverGlow}`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Animated gradient border on hover */}
                <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                  <div className={`absolute inset-0 rounded-3xl bg-gradient-to-r ${card.accentColor} opacity-20 blur-xl`}></div>
                </div>

                {/* Shimmer effect */}
                <div className="absolute inset-0 rounded-3xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                </div>
                
                <div className="relative z-10 flex flex-col h-full">
                  {/* Enhanced Header */}
                  <div className="flex items-center justify-between mb-8">
                    <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/40 group-hover:text-white/60 transition-colors">
                      {card.label}
                    </span>
                    <span className="rounded-full bg-white/10 px-4 py-1.5 text-xs font-bold text-white/50 transition-all group-hover:bg-white/20 group-hover:text-white/80 border border-white/20 group-hover:scale-110">
                      Paso 1
                    </span>
                  </div>

                  {/* Main Content - Perfectly Centered */}
                  <div className="flex-1 flex flex-col justify-center space-y-6">
                    {/* Icon */}
                    <div className="flex justify-center transform group-hover:scale-110 transition-transform duration-500">
                      {card.icon}
                    </div>
                    
                    {/* Title */}
                    <h2 className="text-2xl font-bold leading-tight text-white text-center px-2 group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:bg-clip-text group-hover:from-white group-hover:to-gray-300 transition-all duration-300">
                      {card.title}
                    </h2>

                    {/* Description */}
                    <p className="text-sm leading-relaxed text-white/50 group-hover:text-white/70 text-center px-2 transition-colors duration-300">
                      {card.description}
                    </p>

                    {/* Enhanced Summary Box */}
                    <div className="relative rounded-2xl bg-black/40 p-5 border border-white/10 group-hover:border-white/20 backdrop-blur-xl transition-all duration-300 group-hover:bg-black/60">
                      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${card.accentColor} opacity-0 group-hover:opacity-5 blur-xl transition-opacity duration-300`}></div>
                      
                      <p className="relative text-xs font-bold uppercase tracking-[0.3em] text-white/30 group-hover:text-white/50 text-center mb-2 transition-colors">
                        Resumen
                      </p>
                      <p className="relative text-sm text-white/40 group-hover:text-white/60 leading-relaxed text-center transition-colors">
                        {card.id === 'upload'
                          ? 'Ideal para subir assets existentes y gestionar su distribución.'
                          : 'Explora la futura experiencia creativa impulsada por IA.'}
                      </p>
                    </div>
                  </div>

                  {/* Enhanced Footer */}
                  <div className="mt-8 flex items-center justify-between pt-5 border-t border-white/10 group-hover:border-white/20 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase tracking-[0.3em] text-white/20 group-hover:text-white/40 transition-colors">
                        Continuar
                      </span>
                      <svg 
                        className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    
                    <span className={`relative overflow-hidden rounded-xl bg-gradient-to-r ${card.accentColor} px-6 py-2.5 text-xs font-bold uppercase tracking-wide text-white transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg shadow-black/50`}>
                      <span className="relative z-10">{card.cta}</span>
                      <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Enhanced Footer */}
          <div className="text-center space-y-6">
            {/* Quick Stats */}
            <div className="flex items-center justify-center gap-8 mb-8">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                <span className="text-xs text-gray-500">Sistema operativo</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                <span className="text-xs text-gray-500">2 flujos disponibles</span>
              </div>
            </div>

            <div className="h-px w-32 mx-auto bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            
            <p className="text-xs text-white/20 font-medium">
              Anypost © 2024 · Tu plataforma de creación de contenido
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CreatorHub;
