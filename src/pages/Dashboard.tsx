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
            thumbnail: post.thumbnail
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
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get status badge color
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      published: 'bg-green-500/10 text-green-300 border-green-500/30',
      pending: 'bg-yellow-500/10 text-yellow-300 border-yellow-500/30',
      failed: 'bg-red-500/10 text-red-300 border-red-500/30',
      draft: 'bg-gray-500/10 text-gray-300 border-gray-500/30',
    };
    return statusColors[status.toLowerCase()] || statusColors.draft;
  };

  if (loading || isLoading) {
    return <Loader />;
  }

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
        
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
                  Back to Hub
                </span>
              </button>
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-md opacity-75"></div>
                <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></div>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">Video History</p>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Activity Dashboard
              </span>
            </h1>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <p className="text-gray-400 text-lg max-w-2xl">
                View and manage your published videos and AI-generated images from the last few months. Track your content across all social platforms.
              </p>
              
              <button
                onClick={() => fetchVideos()}
                disabled={isLoading}
                className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 border border-white/10 hover:border-white/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg 
                  className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {isLoading ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="mb-8 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search videos..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-3 pl-10 text-white placeholder-gray-500 transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl"
                />
                <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-white transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl"
              >
                <option value="all" className="bg-gray-900">All Statuses</option>
                {availableStatuses.map(status => (
                  <option key={status} value={status} className="bg-gray-900 capitalize">{status}</option>
                ))}
              </select>

              {/* Platform Filter */}
              <select
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/40 px-5 py-3 text-white transition-all duration-300 focus:border-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 backdrop-blur-xl"
              >
                <option value="all" className="bg-gray-900">All Platforms</option>
                {availablePlatforms.map(platform => (
                  <option key={platform} value={platform} className="bg-gray-900 capitalize">{platform}</option>
                ))}
              </select>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm text-gray-400">
              <span>Total: <span className="text-white font-semibold">{filteredVideos.length}</span> items</span>
              <span>Months: <span className="text-white font-semibold">{timelineGroups.length}</span></span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-8 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 backdrop-blur-xl">
              <div className="flex items-center justify-between">
                <p className="text-sm text-red-300">{error}</p>
                <button
                  onClick={() => fetchVideos()}
                  className="ml-4 rounded-lg bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300 hover:bg-red-500/30 transition-colors"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Timeline */}
          {timelineGroups.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4 opacity-40">📹</div>
              <p className="text-xl text-gray-400 mb-2">No content found</p>
              <p className="text-sm text-gray-500">
                {videos.length === 0 
                  ? 'Upload your first video or generate an image to get started'
                  : 'Try adjusting your filters'}
              </p>
              {videos.length === 0 && (
                <div className="flex gap-4 justify-center mt-6">
                  <button
                    onClick={() => navigate('/upload-from-pc')}
                    className="rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
                  >
                    Upload Video
                  </button>
                  <button
                    onClick={() => navigate('/ai-dashboard')}
                    className="rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-6 py-3 text-sm font-bold text-white transition-all hover:scale-105"
                  >
                    Generate Image
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-12">
              {timelineGroups.map((group: TimelineGroup) => (
                <div key={`${group.year}-${group.month}`} className="group relative">
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
                  
                  <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-6 sm:p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                    {/* Month Header */}
                    <div className="mb-6 pb-4 border-b border-white/10">
                      <h2 className="text-2xl font-bold text-white">
                        {group.monthName} {group.year}
                      </h2>
                      <p className="text-sm text-gray-400 mt-1">
                        {group.videos.length} {group.videos.length === 1 ? 'video' : 'videos'}
                      </p>
                    </div>

                    {/* Videos Grid */}
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {group.videos.map((video) => (
                        <div
                          key={video.id}
                          onClick={() => handleVideoSelect(video)}
                          className={`group/video relative overflow-hidden rounded-2xl border transition-all duration-300 cursor-pointer ${
                            selectedVideo?.id === video.id
                              ? 'border-purple-500/50 bg-purple-500/10 scale-[1.02]'
                              : 'border-white/10 bg-black/20 hover:border-white/20 hover:bg-black/30'
                          }`}
                        >
                          {/* Media Thumbnail */}
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
                                        className="absolute inset-0 h-full w-full object-cover"
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
                                        className="absolute inset-0 h-full w-full object-cover opacity-0 hover:opacity-100 transition-opacity"
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
                                    className="h-full w-full object-cover"
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

                              // Pure imagen (sin video reproducible)
                              if (posterImage) {
                                return (
                                  <img
                                    src={posterImage}
                                    alt={video.title}
                                    className="h-full w-full object-cover cursor-pointer"
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
                                  className="flex h-full items-center justify-center cursor-pointer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleVideoSelect(video);
                                  }}
                                >
                                  <div className="text-4xl opacity-40">🎬</div>
                                </div>
                              );
                            })()}
                            
                            {/* Overlay - Solo para videos */}
                            {Boolean(video.videoUrl) && !isLikelyImageUrl(unwrapStreamUrl(video.videoUrl)) && (
                              <>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover/video:opacity-100 transition-opacity pointer-events-none"></div>
                                
                                {/* Play Icon - Solo para videos */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/video:opacity-100 transition-opacity pointer-events-none">
                                  <div className="rounded-full bg-white/20 backdrop-blur-xl p-4">
                                    <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  </div>
                                </div>
                              </>
                            )}
                          </div>

                          {/* Video Info */}
                          <div className="p-4 space-y-2">
                            <h3 className="font-bold text-white line-clamp-2 group-hover/video:text-purple-300 transition-colors">
                              {video.title}
                            </h3>
                            
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full border ${getStatusBadge(video.status)}`}>
                                {video.status}
                              </span>
                              {video.targetPlatforms?.map(platform => (
                                <span key={platform} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-300 border border-white/10 capitalize">
                                  {platform}
                                </span>
                              ))}
                            </div>

                            <p className="text-xs text-gray-400">
                              {formatDate(video.createdAt)}
                            </p>
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
