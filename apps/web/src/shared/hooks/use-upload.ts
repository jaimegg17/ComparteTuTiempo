import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { uploadApi } from '../api/upload';
import { apiClient } from '../api/client';
import { useAuth } from '@/hooks/useAuth';

interface UploadError {
  status?: number;
  message?: string;
}

interface SafeUploadSuccess<T> {
  success: true;
  data: T;
}

interface SafeUploadFailure {
  success: false;
  error: unknown;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Hook to upload an image
 * @returns Mutation object with uploadImage function
 */
export const useUploadImage = () => {
  const queryClient = useQueryClient();
  const { getAccessToken, user, isLoading } = useAuth();

  const performUpload = useCallback(async (file: File) => {
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
    }, [getAccessToken, isLoading, user]);

  const performUploadSafely = useCallback(async (file: File) => {
    if (!user) {
      return {
        success: false as const,
        error: new Error('Debes iniciar sesión para subir imágenes. Por favor, inicia sesión e intenta nuevamente.'),
      };
    }

    if (isLoading) {
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    const token = await getAccessToken(true);

    if (!token) {
      return {
        success: false as const,
        error: new Error('No se pudo obtener el token de autenticación. Por favor, recarga la página e inicia sesión nuevamente.'),
      };
    }

    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await fetch(`${API_BASE_URL}/upload/image`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          const raw = errorData.message ?? errorData.error;
          errorMessage = Array.isArray(raw) ? raw[0] ?? raw.join(' ') : (raw || errorMessage);
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        return {
          success: false as const,
          error: Object.assign(new Error(errorMessage), { status: response.status, response }),
        };
      }

      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });

      return {
        success: true as const,
        data,
      };
    } catch (error) {
      return {
        success: false as const,
        error,
      };
    }
  }, [getAccessToken, isLoading, queryClient, user]);

  const mutation = useMutation({
    mutationFn: performUpload,
    throwOnError: false,
    retry: false,
    onSuccess: () => {
      // Invalidate any queries that might depend on uploaded images
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });

  const safeUploadImage = useCallback(
    async (file: File): Promise<SafeUploadSuccess<Awaited<ReturnType<typeof performUpload>>> | SafeUploadFailure> => {
      const result = await performUploadSafely(file);
      if (result.success) {
        return { success: true, data: result.data };
      }
      return { success: false, error: result.error };
    },
    [performUploadSafely],
  );

  return {
    ...mutation,
    safeUploadImage,
  };
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
