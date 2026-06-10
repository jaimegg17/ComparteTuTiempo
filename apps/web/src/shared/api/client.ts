import { API_BASE_URL } from './config';

interface ApiError extends Error {
  status?: number;
  response?: Response;
}

export class ApiClient {
  private baseUrl: string;
  private token?: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers: Record<string, string> = {
      ...(options.headers as Record<string, string>),
    };

    // Only set Content-Type if not already set (e.g., for FormData)
    // IMPORTANT: Don't set Content-Type for FormData - browser will set it with boundary
    if (!headers['Content-Type'] && !(options.body instanceof FormData)) {
      headers['Content-Type'] = 'application/json';
    }

    // Always set Authorization header if we have a token
    // This must be set even for FormData requests
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
      console.log('🔑 Setting Authorization header, token length:', this.token.length);
    } else {
      console.warn('⚠️ No token available in apiClient for request to:', endpoint);
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    // Log request details for debugging
    console.log('📤 Making request:', {
      method: config.method || 'GET',
      url,
      hasToken: !!this.token,
      isFormData: options.body instanceof FormData,
      headers: Object.keys(headers),
    });

    try {
      // Asegurar que fetch esté disponible
      if (typeof fetch === 'undefined') {
        throw new Error('Fetch API no está disponible en este entorno');
      }

      const response = await fetch(url, config);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          const raw = errorData.message ?? errorData.error;
          // Nest/ValidationPipe can return message as string or string[]
          errorMessage = Array.isArray(raw) ? raw[0] ?? raw.join(' ') : (raw || errorMessage);
        } catch {
          errorMessage = response.statusText || errorMessage;
        }

        const error: ApiError = new Error(errorMessage);
        error.status = response.status;
        error.response = response;
        throw error;
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown, isFormData: boolean = false): Promise<T> {
    // For FormData, we don't set Content-Type (browser will set it with boundary)
    // But we still need to pass the Authorization header
    const headers: Record<string, string> = {};
    
    // Don't set Content-Type for FormData, browser will set it with boundary
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    // Authorization header will be added in request() method
    // But we ensure it's available here too
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const requestBody: BodyInit | undefined = isFormData
      ? (data as BodyInit | undefined)
      : (data ? JSON.stringify(data) : undefined);

    return this.request<T>(endpoint, {
      method: 'POST',
      headers,
      body: requestBody,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
