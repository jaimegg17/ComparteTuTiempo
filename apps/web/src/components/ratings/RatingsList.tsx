"use client";

import { Box, Typography, Rating, Avatar, Paper, IconButton, Pagination } from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import { useRatings, useDeleteRating } from '@/shared/hooks/use-ratings';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/shared/api/client';
import { useState } from 'react';
import { RatingDialog } from './RatingDialog';
import type { Rating as RatingType } from '@comparte-tu-tiempo/contracts';

interface RatingsListProps {
  serviceId: number;
  serviceTitle: string;
  onRatingUpdated?: () => void;
}

const getRatingUserLabel = (rating: RatingType) => {
  const displayName = rating.user?.name?.trim();
  if (displayName) return displayName;

  const email = rating.user?.email?.trim();
  if (email) return email.split('@')[0];

  return 'Usuario';
};

export function RatingsList({ serviceId, serviceTitle, onRatingUpdated }: RatingsListProps) {
  const { user, getAccessToken } = useAuth();
  const [page, setPage] = useState(1);
  const pageSize = 5;
  const { data, isLoading, error } = useRatings({ 
    serviceId, 
    page,
    pageSize,
  });
  const deleteRating = useDeleteRating();
  const [editingRating, setEditingRating] = useState<RatingType | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleDelete = async (ratingId: number) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta valoración?')) {
      return;
    }

    try {
      setDeletingId(ratingId);
      const token = await getAccessToken();
      if (token) {
        apiClient.setToken(token);
      }
      await deleteRating.mutateAsync(ratingId);
      if (data && data.ratings.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      }
      onRatingUpdated?.();
    } catch {
      alert('Error al eliminar la valoración');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography>Cargando valoraciones...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ py: 2 }}>
        <Typography color="error">Error al cargar valoraciones</Typography>
      </Box>
    );
  }

  const ratings = data?.ratings || [];

  if (ratings.length === 0) {
    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          No hay valoraciones aún. ¡Sé el primero en valorar este servicio!
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
        Valoraciones ({data?.total || 0})
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ratings.map((rating) => {
          const isOwnRating = user?.sub === rating.userId;
          const userLabel = getRatingUserLabel(rating);
          
          return (
            <Paper key={rating.id} sx={{ p: 2, elevation: 1 }}>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Avatar src={rating.user?.imageUrl || undefined} sx={{ width: 40, height: 40 }}>
                  {userLabel[0]?.toUpperCase() || 'U'}
                </Avatar>
                
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                        {userLabel}
                      </Typography>
                      <Rating 
                        value={rating.score} 
                        readOnly 
                        size="small"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                    
                    {isOwnRating && (
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => setEditingRating(rating)}
                          sx={{ mr: 0.5 }}
                        >
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDelete(rating.id)}
                          disabled={deletingId === rating.id}
                          color="error"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                  </Box>

                  {rating.comment && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {rating.comment}
                    </Typography>
                  )}

                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {new Date(rating.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </Typography>
                </Box>
              </Box>
            </Paper>
          );
        })}
      </Box>

      {data && data.totalPages > 1 && (
        <Box sx={{ mt: 2.5, display: 'flex', justifyContent: 'center' }}>
          <Pagination
            page={page}
            count={data.totalPages}
            onChange={(_, newPage) => setPage(newPage)}
            color="primary"
            size="small"
          />
        </Box>
      )}

      {editingRating && (
        <RatingDialog
          open={true}
          onClose={() => setEditingRating(null)}
          serviceTitle={serviceTitle}
          serviceId={serviceId}
          ratingId={editingRating.id}
          initialScore={editingRating.score}
          initialComment={editingRating.comment || ''}
          onRatingSubmitted={() => {
            setEditingRating(null);
            onRatingUpdated?.();
          }}
        />
      )}
    </Box>
  );
}
