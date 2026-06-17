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
      // Invalidate the service ratings list
      queryClient.invalidateQueries({ queryKey: ['ratings', { serviceId: variables.serviceId }] });
      // Invalidate the service to refresh the average
      queryClient.invalidateQueries({ queryKey: ['service', variables.serviceId] });
      // Invalidate all rating lists
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
      // Update the specific rating cache
      queryClient.setQueryData(['rating', updatedRating.rating.id], updatedRating);
      // Invalidate related lists
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
      // Invalidate all rating lists
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
      // Invalidate services to refresh averages
      queryClient.invalidateQueries({ queryKey: ['service'] });
    },
  });
};
