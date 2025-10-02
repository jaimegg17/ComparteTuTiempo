import { useState, useCallback } from 'react';

export interface ErrorState {
  error: string | null;
  loading: boolean;
  success: boolean;
}

export interface UseErrorHandlingReturn {
  error: string | null;
  loading: boolean;
  success: boolean;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  setSuccess: (success: boolean) => void;
  clearError: () => void;
  handleAsyncOperation: <T>(
    operation: () => Promise<T>,
    errorMessage?: string
  ) => Promise<T | null>;
  reset: () => void;
}

export function useErrorHandling(initialState: Partial<ErrorState> = {}): UseErrorHandlingReturn {
  const [error, setError] = useState<string | null>(initialState.error || null);
  const [loading, setLoading] = useState<boolean>(initialState.loading || false);
  const [success, setSuccess] = useState<boolean>(initialState.success || false);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setLoading(false);
    setSuccess(false);
  }, []);

  const handleAsyncOperation = useCallback(async <T>(
    operation: () => Promise<T>,
    errorMessage: string = 'An unexpected error occurred'
  ): Promise<T | null> => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);
      
      const result = await operation();
      setSuccess(true);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : errorMessage;
      setError(errorMsg);
      setSuccess(false);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    error,
    loading,
    success,
    setError,
    setLoading,
    setSuccess,
    clearError,
    handleAsyncOperation,
    reset,
  };
}

// Common error messages in English
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network connection error. Please check your internet connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  FORBIDDEN: 'Access denied. You do not have permission to access this resource.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
  TIMEOUT: 'Request timeout. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred. Please try again.',
  INVALID_TOKEN: 'Invalid or expired authentication token.',
  SESSION_EXPIRED: 'Your session has expired. Please log in again.',
  RATE_LIMITED: 'Too many requests. Please wait a moment and try again.',
  MAINTENANCE: 'The service is temporarily unavailable for maintenance.',
} as const;

// Helper function to extract error message from API responses
export function extractErrorMessage(error: any): string {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error?.message) {
    return error.message;
  }
  
  if (error?.error) {
    return error.error;
  }
  
  return ERROR_MESSAGES.UNKNOWN_ERROR;
}
