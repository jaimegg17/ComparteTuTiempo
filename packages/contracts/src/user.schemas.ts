import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE USUARIO
// ============================================================================

export const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string(),
  phoneNumber: z.string().nullable(),
  location: z.string().nullable(),
  bio: z.string().nullable(),
  skills: z.array(z.string()).default([]),
  imageUrl: z.string().nullable(),
  role: z.enum(['user', 'moderator', 'admin']),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const UserCreateSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).default([]),
});

export const UserUpdateSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').optional(),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
  bio: z.string().optional(),
  skills: z.array(z.string()).optional(),
  imageUrl: z.string().url('URL de imagen inválida').optional(),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type User = z.infer<typeof UserSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
export type UserUpdate = z.infer<typeof UserUpdateSchema>;

// ============================================================================
// ENUMS
// ============================================================================

export const UserRole = {
  USER: 'user',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;
