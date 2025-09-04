import { z } from 'zod';

// ============================================================================
// ESQUEMAS DE SERVICIO
// ============================================================================

export const ServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  duration: z.number().positive('La duración debe ser positiva'),
  location: z.string().nullable(),
  category: z.enum(['educacion', 'hogar', 'tecnologia', 'salud', 'deportes', 'arte', 'otros']),
  type: z.enum(['presencial', 'virtual', 'hibrido']),
  status: z.enum(['activo', 'inactivo', 'completado']),
  price: z.number().positive('El precio debe ser positivo'),
  userId: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ServiceCreateSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres'),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres'),
  duration: z.number().positive('La duración debe ser positiva'),
  location: z.string().optional(),
  category: z.enum(['educacion', 'hogar', 'tecnologia', 'salud', 'deportes', 'arte', 'otros']),
  type: z.enum(['presencial', 'virtual', 'hibrido']),
  price: z.number().positive('El precio debe ser positivo'),
});

export const ServiceUpdateSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').optional(),
  description: z.string().min(20, 'La descripción debe tener al menos 20 caracteres').optional(),
  duration: z.number().positive('La duración debe ser positiva').optional(),
  location: z.string().optional(),
  category: z.enum(['educacion', 'hogar', 'tecnologia', 'salud', 'deportes', 'arte', 'otros']).optional(),
  type: z.enum(['presencial', 'virtual', 'hibrido']).optional(),
  status: z.enum(['activo', 'inactivo', 'completado']).optional(),
  price: z.number().positive('El precio debe ser positivo').optional(),
});

export const ServiceListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.enum(['educacion', 'hogar', 'tecnologia', 'salud', 'deportes', 'arte', 'otros']).optional(),
  city: z.string().optional(),
  type: z.enum(['presencial', 'virtual', 'hibrido']).optional(),
  status: z.enum(['activo', 'inactivo', 'completado']).optional(),
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  pageSize: z.number().min(1, 'El tamaño de página debe ser mayor a 0').max(100, 'El tamaño de página no puede exceder 100').default(20),
});

export const ServiceListResponseSchema = z.object({
  services: z.array(ServiceSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// TIPOS INFERIDOS
// ============================================================================

export type Service = z.infer<typeof ServiceSchema>;
export type ServiceCreate = z.infer<typeof ServiceCreateSchema>;
export type ServiceUpdate = z.infer<typeof ServiceUpdateSchema>;
export type ServiceListQuery = z.infer<typeof ServiceListQuerySchema>;
export type ServiceListResponse = z.infer<typeof ServiceListResponseSchema>;

// ============================================================================
// ENUMS
// ============================================================================

export const ServiceCategory = {
  EDUCACION: 'educacion',
  HOGAR: 'hogar',
  TECNOLOGIA: 'tecnologia',
  SALUD: 'salud',
  DEPORTES: 'deportes',
  ARTE: 'arte',
  OTROS: 'otros',
} as const;

export const ServiceType = {
  PRESENCIAL: 'presencial',
  VIRTUAL: 'virtual',
  HIBRIDO: 'hibrido',
} as const;

export const ServiceStatus = {
  ACTIVO: 'activo',
  INACTIVO: 'inactivo',
  COMPLETADO: 'completado',
} as const;
