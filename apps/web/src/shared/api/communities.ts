import { apiClient } from './client';
import type { 
  Community, 
  CommunityCreate, 
  CommunityListQuery, 
  CommunityListResponse 
} from '@comparte-tu-tiempo/contracts';

type RawCommunity = Omit<Community, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

type RawCommunityListResponse = Partial<Omit<CommunityListResponse, 'communities'>> & {
  communities?: RawCommunity[];
};

const normalizeCommunity = (community: RawCommunity): Community => ({
  ...community,
  createdAt: new Date(community.createdAt),
  updatedAt: new Date(community.updatedAt),
});

export const communitiesApi = {
  // Obtener lista de comunidades
  async getCommunities(query: Partial<CommunityListQuery> = {}): Promise<CommunityListResponse> {
    const searchParams = new URLSearchParams();
    
    if (query.creatorId) searchParams.append('creatorId', query.creatorId);
    if (query.isPrivate !== undefined) searchParams.append('isPrivate', query.isPrivate.toString());
    searchParams.append('page', String(query.page ?? 1));
    searchParams.append('pageSize', String(query.pageSize ?? 20));

    const response = await apiClient.get<RawCommunityListResponse>(`/communities?${searchParams.toString()}`);

    const communities = Array.isArray(response?.communities)
      ? response.communities.map(normalizeCommunity)
      : [];

    return {
      communities,
      total: typeof response?.total === 'number' ? response.total : communities.length,
      page: typeof response?.page === 'number' ? response.page : Number(query.page ?? 1),
      pageSize:
        typeof response?.pageSize === 'number' ? response.pageSize : Number(query.pageSize ?? 20),
      totalPages:
        typeof response?.totalPages === 'number'
          ? response.totalPages
          : Math.max(1, Math.ceil((response?.total ?? communities.length) / Number(query.pageSize ?? 20))),
    };
  },

  // Obtener comunidad por ID
  async getCommunity(id: number): Promise<{ community: Community }> {
    const response = await apiClient.get<{ community?: RawCommunity }>(`/communities/${id}`);

    if (!response?.community) {
      throw new Error('Comunidad no encontrada');
    }

    return {
      community: normalizeCommunity(response.community),
    };
  },

  // Crear nueva comunidad
  async createCommunity(data: CommunityCreate): Promise<{ community: Community }> {
    const response = await apiClient.post<{ community?: RawCommunity }>('/communities', data);
    if (!response?.community) {
      throw new Error('No se pudo crear la comunidad');
    }
    return { community: normalizeCommunity(response.community) };
  },

  // Actualizar comunidad
  async updateCommunity(id: number, data: Partial<CommunityCreate>): Promise<{ community: Community }> {
    const response = await apiClient.put<{ community?: RawCommunity }>(`/communities/${id}`, data);
    if (!response?.community) {
      throw new Error('No se pudo actualizar la comunidad');
    }
    return { community: normalizeCommunity(response.community) };
  },

  // Eliminar comunidad
  async deleteCommunity(id: number): Promise<void> {
    return apiClient.delete<void>(`/communities/${id}`);
  },
};
