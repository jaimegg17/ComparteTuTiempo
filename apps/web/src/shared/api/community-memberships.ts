import { apiClient } from './client';
import type { CommunityMembership, CommunityMembershipRole, CommunityMembershipStatus } from '@comparte-tu-tiempo/contracts';

type RawCommunityMembership = Omit<CommunityMembership, 'joinedAt'> & {
  joinedAt: string | Date;
};

const normalizeMembership = (membership: RawCommunityMembership): CommunityMembership => ({
  ...membership,
  joinedAt: new Date(membership.joinedAt),
});

export const communityMembershipsApi = {
  async getMemberships(communityId: number): Promise<CommunityMembership[]> {
    const response = await apiClient.get<{ memberships?: RawCommunityMembership[] }>(`/communities/${communityId}/members`);
    return Array.isArray(response?.memberships) ? response.memberships.map(normalizeMembership) : [];
  },

  async joinCommunity(communityId: number): Promise<CommunityMembership> {
    const response = await apiClient.post<{ membership?: RawCommunityMembership }>(`/communities/${communityId}/join`, {});
    if (!response?.membership) throw new Error('No se pudo unir a la comunidad');
    return normalizeMembership(response.membership);
  },

  async leaveCommunity(communityId: number): Promise<CommunityMembership> {
    const response = await apiClient.post<{ membership?: RawCommunityMembership }>(`/communities/${communityId}/leave`, {});
    if (!response?.membership) throw new Error('No se pudo salir de la comunidad');
    return normalizeMembership(response.membership);
  },

  async updateMembership(
    communityId: number,
    membershipId: number,
    data: { role?: CommunityMembershipRole; status?: CommunityMembershipStatus },
  ): Promise<CommunityMembership> {
    const response = await apiClient.patch<{ membership?: RawCommunityMembership }>(`/communities/${communityId}/members/${membershipId}`, data);
    if (!response?.membership) throw new Error('No se pudo actualizar el miembro');
    return normalizeMembership(response.membership);
  },
};
