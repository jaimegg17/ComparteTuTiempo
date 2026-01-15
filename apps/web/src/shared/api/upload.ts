import { apiClient } from './client';

export interface UploadImageResponse {
  success: boolean;
  filename: string;
  originalName: string;
  size: number;
  width: number;
  height: number;
  format: string;
  url: string;
}

export interface DeleteImageResponse {
  success: boolean;
  message: string;
}

export const uploadApi = {
  /**
   * Upload an image file to the server
   * @param file - Image file to upload
   * @returns Upload response with image URL and metadata
   */
  async uploadImage(file: File): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('image', file);

    return apiClient.post<UploadImageResponse>('/upload/image', formData, true);
  },

  /**
   * Delete an image from Cloudinary
   * @param publicId - Cloudinary public ID of the image
   * @returns Delete response
   */
  async deleteImage(publicId: string): Promise<DeleteImageResponse> {
    return apiClient.delete<DeleteImageResponse>(`/upload/image/${encodeURIComponent(publicId)}`);
  },
};
