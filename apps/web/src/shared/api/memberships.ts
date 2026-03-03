import { apiClient } from './client';
import type {
  Membership,
  MembershipCreate,
  MembershipListQuery,
  MembershipListResponse,
  MembershipUpdate,
} from '@comparte-tu-tiempo/contracts';

type RawMembership = Omit<Membership, 'joinedAt'> & {
  joinedAt: string | Date;
};

type RawMembershipListResponse = Partial<Omit<MembershipListResponse, 'memberships'>> & {
  memberships?: RawMembership[];
};

const normalizeMembership = (membership: RawMembership): Membership => ({
  ...membership,
  joinedAt: new Date(membership.joinedAt),
});

export const membershipsApi = {
  async getMemberships(query: Partial<MembershipListQuery> = {}): Promise<MembershipListResponse> {
    const searchParams = new URLSearchParams();

    if (query.userId) searchParams.append('userId', query.userId);
    if (typeof query.groupId === 'number') searchParams.append('groupId', String(query.groupId));
    if (query.role) searchParams.append('role', query.role);
    if (query.status) searchParams.append('status', query.status);
    searchParams.append('page', String(query.page ?? 1));
    searchParams.append('pageSize', String(query.pageSize ?? 20));

    const response = await apiClient.get<RawMembershipListResponse>(
      `/memberships?${searchParams.toString()}`,
    );

    const memberships = Array.isArray(response.memberships)
      ? response.memberships.map(normalizeMembership)
      : [];

    return {
      memberships,
      total: typeof response.total === 'number' ? response.total : memberships.length,
      page: typeof response.page === 'number' ? response.page : Number(query.page ?? 1),
      pageSize: typeof response.pageSize === 'number' ? response.pageSize : Number(query.pageSize ?? 20),
      totalPages:
        typeof response.totalPages === 'number'
          ? response.totalPages
          : Math.max(1, Math.ceil((response.total ?? memberships.length) / Number(query.pageSize ?? 20))),
    };
  },

  async createMembership(data: MembershipCreate): Promise<{ membership: Membership }> {
    const response = await apiClient.post<{ membership: RawMembership }>('/memberships', data);
    return { membership: normalizeMembership(response.membership) };
  },

  async updateMembership(id: number, data: MembershipUpdate): Promise<{ membership: Membership }> {
    const response = await apiClient.put<{ membership: RawMembership }>(`/memberships/${id}`, data);
    return { membership: normalizeMembership(response.membership) };
  },
};
