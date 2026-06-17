import { apiClient } from './client';
import type { 
  Community, 
  CommunityCreate, 
  CommunityListQuery, 
  CommunityListResponse,
} from '@comparte-tu-tiempo/contracts';

type CommunityCreateRequest = Omit<CommunityCreate, 'creatorId'>;

type RawCommunity = Omit<Community, 'createdAt' | 'updatedAt'> & {
  createdAt: string | Date;
  updatedAt: string | Date;
};

type RawCommunityListResponse = Partial<Omit<CommunityListResponse, 'communities'>> & {
  communities?: RawCommunity[];
};

const normalizeCommunity = (community: RawCommunity): Community => ({
  ...community,
  topics: Array.isArray(community.topics) ? community.topics : [],
  rules: Array.isArray(community.rules) ? community.rules : [],
  resources: Array.isArray(community.resources) ? community.resources : [],
  createdAt: new Date(community.createdAt),
  updatedAt: new Date(community.updatedAt),
});

export const communitiesApi = {
  // Get community list
  async getCommunities(query: Partial<CommunityListQuery> = {}): Promise<CommunityListResponse> {
    const searchParams = new URLSearchParams();
    
    if (query.creatorId) searchParams.append('creatorId', query.creatorId);
    if (query.isPrivate !== undefined) searchParams.append('isPrivate', query.isPrivate.toString());
    if (query.kind) searchParams.append('kind', query.kind);
    if (query.verificationStatus) searchParams.append('verificationStatus', query.verificationStatus);
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

  // Get community by ID
  async getCommunity(id: number): Promise<{ community: Community }> {
    const response = await apiClient.get<{ community?: RawCommunity }>(`/communities/${id}`);

    if (!response?.community) {
      throw new Error('Comunidad no encontrada');
    }

    return {
      community: normalizeCommunity(response.community),
    };
  },

  // Create a new community
  async createCommunity(data: CommunityCreateRequest): Promise<{ community: Community }> {
    const response = await apiClient.post<{ community?: RawCommunity }>('/communities', data);
    if (!response?.community) {
      throw new Error('No se pudo crear la comunidad');
    }
    return { community: normalizeCommunity(response.community) };
  },

  // Update community
  async updateCommunity(id: number, data: Partial<CommunityCreate>): Promise<{ community: Community }> {
    const response = await apiClient.put<{ community?: RawCommunity }>(`/communities/${id}`, data);
    if (!response?.community) {
      throw new Error('No se pudo actualizar la comunidad');
    }
    return { community: normalizeCommunity(response.community) };
  },

  async getPendingOrganizations(): Promise<{ communities: Community[] }> {
    const response = await apiClient.get<{ communities?: RawCommunity[] }>('/communities/admin/organizations/pending');
    return {
      communities: Array.isArray(response.communities) ? response.communities.map(normalizeCommunity) : [],
    };
  },

  async approveOrganization(id: number): Promise<{ community: Community }> {
    const response = await apiClient.patch<{ community?: RawCommunity }>(`/communities/${id}/approve`);
    if (!response?.community) {
      throw new Error('No se pudo aprobar la organización');
    }
    return { community: normalizeCommunity(response.community) };
  },

  async rejectOrganization(id: number): Promise<{ community: Community }> {
    const response = await apiClient.patch<{ community?: RawCommunity }>(`/communities/${id}/reject`);
    if (!response?.community) {
      throw new Error('No se pudo rechazar la organización');
    }
    return { community: normalizeCommunity(response.community) };
  },

  // Delete community
  async deleteCommunity(id: number): Promise<void> {
    return apiClient.delete<void>(`/communities/${id}`);
  },
};
