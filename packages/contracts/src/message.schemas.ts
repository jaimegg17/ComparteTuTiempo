import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE MESSAGE
// ============================================================================

export const MessageSchema = z.object({
  id: z.number(),
  senderId: z.number(),
  receiverId: z.number(),
  content: z.string(),
  sentAt: z.date(),
  status: z.enum(['sent', 'read', 'delivered']),
  type: z.enum(['text', 'file', 'system']),
  fileUrl: z.string().nullable(),
  createdAt: z.date(),
});

export const MessageCreateSchema = z.object({
  receiverId: z.number(),
  content: z.string().min(1, 'El mensaje no puede estar vacío'),
  type: z.enum(['text', 'file', 'system']).default('text'),
  fileUrl: z.string().optional(),
});

export const MessageUpdateSchema = z.object({
  content: z.string().min(1, 'El mensaje no puede estar vacío').optional(),
  status: z.enum(['sent', 'read', 'delivered']).optional(),
  type: z.enum(['text', 'file', 'system']).optional(),
  fileUrl: z.string().optional(),
});

export const MessageListQuerySchema = z.object({
  senderId: z.number().optional(),
  receiverId: z.number().optional(),
  status: z.enum(['sent', 'read', 'delivered']).optional(),
  type: z.enum(['text', 'file', 'system']).optional(),
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  pageSize: z.number().min(1, 'El tamaño de página debe ser mayor a 0').max(100, 'El tamaño de página no puede exceder 100').default(20),
});

export const MessageListResponseSchema = z.object({
  messages: z.array(MessageSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Message = z.infer<typeof MessageSchema>;
export type MessageCreate = z.infer<typeof MessageCreateSchema>;
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;
export type MessageListQuery = z.infer<typeof MessageListQuerySchema>;
export type MessageListResponse = z.infer<typeof MessageListResponseSchema>;

// ============================================================================
// ENUMS
// ============================================================================

export const MessageStatus = {
  SENT: 'sent',
  READ: 'read',
  DELIVERED: 'delivered',
} as const;

export const MessageType = {
  TEXT: 'text',
  FILE: 'file',
  SYSTEM: 'system',
} as const;
