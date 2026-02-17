import { apiClient } from './client';
import type { 
  Community, 
  CommunityCreate, 
  CommunityListQuery, 
  CommunityListResponse 
} from '@comparte-tu-tiempo/contracts';

export const communitiesApi = {
  // Obtener lista de comunidades
  async getCommunities(query: CommunityListQuery): Promise<CommunityListResponse> {
    const searchParams = new URLSearchParams();
    
    if (query.creatorId) searchParams.append('creatorId', query.creatorId);
    if (query.isPrivate !== undefined) searchParams.append('isPrivate', query.isPrivate.toString());
    searchParams.append('page', query.page.toString());
    searchParams.append('pageSize', query.pageSize.toString());

    return apiClient.get<CommunityListResponse>(`/communities?${searchParams.toString()}`);
  },

  // Obtener comunidad por ID
  async getCommunity(id: number): Promise<{ community: Community }> {
    return apiClient.get<{ community: Community }>(`/communities/${id}`);
  },

  // Crear nueva comunidad
  async createCommunity(data: CommunityCreate): Promise<{ community: Community }> {
    return apiClient.post<{ community: Community }>('/communities', data);
  },

  // Actualizar comunidad
  async updateCommunity(id: number, data: Partial<CommunityCreate>): Promise<Community> {
    return apiClient.put<Community>(`/communities/${id}`, data);
  },

  // Eliminar comunidad
  async deleteCommunity(id: number): Promise<void> {
    return apiClient.delete<void>(`/communities/${id}`);
  },
};
