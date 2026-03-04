export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    message: string;
    code?: string;
  };
}

export interface PresignedUrlRequest {
  filename: string;
  contentType: string;
  type: 'audio' | 'video' | 'image';
}

export interface PresignedUrlResponse {
  uploadUrl: string;
  objectKey: string;
  publicUrl: string;
}

export interface UploadConfirmRequest {
  objectKey: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
}
