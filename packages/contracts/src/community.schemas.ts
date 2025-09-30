import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE COMMUNITY
// ============================================================================

export const CommunitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().transform(v => v ?? null),
  isPrivate: z.boolean(),
  creatorId: z.string(), // Auth0 ID as string
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CommunityCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  isPrivate: z.boolean().default(false),
  creatorId: z.string(), // Auth0 ID as string
});

export const CommunityUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  isPrivate: z.boolean().optional(),
});

export const CommunityListQuerySchema = z.object({
  creatorId: z.string().optional(),
  isPrivate: z.boolean().optional(),
  page: z.number().min(1).default(1),
  pageSize: z.number().min(1).max(100).default(20),
});

export const CommunityListResponseSchema = z.object({
  communities: z.array(CommunitySchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Community = z.infer<typeof CommunitySchema>;
export type CommunityCreate = z.infer<typeof CommunityCreateSchema>;
export type CommunityUpdate = z.infer<typeof CommunityUpdateSchema>;
export type CommunityListQuery = z.infer<typeof CommunityListQuerySchema>;
export type CommunityListResponse = z.infer<typeof CommunityListResponseSchema>;


