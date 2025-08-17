// ============================================================================
// EXPORTACIONES DE AUTENTICACIÓN
// ============================================================================
export * from './auth.schemas';

// ============================================================================
// EXPORTACIONES DE USUARIO
// ============================================================================
export * from './user.schemas';

// ============================================================================
// EXPORTACIONES DE SERVICIO
// ============================================================================
export * from './service.schemas';

// ============================================================================
// RE-EXPORTACIONES PARA FACILITAR EL USO
// ============================================================================
export type {
  SignUp,
  SignIn,
  Me,
} from './auth.schemas';
export type {
  User,
  UserCreate,
  UserUpdate,
} from './user.schemas';
export type {
  Service,
  ServiceCreate,
  ServiceUpdate,
  ServiceListQuery,
  ServiceListResponse,
} from './service.schemas';

// ============================================================================
// RE-EXPORTACIONES DE ENUMS
// ============================================================================
export {
  UserRole,
} from './user.schemas';
export {
  ServiceCategory,
  ServiceType,
  ServiceStatus,
} from './service.schemas';
