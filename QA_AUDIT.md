# Auditoría QA técnica

Fecha: 2026-06-13

## Objetivo

Buscar regresiones y riesgos de flujos reales de la demo: permisos por usuario, integridad de datos, semillas demo, notificaciones, intercambios, chat, eventos y servicios.

## Hallazgos corregidos

### 1. Riesgo DTO en acciones de intercambio

Se detectó que `UpdateExchangeDto` seguía usando `createZodDto`, patrón que ya había provocado errores como `property schema should not exist` en otros endpoints. Se sustituyó por DTO explícito `class-validator` para `state`, `date` y `exchangedTime`.

Archivo:

- `apps/api/src/modules/exchanges/presentation/exchanges.controller.ts`

### 2. Logs ruidosos de comunidades

Se detectaron logs de producción/test en `CommunitiesController` mostrando query, where y response completa. Se retiraron logs informativos dejando errores.

Archivo:

- `apps/api/src/modules/communities/presentation/communities.controller.ts`

### 3. Riesgos de permisos en chat

Se añadieron tests para garantizar que usuarios externos no puedan leer/enviar/marcar mensajes de exchanges ajenos.

Archivos:

- `apps/api/src/modules/messages/application/list-messages.use-case.spec.ts`
- `apps/api/src/modules/messages/application/create-message.use-case.spec.ts`
- `apps/api/src/modules/messages/application/mark-message-read.use-case.spec.ts`

### 4. Riesgos de integridad en eventos

Se añadieron tests para miembro activo, evento lleno, upsert de inscripción y cancelación limitada a `eventId + userId`.

Archivo:

- `apps/api/src/modules/events/presentation/events.controller.spec.ts`

### 5. Riesgos de ownership de notificaciones

Se añadieron tests para marcar todas/una notificación asegurando que siempre se filtra por usuario autenticado.

Archivo:

- `apps/api/src/modules/users/users.controller.spec.ts`

### 6. Servicios globales vs servicios de comunidad

Se añadieron tests de repositorio para asegurar que el marketplace global excluye `communityId` y que el filtrado por comunidad sí los devuelve.

Archivo:

- `apps/api/src/modules/services/infrastructure/prisma-service-repository.spec.ts`

### 7. Data migrations demo

Se añadió auditoría estática para confirmar que existen las migraciones demo críticas y contienen datos esperados/idempotencia básica.

Archivo:

- `apps/api/src/prisma/data-migrations.spec.ts`

## Hallazgos corregidos en segunda pasada

### 8. Eliminación de llamadas directas a `/api/auth/token`

Se migraron las llamadas directas restantes en páginas principales a `useAuth().getAccessToken()` para reutilizar caché y evitar bucles o peticiones redundantes en Network.

Archivos:

- `apps/web/pages/services/create.tsx`
- `apps/web/pages/services/edit/[id].tsx`
- `apps/web/pages/services/[id].tsx`
- `apps/web/pages/exchanges.tsx`
- `apps/web/pages/exchanges/[id].tsx`
- `apps/web/src/widgets/header/index.tsx`

### 9. Eliminación de `createZodDto` restante

Se reemplazaron los DTOs Zod restantes en grupos y membresías por DTOs explícitos `class-validator`, eliminando el patrón que había provocado errores `property schema should not exist`.

Archivos:

- `apps/api/src/modules/groups/presentation/groups.controller.ts`
- `apps/api/src/modules/memberships/presentation/memberships.controller.ts`

### 10. Desactivación del auth legacy local

Se deshabilitaron `signup/signin` locales para evitar tokens mock o rutas ambiguas frente a Auth0, que es el sistema real de autenticación.

Archivos:

- `apps/api/src/modules/auth/presentation/auth.controller.ts`
- `apps/api/src/modules/auth/application/sign-up.use-case.ts`
- `apps/api/src/modules/auth/application/sign-in.use-case.ts`

### 11. Eliminación de endpoints con éxito falso

Se sustituyeron respuestas placeholder/fake en grupos, membresías, eventos y borrado de comunidades por implementación real o `NotImplementedException` explícito.

Archivos:

- `apps/api/src/modules/groups/presentation/groups.controller.ts`
- `apps/api/src/modules/memberships/presentation/memberships.controller.ts`
- `apps/api/src/modules/events/presentation/events.controller.ts`
- `apps/api/src/modules/communities/presentation/communities.controller.ts`

## Riesgos detectados pendientes / recomendaciones

### Tests de navegador real

No hay E2E con Playwright/Cypress. Para la entrega, bastaría una checklist manual de producción, pero un único smoke E2E de login no es trivial por Auth0. Recomendación: mantener QA manual documentado.

## Validación

Comandos ejecutados correctamente:

```bash
pnpm --filter @comparte-tu-tiempo/api typecheck
pnpm --filter @comparte-tu-tiempo/api exec jest --runInBand
pnpm --filter @comparte-tu-tiempo/web typecheck
pnpm --filter @comparte-tu-tiempo/web test
pnpm --filter @comparte-tu-tiempo/api build
pnpm --filter @comparte-tu-tiempo/web build
```

Resultados:

- API: 28 suites, 168 tests.
- Web: 9 suites, 16 tests.
