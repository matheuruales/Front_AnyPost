import api from './api';
import {
  AssetRequest,
  AssetResponse,
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

export interface VideoUploadPayload {
  file: File;
  title: string;
  description?: string;
  ownerId: number;
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
  getUserPosts: (authUserId: string) => withJsonData<UserPost[]>(api.get(`/users/${authUserId}/posts`)),
  createUserPost: (authUserId: string, payload: UserPostRequest) =>
    withJsonData<UserPost>(api.post(`/users/${authUserId}/posts`, payload)),
  deleteUserPost: (postId: string) => api.delete(`/posts/${postId}`),

  // Video operations
  uploadVideoAsset: ({ file, title, description = '', ownerId, targets }: VideoUploadPayload) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('ownerId', ownerId.toString());
    formData.append('targets', targets);

    return withJsonData<string>(
      api.post('/videos/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
    );
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

  downloadGeneratedImage: (imageUrl: string) =>
    api
      .get<Blob>('/ai/images/proxy', {
        params: { imageUrl },
        responseType: 'blob',
      })
      .then((response) => response.data),
};
