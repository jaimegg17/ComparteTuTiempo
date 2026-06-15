import { z } from 'zod';

// ============================================================================
// SERVICE SCHEMAS
// ============================================================================

export const ServiceSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string(),
  detailedDescription: z.string().nullable().optional(),
  duration: z.number().positive('Duration must be positive'),
  location: z.string().nullable(),
  latitude: z.number().nullable().optional(),
  longitude: z.number().nullable().optional(),
  formattedAddress: z.string().nullable().optional(),
  placeId: z.string().nullable().optional(),
  availability: z.string().nullable().optional(),
  category: z.enum(['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS']),
  type: z.enum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDO']),
  intent: z.enum(['OFFER', 'REQUEST']).default('OFFER'),
  status: z.enum(['ACTIVO', 'INACTIVO', 'COMPLETADO']),
  price: z.number().positive('Price must be positive'),
  distanceKm: z.number().nullable().optional(),
  userId: z.string(),
  communityId: z.number().nullable().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const ServiceCreateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  detailedDescription: z.string().optional(),
  duration: z.number().positive('Duration must be positive'),
  location: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  formattedAddress: z.string().optional(),
  placeId: z.string().optional(),
  availability: z.string().optional(),
  category: z.enum(['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS']),
  type: z.enum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDO']),
  intent: z.enum(['OFFER', 'REQUEST']).default('OFFER'),
  price: z.number().positive('Price must be positive'),
  imageUrl: z.string().url('Image URL must be valid').optional().nullable(),
  communityId: z.number().positive().optional().nullable(),
});

export const ServiceUpdateSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').optional(),
  description: z.string().min(20, 'Description must be at least 20 characters').optional(),
  detailedDescription: z.string().optional(),
  duration: z.number().positive('Duration must be positive').optional(),
  location: z.string().optional(),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  formattedAddress: z.string().optional().nullable(),
  placeId: z.string().optional().nullable(),
  availability: z.string().optional(),
  category: z.enum(['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS']).optional(),
  type: z.enum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDO']).optional(),
  intent: z.enum(['OFFER', 'REQUEST']).optional(),
  status: z.enum(['ACTIVO', 'INACTIVO', 'COMPLETADO']).optional(),
  price: z.number().positive('Price must be positive').optional(),
  imageUrl: z.string().url('Image URL must be valid').optional().nullable(),
  communityId: z.number().positive().optional().nullable(),
});

export const ServiceListQuerySchema = z.object({
  q: z.string().optional(),
  category: z.enum(['EDUCACION', 'HOGAR', 'TECNOLOGIA', 'SALUD', 'DEPORTES', 'ARTE', 'OTROS']).optional(),
  location: z.string().optional(),
  type: z.enum(['PRESENCIAL', 'VIRTUAL', 'HIBRIDO']).optional(),
  intent: z.enum(['OFFER', 'REQUEST']).optional(),
  status: z.enum(['ACTIVO', 'INACTIVO', 'COMPLETADO']).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  nearLat: z.number().optional(),
  nearLng: z.number().optional(),
  radiusKm: z.number().positive().optional(),
  userId: z.string().optional(), // Filter by user ID
  communityId: z.number().positive().optional(),
  page: z.number().min(1, 'Page must be greater than 0').default(1),
  pageSize: z.number().min(1, 'Page size must be greater than 0').max(100, 'Page size cannot exceed 100').default(20),
});

export const ServiceListResponseSchema = z.object({
  services: z.array(ServiceSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
  totalPages: z.number(),
});

// ============================================================================
// INFERRED TYPES
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
  EDUCACION: 'EDUCACION',
  HOGAR: 'HOGAR',
  TECNOLOGIA: 'TECNOLOGIA',
  SALUD: 'SALUD',
  DEPORTES: 'DEPORTES',
  ARTE: 'ARTE',
  OTROS: 'OTROS',
} as const;

export const ServiceType = {
  PRESENCIAL: 'PRESENCIAL',
  VIRTUAL: 'VIRTUAL',
  HIBRIDO: 'HIBRIDO',
} as const;

export const ServiceStatus = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  COMPLETADO: 'COMPLETADO',
} as const;

export const ServiceIntent = {
  OFFER: 'OFFER',
  REQUEST: 'REQUEST',
} as const;
