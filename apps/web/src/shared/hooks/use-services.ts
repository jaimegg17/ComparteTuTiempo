import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicesApi } from '../api/services';
import type { ServiceCreate, ServiceListQuery } from '@comparte-tu-tiempo/contracts';

export const useServices = (query: ServiceListQuery) => {
  return useQuery({
    queryKey: ['services', query],
    queryFn: () => servicesApi.getServices(query),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useService = (id: number) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: () => servicesApi.getService(id),
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: ServiceCreate) => servicesApi.createService(data),
    onSuccess: () => {
      // Invalidar y refetch la lista de servicios
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ServiceCreate> }) =>
      servicesApi.updateService(id, data),
    onSuccess: (updatedService) => {
      // Actualizar el cache del servicio específico
      queryClient.setQueryData(['service', updatedService.id], updatedService);
      // Invalidar la lista de servicios
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => servicesApi.deleteService(id),
    onSuccess: () => {
      // Invalidar y refetch la lista de servicios
      queryClient.invalidateQueries({ queryKey: ['services'] });
    },
  });
};
