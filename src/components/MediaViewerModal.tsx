import React, { useEffect, useRef, useState } from 'react';
import { UserPost } from '../types/backend';
import { backendApi } from '../services/backend';

// Helper function to get streaming URL for videos
const getStreamingUrl = (videoUrl: string | null | undefined): string | undefined => {
  if (!videoUrl) return undefined;
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
  const [isPlaying, setIsPlaying] = useState(false);
  const [shareLink, setShareLink] = useState<string | null>(null);
  const [isLinkCopied, setIsLinkCopied] = useState(false);

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
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

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

    const mediaUrl = post.videoUrl || post.thumbnail;
    if (!mediaUrl) return;

    // Create a temporary anchor element to trigger download
    const link = document.createElement('a');
    link.href = mediaUrl;
    link.download = `${post.title.replace(/[^a-z0-9]/gi, '_')}.${post.videoUrl ? 'mp4' : 'jpg'}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = () => {
    if (!post) return;

    const mediaUrl = post.videoUrl || post.thumbnail;
    if (!mediaUrl) return;

    // Generate shareable link with media URL as parameter
    const shareUrl = `${window.location.origin}/share/${post.id}?media=${encodeURIComponent(mediaUrl)}`;
    setShareLink(shareUrl);

    // Copy to clipboard
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 3000);
      }).catch(() => {
        // Fallback: create a temporary textarea
        const textarea = document.createElement('textarea');
        textarea.value = shareUrl;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        try {
          document.execCommand('copy');
          setIsLinkCopied(true);
          setTimeout(() => setIsLinkCopied(false), 3000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
        document.body.removeChild(textarea);
      });
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = shareUrl;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        setIsLinkCopied(true);
        setTimeout(() => setIsLinkCopied(false), 3000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textarea);
    }
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
      published: 'bg-green-500/10 text-green-300 border-green-500/30',
      pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
      failed: 'bg-red-500/10 text-red-300 border-red-500/30',
      draft: 'bg-gray-500/10 text-gray-300 border-gray-500/30',
    };
    return statusColors[status.toLowerCase()] || statusColors.draft;
  };

  if (!isOpen || !post) return null;

  const mediaUrl = post.videoUrl || post.thumbnail;
  const isVideo = !!post.videoUrl;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="relative z-10 w-full h-full max-w-7xl mx-auto p-4 md:p-8 flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-all backdrop-blur-xl border border-white/10"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Navigation Buttons */}
        {hasPrevious && (
          <button
            onClick={onPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-all backdrop-blur-xl border border-white/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {hasNext && (
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-white/10 hover:bg-white/20 p-3 text-white transition-all backdrop-blur-xl border border-white/10"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col md:flex-row gap-6 overflow-hidden">
          {/* Media Viewer */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div className="relative w-full h-full max-h-[80vh] bg-black rounded-2xl overflow-hidden border border-white/10">
              {isVideo ? (
                <video
                  ref={videoRef}
                  src={getStreamingUrl(mediaUrl || undefined)}
                  className="w-full h-full object-contain"
                  controls
                  preload="auto"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                />
              ) : (
                <img
                  src={mediaUrl || undefined}
                  alt={post.title}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>

          {/* Info Panel */}
          <div className="w-full md:w-96 flex-shrink-0 bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-2xl border border-white/10 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Title */}
              <div>
                <h2 className="text-2xl font-bold text-white mb-2">{post.title}</h2>
                <p className="text-sm text-gray-400">{formatDate(post.createdAt)}</p>
              </div>

              {/* Description */}
              {post.content && (
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                    Description
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{post.content}</p>
                </div>
              )}

              {/* Status and Platforms */}
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                    Status
                  </h3>
                  <span className={`inline-block text-xs px-3 py-1 rounded-full border ${getStatusBadge(post.status)}`}>
                    {post.status}
                  </span>
                </div>

                {post.targetPlatforms && post.targetPlatforms.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                      Platforms
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.targetPlatforms.map(platform => (
                        <span
                          key={platform}
                          className="text-xs px-3 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 capitalize"
                        >
                          {platform}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {post.tags && post.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-gray-400 mb-2">
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {post.tags.map(tag => (
                        <span
                          key={tag}
                          className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t border-white/10">
                <button
                  onClick={handleDownload}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-[1.02] hover:shadow-xl"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Download {isVideo ? 'Video' : 'Image'}
                </button>

                <button
                  onClick={handleShare}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 px-6 py-3 text-sm font-bold text-white transition-all border border-white/10"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  {isLinkCopied ? 'Link Copied!' : 'Share'}
                </button>

                {shareLink && (
                  <div className="mt-3 p-3 rounded-lg bg-green-500/10 border border-green-500/30">
                    <p className="text-xs text-green-300 mb-2">Shareable link:</p>
                    <p className="text-xs text-green-200 break-all font-mono">{shareLink}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaViewerModal;

