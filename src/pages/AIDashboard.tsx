import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Loader from '../components/ui/Loader';
import { backendApi } from '../services/backend';
import { ImageGenerationResponse } from '../types/backend';
import { useAuth } from '../hooks/useAuth';

const sizeOptions = [
  { value: '1024x1024', label: '1024 x 1024 (Cuadrada)' },
  { value: '1024x1792', label: '1024 x 1792 (Vertical)' },
  { value: '1792x1024', label: '1792 x 1024 (Horizontal)' },
];

const qualityOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'hd', label: 'Alta Definición' },
];

const styleOptions = [
  { value: 'vivid', label: 'Vivid' },
  { value: 'natural', label: 'Natural' },
];

type PromptEntry = {
  id: string;
  prompt: string;
  size: string;
  quality: string;
  style: string;
  imageUrl?: string;
  timestamp: number;
};

const PROMPT_HISTORY_STORAGE_KEY = 'anypost-prompt-history-v2';
const MAX_HISTORY_ITEMS = 30;

const AIDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();

  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState(sizeOptions[0].value);
  const [quality, setQuality] = useState(qualityOptions[0].value);
  const [style, setStyle] = useState(styleOptions[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<PromptEntry[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = window.localStorage.getItem(PROMPT_HISTORY_STORAGE_KEY);
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (err) {
      console.warn('No se pudo cargar el historial', err);
    }
  }, []);

  const saveHistory = useCallback(
    (entries: PromptEntry[]) => {
      if (typeof window === 'undefined') return;
      try {
        window.localStorage.setItem(PROMPT_HISTORY_STORAGE_KEY, JSON.stringify(entries));
      } catch (err) {
        console.warn('No se pudo guardar el historial', err);
      }
    },
    [],
  );

  const handlePromptSelect = (entry: PromptEntry) => {
    setPrompt(entry.prompt);
    setSize(entry.size);
    setQuality(entry.quality);
    setStyle(entry.style);
    if (entry.imageUrl) {
      setGeneratedImage({
        prompt: entry.prompt,
        imageUrl: entry.imageUrl,
        size: entry.size,
        quality: entry.quality,
        style: entry.style,
      });
    }
    setErrorMessage(null);
  };

  const handleGenerateImage = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setErrorMessage('Escribe el prompt para generar la imagen.');
      return;
    }

    setIsGenerating(true);
    setErrorMessage(null);

    try {
      const response = await backendApi.generateImageFromPrompt({
        prompt: trimmedPrompt,
        size,
        quality,
        style,
      });

      setGeneratedImage(response);

      const entry: PromptEntry = {
        id: `prompt-${Date.now()}`,
        prompt: trimmedPrompt,
        size,
        quality,
        style,
        imageUrl: response.imageUrl,
        timestamp: Date.now(),
      };

      const nextHistory = [entry, ...history].slice(0, MAX_HISTORY_ITEMS);
      setHistory(nextHistory);
      saveHistory(nextHistory);
    } catch (error) {
      console.error('Error generando imagen', error);
      setErrorMessage('No pudimos generar la imagen. Intenta de nuevo.');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage?.imageUrl) return;
    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    link.download = 'anypost-image.png';
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const heroBadge = useMemo(() => {
    if (!currentUser?.email) return 'Generador IA';
    return `Hola, ${currentUser.email.split('@')[0]}`;
  }, [currentUser]);

  if (loading) return <Loader />;

  return (
    <Layout>
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900" />
        <div className="fixed inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <button
                onClick={() => navigate('/creator-hub')}
                className="group relative overflow-hidden rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 border border-white/10 hover:border-white/20"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver
                </span>
              </button>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-md opacity-75"></div>
                <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></div>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">{heroBadge}</p>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Genera imágenes con IA
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Ingresa tu prompt, elige las características y genera la imagen. Se eliminó la publicación: aquí solo creas y descargas.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            {/* Left column */}
            <div className="space-y-6">
              <form onSubmit={handleGenerateImage} className="space-y-6">
                {/* Prompt input */}
                <div className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                  <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-white/40">Paso 1</p>
                        <h2 className="text-xl font-bold text-white mt-1">Escribe tu prompt</h2>
                      </div>
                      <span className="text-xs text-gray-500">Solo generación, sin publicación</span>
                    </div>
                    <div className="relative">
                      <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="Ej: Una foto de estudio, fondo negro, luz lateral, retrato dramático de un músico con guitarra."
                        className="w-full h-32 rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl resize-none"
                        disabled={isGenerating}
                      />
                      <button
                        type="submit"
                        disabled={isGenerating || !prompt.trim()}
                        className="absolute bottom-4 right-4 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-4 py-2 text-sm font-semibold text-white transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? 'Generando...' : 'Generar'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Options */}
                <div className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                  <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                    <div className="mb-4">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/40">Paso 2</p>
                      <h2 className="text-xl font-bold text-white mt-1">Configura la imagen</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Tamaño</label>
                        <select
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                          value={size}
                          onChange={(e) => setSize(e.target.value)}
                          disabled={isGenerating}
                        >
                          {sizeOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-gray-900">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Calidad</label>
                        <select
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                          value={quality}
                          onChange={(e) => setQuality(e.target.value)}
                          disabled={isGenerating}
                        >
                          {qualityOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-gray-900">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Estilo</label>
                        <select
                          className="w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white focus:border-white/30 focus:outline-none"
                          value={style}
                          onChange={(e) => setStyle(e.target.value)}
                          disabled={isGenerating}
                        >
                          {styleOptions.map((option) => (
                            <option key={option.value} value={option.value} className="bg-gray-900">
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 backdrop-blur-xl text-sm text-red-300">
                    {errorMessage}
                  </div>
                )}

                {/* History */}
                <div className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                  <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-xl font-bold text-white">Historial de prompts</h2>
                      {history.length > 0 && (
                        <button
                          type="button"
                          onClick={() => {
                            setHistory([]);
                            saveHistory([]);
                          }}
                          className="text-xs text-gray-500 hover:text-white transition-colors"
                        >
                          Limpiar historial
                        </button>
                      )}
                    </div>
                    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                      {history.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-3">Aún no hay prompts guardados.</p>
                      ) : (
                        history.map((entry) => (
                          <button
                            key={entry.id}
                            type="button"
                            onClick={() => handlePromptSelect(entry)}
                            className="w-full text-left rounded-lg border border-white/10 bg-black/20 px-3 py-2 hover:bg-black/40 hover:border-white/20 transition-all group"
                          >
                            <p className="text-xs text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                              {entry.prompt}
                            </p>
                            <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                              <span>{entry.size}</span>
                              <span>•</span>
                              <span>{entry.style}</span>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Right column */}
            <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="text-center mb-4">
                    <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Preview</p>
                    <p className="text-xs text-gray-500">
                      {generatedImage ? 'Imagen lista' : 'Sin imagen generada'}
                    </p>
                  </div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900 to-black shadow-inner">
                    {generatedImage?.imageUrl ? (
                      <>
                        <img
                          src={generatedImage.imageUrl}
                          alt={generatedImage.revisedPrompt || generatedImage.prompt}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                        {isGenerating && (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/70 text-white backdrop-blur-sm">
                            <svg className="h-6 w-6 animate-spin text-white" viewBox="0 0 24 24">
                              <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                              <path
                                className="opacity-80"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 104 12z"
                              />
                            </svg>
                            <p className="text-xs font-medium">Generando...</p>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white/50 px-6">
                        <span className="text-4xl">🖼️</span>
                        <p className="text-xs font-medium">La imagen aparecerá aquí</p>
                        <p className="text-[11px] text-gray-500">No se publicará, solo puedes descargarla.</p>
                      </div>
                    )}
                  </div>

                  {generatedImage && (
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{generatedImage.size}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{generatedImage.quality}</span>
                        <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">{generatedImage.style}</span>
                      </div>
                      <button
                        type="button"
                        onClick={downloadImage}
                        className="rounded-lg bg-white text-gray-900 px-4 py-2 text-xs font-semibold transition hover:scale-105"
                      >
                        Descargar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AIDashboard;
