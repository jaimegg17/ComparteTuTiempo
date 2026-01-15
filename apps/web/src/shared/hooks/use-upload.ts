import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadApi } from '../api/upload';
import { apiClient } from '../api/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Hook to upload an image
 * @returns Mutation object with uploadImage function
 */
export const useUploadImage = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      // Get token and set it in API client
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }
      return uploadApi.uploadImage(file);
    },
    onSuccess: () => {
      // Invalidate any queries that might depend on uploaded images
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};

/**
 * Hook to delete an image
 * @returns Mutation object with deleteImage function
 */
export const useDeleteImage = () => {
  const queryClient = useQueryClient();
  const { getAccessToken } = useAuth();

  return useMutation({
    mutationFn: async (publicId: string) => {
      // Get token and set it in API client
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }
      return uploadApi.deleteImage(publicId);
    },
    onSuccess: () => {
      // Invalidate any queries that might depend on images
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
};
