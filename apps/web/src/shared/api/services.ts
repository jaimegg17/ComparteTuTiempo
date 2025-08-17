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
    if (query.city) searchParams.append('city', query.city);
    if (query.type) searchParams.append('type', query.type);
    if (query.status) searchParams.append('status', query.status);
    searchParams.append('page', query.page.toString());
    searchParams.append('pageSize', query.pageSize.toString());

    return apiClient.get<ServiceListResponse>(`/services?${searchParams.toString()}`);
  },

  // Obtener servicio por ID
  async getService(id: number): Promise<Service> {
    return apiClient.get<Service>(`/services/${id}`);
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
