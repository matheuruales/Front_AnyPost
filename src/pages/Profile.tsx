import React, { useCallback, useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../hooks/useAuth';
import Loader from '../components/ui/Loader';
import { backendApi } from '../services/backend';
import { UserPost } from '../types/backend';

type Banner = { type: 'success' | 'error'; text: string } | null;

const PostHistory: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [posts, setPosts] = useState<UserPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<UserPost[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<Banner>(null);
  const [isFetching, setIsFetching] = useState(true);
  const [selectedPost, setSelectedPost] = useState<UserPost | null>(null);

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

  // Filtrar publicaciones
  useEffect(() => {
    let filtered = posts;

    // Filtrar por término de búsqueda
    if (searchTerm) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filtrar por estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(post => post.status === statusFilter);
    }

    setFilteredPosts(filtered);
  }, [posts, searchTerm, statusFilter]);

  const fetchUserPosts = useCallback(async () => {
    if (!currentUser) {
      setIsFetching(false);
      return;
    }

    setIsFetching(true);
    try {
      console.log('Fetching posts for user:', {
        authUserId: currentUser.uid,
        email: currentUser.email
      });

      const userPosts = await backendApi.getUserPosts({
        authUserId: currentUser.uid,
        email: currentUser.email ?? undefined,
      });

      console.log('Received posts from backend:', userPosts);
      setPosts(userPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      handleError(error, 'No se pudieron cargar las publicaciones.');
    } finally {
      setIsFetching(false);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchUserPosts();
  }, [fetchUserPosts]);

  const handleViewDetails = (post: UserPost) => {
    setSelectedPost(post);
  };

  const handleCloseDetails = () => {
    setSelectedPost(null);
  };

  const handleDeletePost = async (postId: string) => {
    try {
      await backendApi.deleteUserPost(postId);
      setPosts(prev => prev.filter(post => post.id !== postId));
      setFeedback({ type: 'success', text: 'Publicación eliminada correctamente.' });
    } catch (error) {
      handleError(error, 'No se pudo eliminar la publicación.');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30', label: 'Borrador' },
      published: { color: 'bg-green-500/20 text-green-300 border-green-500/30', label: 'Publicado' },
      scheduled: { color: 'bg-blue-500/20 text-blue-300 border-blue-500/30', label: 'Programado' },
      archived: { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', label: 'Archivado' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                  { color: 'bg-gray-500/20 text-gray-300 border-gray-500/30', label: status };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getPublicationBadge = (status: string) => {
    const normalized = status?.toLowerCase();
    const styles: Record<string, string> = {
      published: 'bg-green-500/10 text-green-300 border-green-500/30',
      completed: 'bg-green-500/10 text-green-300 border-green-500/30',
      scheduled: 'bg-blue-500/10 text-blue-300 border-blue-500/30',
      failed: 'bg-red-500/10 text-red-300 border-red-500/30',
      error: 'bg-red-500/10 text-red-300 border-red-500/30',
      processing: 'bg-yellow-500/10 text-yellow-200 border-yellow-500/30',
    };

    return styles[normalized || ''] || 'bg-gray-500/10 text-gray-300 border-gray-500/30';
  };

  const renderTargets = (targets?: string[]) => {
    if (!targets || !targets.length) return null;

    return (
      <div className="flex flex-wrap gap-2 mb-4">
        {targets.map((target, index) => (
          <span
            key={`${target}-${index}`}
            className="px-2 py-1 bg-indigo-500/10 text-indigo-200 border border-indigo-500/30 rounded-lg text-xs"
          >
            {target}
          </span>
        ))}
      </div>
    );
  };

  const renderPublicationSummary = (post: UserPost) => {
    if (!post.publications || !post.publications.length) {
      return <p className="text-sm text-gray-500">Sin registros de publicación.</p>;
    }

    return (
      <div className="flex flex-wrap gap-3">
        {post.publications.map((publication) => {
          const href = publication.publishedUrl || post.videoUrl || '#';
          const hasLink = Boolean(publication.publishedUrl || post.videoUrl);
          return (
            <a
              key={publication.id}
              href={hasLink ? href : undefined}
              target={hasLink ? '_blank' : undefined}
              rel={hasLink ? 'noreferrer' : undefined}
              className={`px-3 py-2 rounded-xl border ${getPublicationBadge(publication.status)} ${
                hasLink ? 'hover:border-white/40 transition-colors' : 'cursor-default'
              }`}
            >
              <div className="text-xs uppercase tracking-wide text-gray-400">{publication.network}</div>
              <div className="text-sm font-semibold">{publication.status}</div>
            </a>
          );
        })}
      </div>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
        <div className="relative z-10 max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <header className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 blur-md opacity-75"></div>
                <div className="relative h-3 w-3 rounded-full bg-gradient-to-r from-pink-500 to-yellow-500"></div>
              </div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-gray-500">Historial de Publicaciones</p>
            </div>
            
            <h1 className="text-5xl font-bold mb-4">
              <span className="bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                Tus Publicaciones
              </span>
            </h1>
            
            <p className="text-gray-400 text-lg max-w-3xl">
              Revisa y gestiona todo tu historial de publicaciones en una sola vista.
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

          {/* Filters and Search */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Search Card */}
            <div className="group relative lg:col-span-2">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Buscar Publicaciones</h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <Input
                    label="Buscar en publicaciones"
                    placeholder="Título, contenido o etiquetas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Filtrar por estado
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent backdrop-blur-xl"
                    >
                      <option value="all">Todos los estados</option>
                      <option value="draft">Borrador</option>
                      <option value="published">Publicado</option>
                      <option value="scheduled">Programado</option>
                      <option value="archived">Archivado</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Card */}
            <div className="group relative">
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
              
              <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-white mb-2">Resumen</h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full"></div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Total</span>
                    <span className="text-white font-bold text-xl">{posts.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Publicados</span>
                    <span className="text-green-400 font-bold">
                      {posts.filter(p => p.status === 'published').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Borradores</span>
                    <span className="text-yellow-400 font-bold">
                      {posts.filter(p => p.status === 'draft').length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Mostrando</span>
                    <span className="text-purple-400 font-bold">{filteredPosts.length}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Posts Grid */}
          <div className="group relative">
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-700"></div>
            
            <div className="relative bg-gradient-to-br from-gray-900/50 via-gray-800/40 to-gray-900/50 backdrop-blur-xl rounded-3xl border border-white/10 p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_8px_40px_rgba(0,0,0,0.12)]">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Tus Publicaciones</h2>
                  <div className="h-1 w-12 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 rounded-full mb-3"></div>
                </div>
                
                <Button
                  variant="outline"
                  onClick={fetchUserPosts}
                  isLoading={isFetching}
                >
                  Actualizar
                </Button>
              </div>

              {/* Posts List */}
              <div className="space-y-4">
                {filteredPosts.map((post) => (
                  <div
                    key={post.id}
                    className="group/post relative bg-black/40 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition-all duration-300 backdrop-blur-xl"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                      {/* Post Thumbnail */}
                      {post.thumbnail && (
                        <div className="flex-shrink-0">
                          <img
                            src={post.thumbnail}
                            alt={post.title}
                            className="w-20 h-20 rounded-xl object-cover"
                          />
                        </div>
                      )}
                      
                      {/* Post Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                          <h3 className="text-lg font-semibold text-white group-hover/post:text-purple-300 transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(post.status)}
                            {post.publishedAt && post.status === 'published' && (
                              <span className="text-xs text-gray-400">
                                {formatDate(post.publishedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <p className="text-gray-300 text-sm mb-4 line-clamp-2">
                          {post.content || 'Sin contenido...'}
                        </p>

                        {post.videoUrl && (
                          <div className="flex flex-wrap items-center gap-2 mb-4 text-sm text-gray-400">
                            <span>Video público:</span>
                            <a
                              href={post.videoUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-300 hover:text-purple-100 underline decoration-dotted"
                            >
                              Ver video
                            </a>
                          </div>
                        )}

                        {renderTargets(post.targetPlatforms)}
                        
                        {/* Tags */}
                        {post.tags && post.tags.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-4">
                            {post.tags.slice(0, 3).map((tag, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded-lg text-xs"
                              >
                                #{tag}
                              </span>
                            ))}
                            {post.tags.length > 3 && (
                              <span className="px-2 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-xs">
                                +{post.tags.length - 3} más
                              </span>
                            )}
                          </div>
                        )}

                        <div className="mb-4">
                          <p className="text-xs uppercase tracking-[0.3em] text-gray-500 mb-2">
                            Redes sociales
                          </p>
                          {renderPublicationSummary(post)}
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDetails(post)}
                          >
                            Ver detalles
                          </Button>
                          
                          {post.status === 'draft' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => {/* Implement edit */}}
                            >
                              Editar
                            </Button>
                          )}
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                          >
                            Eliminar
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {!filteredPosts.length && !isFetching && (
                  <div className="text-center py-12">
                    <div className="text-4xl opacity-40 mb-4">📝</div>
                    <p className="text-gray-400 text-lg mb-2">
                      {searchTerm || statusFilter !== 'all' 
                        ? 'No se encontraron publicaciones con los filtros aplicados.' 
                        : 'Aún no tienes publicaciones.'}
                    </p>
                    {searchTerm || statusFilter !== 'all' ? (
                      <Button
                        variant="outline"
                        onClick={() => {
                          setSearchTerm('');
                          setStatusFilter('all');
                        }}
                      >
                        Limpiar filtros
                      </Button>
                    ) : (
                      <Button variant="primary">
                        Crear primera publicación
                      </Button>
                    )}
                  </div>
                )}
                
                {isFetching && (
                  <div className="text-center py-12">
                    <Loader />
                    <p className="text-gray-400 mt-4">Cargando publicaciones...</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Post Details Modal */}
      {selectedPost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-3xl border border-white/10 p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-2xl font-bold text-white">{selectedPost.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCloseDetails}
              >
                ✕
              </Button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Estado:</span>
                  <div className="mt-1">{getStatusBadge(selectedPost.status)}</div>
                </div>
                <div>
                  <span className="text-gray-400">Creado:</span>
                  <p className="text-white mt-1">{formatDate(selectedPost.createdAt)}</p>
                </div>
                {selectedPost.publishedAt && (
                  <div>
                    <span className="text-gray-400">Publicado:</span>
                    <p className="text-white mt-1">{formatDate(selectedPost.publishedAt)}</p>
                  </div>
                )}
                {selectedPost.updatedAt && (
                  <div>
                    <span className="text-gray-400">Actualizado:</span>
                    <p className="text-white mt-1">{formatDate(selectedPost.updatedAt)}</p>
                  </div>
                )}
              </div>
              
              {selectedPost.content && (
                <div>
                  <span className="text-gray-400 block mb-2">Contenido:</span>
                  <p className="text-white bg-black/30 rounded-xl p-4 whitespace-pre-wrap">
                    {selectedPost.content}
                  </p>
                </div>
              )}
              
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-2">Etiquetas:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedPost.videoUrl && (
                <div>
                  <span className="text-gray-400 block mb-2">Video público:</span>
                  <a
                    href={selectedPost.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-purple-300 hover:text-purple-100 underline decoration-dotted"
                  >
                    Abrir enlace
                  </a>
                </div>
              )}

              {selectedPost.targetPlatforms && selectedPost.targetPlatforms.length > 0 && (
                <div>
                  <span className="text-gray-400 block mb-2">Redes objetivo:</span>
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.targetPlatforms.map((target, index) => (
                      <span
                        key={`${target}-${index}`}
                        className="px-3 py-1 bg-indigo-500/20 text-indigo-200 rounded-full text-sm"
                      >
                        {target}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <span className="text-gray-400 block mb-2">Historial de publicaciones:</span>
                {selectedPost.publications && selectedPost.publications.length > 0 ? (
                  <div className="space-y-3">
                    {selectedPost.publications.map((publication) => (
                      <div
                        key={publication.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-black/30 border border-white/5 rounded-2xl p-4"
                      >
                        <div>
                          <p className="text-white font-semibold">{publication.network}</p>
                          <p className="text-sm text-gray-400">{publication.status}</p>
                        </div>
                        <div className="text-sm text-gray-400 text-left sm:text-right">
                          {publication.publishedAt && (
                            <p className="mb-1">{formatDate(publication.publishedAt)}</p>
                          )}
                          {publication.publishedUrl && (
                            <a
                              href={publication.publishedUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-purple-300 hover:text-purple-100 underline decoration-dotted"
                            >
                              Ver publicación
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Sin información de redes sociales.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default PostHistory;
