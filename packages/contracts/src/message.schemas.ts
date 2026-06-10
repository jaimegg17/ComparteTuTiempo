import { z } from 'zod';
import { ExchangeStatus } from './exchange.schemas';

// ============================================================================
// ESQUEMAS DE MESSAGE
// ============================================================================

export const MessageSchema = z.object({
  id: z.number(),
  exchangeId: z.number(),
  senderId: z.string(), // Auth0 ID as string
  content: z.string(),
  isRead: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const MessageCreateSchema = z.object({
  exchangeId: z.number().min(1, 'exchangeId es requerido'),
  content: z.string().min(1, 'El mensaje no puede estar vacío').max(1000, 'El mensaje no puede exceder 1000 caracteres'),
});

export const MessageUpdateSchema = z.object({
  isRead: z.boolean().optional(),
});

export const MessageListQuerySchema = z.object({
  exchangeId: z.number().min(1, 'exchangeId es requerido').optional(),
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

export const ConversationUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  imageUrl: z.string().nullable().optional(),
});

export const ConversationServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
});

export const ConversationSummarySchema = z.object({
  exchangeId: z.number(),
  exchangeState: z.enum([
    ExchangeStatus.PENDING,
    ExchangeStatus.CONFIRMED,
    ExchangeStatus.IN_PROGRESS,
    ExchangeStatus.COMPLETED,
    ExchangeStatus.CANCELLED,
    ExchangeStatus.DISPUTED,
  ]),
  otherUser: ConversationUserSchema,
  service: ConversationServiceSchema.nullable(),
  lastMessage: MessageSchema.nullable(),
  lastMessageAt: z.date(),
  unreadCount: z.number(),
});

export const ConversationListResponseSchema = z.object({
  conversations: z.array(ConversationSummarySchema),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Message = z.infer<typeof MessageSchema>;
export type MessageCreate = z.infer<typeof MessageCreateSchema>;
export type MessageUpdate = z.infer<typeof MessageUpdateSchema>;
export type MessageListQuery = z.infer<typeof MessageListQuerySchema>;
export type MessageListResponse = z.infer<typeof MessageListResponseSchema>;
export type ConversationUser = z.infer<typeof ConversationUserSchema>;
export type ConversationService = z.infer<typeof ConversationServiceSchema>;
export type ConversationSummary = z.infer<typeof ConversationSummarySchema>;
export type ConversationListResponse = z.infer<typeof ConversationListResponseSchema>;
