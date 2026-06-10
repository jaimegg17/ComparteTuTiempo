import { apiClient } from './client';
import type { 
  Service, 
  ServiceCreate, 
  ServiceListQuery, 
  ServiceListResponse 
} from '@comparte-tu-tiempo/contracts';

export const servicesApi = {
  // Obtener lista de servicios
  async getServices(query: ServiceListQuery): Promise<ServiceListResponse> {
    const searchParams = new URLSearchParams();
    
    if (query.q) searchParams.append('q', query.q);
    if (query.category) searchParams.append('category', query.category);
    if (query.location) searchParams.append('location', query.location);
    if (query.type) searchParams.append('type', query.type);
    if (query.intent) searchParams.append('intent', query.intent);
    if (query.status) searchParams.append('status', query.status);
    if (query.communityId !== undefined) searchParams.append('communityId', query.communityId.toString());
    if (query.nearLat !== undefined) searchParams.append('nearLat', query.nearLat.toString());
    if (query.nearLng !== undefined) searchParams.append('nearLng', query.nearLng.toString());
    if (query.radiusKm !== undefined) searchParams.append('radiusKm', query.radiusKm.toString());
    searchParams.append('page', query.page.toString());
    searchParams.append('pageSize', query.pageSize.toString());

    return apiClient.get<ServiceListResponse>(`/services?${searchParams.toString()}`);
  },

  async getNearbyServices(query: ServiceListQuery): Promise<ServiceListResponse> {
    const searchParams = new URLSearchParams();

    if (query.q) searchParams.append('q', query.q);
    if (query.category) searchParams.append('category', query.category);
    if (query.location) searchParams.append('location', query.location);
    if (query.type) searchParams.append('type', query.type);
    if (query.intent) searchParams.append('intent', query.intent);
    if (query.status) searchParams.append('status', query.status);
    if (query.communityId !== undefined) searchParams.append('communityId', query.communityId.toString());
    if (query.nearLat !== undefined) searchParams.append('nearLat', query.nearLat.toString());
    if (query.nearLng !== undefined) searchParams.append('nearLng', query.nearLng.toString());
    if (query.radiusKm !== undefined) searchParams.append('radiusKm', query.radiusKm.toString());
    searchParams.append('page', query.page.toString());
    searchParams.append('pageSize', query.pageSize.toString());

    return apiClient.get<ServiceListResponse>(`/services/nearby/search?${searchParams.toString()}`);
  },

  // Obtener servicio por ID
  async getService(id: number): Promise<{ service: Service & { averageRating?: number; totalRatings?: number; totalExchanges?: number } }> {
    return apiClient.get<{ service: Service & { averageRating?: number; totalRatings?: number; totalExchanges?: number } }>(`/services/${id}`);
  },

  // Crear nuevo servicio
  async createService(data: ServiceCreate): Promise<{ service: Service }> {
    return apiClient.post<{ service: Service }>('/services', data);
  },

  // Actualizar servicio
  async updateService(id: number, data: Partial<ServiceCreate>): Promise<Service> {
    return apiClient.put<Service>(`/services/${id}`, data);
  },

  // Eliminar servicio
  async deleteService(id: number): Promise<void> {
    return apiClient.delete<void>(`/services/${id}`);
  },
};
