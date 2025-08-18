import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE EVENT
// ============================================================================

export const EventSchema = z.object({
  id: z.number(),
  groupId: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  date: z.date(),
  location: z.string().nullable(),
  capacity: z.number().nullable(),
  createdAt: z.date(),
});

export const EventCreateSchema = z.object({
  groupId: z.number(),
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().optional(),
  date: z.date(),
  location: z.string().optional(),
  capacity: z.number().positive('La capacidad debe ser positiva').optional(),
});

export const EventUpdateSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').optional(),
  description: z.string().optional(),
  date: z.date().optional(),
  location: z.string().optional(),
  capacity: z.number().positive('La capacidad debe ser positiva').optional(),
});

export const EventListQuerySchema = z.object({
  groupId: z.number().optional(),
  q: z.string().optional(),
  dateFrom: z.date().optional(),
  dateTo: z.date().optional(),
  location: z.string().optional(),
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  pageSize: z.number().min(1, 'El tamaño de página debe ser mayor a 0').max(100, 'El tamaño de página no puede exceder 100').default(20),
});

export const EventListResponseSchema = z.object({
  events: z.array(EventSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Event = z.infer<typeof EventSchema>;
export type EventCreate = z.infer<typeof EventCreateSchema>;
export type EventUpdate = z.infer<typeof EventUpdateSchema>;
export type EventListQuery = z.infer<typeof EventListQuerySchema>;
export type EventListResponse = z.infer<typeof EventListResponseSchema>;
