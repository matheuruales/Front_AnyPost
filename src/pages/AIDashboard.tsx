import React, { useEffect, useMemo, useState, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backend';
import { ImageGenerationResponse } from '../types/backend';
import { PromptHistoryStack, PromptEntry } from '../data-structures/PromptHistoryStack';
import Loader from '../components/ui/Loader';

const sizeOptions = [
  { value: '1024x1024', label: '1024 x 1024 (Square)' },
  { value: '1024x1792', label: '1024 x 1792 (Vertical)' },
  { value: '1792x1024', label: '1792 x 1024 (Horizontal)' },
];

const qualityOptions = [
  { value: 'standard', label: 'Standard' },
  { value: 'hd', label: 'High Definition' },
];

const styleOptions = [
  { value: 'vivid', label: 'Vivid' },
  { value: 'natural', label: 'Natural' },
];

const PROMPT_HISTORY_STORAGE_KEY = 'anypost-prompt-history';
const MAX_HISTORY_ITEMS = 50;

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

const AIDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout, currentUser } = useAuth();
  
  const [prompt, setPrompt] = useState('');
  const [size, setSize] = useState(sizeOptions[0].value);
  const [quality, setQuality] = useState(qualityOptions[0].value);
  const [style, setStyle] = useState(styleOptions[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<ImageGenerationResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [descriptionCharCount, setDescriptionCharCount] = useState(0);
  const MAX_DESCRIPTION_LENGTH = 500;
  const [selectedTargets, setSelectedTargets] = useState<TargetValue[]>(['youtube']);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  // Initialize prompt history stack
  const promptHistory = useMemo(() => new PromptHistoryStack(MAX_HISTORY_ITEMS), []);

  // Load prompt history from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const stored = window.localStorage.getItem(PROMPT_HISTORY_STORAGE_KEY);
      if (stored) {
        const parsed: PromptEntry[] = JSON.parse(stored);
        parsed.forEach(entry => promptHistory.push(entry));
      }
    } catch (error) {
      console.warn('Failed to load prompt history', error);
    }
  }, [promptHistory]);

  // Save prompt history to localStorage
  const savePromptHistory = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const allPrompts = promptHistory.getAll();
      window.localStorage.setItem(PROMPT_HISTORY_STORAGE_KEY, JSON.stringify(allPrompts));
    } catch (error) {
      console.warn('Failed to save prompt history', error);
    }
  }, [promptHistory]);

  const targetsPreview = useMemo(() => selectedTargets.join(', '), [selectedTargets]);

  const toggleTarget = (value: TargetValue) => {
    setSelectedTargets((prev) =>
      prev.includes(value) ? prev.filter((target) => target !== value) : [...prev, value]
    );
  };

  const handleGenerateImage = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const trimmedPrompt = prompt.trim();
    if (!trimmedPrompt) {
      setErrorMessage('Please describe the scene you want to generate.');
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

      // Add to prompt history
      const promptEntry: PromptEntry = {
        id: `prompt-${Date.now()}-${Math.random()}`,
        prompt: trimmedPrompt,
        size,
        quality,
        style,
        timestamp: Date.now(),
        imageUrl: response.imageUrl,
      };
      promptHistory.push(promptEntry);
      savePromptHistory();
    } catch (error) {
      console.error('Error generating image', error);
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as { message?: string; error?: string } | string | undefined;
        let backendMessage: string | undefined;
        if (responseData && typeof responseData === 'object') {
          backendMessage = responseData.message || responseData.error;
        } else if (typeof responseData === 'string') {
          backendMessage = responseData;
        }
        setErrorMessage(backendMessage || 'Failed to generate image. Please try again.');
      } else {
        setErrorMessage('Something went wrong while generating the image.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

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
          reject(new Error('Could not prepare canvas for image conversion.'));
          return;
        }

        context.drawImage(image, 0, 0);
        canvas.toBlob(
          (convertedBlob) => {
            if (!convertedBlob) {
              reject(new Error('Could not convert generated image to JPG.'));
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
        reject(new Error('Could not process generated image for publishing.'));
      };

      image.src = objectUrl;
    });
  };

  const createUploadFileFromGeneratedImage = async (image: ImageGenerationResponse) => {
    const blob = await backendApi.downloadGeneratedImage(image.imageUrl);

    if (!blob.size) {
      throw new Error('Generated image does not contain valid data.');
    }

    const jpegBlob = await convertBlobToJpeg(blob);
    return new File([jpegBlob], `anypost-ai-${Date.now()}.jpg`, { type: 'image/jpeg' });
  };

  const handlePublishImage = async () => {
    setPublishSuccess(null);
    setPublishError(null);

    if (!generatedImage?.imageUrl) {
      setPublishError('Generate an image before trying to publish it.');
      return;
    }

    if (!selectedTargets.length) {
      setPublishError('Select at least one social network.');
      return;
    }

    if (!title.trim()) {
      setPublishError('Please enter a title.');
      return;
    }

    setIsPublishing(true);
    try {
      const file = await createUploadFileFromGeneratedImage(generatedImage);

      const response = await backendApi.uploadVideoAsset({
        file,
        title: title.trim(),
        description: description.trim(),
        authUserId: currentUser!.uid,
        targets: targetsPreview,
      });

      setPublishSuccess('Image published successfully!');
      
      // Reset form
      setTitle('');
      setDescription('');
      setDescriptionCharCount(0);
      setSelectedTargets(['youtube']);
      
      // Navigate to dashboard after 2 seconds
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error publishing generated image', error);
      const message =
        error instanceof Error ? error.message : 'Could not publish image. Please try again.';
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
      console.error('Error logging out:', error);
    }
  };

  const allPrompts = promptHistory.getAll();

  return (
    <div className="relative min-h-screen bg-black text-white overflow-hidden">
      <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
      
      <div className="fixed inset-0 opacity-30">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-12">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/creator-hub')}
              className="group relative overflow-hidden rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 border border-white/10 hover:border-white/20"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Hub
              </span>
            </button>
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-md opacity-75"></div>
              <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></div>
            </div>
            <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">Anypost AI</p>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
              AI Creative Lab
            </span>
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <p className="text-gray-400 text-lg max-w-2xl">
              Generate images with AI, experiment with prompts and publish directly to your social networks.
            </p>
            
            {/* Social Media Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              {TARGET_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleTarget(option.value)}
                  className={`group relative flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wide transition-all duration-300 ${
                    selectedTargets.includes(option.value)
                      ? 'bg-white/10 text-white border-white/20 shadow-lg'
                      : 'bg-white/5 text-gray-400 border-white/10 hover:border-white/20 hover:bg-white/10'
                  }`}
                >
                  <span
                    className="flex h-5 w-5 items-center justify-center rounded transition-all duration-300"
                    style={{
                      backgroundColor: selectedTargets.includes(option.value) ? `${option.color}20` : 'transparent',
                      color: option.color,
                    }}
                  >
                    {option.icon}
                  </span>
                  <span className="hidden lg:inline">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area - Grid Layout like UploadFromPC */}
        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Left Panel - History, Prompt Input, Options */}
          <div className="space-y-6">
            <form onSubmit={handleGenerateImage} className="space-y-6">
              {/* Prompt History - Above Input (Stack LIFO) */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Previous</span>
                        <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[100px]"></div>
                      </div>
                      <h2 className="text-xl font-bold text-white">Prompt History</h2>
                    </div>
                    {allPrompts.length > 0 && (
                      <button
                        onClick={() => {
                          promptHistory.clear();
                          savePromptHistory();
                        }}
                        className="text-xs text-gray-500 hover:text-white transition-colors"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {allPrompts.length === 0 ? (
                      <p className="text-xs text-gray-500 text-center py-4">No previous prompts</p>
                    ) : (
                      allPrompts.map((entry) => (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => handlePromptSelect(entry)}
                          className="w-full text-left rounded-lg border border-white/10 bg-black/20 px-3 py-2 hover:bg-black/40 hover:border-white/20 transition-all group"
                        >
                          <p className="text-xs text-white line-clamp-1 group-hover:text-purple-300 transition-colors">
                            {entry.prompt}
                          </p>
                          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-500">
                            <span className="text-[10px]">{entry.size.split('x')[0]}</span>
                            <span className="text-[10px]">•</span>
                            <span className="text-[10px]">{entry.style}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Prompt Input */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Step 1</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[100px]"></div>
                    </div>
                    <h2 className="text-xl font-bold text-white">What do you want to do today?</h2>
                  </div>
                  
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="E.g. Give me a video to promote a puppy costume party event."
                      className="w-full h-32 rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-sm text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl resize-none"
                      disabled={isGenerating}
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-xl backdrop-blur-sm">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          <p className="text-xs text-white font-medium">Generating image...</p>
                        </div>
                      </div>
                    )}
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim()}
                      className="absolute bottom-4 right-4 rounded-lg bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 p-2 text-white transition-all hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGenerating ? (
                        <svg className="animate-spin w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Options */}
              <div className="group relative">
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                
                <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Step 2</span>
                      <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[100px]"></div>
                    </div>
                    <h2 className="text-xl font-bold text-white">Generation Options</h2>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-gray-500 mb-2 block">Size</label>
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
                      <label className="text-xs text-gray-500 mb-2 block">Quality</label>
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
                      <label className="text-xs text-gray-500 mb-2 block">Style</label>
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

              {/* Error Message */}
              {errorMessage && (
                <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 backdrop-blur-xl">
                  <p className="text-sm text-red-300">{errorMessage}</p>
                </div>
              )}
            </form>
          </div>

          {/* Right Panel - Image Viewer and Upload */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            {/* Image Viewer */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="text-center mb-4">
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 mb-2">Preview</p>
                  <p className="text-xs text-gray-500">
                    Generated Image {generatedImage ? '· Ready' : '· No image'}
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
                          <p className="text-xs font-medium">Generating...</p>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-center text-white/50">
                      <span className="text-4xl">🖼️</span>
                      <p className="text-xs font-medium px-4">Generated image will appear here</p>
                    </div>
                  )}
                </div>

                {generatedImage && (
                  <div className="mt-4 space-y-3">
                    <div className="flex flex-wrap gap-2 justify-center">
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                        {generatedImage.size}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                        {generatedImage.quality}
                      </span>
                      <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/60">
                        {generatedImage.style}
                      </span>
                    </div>
                    {generatedImage.revisedPrompt && (
                      <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 p-3 backdrop-blur-xl">
                        <p className="text-xs uppercase tracking-[0.3em] text-purple-400 mb-2">Optimized Prompt</p>
                        <p className="text-sm leading-relaxed text-white/80 line-clamp-2">{generatedImage.revisedPrompt}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Title and Description */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">Step 3</span>
                    <div className="h-px flex-1 bg-gradient-to-r from-white/20 to-transparent max-w-[100px]"></div>
                  </div>
                  <h2 className="text-xl font-bold text-white">Content Details</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 block">
                      Publication Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter your campaign title"
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl"
                      required
                    />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <label className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 block">
                        Description
                      </label>
                      <span className={`text-xs font-medium ${
                        descriptionCharCount > MAX_DESCRIPTION_LENGTH 
                          ? 'text-red-400' 
                          : descriptionCharCount > MAX_DESCRIPTION_LENGTH * 0.9 
                          ? 'text-yellow-400' 
                          : 'text-gray-500'
                      }`}>
                        {descriptionCharCount} / {MAX_DESCRIPTION_LENGTH}
                      </span>
                    </div>
                    <textarea
                      value={description}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (value.length <= MAX_DESCRIPTION_LENGTH) {
                          setDescription(value);
                          setDescriptionCharCount(value.length);
                        }
                      }}
                      maxLength={MAX_DESCRIPTION_LENGTH}
                      placeholder="Write the main copy or additional notes..."
                      className="h-32 w-full rounded-xl border border-white/10 bg-black/40 px-5 py-4 text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Upload Button and Status */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`relative h-3 w-3 rounded-full ${
                    publishSuccess ? 'bg-green-500' : 
                    publishError ? 'bg-red-500' : 
                    'bg-blue-500'
                  }`}>
                    <div className={`absolute inset-0 rounded-full animate-pulse ${
                      publishSuccess ? 'bg-green-500' : 
                      publishError ? 'bg-red-500' : 
                      'bg-blue-500'
                    } blur-md`}></div>
                  </div>
                  <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400">Status</p>
                </div>
                
                <div className={`rounded-xl p-4 text-sm transition-all duration-300 backdrop-blur-xl mb-4 ${
                  publishSuccess 
                    ? 'bg-green-500/10 text-green-300 border border-green-500/30' 
                    : publishError 
                    ? 'bg-red-500/10 text-red-300 border border-red-500/30'
                    : 'bg-blue-500/10 text-blue-300 border border-blue-500/30'
                }`}>
                  <div className="flex items-start gap-3">
                    <span className="text-xl flex-shrink-0">
                      {publishSuccess ? '✅' : publishError ? '❌' : '⚡'}
                    </span>
                    <p className="font-medium leading-relaxed">
                      {publishSuccess
                        ? publishSuccess
                        : publishError
                        ? publishError
                        : 'Ready to publish. Generate an image and complete the form.'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handlePublishImage}
                  disabled={!generatedImage?.imageUrl || isPublishing || !title.trim()}
                  className="group relative w-full overflow-hidden rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-8 py-5 text-base font-bold uppercase tracking-wide text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  <span className="relative z-10 flex items-center justify-center gap-3">
                    {isPublishing ? (
                      <>
                        <svg className="animate-spin h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Publishing...
                      </>
                    ) : (
                      <>
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        Publish image to social networks
                        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIDashboard;
