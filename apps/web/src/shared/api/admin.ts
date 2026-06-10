import { apiClient } from './client';

export interface AdminMetrics {
  users: number;
  services: number;
  exchanges: number;
  communities: number;
  organizations: number;
  pendingOrganizations: number;
  events: number;
}

export const adminApi = {
  async getMetrics(): Promise<{ metrics: AdminMetrics }> {
    return apiClient.get<{ metrics: AdminMetrics }>('/users/admin/metrics');
  },
};
