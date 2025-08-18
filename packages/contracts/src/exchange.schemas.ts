import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE EXCHANGE
// ============================================================================

export const ExchangeSchema = z.object({
  id: z.number(),
  requestedById: z.number(),
  offeredById: z.number(),
  serviceId: z.number(),
  date: z.date(),
  state: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed']),
  exchangedTime: z.number().positive('El tiempo intercambiado debe ser positivo'),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ExchangeCreateSchema = z.object({
  requestedById: z.number(),
  offeredById: z.number(),
  serviceId: z.number(),
  date: z.date(),
  exchangedTime: z.number().positive('El tiempo intercambiado debe ser positivo'),
});

export const ExchangeUpdateSchema = z.object({
  date: z.date().optional(),
  state: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed']).optional(),
  exchangedTime: z.number().positive('El tiempo intercambiado debe ser positivo').optional(),
});

export const ExchangeListQuerySchema = z.object({
  requestedById: z.number().optional(),
  offeredById: z.number().optional(),
  serviceId: z.number().optional(),
  state: z.enum(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed']).optional(),
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  pageSize: z.number().min(1, 'El tamaño de página debe ser mayor a 0').max(100, 'El tamaño de página no puede exceder 100').default(20),
});

export const ExchangeListResponseSchema = z.object({
  exchanges: z.array(ExchangeSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Exchange = z.infer<typeof ExchangeSchema>;
export type ExchangeCreate = z.infer<typeof ExchangeCreateSchema>;
export type ExchangeUpdate = z.infer<typeof ExchangeUpdateSchema>;
export type ExchangeListQuery = z.infer<typeof ExchangeListQuerySchema>;
export type ExchangeListResponse = z.infer<typeof ExchangeListResponseSchema>;

// ============================================================================
// ENUMS
// ============================================================================

export const ExchangeStatus = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  DISPUTED: 'disputed',
} as const;
