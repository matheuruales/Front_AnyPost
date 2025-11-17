import React, { useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Loader from '../components/ui/Loader';
import { useAuth } from '../hooks/useAuth';
import { backendApi } from '../services/backend';

interface ProfileStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
  archived: number;
  platforms: number;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, loading } = useAuth();
  const [stats, setStats] = useState<ProfileStats>({
    total: 0,
    published: 0,
    draft: 0,
    scheduled: 0,
    archived: 0,
    platforms: 0,
  });
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    if (!currentUser) return;
    setIsFetching(true);
    setError(null);
    try {
      const posts = await backendApi.getUserPosts({
        authUserId: currentUser.authUserId,
        email: currentUser.email ?? undefined,
      });

      const platforms = new Set<string>();
      posts.forEach((post) => {
        post.targetPlatforms?.forEach((p) => platforms.add(p));
      });

      const nextStats: ProfileStats = {
        total: posts.length,
        published: posts.filter((p) => p.status === 'published').length,
        draft: posts.filter((p) => p.status === 'draft').length,
        scheduled: posts.filter((p) => p.status === 'scheduled').length,
        archived: posts.filter((p) => p.status === 'archived').length,
        platforms: platforms.size,
      };

      setStats(nextStats);
    } catch (err) {
      console.error('Error fetching profile stats', err);
      setError('No pudimos cargar tus estadísticas.');
    } finally {
      setIsFetching(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const initials = useMemo(() => {
    if (!currentUser?.email) return 'A';
    return currentUser.email.slice(0, 2).toUpperCase();
  }, [currentUser]);

  if (loading) {
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

        <div className="relative z-10 max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500 mb-2">Perfil</p>
              <h1 className="text-4xl font-bold text-white">Resumen de tu cuenta</h1>
              <p className="text-gray-400 mt-2">Información básica y desempeño de tus publicaciones.</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/upload-from-pc')}
                className="rounded-xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg hover:scale-[1.02] transition"
              >
                Nueva publicación
              </button>
              <button
                onClick={() => navigate('/dashboard')}
                className="rounded-xl border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition"
              >
                Ver historial
              </button>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-[1.2fr,0.8fr]">
            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/50 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_20px_80px_rgba(0,0,0,0.25)]">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-lg">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm text-gray-400">Usuario</p>
                    <h2 className="text-2xl font-bold text-white">{currentUser?.displayName || 'Creador'}</h2>
                    <p className="text-gray-400">{currentUser?.email}</p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-400">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                  </div>
                  <div className="rounded-2xl border border-green-500/20 bg-green-500/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-green-200">Publicadas</p>
                    <p className="text-2xl font-bold text-green-100">{stats.published}</p>
                  </div>
                  <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-yellow-200">Borradores</p>
                    <p className="text-2xl font-bold text-yellow-100">{stats.draft}</p>
                  </div>
                  <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-blue-200">Programadas</p>
                    <p className="text-2xl font-bold text-blue-100">{stats.scheduled}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-gray-900/60 via-gray-800/40 to-gray-900/50 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-500">Resumen rápido</p>
                    <h3 className="text-xl font-bold text-white">Estadísticas</h3>
                  </div>
                  {isFetching && <span className="text-xs text-purple-200">Actualizando...</span>}
                </div>
                <div className="space-y-3 text-sm text-gray-300">
                  <div className="flex justify-between items-center">
                    <span>Publicaciones archivadas</span>
                    <span className="text-white font-semibold">{stats.archived}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Redes con publicaciones</span>
                    <span className="text-white font-semibold">{stats.platforms}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Última actualización</span>
                    <span className="text-white font-semibold">{new Date().toLocaleTimeString()}</span>
                  </div>
                  {error && (
                    <p className="text-xs text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2 mt-2">{error}</p>
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

export default Profile;
