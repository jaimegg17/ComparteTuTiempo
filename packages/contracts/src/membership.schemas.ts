import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE MEMBERSHIP
// ============================================================================

export const MembershipSchema = z.object({
  id: z.number(),
  userId: z.number(),
  groupId: z.number(),
  role: z.enum(['member', 'moderator', 'admin']),
  status: z.enum(['activa', 'pendiente', 'suspendida']),
  joinedAt: z.date(),
});

export const MembershipCreateSchema = z.object({
  userId: z.number(),
  groupId: z.number(),
  role: z.enum(['member', 'moderator', 'admin']).default('member'),
  status: z.enum(['activa', 'pendiente', 'suspendida']).default('activa'),
});

export const MembershipUpdateSchema = z.object({
  role: z.enum(['member', 'moderator', 'admin']).optional(),
  status: z.enum(['activa', 'pendiente', 'suspendida']).optional(),
});

export const MembershipListQuerySchema = z.object({
  userId: z.number().optional(),
  groupId: z.number().optional(),
  role: z.enum(['member', 'moderator', 'admin']).optional(),
  status: z.enum(['activa', 'pendiente', 'suspendida']).optional(),
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  pageSize: z.number().min(1, 'El tamaño de página debe ser mayor a 0').max(100, 'El tamaño de página no puede exceder 100').default(20),
});

export const MembershipListResponseSchema = z.object({
  memberships: z.array(MembershipSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Membership = z.infer<typeof MembershipSchema>;
export type MembershipCreate = z.infer<typeof MembershipCreateSchema>;
export type MembershipUpdate = z.infer<typeof MembershipUpdateSchema>;
export type MembershipListQuery = z.infer<typeof MembershipListQuerySchema>;
export type MembershipListResponse = z.infer<typeof MembershipListResponseSchema>;

// ============================================================================
// ENUMS
// ============================================================================

export const MembershipRole = {
  MEMBER: 'member',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

export const MembershipStatus = {
  ACTIVA: 'activa',
  PENDIENTE: 'pendiente',
  SUSPENDIDA: 'suspendida',
} as const;
