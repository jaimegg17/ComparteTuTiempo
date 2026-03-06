import { useMutation, useQueryClient } from '@tanstack/react-query';
import { uploadApi } from '../api/upload';
import { apiClient } from '../api/client';
import { useAuth } from '@/hooks/useAuth';

interface UploadError {
  status?: number;
  message?: string;
}

/**
 * Hook to upload an image
 * @returns Mutation object with uploadImage function
 */
export const useUploadImage = () => {
  const queryClient = useQueryClient();
  const { getAccessToken, user, isLoading } = useAuth();

  return useMutation({
    mutationFn: async (file: File) => {
      // Ensure user is authenticated
      if (!user) {
        console.error('❌ User not authenticated');
        throw new Error('Debes iniciar sesión para subir imágenes. Por favor, inicia sesión e intenta nuevamente.');
      }

      if (isLoading) {
        console.log('⏳ Waiting for auth to load...');
        // Wait a bit for auth to finish loading
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('🔑 Attempting to get access token for user:', user.sub);
      
      // Always get a fresh token before making the request
      // Don't rely on cached token as it might be expired
      // Force refresh to ensure we get a valid token
      const token = await getAccessToken(true); // forceRefresh = true
      
      if (!token) {
        console.error('❌ Failed to get access token');
        console.error('User:', user);
        console.error('User sub:', user.sub);
        throw new Error('No se pudo obtener el token de autenticación. Por favor, recarga la página e inicia sesión nuevamente.');
      }
      
      console.log('✅ Token obtained, length:', token.length);
      console.log('✅ Token preview:', token.substring(0, 20) + '...');
      
      // Always set a fresh token before making the request
      // Clear any old token first to avoid issues
      apiClient.setToken(token);
      console.log('✅ Token set in apiClient');
      
      // Small delay to ensure token is set
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        console.log('📤 Starting image upload...');
        const result = await uploadApi.uploadImage(file);
        console.log('✅ Image upload successful');
        return result;
      } catch (error: unknown) {
        const uploadError = (error ?? {}) as UploadError;
        // If we get a 401, the token might be expired
        if (
          uploadError.status === 401 ||
          uploadError.message?.includes('401') ||
          uploadError.message?.includes('Unauthorized') ||
          uploadError.message?.includes('Token inválido')
        ) {
          console.log('🔄 Token expired or invalid, trying to get a fresh one...');
          // Force a fresh token fetch (don't use cache)
          const freshToken = await getAccessToken(true); // forceRefresh = true
          if (freshToken && freshToken !== token) {
            apiClient.setToken(freshToken);
            // Retry once with the fresh token
            return await uploadApi.uploadImage(file);
          } else {
            throw new Error('Token de autenticación inválido o expirado. Por favor, recarga la página e inicia sesión nuevamente.');
          }
        }
        throw error;
      }
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
