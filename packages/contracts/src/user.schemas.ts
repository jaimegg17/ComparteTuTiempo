import { z } from 'zod';

// ============================================================================
// USER SCHEMAS
// ============================================================================

export const UserSchema = z.object({
  id: z.string(), // Auth0 ID as string
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string().nullable(),
  location: z.string().nullable(),
  bio: z.string().nullable(),
  skills: z.array(z.string()).default([]),
  imageUrl: z.string().nullable(),
  role: z.enum(['USER', 'MODERATOR', 'ADMIN']), // Match Prisma enum
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserCreateSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).default([]),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  imageUrl: z.string().url('Invalid image URL').optional(),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

// ============================================================================
// ENUMS
// ============================================================================

export const UserRole = {
  USER: 'USER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
} as const;
