import React, { useEffect, useRef, useState } from 'react';
import { UserPost } from '../types/backend';
import { backendApi } from '../services/backend';

// Helper to get streaming URL for videos
const getStreamingUrl = (videoUrl: string | null | undefined): string | undefined => {
  if (!videoUrl) return undefined;
  if (videoUrl.includes('/videos/stream?url=')) return videoUrl;
  return backendApi.getVideoStreamUrl(videoUrl);
};

interface MediaViewerModalProps {
  post: UserPost | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

const MediaViewerModal: React.FC<MediaViewerModalProps> = ({
  post,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    if (isOpen && post && videoRef.current) {
      // Auto-play video when modal opens
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked by browser
        setIsPlaying(false);
      });
    }
  }, [isOpen, post]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Asegurar que el modal esté por encima de todo
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.documentElement.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleDownload = () => {
    if (!post) return;

    const hasImage = Boolean(post.imageUrl || post.thumbnail);
    const urlToDownload = hasImage ? (post.imageUrl || post.thumbnail) : post.videoUrl;
    if (!urlToDownload) return;

    const proxiedUrl = hasImage ? urlToDownload : getStreamingUrl(urlToDownload);
    if (!proxiedUrl) return;

    const link = document.createElement('a');
    link.href = proxiedUrl;
    const extension = post.videoUrl ? 'mp4' : (post.imageUrl ? 'jpg' : 'jpg');
    link.download = `${post.title.replace(/[^a-z0-9]/gi, '_')}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      published: 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-300 border-green-500/40 shadow-lg shadow-green-500/10',
      pending: 'bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-300 border-yellow-500/40 shadow-lg shadow-yellow-500/10',
      failed: 'bg-gradient-to-r from-red-500/20 to-pink-500/20 text-red-300 border-red-500/40 shadow-lg shadow-red-500/10',
      draft: 'bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-300 border-gray-500/40 shadow-lg shadow-gray-500/10',
    };
    return statusColors[status.toLowerCase()] || statusColors.draft;
  };

  if (!isOpen || !post) return null;

  const unwrapStreamUrl = (url: string | undefined | null): string | undefined => {
    if (!url) return undefined;
    try {
      const parsed = new URL(url);
      const nested = parsed.searchParams.get('url');
      if (nested) return decodeURIComponent(nested);
    } catch {
      // fallback to original
    }
    return url;
  };

  const isLikelyImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    const clean = url.split('?')[0];
    return /\.(png|jpe?g|gif|webp|svg|heic|heif)$/i.test(clean);
  };

  const primaryImage = unwrapStreamUrl(post.imageUrl);
  const thumbnail = unwrapStreamUrl(post.thumbnail);
  const rawVideo = post.videoUrl;
  const unwrappedVideo = unwrapStreamUrl(rawVideo);

  const posterImage = primaryImage || thumbnail || (isLikelyImageUrl(unwrappedVideo) ? unwrappedVideo : undefined);

  const hasVideo = Boolean(rawVideo && !isLikelyImageUrl(unwrappedVideo));
  const mediaUrl = hasVideo
    ? getStreamingUrl(rawVideo || '')
    : (posterImage || '');
  const isVideo = hasVideo;

  return (
    <div 
      ref={modalRef}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      {/* Enhanced Backdrop with Gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-purple-900/40 via-black/95 to-indigo-900/40 backdrop-blur-2xl"
        onClick={onClose}
      />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-r from-blue-600/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Modal Container */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto flex flex-col">
        {/* Enhanced Header Bar */}
        <div className="flex items-center justify-between p-4 md:p-6 mb-4 md:mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="group relative rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 p-3 text-white transition-all duration-300 hover:scale-110 hover:from-purple-600/30 hover:to-pink-600/30 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/50 shadow-2xl shadow-purple-500/20"
            >
              <svg className="w-6 h-6 transform group-hover:rotate-90 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="hidden md:block">
              <h1 className="text-xl font-bold text-white bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Media Viewer
              </h1>
              <p className="text-sm text-gray-400">Viewing your content</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-4 py-3 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-2xl shadow-lg shadow-green-500/25"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 md:gap-8 overflow-hidden px-4 md:px-6 pb-6">
          {/* Enhanced Media Viewer */}
          <div className="flex-1 flex items-center justify-center min-h-0 relative">
            {/* Navigation Buttons */}
            {hasPrevious && (
              <button
                onClick={onPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 p-4 text-white transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/50 shadow-2xl shadow-purple-500/20 group"
              >
                <svg className="w-6 h-6 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {hasNext && (
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 hover:from-purple-600/30 hover:to-pink-600/30 p-4 text-white transition-all duration-300 hover:scale-110 backdrop-blur-xl border border-purple-500/30 hover:border-purple-500/50 shadow-2xl shadow-purple-500/20 group"
              >
                <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}

            {/* Media Container */}
            <div className="relative w-full h-full max-h-[70vh] bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl overflow-hidden border-2 border-purple-500/20 shadow-2xl shadow-purple-500/10">
              {/* Loading State */}
              {!imageLoaded && !videoLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
                    <p className="text-gray-400 text-sm">Loading media...</p>
                  </div>
                </div>
              )}

              {isVideo ? (
                <video
                  ref={videoRef}
                  src={mediaUrl}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
                  controls
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onLoadedData={() => setVideoLoaded(true)}
                  onError={() => setVideoLoaded(true)}
                />
              ) : (
                <img
                  src={mediaUrl}
                  alt={post.title}
                  className={`w-full h-full object-contain transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                  onLoad={() => setImageLoaded(true)}
                  onError={() => setImageLoaded(true)}
                />
              )}

              {/* Media Type Badge */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-2 rounded-full text-xs font-bold backdrop-blur-xl border shadow-lg ${
                  isVideo 
                    ? 'bg-purple-500/20 text-purple-300 border-purple-500/40 shadow-purple-500/10' 
                    : 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-blue-500/10'
                }`}>
                  {isVideo ? '🎬 VIDEO' : '🖼️ IMAGE'}
                </span>
              </div>
            </div>
          </div>

          {/* Enhanced Info Panel */}
          <div className="w-full lg:w-96 xl:w-[480px] flex-shrink-0 bg-gradient-to-br from-gray-900/80 via-purple-900/30 to-gray-900/80 backdrop-blur-2xl rounded-3xl border-2 border-purple-500/20 p-6 md:p-8 overflow-y-auto shadow-2xl shadow-purple-500/10">
            <div className="space-y-6 md:space-y-8">
              {/* Title Section */}
              <div className="text-center lg:text-left">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent leading-tight">
                  {post.title}
                </h2>
                <div className="flex items-center justify-center lg:justify-start gap-3 text-sm text-gray-400">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{formatDate(post.createdAt)}</span>
                </div>
              </div>

              {/* Description */}
              {post.content && (
                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                    </svg>
                    DESCRIPTION
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{post.content}</p>
                </div>
              )}

              {/* Status and Metadata */}
              <div className="space-y-4">
                {/* Status */}
                <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    STATUS
                  </h3>
                  <span className={`inline-block text-sm px-4 py-2 rounded-full border font-semibold ${getStatusBadge(post.status)}`}>
                    {post.status.toUpperCase()}
                  </span>
                </div>

                {/* Platforms */}
                {post.targetPlatforms && post.targetPlatforms.length > 0 && (
                  <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                      </svg>
                      PLATFORMS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.targetPlatforms.map(platform => (
                        <span
                          key={platform}
                          className="text-xs px-3 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-purple-300 border border-purple-500/30 capitalize font-medium shadow-lg shadow-purple-500/5"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {post.tags && post.tags.length > 0 && (
                  <div className="bg-black/30 rounded-2xl p-4 border border-white/5">
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-3 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      TAGS
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-2 rounded-full bg-gradient-to-r from-pink-500/10 to-rose-500/10 text-pink-300 border border-pink-500/30 font-medium shadow-lg shadow-pink-500/5"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-6 border-t border-purple-500/20">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-2xl shadow-lg shadow-green-500/25"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {isVideo ? 'Video' : 'Image'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewerModal;
