import React, { useEffect, useState, useCallback, useMemo } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backend';
import { UserPost } from '../types/backend';
import Loader from '../components/ui/Loader';
import { useNavigate } from 'react-router-dom';
import { VideoTimelineMap, TimelineGroup } from '../data-structures/VideoTimelineMap';
import { VideoNavigationList } from '../data-structures/VideoNavigationList';
import { VideoIndexMap } from '../data-structures/VideoIndexMap';
import { VideoThumbnailCache } from '../data-structures/VideoThumbnailCache';
import MediaViewerModal from '../components/MediaViewerModal';

// Ensure we only wrap raw blob URLs once (avoid double /videos/stream?url= nesting)
const getVideoStreamUrl = (videoUrl: string | null | undefined): string | undefined => {
  if (!videoUrl) return undefined;
  if (videoUrl.includes('/videos/stream?url=')) return videoUrl;
  return backendApi.getVideoStreamUrl(videoUrl);
};

const getImageUrl = (imageUrl?: string | null, thumbnail?: string | null): string | undefined => {
  return imageUrl ?? thumbnail ?? undefined;
};

const unwrapStreamUrl = (url: string | undefined | null): string | undefined => {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    const nested = parsed.searchParams.get('url');
    if (nested) return decodeURIComponent(nested);
  } catch {
    // fall through with original URL
  }
  return url;
};

const isLikelyImageUrl = (url: string | undefined | null): boolean => {
  if (!url) return false;
  const clean = url.split('?')[0];
  return /\.(png|jpe?g|gif|webp|svg|heic|heif)$/i.test(clean);
};

const Dashboard: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  
  const [videos, setVideos] = useState<UserPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<UserPost | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  
  // Initialize data structures
  const timelineMap = useMemo(() => new VideoTimelineMap(), []);
  const navigationList = useMemo(() => new VideoNavigationList(), []);
  const indexMap = useMemo(() => new VideoIndexMap(), []);
  const thumbnailCache = useMemo(() => new VideoThumbnailCache(), []);

  // Fetch videos from backend
  const fetchVideos = useCallback(async () => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('Fetching user posts for:', {
        authUserId: currentUser.authUserId,
        email: currentUser.email
      });

      const userPosts = await backendApi.getUserPosts({
        authUserId: currentUser.authUserId,
        email: currentUser.email ?? undefined,
      });

      console.log('Total user posts received:', userPosts.length);
      console.log('Sample posts:', userPosts.slice(0, 3).map(p => ({
        id: p.id,
        title: p.title,
        hasVideoUrl: !!p.videoUrl,
        hasImageUrl: !!p.imageUrl,
        hasThumbnail: !!p.thumbnail,
        videoUrl: p.videoUrl,
        imageUrl: p.imageUrl,
        thumbnail: p.thumbnail,
        ownerAuthUserId: p.ownerAuthUserId,
        status: p.status
      })));
      
      // Log all posts to see what we're getting
      console.log('All posts received:', userPosts);

      // Filter posts with videoUrl, imageUrl or thumbnail (videos and images)
      // Also include posts that might have content but no explicit media field
      const mediaPosts = userPosts.filter(post => {
        const hasMedia = !!(post.videoUrl || post.imageUrl || post.thumbnail);
        if (!hasMedia) {
          console.log('Post filtered out (no media):', {
            id: post.id,
            title: post.title,
            videoUrl: post.videoUrl,
            imageUrl: post.imageUrl,
            thumbnail: p.thumbnail
          });
        }
        return hasMedia;
      });

      console.log('Media posts after filtering:', mediaPosts.length);

      setVideos(mediaPosts);

      // Populate data structures
      timelineMap.clear();
      navigationList.clear();
      indexMap.clear();

      timelineMap.addVideos(mediaPosts);
      navigationList.appendBatch(mediaPosts);
      indexMap.addVideos(mediaPosts);

      if (mediaPosts.length > 0) {
        setSelectedVideo(mediaPosts[0]);
        navigationList.moveTo(mediaPosts[0].id);
      } else {
        console.warn('No media posts found. All posts:', userPosts);
      }
    } catch (err) {
      console.error('Error fetching videos:', err);
      setError(err instanceof Error ? err.message : 'Failed to load videos');
    } finally {
      setIsLoading(false);
    }
  }, [currentUser, timelineMap, navigationList, indexMap]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  // Filter videos based on search and filters
  const filteredVideos = useMemo(() => {
    let result = videos;

    // Apply search
    if (searchQuery.trim()) {
      result = indexMap.search(searchQuery.trim());
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(video => video.status === statusFilter);
    }

    // Apply platform filter
    if (platformFilter !== 'all') {
      result = result.filter(video => 
        video.targetPlatforms?.includes(platformFilter)
      );
    }

    return result;
  }, [videos, searchQuery, statusFilter, platformFilter, indexMap]);

  // Get timeline groups for filtered videos
  const timelineGroups = useMemo(() => {
    const tempTimeline = new VideoTimelineMap();
    tempTimeline.addVideos(filteredVideos);
    return tempTimeline.getTimelineGroups();
  }, [filteredVideos]);

  // Get unique statuses and platforms for filters
  const availableStatuses = useMemo(() => indexMap.getAllStatuses(), [indexMap]);
  const availablePlatforms = useMemo(() => indexMap.getAllPlatforms(), [indexMap]);

  // Navigation handlers
  const handleVideoSelect = (video: UserPost) => {
    setSelectedVideo(video);
    navigationList.moveTo(video.id);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleNextVideo = () => {
    const next = navigationList.next();
    if (next) {
      setSelectedVideo(next);
    }
  };

  const handlePreviousVideo = () => {
    const prev = navigationList.previous();
    if (prev) {
      setSelectedVideo(prev);
    }
  };

  // Format date helper
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      published: 'bg-green-500/15 text-green-300 border-green-500/40 shadow-lg shadow-green-500/10',
      pending: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/40 shadow-lg shadow-yellow-500/10',
      failed: 'bg-red-500/15 text-red-300 border-red-500/40 shadow-lg shadow-red-500/10',
      draft: 'bg-gray-500/15 text-gray-300 border-gray-500/40 shadow-lg shadow-gray-500/10',
    };
    return statusColors[status.toLowerCase()] || statusColors.draft;
  };

  if (loading || isLoading) {
    return <Loader />;
  }

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Enhanced Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
        
        <div className="fixed inset-0 opacity-40">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/25 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/25 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-12">
          {/* Enhanced Header */}
          <div className="mb-12">
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <button
                onClick={() => navigate('/creator-hub')}
                className="group relative overflow-hidden rounded-2xl bg-white/5 px-5 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 border border-white/10 hover:border-white/20 hover:scale-105 shadow-lg"
              >
                <span className="relative z-10 flex items-center gap-2">
                  <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Back to Hub
                </span>
              </button>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-md opacity-75"></div>
                <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></div>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-400 bg-black/30 px-4 py-2 rounded-full border border-white/5">
                Video History
              </p>
            </div>
            
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent leading-tight">
                  Activity Dashboard
                </h1>
                <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                  View and manage your published videos and AI-generated images. Track your content across all social platforms.
                </p>
              </div>
              
              <button
                onClick={() => fetchVideos()}
                disabled={isLoading}
                className="flex items-center gap-3 rounded-2xl bg-gradient-to-r from-purple-600/20 to-pink-600/20 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:from-purple-600/30 hover:to-pink-600/30 border border-purple-500/30 hover:border-purple-500/50 hover:scale-105 shadow-lg shadow-purple-500/10 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 min-w-[140px] justify-center"
              >
                <svg 
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          </div>

          {/* Enhanced Filters Section */}
          <div className="mb-12 space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {/* Search */}
              <div className="relative lg:col-span-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos, titles, descriptions..."
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 pl-12 text-white placeholder-gray-400 transition-all duration-300 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-xl shadow-lg"
                />
                <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Status Filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 pr-10 text-white transition-all duration-300 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-xl shadow-lg appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">All Statuses</option>
                  {availableStatuses.map(status => (
                    <option key={status} value={status} className="bg-gray-900 capitalize">{status}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              {/* Platform Filter */}
              <div className="relative">
                <select
                  value={platformFilter}
                  onChange={(e) => setPlatformFilter(e.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-5 py-4 pr-10 text-white transition-all duration-300 focus:border-purple-500/50 focus:outline-none focus:ring-2 focus:ring-purple-500/20 backdrop-blur-xl shadow-lg appearance-none cursor-pointer"
                >
                  <option value="all" className="bg-gray-900">All Platforms</option>
                  {availablePlatforms.map(platform => (
                    <option key={platform} value={platform} className="bg-gray-900 capitalize">{platform}</option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Enhanced Stats */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-3 bg-black/30 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Total: <span className="text-white font-bold text-lg">{filteredVideos.length}</span> items</span>
              </div>
              <div className="flex items-center gap-3 bg-black/30 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Months: <span className="text-white font-bold text-lg">{timelineGroups.length}</span></span>
              </div>
              <div className="flex items-center gap-3 bg-black/30 px-4 py-3 rounded-2xl border border-white/5 backdrop-blur-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-gray-300">Status: <span className="text-white font-bold text-lg">{statusFilter}</span></span>
              </div>
            </div>
          </div>

          {/* Enhanced Error Message */}
          {error && (
            <div className="mb-8 rounded-2xl bg-red-500/10 border border-red-500/40 px-6 py-4 backdrop-blur-xl shadow-lg shadow-red-500/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-300 font-medium">{error}</p>
                </div>
                <button
                  onClick={() => fetchVideos()}
                  className="ml-4 rounded-xl bg-red-500/20 px-4 py-2 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-all duration-300 hover:scale-105"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          {/* Enhanced Timeline */}
          {timelineGroups.length === 0 ? (
            <div className="text-center py-24">
              <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6">
                <div className="text-4xl opacity-60">📹</div>
              </div>
              <p className="text-2xl font-bold text-gray-300 mb-3">No content found</p>
              <p className="text-gray-500 max-w-md mx-auto leading-relaxed">
                {videos.length === 0 
                  ? 'Upload your first video or generate an image to get started with your content journey'
                  : 'Try adjusting your search terms or filters to find what you\'re looking for'}
              </p>
              {videos.length === 0 && (
                <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                  <button
                    onClick={() => navigate('/upload-from-pc')}
                    className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  >
                    Upload Video
                  </button>
                  <button
                    onClick={() => navigate('/ai-dashboard')}
                    className="rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-4 text-sm font-bold text-white transition-all hover:scale-105 shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
                  >
                    Generate Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-16">
              {timelineGroups.map((group: TimelineGroup) => (
                <div key={`${group.year}-${group.month}`} className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-all duration-700"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900/60 via-gray-800/50 to-gray-900/60 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl shadow-black/30 hover:shadow-purple-500/10 transition-all duration-500">
                    {/* Enhanced Month Header */}
                    <div className="mb-8 pb-6 border-b border-white/10">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h2 className="text-3xl font-bold text-white mb-2">
                            {group.monthName} {group.year}
                          </h2>
                          <p className="text-gray-400 text-lg">
                            {group.videos.length} {group.videos.length === 1 ? 'media item' : 'media items'} this month
                          </p>
                        </div>
                        <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-gray-300 font-medium">
                            {group.videos.filter(v => v.status === 'published').length} published
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Enhanced Videos Grid */}
                    <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                      {group.videos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => handleVideoSelect(video)}
                          className={`group/video relative overflow-hidden rounded-3xl border-2 transition-all duration-500 cursor-pointer transform hover:scale-[1.03] ${
                            selectedVideo?.id === video.id
                              ? 'border-purple-500/60 bg-gradient-to-br from-purple-500/15 to-pink-500/15 shadow-2xl shadow-purple-500/20'
                              : 'border-white/10 bg-gradient-to-br from-gray-800/30 to-gray-900/30 hover:border-white/20 hover:bg-gray-800/40 shadow-lg hover:shadow-xl'
                          }`}
                        >
                          {/* Enhanced Media Thumbnail */}
                          <div className="relative aspect-video w-full overflow-hidden bg-gradient-to-br from-gray-900 to-black">
                            {(() => {
                              const primaryImage = unwrapStreamUrl(getImageUrl(video.imageUrl, null));
                              const thumbImage = unwrapStreamUrl(video.thumbnail);
                              const rawVideoUrl = video.videoUrl || undefined;
                              const unwrappedVideo = unwrapStreamUrl(rawVideoUrl);

                              const posterImage =
                                primaryImage ||
                                thumbImage ||
                                (isLikelyImageUrl(unwrappedVideo) ? unwrappedVideo : undefined);

                              const hasVideo = Boolean(rawVideoUrl && !isLikelyImageUrl(unwrappedVideo));
                              const videoSource = hasVideo ? getVideoStreamUrl(rawVideoUrl) : undefined;

                              if (videoSource) {
                                if (posterImage) {
                                  return (
                                    <>
                                      <img
                                        src={posterImage}
                                        alt={video.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-all duration-500 group-hover/video:scale-110"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleVideoSelect(video);
                                        }}
                                        onError={(e) => {
                                          e.currentTarget.style.display = 'none';
                                        }}
                                      />
                                      <video
                                        src={videoSource}
                                        className="absolute inset-0 h-full w-full object-cover opacity-0 group-hover/video:opacity-100 transition-opacity duration-500"
                                        muted
                                        preload="none"
                                        playsInline
                                        onMouseEnter={(e) => {
                                          const target = e.target as HTMLVideoElement;
                                          target.currentTime = 0;
                                          target.play().catch(() => {});
                                          e.currentTarget.parentElement?.querySelector('img')?.setAttribute('style', 'opacity:0;');
                                          e.currentTarget.style.opacity = '1';
                                        }}
                                        onMouseLeave={(e) => {
                                          const target = e.target as HTMLVideoElement;
                                          target.pause();
                                          target.currentTime = 0;
                                          e.currentTarget.style.opacity = '0';
                                          e.currentTarget.parentElement?.querySelector('img')?.setAttribute('style', 'opacity:1;');
                                        }}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleVideoSelect(video);
                                        }}
                                      />
                                    </>
                                  );
                                }

                                return (
                                  <video
                                    src={videoSource}
                                    className="h-full w-full object-cover group-hover/video:scale-110 transition-transform duration-500"
                                    muted
                                    preload="metadata"
                                    playsInline
                                    onMouseEnter={(e) => {
                                      const target = e.target as HTMLVideoElement;
                                      if (target.readyState >= 2) {
                                        target.currentTime = 0;
                                        target.play().catch(() => {});
                                      }
                                    }}
                                    onMouseLeave={(e) => {
                                      const target = e.target as HTMLVideoElement;
                                      target.pause();
                                      target.currentTime = 0;
                                    }}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVideoSelect(video);
                                    }}
                                  />
                                );
                              }

                              // Pure image (sin video reproducible)
                              if (posterImage) {
                                return (
                                  <img
                                    src={posterImage}
                                    alt={video.title}
                                    className="h-full w-full object-cover group-hover/video:scale-110 transition-transform duration-500 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleVideoSelect(video);
                                    }}
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none';
                                    }}
                                  />
                                );
                              }

                              return (
                                <div
                                  className="flex h-full items-center justify-center cursor-pointer bg-gradient-to-br from-gray-800 to-gray-900"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVideoSelect(video);
                                  }}
                                >
                                  <div className="text-4xl opacity-40 transition-opacity group-hover/video:opacity-60">🎬</div>
                                </div>
                              );
                            })()}
                            
                            {/* Enhanced Overlay - Solo para videos */}
                            {Boolean(video.videoUrl) && !isLikelyImageUrl(unwrapStreamUrl(video.videoUrl)) && (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover/video:opacity-100 transition-all duration-500 pointer-events-none"></div>
                                
                                {/* Enhanced Play Icon - Solo para videos */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-all duration-500 pointer-events-none">
                                  <div className="rounded-2xl bg-white/20 backdrop-blur-xl p-5 transform group-hover/video:scale-110 transition-transform duration-300 shadow-2xl">
                                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              </>
                            )}

                            {/* Enhanced Status Badge */}
                            <div className="absolute top-4 left-4">
                              <span className={`text-xs px-3 py-2 rounded-full border font-semibold ${getStatusBadge(video.status)}`}>
                                {video.status}
                              </span>
                            </div>
                          </div>

                          {/* Enhanced Video Info */}
                          <div className="p-5 space-y-3">
                            <h3 className="font-bold text-white line-clamp-2 group-hover/video:text-purple-300 transition-colors duration-300 text-lg leading-tight">
                              {video.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              {video.targetPlatforms?.map(platform => (
                                <span key={platform} className="text-xs px-3 py-1.5 rounded-full bg-white/5 text-gray-300 border border-white/10 capitalize font-medium">
                                  {platform}
                                </span>
                              ))}
                            </div>

                            <div className="flex items-center justify-between pt-2">
                              <p className="text-sm text-gray-400 font-medium">
                                {formatDate(video.createdAt)}
                              </p>
                              <div className="w-2 h-2 rounded-full bg-green-500/60 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Media Viewer Modal */}
          <MediaViewerModal
            post={selectedVideo}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onNext={handleNextVideo}
            onPrevious={handlePreviousVideo}
            hasNext={navigationList.hasNext()}
            hasPrevious={navigationList.hasPrevious()}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;