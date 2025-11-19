import api, { API_BASE_URL } from './api';
import axios from 'axios';
import {
  AssetRequest,
  AssetResponse,
  AuthLoginRequest,
  AuthRegisterRequest,
  AuthResponse,
  PostDraftRequest,
  PostDraftResponse,
  PublicationJobRequest,
  PublicationJobResponse,
  PublicationResultRequest,
  PublicationResultResponse,
  UserProfileRequest,
  UserProfileResponse,
  UserPost,
  UserPostRequest,
  VideoJobStatus,
  VideoJobCreationResponse,
  ImageGenerationRequest,
  ImageGenerationResponse,
} from '../types/backend';

export interface UserPostQuery {
  authUserId?: string | null;
  profileId?: number | null;
  email?: string | null;
}

export interface VideoUploadPayload {
  file: File;
  title: string;
  description?: string;
  authUserId: string;
  targets: string;
}

export interface VideoPromptPayload {
  prompt: string;
  title: string;
  description?: string;
  ownerId: number;
  targets: string;
  style?: string;
}

const withJsonData = async <T>(promise: Promise<{ data: T }>) => {
  const { data } = await promise;
  return data;
};

export const backendApi = {
  // Post drafts
  getPostDrafts: () => withJsonData<PostDraftResponse[]>(api.get('/post-drafts')),
  createPostDraft: (payload: PostDraftRequest) => withJsonData<PostDraftResponse>(api.post('/post-drafts', payload)),
  deletePostDraft: (id: number) => api.delete(`/post-drafts/${id}`),

  // Assets
  getAssets: () => withJsonData<AssetResponse[]>(api.get('/assets')),
  createAsset: (payload: AssetRequest) => withJsonData<AssetResponse>(api.post('/assets', payload)),
  deleteAsset: (id: number) => api.delete(`/assets/${id}`),

  auth: {
    login: (payload: AuthLoginRequest) => withJsonData<AuthResponse>(api.post('/auth/login', payload)),
    register: (payload: AuthRegisterRequest) => withJsonData<AuthResponse>(api.post('/auth/register', payload)),
    me: () => withJsonData<AuthResponse>(api.get('/auth/me')),
    forgotPassword: (email: string) => api.post('/auth/forgot-password', { email }),
    verifyResetCode: (email: string, code: string) => api.post('/auth/verify-reset-code', { email, code }),
    resetPassword: (email: string, code: string, newPassword: string) =>
      api.post('/auth/reset-password', { email, code, newPassword }),
  },

  // Publication jobs
  getPublicationJobs: () => withJsonData<PublicationJobResponse[]>(api.get('/publication-jobs')),
  createPublicationJob: (payload: PublicationJobRequest) =>
    withJsonData<PublicationJobResponse>(api.post('/publication-jobs', payload)),
  deletePublicationJob: (id: number) => api.delete(`/publication-jobs/${id}`),

  // Publication results
  getPublicationResults: () => withJsonData<PublicationResultResponse[]>(api.get('/publication-results')),
  createPublicationResult: (payload: PublicationResultRequest) =>
    withJsonData<PublicationResultResponse>(api.post('/publication-results', payload)),
  deletePublicationResult: (id: number) => api.delete(`/publication-results/${id}`),

  // User profiles
  getUserProfiles: () => withJsonData<UserProfileResponse[]>(api.get('/user-profiles')),
  createUserProfile: (payload: UserProfileRequest) => withJsonData<UserProfileResponse>(api.post('/user-profiles', payload)),
  deleteUserProfile: (id: number) => api.delete(`/user-profiles/${id}`),

  // User posts
  getUserPosts: (params: UserPostQuery) => {
    const cleanParams: Record<string, string | number> = {};
    if (params.authUserId) cleanParams.authUserId = params.authUserId;
    if (params.profileId !== undefined && params.profileId !== null) cleanParams.profileId = params.profileId;
    if (params.email) cleanParams.email = params.email;
    
    console.log('[backendApi.getUserPosts] Request params:', cleanParams);
    console.log('[backendApi.getUserPosts] Full URL will be:', `${API_BASE_URL}/user-posts?${new URLSearchParams(cleanParams as Record<string, string>).toString()}`);
    
    return withJsonData<UserPost[]>(api.get('/user-posts', { params: cleanParams }));
  },
  getUserPostById: (postId: string) => withJsonData<UserPost>(api.get(`/user-posts/${postId}`)),
  
  // Public endpoint for shared posts (doesn't require authentication)
  // Only returns posts with status = "published"
  getSharedPostById: (postId: string) => {
    // Create a new axios instance without interceptors for public access
    const publicApi = axios.create({
      baseURL: API_BASE_URL,
    });
    return withJsonData<UserPost>(publicApi.get(`/posts/public/${postId}`));
  },
  createUserPost: (authUserId: string, payload: UserPostRequest) =>
    withJsonData<UserPost>(api.post(`/users/${authUserId}/posts`, payload)),
  deleteUserPost: (postId: string) => api.delete(`/posts/${postId}`),

  // Video operations
  uploadVideoAsset: ({ file, title, description = '', authUserId, targets }: VideoUploadPayload) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('authUserId', authUserId);
    formData.append('targets', targets);

    return withJsonData<string>(api.post('/videos/upload', formData));
  },

  generateVideoAsync: async ({
    prompt,
    title,
    description = '',
    ownerId,
    targets,
    style,
  }: VideoPromptPayload): Promise<VideoJobCreationResponse> => {
    const formData = new URLSearchParams();
    formData.set('prompt', prompt);
    formData.set('title', title);
    formData.set('description', description);
    formData.set('ownerId', ownerId.toString());
    formData.set('targets', targets);
    if (style) {
      formData.set('style', style);
    }

    const { data } = await api.post<string>('/videos/generate', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    const jobIdMatch = data.match(/job id[:\s]+(\d+)/i);
    if (!jobIdMatch) {
      throw new Error('El backend no devolvió un Job ID válido.');
    }

    return {
      jobId: Number(jobIdMatch[1]),
      message: data,
    };
  },

  getVideoJobStatus: (jobId: number) => withJsonData<VideoJobStatus>(api.get(`/videos/jobs/${jobId}`)),

  generateImageFromPrompt: (payload: ImageGenerationRequest) =>
    withJsonData<ImageGenerationResponse>(api.post('/ai/images/generate', payload)),

  uploadAiImageToBlobStorage: (imageUrl: string) =>
    withJsonData<{ blobUrl: string }>(api.post('/ai/images/upload-to-blob', null, {
      params: { imageUrl },
    })),

  downloadGeneratedImage: (imageUrl: string) =>
    api
      .get<Blob>('/ai/images/proxy', {
        params: { imageUrl },
        responseType: 'blob',
      })
      .then((response) => response.data),

  // Video streaming - returns the streaming URL for a blob URL
  getVideoStreamUrl: (blobUrl: string): string => {
    if (!blobUrl) return '';
    // Encode the blob URL as a query parameter
    const encodedUrl = encodeURIComponent(blobUrl);
    return `${API_BASE_URL}/videos/stream?url=${encodedUrl}`;
  },
};
