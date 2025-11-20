import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Loader from '../components/ui/Loader';
import { backendApi } from '../services/backend';
import { UserPost } from '../types/backend';
import axios from 'axios';
import { API_BASE_URL } from '../services/api';

const SharePost: React.FC = () => {
  const { postId } = useParams<{ postId: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<UserPost | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      if (!postId) {
        setError('Link inválido.');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      // 1) Intento público (publicado)
      try {
        const response = await backendApi.getSharedPostById(postId);
        setPost(response);
        setError(null);
        setLoading(false);
        return;
      } catch (err) {
        console.warn('[SharePost] Public endpoint falló, probando fallback', err);
      }

      // 2) Fallback sin auth a /user-posts/:id (para cualquier estado)
      try {
        const publicApi = axios.create({ baseURL: API_BASE_URL });
        const { data } = await publicApi.get<UserPost>(`/user-posts/${postId}`);
        setPost(data);
        setError(null);
      } catch (err) {
        console.error('[SharePost] No se pudo cargar el post', err);
        setError('No pudimos cargar este contenido. Verifica el enlace o inténtalo más tarde.');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postId]);

  const unwrapStreamUrl = (url: string | undefined | null): string | undefined => {
    if (!url) return undefined;
    try {
      const parsed = new URL(url);
      const nested = parsed.searchParams.get('url');
      if (nested) return decodeURIComponent(nested);
    } catch {
      // ignore
    }
    return url;
  };

  const isLikelyImageUrl = (url: string | undefined | null): boolean => {
    if (!url) return false;
    const clean = url.split('?')[0];
    return /\.(png|jpe?g|gif|webp|svg|heic|heif)$/i.test(clean);
  };

  const mediaUrl = useMemo(() => {
    const primaryImage = unwrapStreamUrl(post?.imageUrl ?? undefined);
    const thumb = unwrapStreamUrl(post?.thumbnail ?? undefined);
    const rawVideo = post?.videoUrl ?? undefined;
    const unwrappedVideo = unwrapStreamUrl(rawVideo);

    const posterImage = primaryImage || thumb || (isLikelyImageUrl(unwrappedVideo) ? unwrappedVideo : undefined);
    const hasVideo = Boolean(rawVideo && !isLikelyImageUrl(unwrappedVideo));

    if (hasVideo) {
      return rawVideo.includes('/videos/stream?url=') ? rawVideo : backendApi.getVideoStreamUrl(rawVideo);
    }

    return posterImage;
  }, [post]);

  const isVideo = useMemo(() => {
    if (!post?.videoUrl) return false;
    return /\.(mp4|mov|webm|m4v)$/i.test(post.videoUrl);
  }, [post]);

  if (loading) {
    return <Loader />;
  }

  if (error || !post) {
    return (
      <Layout>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-3xl font-bold text-white mb-4">Share Link</h1>
          <p className="text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="rounded-xl bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            Go to home
          </button>
        </div>
      </Layout>
    );
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

        <div className="relative z-10 mx-auto max-w-4xl px-4 py-16">
          <button
            onClick={() => navigate('/')}
            className="group relative overflow-hidden rounded-xl bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 border border-white/10 hover:border-white/20 mb-6"
          >
            <span className="relative z-10 flex items-center gap-2">
              <svg className="w-4 h-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to home
            </span>
          </button>

          <div className="rounded-3xl border border-white/10 bg-black/50 backdrop-blur-xl p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_80px_rgba(0,0,0,0.25)]">
            <h1 className="text-3xl font-bold text-white mb-6">{post.title}</h1>
            <p className="text-gray-300 mb-8">{post.content || 'This post does not include a description.'}</p>

            <div className="w-full rounded-2xl border border-white/10 bg-black/60 overflow-hidden min-h-[300px] flex items-center justify-center">
              {mediaUrl ? (
                isVideo ? (
                  <video src={mediaUrl} controls className="w-full h-full object-contain" />
                ) : (
                  <img src={mediaUrl} alt={post.title} className="w-full h-full object-contain" />
                )
              ) : (
                <div className="text-gray-500 text-center py-10">No media available</div>
              )}
            </div>

            {post.targetPlatforms && post.targetPlatforms.length > 0 && (
              <div className="mt-6">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">Platforms</p>
                <div className="flex flex-wrap gap-2">
                  {post.targetPlatforms.map(platform => (
                    <span key={platform} className="rounded-full border border-white/10 px-3 py-1 text-sm text-gray-200">
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SharePost;
