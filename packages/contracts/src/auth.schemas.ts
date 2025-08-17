import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE AUTENTICACIÓN
// ============================================================================

export const SignUpSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  phoneNumber: z.string().optional(),
  location: z.string().optional(),
});

export const SignInSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'La contraseña es requerida'),
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
// TIPOS INFERIDOS
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
