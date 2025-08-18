import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE GROUP
// ============================================================================

export const GroupSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  type: z.enum(['publico', 'privado', 'trabajo', 'hobby']),
  isPrivate: z.boolean(),
  creatorId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const GroupCreateSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().optional(),
  type: z.enum(['publico', 'privado', 'trabajo', 'hobby']),
  isPrivate: z.boolean().default(false),
});

export const GroupUpdateSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').optional(),
  description: z.string().optional(),
  type: z.enum(['publico', 'privado', 'trabajo', 'hobby']).optional(),
  isPrivate: z.boolean().optional(),
});

export const GroupListQuerySchema = z.object({
  q: z.string().optional(),
  type: z.enum(['publico', 'privado', 'trabajo', 'hobby']).optional(),
  isPrivate: z.boolean().optional(),
  creatorId: z.number().optional(),
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  pageSize: z.number().min(1, 'El tamaño de página debe ser mayor a 0').max(100, 'El tamaño de página no puede exceder 100').default(20),
});

export const GroupListResponseSchema = z.object({
  groups: z.array(GroupSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Group = z.infer<typeof GroupSchema>;
export type GroupCreate = z.infer<typeof GroupCreateSchema>;
export type GroupUpdate = z.infer<typeof GroupUpdateSchema>;
export type GroupListQuery = z.infer<typeof GroupListQuerySchema>;
export type GroupListResponse = z.infer<typeof GroupListResponseSchema>;

// ============================================================================
// ENUMS
// ============================================================================

export const GroupType = {
  PUBLICO: 'publico',
  PRIVADO: 'privado',
  TRABAJO: 'trabajo',
  HOBBY: 'hobby',
} as const;
