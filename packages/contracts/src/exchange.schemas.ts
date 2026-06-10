import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE EXCHANGE
// ============================================================================

export const ExchangeSchema = z.object({
  id: z.number(),
  requestedById: z.string(), // Auth0 ID as string
  offeredById: z.string(),   // Auth0 ID as string
  serviceId: z.number(),
  date: z.date(),
  state: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED']),
  exchangedTime: z.number().positive('El tiempo intercambiado debe ser positivo'), // Will be converted to Decimal in Prisma
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ExchangeCreateSchema = z.object({
  requestedById: z.string(), // Auth0 ID as string
  offeredById: z.string(),   // Auth0 ID as string
  serviceId: z.number(),
  date: z.date(),
  exchangedTime: z.number().positive('El tiempo intercambiado debe ser positivo'),
});

export const ExchangeUpdateSchema = z.object({
  date: z.date().optional(),
  state: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED']).optional(),
  exchangedTime: z.number().positive('El tiempo intercambiado debe ser positivo').optional(),
});

export const ExchangeListQuerySchema = z.object({
  requestedById: z.string().optional(), // Auth0 ID as string
  offeredById: z.string().optional(),   // Auth0 ID as string
  serviceId: z.number().optional(),
  state: z.enum(['PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'DISPUTED']).optional(),
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
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  DISPUTED: 'DISPUTED',
} as const;
