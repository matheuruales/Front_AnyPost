import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader';
import { backendApi } from '../services/backend';
import { UserProfileResponse } from '../types/backend';

type Banner = { type: 'success' | 'error'; text: string } | null;

const Profile: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const email = currentUser?.email ?? '';
  const [profiles, setProfiles] = useState<UserProfileResponse[]>([]);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [feedback, setFeedback] = useState<Banner>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState<number | null>(null);

  const handleError = (error: unknown, fallback: string) => {
    console.error(fallback, error);
    setFeedback({
      type: 'error',
      text: error instanceof Error ? error.message : fallback,
    });
  };

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 4000);
    return () => clearTimeout(timer);
  }, [feedback]);

  const fetchProfiles = useCallback(async () => {
    if (!email) {
      setIsFetching(false);
      return;
    }
    setIsFetching(true);
    try {
      const data = await backendApi.getUserProfiles();
      setProfiles(data);
      const match = data.find((profile) => profile.email.toLowerCase() === email.toLowerCase()) || null;
      setUserProfile(match);
      if (match) {
        setDisplayName(match.displayName);
      } else if (email) {
        setDisplayName(email.split('@')[0] ?? '');
      }
    } catch (error) {
      handleError(error, 'No se pudieron cargar los perfiles desde el backend.');
    } finally {
      setIsFetching(false);
    }
  }, [email]);

  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  const handleSaveProfile = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!email) {
      return;
    }
    setIsSaving(true);
    try {
      if (userProfile) {
        await backendApi.deleteUserProfile(userProfile.id);
      }
      const created = await backendApi.createUserProfile({
        email,
        displayName: displayName.trim() || email,
      });
      setUserProfile(created);
      setProfiles((prev) => {
        const remaining = prev.filter((profile) => profile.id !== userProfile?.id);
        return [created, ...remaining];
      });
      setFeedback({ type: 'success', text: 'Perfil guardado en el servicio backend.' });
    } catch (error) {
      handleError(error, 'Error al guardar tu perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteProfile = async (id: number) => {
    setIsDeleting(id);
    try {
      await backendApi.deleteUserProfile(id);
      setProfiles((prev) => prev.filter((profile) => profile.id !== id));
      if (userProfile?.id === id) {
        setUserProfile(null);
        setDisplayName(email ? email.split('@')[0] ?? '' : '');
      }
      setFeedback({ type: 'success', text: 'Perfil eliminado correctamente.' });
    } catch (error) {
      handleError(error, 'No se pudo eliminar ese perfil.');
    } finally {
      setIsDeleting(null);
    }
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <Layout>
      <div className="relative min-h-screen overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-to-br from-gray-950 via-black to-gray-900"></div>
        
        {/* Animated mesh gradient overlay */}
        <div className="fixed inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-md opacity-75"></div>
                <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></div>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">Perfil e Identidad</p>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Tu identidad en AnyPost
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg max-w-3xl">
              Sincroniza tu cuenta de Firebase con el backend de Spring para que los assets, borradores y trabajos puedan referenciar un ID de perfil.
            </p>
          </header>

          {/* Feedback Banner */}
          {feedback && (
            <div className="mb-8">
              <div className={`relative rounded-xl px-5 py-4 backdrop-blur-xl border ${
                feedback.type === 'error' 
                  ? 'bg-red-500/10 border-red-500/30' 
                  : 'bg-green-500/10 border-green-500/30'
              }`}>
                <div className="flex items-center gap-3">
                  <span className="text-2xl">
                    {feedback.type === 'error' ? '❌' : '✅'}
                  </span>
                  <p className={`text-sm font-medium ${
                    feedback.type === 'error' ? 'text-red-300' : 'text-green-300'
                  }`}>
                    {feedback.text}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Account Info Card */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Cuenta</h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full"></div>
                </div>
                
                <div className="space-y-4 mb-6">
                  <div className="rounded-xl bg-black/40 border border-white/10 p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Email</p>
                    <p className="text-sm text-white font-medium break-all">{currentUser?.email}</p>
                  </div>
                  
                  <div className="rounded-xl bg-black/40 border border-white/10 p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Firebase UID</p>
                    <p className="text-xs text-gray-300 font-mono break-all">{currentUser?.uid}</p>
                  </div>
                  
                  <div className="rounded-xl bg-black/40 border border-white/10 p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-2">Perfil Backend</p>
                    {userProfile ? (
                      <div className="space-y-2">
                        <p className="text-sm font-bold text-green-400">#{userProfile.id}</p>
                        {userProfile?.createdAt && (
                          <p className="text-xs text-gray-500">
                            Creado {new Date(userProfile.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-red-400">No creado</p>
                    )}
                  </div>
                </div>
                
                <Button variant="outline" onClick={fetchProfiles} isLoading={isFetching} className="w-full">
                  Recargar perfiles
                </Button>
              </div>
            </div>

            {/* Profile Editor Card */}
            <div className="lg:col-span-2 group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Perfil Backend</h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full mb-3"></div>
                  <p className="text-sm text-gray-400">
                    El API de Spring almacena este registro y lo conecta a assets, borradores y trabajos.
                  </p>
                </div>
                
                <form className="space-y-6" onSubmit={handleSaveProfile}>
                  <Input
                    label="Nombre para mostrar"
                    placeholder="Marketing de Producto"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                  
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <Button type="submit" variant="primary" isLoading={isSaving} className="flex-1 sm:flex-none">
                      {userProfile ? 'Actualizar perfil' : 'Crear perfil'}
                    </Button>
                    {userProfile && (
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleDeleteProfile(userProfile.id)}
                        isLoading={isDeleting === userProfile.id}
                        className="flex-1 sm:flex-none"
                      >
                        Eliminar mi perfil
                      </Button>
                    )}
                  </div>
                  
                  <div className="rounded-xl bg-blue-500/10 border border-blue-500/30 p-4 backdrop-blur-xl">
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-xs text-blue-300 leading-relaxed">
                        Guardar sobrescribe tu perfil backend existente para que los recursos downstream siempre apunten al nombre más reciente.
                      </p>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Collaborator Directory */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
            
            <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Directorio de colaboradores</h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full mb-3"></div>
                  <p className="text-sm text-gray-400">
                    Cada trabajo de publicación puede referenciar estos IDs de perfil como propietarios.
                  </p>
                </div>
                <span className="text-sm font-bold text-white bg-white/10 px-5 py-2.5 rounded-full border border-white/20">
                  {profiles.length} {profiles.length === 1 ? 'perfil' : 'perfiles'}
                </span>
              </div>

              <div className="overflow-x-auto rounded-2xl border border-white/10 backdrop-blur-xl">
                <table className="min-w-full text-sm">
                  <thead className="bg-black/40 text-gray-400 uppercase tracking-wider">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-bold">ID</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Nombre</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Email</th>
                      <th className="px-6 py-4 text-left text-xs font-bold">Creado</th>
                      <th className="px-6 py-4"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {profiles.map((profile) => (
                      <tr key={profile.id} className="hover:bg-white/5 transition-colors duration-200">
                        <td className="px-6 py-4">
                          <span className="font-mono text-xs text-purple-400 font-bold">#{profile.id}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-white font-medium">{profile.displayName}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-300 text-sm">{profile.email}</span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-gray-400 text-xs">
                            {profile.createdAt ? new Date(profile.createdAt).toLocaleString() : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            type="button"
                            variant="ghost"
                            onClick={() => handleDeleteProfile(profile.id)}
                            disabled={isDeleting !== null}
                            isLoading={isDeleting === profile.id}
                          >
                            Eliminar
                          </Button>
                        </td>
                      </tr>
                    ))}
                    {!profiles.length && (
                      <tr>
                        <td className="px-6 py-8 text-center text-gray-500" colSpan={5}>
                          <div className="flex flex-col items-center gap-3">
                            <div className="text-4xl opacity-40">👥</div>
                            <p className="text-sm">
                              {isFetching ? 'Cargando perfiles...' : 'No hay perfiles registrados aún.'}
                            </p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;