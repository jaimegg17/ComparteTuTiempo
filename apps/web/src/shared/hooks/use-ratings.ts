import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ratingsApi } from '../api/ratings';
import type { RatingCreate, RatingUpdate, RatingListQuery } from '@comparte-tu-tiempo/contracts';

export const useRatings = (query: RatingListQuery) => {
  return useQuery({
    queryKey: ['ratings', query],
    queryFn: () => ratingsApi.getRatings(query),
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useRating = (id: number) => {
  return useQuery({
    queryKey: ['rating', id],
    queryFn: () => ratingsApi.getRating(id),
    enabled: !!id,
  });
};

export const useCreateRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: RatingCreate) => ratingsApi.createRating(data),
    onSuccess: (_, variables) => {
      // Invalidar la lista de valoraciones del servicio
      queryClient.invalidateQueries({ queryKey: ['ratings', { serviceId: variables.serviceId }] });
      // Invalidar el servicio para actualizar el promedio
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      // Invalidar todas las listas de valoraciones
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    },
  });
};

export const useUpdateRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: RatingUpdate }) =>
      ratingsApi.updateRating(id, data),
    onSuccess: (updatedRating) => {
      // Actualizar el cache de la valoración específica
      queryClient.setQueryData(['rating', updatedRating.rating.id], updatedRating);
      // Invalidar listas relacionadas
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      queryClient.invalidateQueries({ queryKey: ['service', updatedRating.rating.serviceId] });
    },
  });
};

export const useDeleteRating = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => ratingsApi.deleteRating(id),
    onSuccess: () => {
      // Invalidar todas las listas de valoraciones
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      // Invalidar servicios para actualizar promedios
      queryClient.invalidateQueries({ queryKey: ['service'] });
    },
  });
};
