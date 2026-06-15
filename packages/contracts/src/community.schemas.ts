import { z } from 'zod';

// ============================================================================
// COMMUNITY SCHEMAS
// ============================================================================

export const CommunityResourceSchema = z.object({
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  type: z.enum(['link', 'note', 'image']).default('note'),
  url: z.string().url('Resource URL must be valid').nullable().optional(),
  imageUrl: z.string().url('Image URL must be valid').nullable().optional(),
});

export const CommunityKindSchema = z.enum(['COMMUNITY', 'ORGANIZATION']);
export const CommunityVerificationStatusSchema = z.enum(['NONE', 'PENDING', 'APPROVED', 'REJECTED']);
export const CommunityMembershipRoleSchema = z.enum(['OWNER', 'MEMBER']);
export const CommunityMembershipStatusSchema = z.enum(['ACTIVE', 'PENDING', 'SUSPENDED']);

export const CommunityMembershipSchema = z.object({
  id: z.number(),
  communityId: z.number(),
  userId: z.string(),
  role: CommunityMembershipRoleSchema,
  status: CommunityMembershipStatusSchema,
  joinedAt: z.date(),
  userName: z.string().nullable().optional(),
  userImageUrl: z.string().url().nullable().optional(),
});

export const CommunitySchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable().transform(v => v ?? null),
  imageUrl: z.string().url('Image URL must be valid').nullable().optional(),
  topics: z.array(z.string()).default([]),
  rules: z.array(z.string()).default([]),
  resources: z.array(CommunityResourceSchema).default([]),
  kind: CommunityKindSchema.default('COMMUNITY'),
  verificationStatus: CommunityVerificationStatusSchema.default('NONE'),
  isPrivate: z.boolean(),
  creatorId: z.string(), // Auth0 ID as string
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const CommunityCreateSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  imageUrl: z.string().url('Image URL must be valid').optional().nullable(),
  topics: z.array(z.string().min(1).max(40)).max(8).optional(),
  rules: z.array(z.string().min(3).max(180)).max(10).optional(),
  resources: z.array(CommunityResourceSchema).max(12).optional(),
  kind: CommunityKindSchema.optional(),
  isPrivate: z.boolean().default(false),
  creatorId: z.string(), // Auth0 ID as string
});

export const CommunityUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  description: z.string().min(10).max(500).optional(),
  imageUrl: z.string().url('Image URL must be valid').optional().nullable(),
  topics: z.array(z.string().min(1).max(40)).max(8).optional(),
  rules: z.array(z.string().min(3).max(180)).max(10).optional(),
  resources: z.array(CommunityResourceSchema).max(12).optional(),
  verificationStatus: CommunityVerificationStatusSchema.optional(),
  isPrivate: z.boolean().optional(),
});

export const CommunityListQuerySchema = z.object({
  creatorId: z.string().optional(),
  isPrivate: z.boolean().optional(),
  kind: CommunityKindSchema.optional(),
  verificationStatus: CommunityVerificationStatusSchema.optional(),
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
// INFERRED TYPES
// ============================================================================

export type CommunityResource = z.infer<typeof CommunityResourceSchema>;
export type CommunityKind = z.infer<typeof CommunityKindSchema>;
export type CommunityVerificationStatus = z.infer<typeof CommunityVerificationStatusSchema>;
export type CommunityMembershipRole = z.infer<typeof CommunityMembershipRoleSchema>;
export type CommunityMembershipStatus = z.infer<typeof CommunityMembershipStatusSchema>;
export type CommunityMembership = z.infer<typeof CommunityMembershipSchema>;
export type Community = z.infer<typeof CommunitySchema>;
export type CommunityCreate = z.infer<typeof CommunityCreateSchema>;
export type CommunityUpdate = z.infer<typeof CommunityUpdateSchema>;
export type CommunityListQuery = z.infer<typeof CommunityListQuerySchema>;
export type CommunityListResponse = z.infer<typeof CommunityListResponseSchema>;

export const CommunityKind = {
  COMMUNITY: 'COMMUNITY',
  ORGANIZATION: 'ORGANIZATION',
} as const;

export const CommunityVerificationStatus = {
  NONE: 'NONE',
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
} as const;

export const CommunityMembershipRole = {
  OWNER: 'OWNER',
  MEMBER: 'MEMBER',
} as const;

export const CommunityMembershipStatus = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  SUSPENDED: 'SUSPENDED',
} as const;
