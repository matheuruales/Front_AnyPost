import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backend';
import { ImageGenerationResponse } from '../types/backend';

const sizeOptions = [
  { value: '1024x1024', label: '1024 x 1024 (Cuadrada)' },
  { value: '1024x1792', label: '1024 x 1792 (Vertical)' },
  { value: '1792x1024', label: '1792 x 1024 (Horizontal)' },
];

const qualityOptions = [
  { value: 'standard', label: 'Estándar' },
  { value: 'hd', label: 'Alta definición' },
];

const styleOptions = [
  { value: 'vivid', label: 'Vívido' },
  { value: 'natural', label: 'Natural' },
];

const IMAGE_HISTORY_STORAGE_KEY = 'anypost-ai-image-history';
const MAX_HISTORY_ITEMS = 12;

type ImageHistoryEntry = ImageGenerationResponse;
type TargetOption = {
  value: string;
  label: string;
  color: string;
  icon: JSX.Element;
};

const TARGET_OPTIONS: TargetOption[] = [
  {
    value: 'youtube',
    label: 'YouTube',
    color: '#FF0000',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  {
    value: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
  },
  {
    value: 'facebook',
    label: 'Facebook',
    color: '#1877F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
  },
  {
    value: 'tiktok',
    label: 'TikTok',
    color: '#69C9D0',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" />
      </svg>
    ),
  },
  {
    value: 'twitter',
    label: 'Twitter',
    color: '#1DA1F2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  {
    value: 'linkedin',
    label: 'LinkedIn',
    color: '#0A66C2',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
];

type TargetValue = (typeof TARGET_OPTIONS)[number]['value'];

const TargetSwitch: React.FC<{
  option: TargetOption;
  active: boolean;
  onToggle: () => void;
}> = ({ option, active, onToggle }) => {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`group relative flex items-center gap-3 rounded-xl border px-5 py-4 text-sm font-bold uppercase tracking-wide transition-all duration-300 hover:scale-[1.02] ${
        active
          ? 'bg-white/10 text-white border-white/20 shadow-lg backdrop-blur-xl'
          : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:bg-white/10'
      }`}
    >
      <span
        className="flex h-10 w-10 items-center justify-center rounded-lg text-lg font-bold transition-all duration-300 group-hover:scale-110"
        style={{
          backgroundColor: active ? `${option.color}20` : 'transparent',
          color: option.color,
          border: `2px solid ${option.color}40`,
        }}
      >
        {option.icon}
      </span>
      <span className="transition-all duration-300 flex-1 text-left">{option.label}</span>
      <span
        className={`ml-auto flex h-6 w-12 items-center rounded-full px-1 transition-all duration-300 ${
          active ? 'bg-green-500' : 'bg-gray-700'
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition-all duration-300 shadow-lg ${
            active ? 'translate-x-7' : 'translate-x-0'
          }`}
        />
      </span>
    </button>
  );
};

const AIDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState(sizeOptions[0].value);
  const [quality, setQuality] = useState(qualityOptions[0].value);
  const [style, setStyle] = useState(styleOptions[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<ImageHistoryEntry | null>(null);
  const [history, setHistory] = useState<ImageHistoryEntry[]>([]);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [ownerId, setOwnerId] = useState('1');
  const [selectedTargets, setSelectedTargets] = useState<TargetValue[]>(['youtube']);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);
  const targetsPreview = useMemo(() => selectedTargets.join(', '), [selectedTargets]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const storedHistory = window.localStorage.getItem(IMAGE_HISTORY_STORAGE_KEY);
      if (storedHistory) {
        const parsed: ImageHistoryEntry[] = JSON.parse(storedHistory);
        setHistory(parsed);
        if (parsed.length > 0) {
          setGeneratedImage(parsed[0]);
        }
      }
    } catch (storageError) {
      console.warn('No se pudo recuperar el historial de imágenes', storageError);
    } finally {
      setHistoryLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!historyLoaded || typeof window === 'undefined') {
      return;
    }
    window.localStorage.setItem(IMAGE_HISTORY_STORAGE_KEY, JSON.stringify(history));
  }, [history, historyLoaded]);

  const handleGenerateImage = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setErrorMessage('Por favor describe la escena que quieres generar.');
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

      const nextResult: ImageHistoryEntry = {
        ...response,
        generatedAt: response.generatedAt ?? new Date().toISOString(),
      };

      setGeneratedImage(nextResult);
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.imageUrl !== nextResult.imageUrl);
        return [nextResult, ...filtered].slice(0, MAX_HISTORY_ITEMS);
      });
    } catch (error) {
      console.error('Error generando imagen', error);
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; error?: string } | string | undefined;
        let backendMessage: string | undefined;
        if (responseData && typeof responseData === 'object') {
          backendMessage = responseData.message || responseData.error;
        } else if (typeof responseData === 'string') {
          backendMessage = responseData;
        }
        setErrorMessage(backendMessage || 'No se pudo generar la imagen. Intenta nuevamente.');
      } else {
        setErrorMessage('Algo salió mal al generar la imagen.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownloadImage = () => {
    if (!generatedImage?.imageUrl) {
      return;
    }
    const link = document.createElement('a');
    link.href = generatedImage.imageUrl;
    link.setAttribute('download', `anypost-ai-${Date.now()}.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleHistorySelect = (entry: ImageHistoryEntry) => {
    setGeneratedImage(entry);
    setPrompt(entry.prompt);
    setSize(entry.size);
    setQuality(entry.quality);
    setStyle(entry.style);
    setErrorMessage(null);
  };

  const handleOpenImageInNewTab = () => {
    if (!generatedImage?.imageUrl) {
      return;
    }
    window.open(generatedImage.imageUrl, '_blank', 'noopener,noreferrer');
  };

  const handleClearHistory = () => {
    setHistory([]);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(IMAGE_HISTORY_STORAGE_KEY);
    }
  };

  const toggleTarget = (value: TargetValue) => {
    setSelectedTargets((prev) =>
      prev.includes(value) ? prev.filter((target) => target !== value) : [...prev, value]
    );
  };

  const convertBlobToJpeg = async (blob: Blob): Promise<Blob> => {
    if (blob.type === 'image/jpeg') {
      return blob;
    }

    return new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(blob);
      const image = new Image();

      image.onload = () => {
        URL.revokeObjectURL(objectUrl);
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const context = canvas.getContext('2d');

        if (!context) {
          reject(new Error('No se pudo preparar el lienzo para convertir la imagen.'));
          return;
        }

        context.drawImage(image, 0, 0);
        canvas.toBlob(
          (convertedBlob) => {
            if (!convertedBlob) {
              reject(new Error('No se pudo convertir la imagen generada a JPG.'));
              return;
            }
            resolve(convertedBlob);
          },
          'image/jpeg',
          0.92
        );
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error('No se pudo procesar la imagen generada para publicarla.'));
      };

      image.src = objectUrl;
    });
  };

  const createUploadFileFromGeneratedImage = async (image: ImageHistoryEntry) => {
    const blob = await backendApi.downloadGeneratedImage(image.imageUrl);

    if (!blob.size) {
      throw new Error('La imagen generada no contiene datos válidos.');
    }

    const jpegBlob = await convertBlobToJpeg(blob);
    return new File([jpegBlob], `anypost-ai-${Date.now()}.jpg`, { type: 'image/jpeg' });
  };

  const resetPublishForm = () => {
    setTitle('');
    setDescription('');
    setOwnerId('1');
    setSelectedTargets(['youtube']);
  };

  const publishGeneratedImage = async () => {
    if (!generatedImage) {
      throw new Error('Genera una imagen antes de publicarla.');
    }

    const file = await createUploadFileFromGeneratedImage(generatedImage);

    return backendApi.uploadVideoAsset({
      file,
      title: title.trim() || 'Imagen generada con IA',
      description: description.trim(),
      ownerId: Number(ownerId) || 1,
      targets: targetsPreview,
    });
  };

  const handlePublishImage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPublishSuccess(null);
    setPublishError(null);

    if (!generatedImage?.imageUrl) {
      setPublishError('Genera una imagen antes de intentar publicarla.');
      return;
    }

    if (!selectedTargets.length) {
      setPublishError('Selecciona al menos una red social.');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await publishGeneratedImage();
      setPublishSuccess(response);
      resetPublishForm();
    } catch (error) {
      console.error('Error al publicar imagen generada', error);
      const message =
        error instanceof Error ? error.message : 'No se pudo enviar la imagen. Intenta nuevamente.';
      setPublishError(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
      
      {/* Animated mesh gradient overlay */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Content wrapper */}
      <div className="relative z-10">
        {/* Enhanced Navbar */}
        <nav className="border-b border-white/5 bg-black/60 backdrop-blur-2xl">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex h-20 items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-md opacity-75"></div>
                  <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></div>
                </div>
                <p className="text-base font-bold uppercase tracking-[0.3em] bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                  Anypost
                </p>
              </div>
              
              <div className="flex items-center gap-6">
                {currentUser?.email && (
                  <div className="flex items-center gap-3 rounded-full bg-white/5 px-5 py-2.5 border border-white/10 backdrop-blur-xl">
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-green-500 blur-sm"></div>
                      <div className="relative h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <p className="text-sm text-gray-300">
                      <span className="text-gray-500">Conectado como</span>{' '}
                      <span className="font-semibold text-white">{currentUser.email}</span>
                    </p>
                  </div>
                )}
                
                <button
                  onClick={() => navigate('/creator-hub')}
                  className="group relative overflow-hidden rounded-xl bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 border border-white/10 hover:border-white/20"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                    Volver al hub
                  </span>
                </button>

                <button
                  onClick={handleLogout}
                  className="group relative overflow-hidden rounded-xl bg-white/5 px-6 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 border border-white/10 hover:border-white/20 hover:scale-105"
                >
                  <span className="relative z-10">Cerrar sesión</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                </button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Header */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 border border-white/10 backdrop-blur-xl">
                <span className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse"></span>
                <span className="text-xs font-medium uppercase tracking-[0.2em] text-gray-400">
                  Generador IA activo
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Laboratorio creativo
              </span>{' '}
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent">
                IA
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg max-w-3xl">
              Experimenta con prompts, genera imágenes en segundos y sincroniza tus assets con el resto del flujo creativo.
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
            {/* Left Column */}
            <div className="space-y-8">
              {/* Generator Card */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Paso 1</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[100px]"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Generador de imágenes con IA</h2>
                    <p className="text-sm text-white/60 mt-2">
                      Describe una escena, ajusta los parámetros y genera assets listos para tus campañas.
                    </p>
                  </div>

                  <div className="grid gap-8 lg:grid-cols-2">
                    {/* Form */}
                    <form className="space-y-6" onSubmit={handleGenerateImage}>
                      <div>
                        <label htmlFor="prompt" className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                          Descripción
                        </label>
                        <textarea
                          id="prompt"
                          value={prompt}
                          onChange={(event) => setPrompt(event.target.value)}
                          placeholder="Ej: Astronauta montando un corgi en un desfile futurista."
                          className="w-full h-32 rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl resize-none"
                          disabled={isGenerating}
                        />
                      </div>

                      <div className="grid gap-4 sm:grid-cols-3">
                        <div>
                          <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">Tamaño</label>
                          <select
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                            value={size}
                            onChange={(event) => setSize(event.target.value)}
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
                          <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">Calidad</label>
                          <select
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                            value={quality}
                            onChange={(event) => setQuality(event.target.value)}
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
                          <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">Estilo</label>
                          <select
                            className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
                            value={style}
                            onChange={(event) => setStyle(event.target.value)}
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

                      {errorMessage && (
                        <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 backdrop-blur-xl">
                          <p className="text-sm text-red-300">{errorMessage}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={isGenerating}
                        className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-4 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-purple-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="relative z-10 flex items-center justify-center gap-2">
                          {isGenerating ? (
                            <>
                              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Generando imagen...
                            </>
                          ) : (
                            <>
                              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                              </svg>
                              Generar imagen
                            </>
                          )}
                        </span>
                        <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                      </button>
                    </form>

                    {/* Preview */}
                    <div className="space-y-4">
                      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/30 p-4 backdrop-blur-xl">
                        <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-gray-900 to-black">
                          {generatedImage?.imageUrl ? (
                            <img
                              src={generatedImage.imageUrl}
                              alt={generatedImage.revisedPrompt || generatedImage.prompt}
                              className="h-full w-full object-cover"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full flex-col items-center justify-center gap-4 text-center text-white/50">
                              <span className="text-5xl">🖼️</span>
                              <p className="text-sm font-medium px-4">La imagen generada aparecerá aquí</p>
                            </div>
                          )}

                          {isGenerating && (
                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/70 text-white backdrop-blur-sm">
                              <svg className="h-8 w-8 animate-spin text-white" viewBox="0 0 24 24">
                                <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                <path
                                  className="opacity-80"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8v4l3-3-3-3v4A8 8 0 104 12z"
                                />
                              </svg>
                              <p className="text-sm font-medium">Generando magia visual...</p>
                            </div>
                          )}
                        </div>

                        {generatedImage && (
                          <div className="mt-4 space-y-4">
                            <div className="flex flex-wrap gap-2">
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">{generatedImage.size}</span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">{generatedImage.quality}</span>
                              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">{generatedImage.style}</span>
                            </div>
                            {generatedImage.revisedPrompt && (
                              <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-4 backdrop-blur-xl">
                                <p className="text-xs uppercase tracking-[0.3em] text-purple-400 mb-2">Prompt optimizado</p>
                                <p className="text-sm leading-relaxed text-white/80">{generatedImage.revisedPrompt}</p>
                              </div>
                            )}
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={handleDownloadImage}
                                disabled={!generatedImage.imageUrl}
                                className="flex-1 rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:opacity-50"
                              >
                                Descargar
                              </button>
                              <button
                                type="button"
                                onClick={handleOpenImageInNewTab}
                                disabled={!generatedImage.imageUrl}
                                className="flex-1 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/60 disabled:opacity-50"
                              >
                                Abrir
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* History */}
              {history.length > 0 && (
                <div className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-xl font-bold text-white">Historial reciente</h3>
                        <p className="text-sm text-white/60 mt-1">Tus últimos {MAX_HISTORY_ITEMS} renders</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleClearHistory}
                        className="text-sm font-semibold text-white/60 hover:text-white transition"
                      >
                        Limpiar
                      </button>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {history.map((item, index) => (
                        <button
                          type="button"
                          key={`${item.imageUrl}-${index}`}
                          onClick={() => handleHistorySelect(item)}
                          className="group/history overflow-hidden rounded-xl border border-white/10 bg-black/30 text-left transition hover:border-white/30 hover:scale-[1.02]"
                        >
                          <div className="relative aspect-square w-full overflow-hidden">
                            <img
                              src={item.imageUrl}
                              alt={item.revisedPrompt || item.prompt}
                              className="h-full w-full object-cover transition duration-500 group-hover/history:scale-105"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs text-white/70 line-clamp-2">{item.revisedPrompt || item.prompt}</p>
                            <div className="flex items-center gap-2 mt-2 text-xs text-white/40">
                              <span>{item.size.split('x')[0]}</span>
                              <span>•</span>
                              <span>{item.style}</span>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Publish Form */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Paso 2</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[100px]"></div>
                    </div>
                    <h2 className="text-2xl font-bold text-white">Publicar imagen</h2>
                    <p className="text-sm text-white/60 mt-2">
                      Envía tu asset directamente al backend para distribuirlo en múltiples plataformas
                    </p>
                  </div>

                  <form className="space-y-6" onSubmit={handlePublishImage}>
                    {/* Social Networks */}
                    <div>
                      <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                        Redes sociales
                      </label>
                      <div className="grid gap-3 md:grid-cols-2">
                        {TARGET_OPTIONS.map((option) => (
                          <TargetSwitch
                            key={option.value}
                            option={option}
                            active={selectedTargets.includes(option.value)}
                            onToggle={() => toggleTarget(option.value)}
                          />
                        ))}
                      </div>
                      <p className="mt-3 text-xs text-white/50">
                        Seleccionadas: {selectedTargets.length ? targetsPreview : 'ninguna'}
                      </p>
                    </div>

                    {/* Details */}
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                          Título
                        </label>
                        <input
                          type="text"
                          value={title}
                          onChange={(event) => setTitle(event.target.value)}
                          placeholder="Ej: Campaña IA Neon"
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                          Owner ID
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={ownerId}
                          onChange={(event) => setOwnerId(event.target.value)}
                          className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                        Descripción
                      </label>
                      <textarea
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Breve resumen para tus colaboradores."
                        className="h-24 w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl resize-none"
                      />
                    </div>

                    {publishError && (
                      <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 backdrop-blur-xl">
                        <p className="text-sm text-red-300">{publishError}</p>
                      </div>
                    )}
                    {publishSuccess && (
                      <div className="rounded-xl bg-green-500/10 border border-green-500/30 px-4 py-3 backdrop-blur-xl">
                        <p className="text-sm text-green-300">{publishSuccess}</p>
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={!generatedImage?.imageUrl || isPublishing}
                      className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-8 py-5 text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      <span className="relative z-10 flex items-center justify-center gap-3">
                        {isPublishing ? (
                          <>
                            <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Enviando asset...
                          </>
                        ) : (
                          <>
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Publicar imagen generada
                            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </>
                        )}
                      </span>
                      <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                    {!generatedImage?.imageUrl && (
                      <p className="text-xs text-white/40 text-center">
                        Genera y selecciona una imagen antes de publicar
                      </p>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
              {/* Status */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Estado</span>
                  </div>
                  <div className="rounded-xl bg-black/40 border border-white/10 p-4 backdrop-blur-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                      <p className="text-lg font-bold text-white">Generador activo</p>
                    </div>
                    <p className="text-sm text-white/60">
                      El generador de imágenes IA está operativo y listo para crear
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Notes */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Guía rápida</span>
                  </div>
                  <ul className="space-y-3">
                    {[
                      'Describe tu idea en el prompt y ajusta los parámetros',
                      'Genera la imagen y revisa el resultado',
                      'Publica directamente en tus redes sociales'
                    ].map((note, index) => (
                      <li key={index} className="flex items-start gap-3 rounded-xl bg-black/40 border border-white/10 p-3 backdrop-blur-xl">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-xs font-bold text-purple-400 border border-purple-500/30">
                          {index + 1}
                        </span>
                        <p className="text-sm text-white/70 leading-relaxed">{note}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Next Step */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)] text-center">
                  <div className="mb-4">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Siguiente paso</span>
                  </div>
                  <p className="text-sm text-white/70 leading-relaxed mb-6">
                    Vuelve al hub para elegir otro flujo o ve al dashboard clásico
                  </p>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="group/btn relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-3 text-sm font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-lg shadow-black/50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Ir al dashboard
                      <svg className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover/btn:translate-y-0 transition-transform duration-300"></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
