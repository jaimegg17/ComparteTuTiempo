import { apiClient } from './client';
import type { 
  Rating, 
  RatingCreate, 
  RatingUpdate,
  RatingListQuery,
  RatingListResponse
} from '@comparte-tu-tiempo/contracts';

export const ratingsApi = {
  // Obtener lista de valoraciones
  async getRatings(query: RatingListQuery): Promise<RatingListResponse> {
    const searchParams = new URLSearchParams();
    
    if (query.userId) searchParams.append('userId', query.userId);
    if (query.serviceId) searchParams.append('serviceId', query.serviceId.toString());
    if (query.score) searchParams.append('score', query.score.toString());
    searchParams.append('page', (query.page || 1).toString());
    searchParams.append('pageSize', (query.pageSize || 20).toString());

    return apiClient.get<RatingListResponse>(`/ratings?${searchParams.toString()}`);
  },

  // Obtener valoración por ID
  async getRating(id: number): Promise<Rating> {
    return apiClient.get<Rating>(`/ratings/${id}`);
  },

  // Crear nueva valoración
  async createRating(data: RatingCreate): Promise<{ rating: Rating }> {
    return apiClient.post<{ rating: Rating }>('/ratings', data);
  },

  // Actualizar valoración
  async updateRating(id: number, data: RatingUpdate): Promise<{ rating: Rating }> {
    return apiClient.put<{ rating: Rating }>(`/ratings/${id}`, data);
  },

  // Eliminar valoración
  async deleteRating(id: number): Promise<void> {
    return apiClient.delete<void>(`/ratings/${id}`);
  },
};
