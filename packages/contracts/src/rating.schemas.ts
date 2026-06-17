import { z } from 'zod';

// ============================================================================
// RATING SCHEMAS
// ============================================================================

export const RatingUserSchema = z.object({
  id: z.string(),
  name: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export const RatingSchema = z.object({
  id: z.number(),
  userId: z.string(), // Auth0 ID as string
  serviceId: z.number(),
  score: z.number().int().min(1).max(5),
  comment: z.string().nullable(),
  createdAt: z.date(),
  user: RatingUserSchema.optional(),
});

export const RatingCreateSchema = z.object({
  userId: z.string(), // Auth0 ID as string
  serviceId: z.number(),
  score: z.number().int().min(1).max(5),
  comment: z.string().optional(),
});

export const RatingUpdateSchema = z.object({
  score: z.number().int().min(1).max(5).optional(),
  comment: z.string().optional(),
});

export const RatingListQuerySchema = z.object({
  userId: z.string().optional(),
  serviceId: z.number().optional(),
  score: z.number().int().min(1).max(5).optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

export const RatingListResponseSchema = z.object({
  ratings: z.array(RatingSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type Rating = z.infer<typeof RatingSchema>;
export type RatingCreate = z.infer<typeof RatingCreateSchema>;
export type RatingUpdate = z.infer<typeof RatingUpdateSchema>;
export type RatingListQuery = z.infer<typeof RatingListQuerySchema>;
export type RatingListResponse = z.infer<typeof RatingListResponseSchema>;


