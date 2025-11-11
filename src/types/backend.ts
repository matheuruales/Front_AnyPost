export interface PostDraftRequest {
  title: string;
  description?: string;
  assetId: number;
  targets: string;
  status?: string;
}

export interface PostDraftResponse extends PostDraftRequest {
  id: number;
  createdAt?: string | null;
}

export interface AssetRequest {
  owner: number;
  type: string;
  source?: string;
  blobUrl: string;
}

export interface AssetResponse extends AssetRequest {
  id: number;
  createdAt?: string | null;
}

export interface PublicationJobRequest {
  postDraftId: number;
  status?: string;
}

export interface PublicationJobResponse extends PublicationJobRequest {
  id: number;
  requestedAt?: string | null;
}

export interface PublicationResultRequest {
  network: string;
  status: string;
  url?: string;
  error?: string;
}

export interface PublicationResultResponse extends PublicationResultRequest {
  id: number;
}

export interface UserProfileRequest {
  email: string;
  displayName: string;
  authUserId: string;
}

export interface UserProfileResponse extends UserProfileRequest {
  id: number;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface VideoJobStatus {
  jobId: number;
  status: string;
  createdAt?: string | null;
  updatedAt?: string | null;
  videoUrl?: string;
  errorMessage?: string;
}

export interface VideoJobCreationResponse {
  jobId: number;
  message: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  size?: string;
  quality?: string;
  style?: string;
}

export interface ImageGenerationResponse {
  prompt: string;
  revisedPrompt?: string | null;
  imageUrl: string;
  size: string;
  quality: string;
  style: string;
  generatedAt?: string | null;
}

export interface PostPublication {
  id: string;
  network: string;
  status: string;
  publishedUrl?: string | null;
  publishedAt?: string | null;
}

export interface PostPublicationRequest {
  network: string;
  status: string;
  publishedUrl?: string | null;
  publishedAt?: string | null;
}

export interface UserPostRequest {
  title: string;
  content?: string | null;
  status?: string | null;
  videoUrl?: string | null;
  publishedAt?: string | null;
  tags?: string[];
  targetPlatforms?: string[];
  publications?: PostPublicationRequest[];
}

export interface UserPost {
  id: string;
  title: string;
  content?: string | null;
  thumbnail?: string | null;
  status: string;
  videoUrl?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  publishedAt?: string | null;
  ownerAuthUserId?: string | null;
  tags?: string[];
  targetPlatforms?: string[];
  publications?: PostPublication[];
}
