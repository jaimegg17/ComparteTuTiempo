import { z } from 'zod';

// ============================================================================
// AUTHENTICATION SCHEMAS
// ============================================================================

export const SignUpSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
});

export const SignInSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
});

export const MeSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string().nullable(),
  location: z.string().nullable(),
  role: z.enum(['user', 'moderator', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// ============================================================================
// INFERRED TYPES
// ============================================================================

export type SignUp = z.infer<typeof SignUpSchema>;
export type SignIn = z.infer<typeof SignInSchema>;
export type Me = z.infer<typeof MeSchema>;

// ============================================================================
// ENUMS
// ============================================================================

export const UserRole = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;
