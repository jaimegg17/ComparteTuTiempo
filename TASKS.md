# 📋 Tareas Pendientes - ComparteTuTiempo

> **Objetivo**: Completar un TFG de alta calidad con módulos funcionales, UX/UI fluida y optimizada para cualquier tipo de usuario.

---

## 🎯 Prioridades

### **P0 - Crítico (Completar Primero)**
Funcionalidades core que deben funcionar perfectamente para una experiencia de usuario fluida.

### **P1 - Alto (Completar Segundo)**
Funcionalidades importantes que mejoran significativamente la experiencia.

### **P2 - Medio (Completar Tercero)**
Mejoras y optimizaciones que elevan la calidad del proyecto.

### **P3 - Bajo (Completar Último)**
Nice-to-have y mejoras adicionales.

---

## 🔴 P0 - CRÍTICO

### 1. Sistema de Mensajería (Chat) - COMPLETAR

**Estado Actual**: Parcialmente implementado, tiene bugs críticos.

#### Tareas:

- [ ] **P0.1.1** Corregir `exchangeId` hardcodeado en `messages.controller.ts`
  - Línea 55: `exchangeId: 1` debe obtenerse del body o query params
  - Línea 83: `exchangeId: 1` debe obtenerse del query params
  - **Archivo**: `apps/api/src/modules/messages/presentation/messages.controller.ts`
  - **Impacto**: Sin esto, el chat no funciona correctamente

- [ ] **P0.1.2** Implementar endpoint para obtener mensajes por exchangeId
  - Crear `GetMessagesByExchangeUseCase`
  - Endpoint: `GET /api/messages/exchange/:exchangeId`
  - Validar que el usuario pertenece al intercambio
  - **Archivo**: `apps/api/src/modules/messages/application/get-messages-by-exchange.use-case.ts`

- [ ] **P0.1.3** Implementar funcionalidad de mensajes leídos
  - Agregar endpoint `PUT /api/messages/:id/read` para marcar como leído
  - Actualizar `isRead` cuando el usuario ve los mensajes
  - Mostrar contador de no leídos en frontend
  - **Archivo**: `apps/api/src/modules/messages/application/mark-message-read.use-case.ts`

- [ ] **P0.1.4** Integrar Chat component con Auth0
  - Reemplazar `localStorage.getItem('access_token')` con hook de Auth0
  - Usar `useUser()` de `@auth0/nextjs-auth0/client` para obtener token
  - **Archivo**: `apps/web/src/components/chat/Chat.tsx`

- [ ] **P0.1.5** Implementar WebSocket o Polling para mensajes en tiempo real
  - Opción 1: WebSocket con Socket.io
  - Opción 2: Polling cada 2-3 segundos
  - Mostrar notificaciones de nuevos mensajes
  - **Prioridad**: WebSocket es mejor UX, pero polling es más simple

- [ ] **P0.1.6** Crear página de conversaciones
  - Lista de todas las conversaciones del usuario
  - Mostrar último mensaje, timestamp, no leídos
  - Navegación a chat individual
  - **Archivo**: `apps/web/src/app/conversations/page.tsx` (crear)

- [ ] **P0.1.7** Mejorar UI del Chat component
  - Indicadores de "escribiendo..."
  - Timestamps formateados mejor
  - Avatares de usuarios
  - Estados de entrega (enviado, entregado, leído)
  - **Archivo**: `apps/web/src/components/chat/Chat.tsx`

---

### 2. Sistema de Valoraciones (Ratings) - COMPLETAR

**Estado Actual**: Funcional pero incompleto.

#### Tareas:

- [ ] **P0.2.1** Implementar endpoint DELETE para valoraciones
  - Crear `DeleteRatingUseCase`
  - Validar que solo el creador puede eliminar
  - Endpoint: `DELETE /api/ratings/:id`
  - **Archivo**: `apps/api/src/modules/ratings/application/delete-rating.use-case.ts`

- [ ] **P0.2.2** Mejorar validación de creación de valoraciones
  - Verificar que el usuario completó el intercambio (ya existe)
  - Verificar que no haya valorado antes (ya existe)
  - Agregar validación de que el servicio existe
  - **Archivo**: `apps/api/src/modules/ratings/application/create-rating.use-case.ts`

- [ ] **P0.2.3** Implementar cálculo de promedio de ratings por servicio
  - Agregar campo `averageRating` en respuesta de `GET /api/services/:id`
  - Cachear promedio si es necesario (Redis o en BD)
  - Actualizar promedio cuando se crea/actualiza/elimina rating
  - **Archivo**: `apps/api/src/modules/services/presentation/services.controller.ts`

- [ ] **P0.2.4** Crear componente de valoración en frontend
  - Formulario para crear/editar valoración
  - Selector de estrellas (1-5)
  - Campo de comentario con contador de caracteres
  - Validación en frontend
  - **Archivo**: `apps/web/src/components/ratings/RatingForm.tsx` (crear)

- [ ] **P0.2.5** Mostrar valoraciones en página de servicio
  - Lista de valoraciones con usuario, estrellas, comentario
  - Promedio de estrellas destacado
  - Paginación si hay muchas valoraciones
  - **Archivo**: `apps/web/src/app/services/[id]/page.tsx` (crear)

- [ ] **P0.2.6** Agregar validación con DTOs Zod
  - Reemplazar DTOs manuales con Zod schemas
  - Usar `createZodDto` de `@anatine/zod-nestjs`
  - **Archivo**: `apps/api/src/modules/ratings/presentation/ratings.controller.ts`

- [ ] **P0.2.7** Implementar edición de valoraciones
  - Permitir editar comentario y estrellas
  - Validar que solo el creador puede editar
  - **Archivo**: Ya existe `UpdateRatingUseCase`, verificar que funcione correctamente

---

### 3. Sistema de Subida de Imágenes - COMPLETAR

**Estado Actual**: Funcional pero necesita mejoras.

#### Tareas:

- [ ] **P0.3.1** Verificar configuración de Cloudinary
  - Asegurar que variables de entorno estén configuradas
  - Probar subida de imagen
  - Verificar que las URLs se guardan correctamente
  - **Archivo**: `apps/api/src/common/cloudinary/cloudinary.service.ts`

- [ ] **P0.3.2** Mejorar validación de archivos
  - Validar tipos MIME específicos (jpeg, png, webp)
  - Validar dimensiones mínimas/máximas
  - Validar ratio de aspecto si es necesario
  - Mensajes de error más descriptivos
  - **Archivo**: `apps/api/src/modules/upload/upload.controller.ts`

- [ ] **P0.3.3** Implementar componente de subida de imágenes en frontend
  - Drag & drop
  - Preview antes de subir
  - Indicador de progreso
  - Validación de tamaño y tipo
  - Mostrar imagen subida
  - **Archivo**: `apps/web/src/components/ui/ImageUpload.tsx` (mejorar el existente)

- [ ] **P0.3.4** Integrar subida de imágenes en formularios
  - Formulario de creación de servicio
  - Formulario de edición de perfil
  - Formulario de creación de grupo
  - **Archivos**: Varios formularios

- [ ] **P0.3.5** Implementar eliminación de imágenes
  - Endpoint `DELETE /api/upload/image/:publicId`
  - Eliminar imagen de Cloudinary cuando se elimina servicio/usuario
  - Limpiar imágenes huérfanas
  - **Archivo**: `apps/api/src/modules/upload/upload.controller.ts`

- [ ] **P0.3.6** Optimizar imágenes en frontend
  - Usar `next/image` para optimización
  - Lazy loading
  - Placeholders mientras carga
  - **Archivo**: Componentes que muestran imágenes

- [ ] **P0.3.7** Agregar soporte para múltiples imágenes
  - Permitir subir varias imágenes para un servicio
  - Galería de imágenes en detalle de servicio
  - **Archivo**: Nuevo modelo o campo JSON en Service

---

### 4. Autenticación - COMPLETAR TODOs

**Estado Actual**: Auth0 funciona, pero hay TODOs pendientes.

#### Tareas:

- [ ] **P0.4.1** Completar lógica de signup en `auth.controller.ts`
  - Implementar endpoint `POST /api/auth/signup`
  - Hash de contraseña con bcrypt
  - Validación de email único
  - **Archivo**: `apps/api/src/modules/auth/presentation/auth.controller.ts`

- [ ] **P0.4.2** Completar lógica de signin en `auth.controller.ts`
  - Implementar endpoint `POST /api/auth/signin`
  - Verificar contraseña
  - Generar JWT token (o usar Auth0)
  - **Archivo**: `apps/api/src/modules/auth/presentation/auth.controller.ts`

- [ ] **P0.4.3** Generar tokens JWT en use cases
  - `SignUpUseCase`: Generar token después de crear usuario
  - `SignInUseCase`: Generar token después de validar credenciales
  - **Archivos**: 
    - `apps/api/src/modules/auth/application/sign-up.use-case.ts`
    - `apps/api/src/modules/auth/application/sign-in.use-case.ts`

- [ ] **P0.4.4** Eliminar fallbacks de test-user
  - Buscar todos los `'auth0|test-user-1'` en controladores
  - Requerir autenticación real
  - Lanzar `UnauthorizedException` si no hay usuario
  - **Archivos**: Varios controladores

- [ ] **P0.4.5** Verificar configuración de Auth0
  - Variables de entorno correctas
  - Callback URLs configuradas
  - Audiencia correcta
  - **Archivo**: `.env` y configuración de Auth0

---

### 5. Validaciones y DTOs - COMPLETAR

**Estado Actual**: Algunas validaciones deshabilitadas temporalmente.

#### Tareas:

- [ ] **P0.5.1** Habilitar validación global completa
  - Habilitar `whitelist: true` en `ValidationPipe`
  - Habilitar `forbidNonWhitelisted: true`
  - **Archivo**: `apps/api/src/main.ts`

- [ ] **P0.5.2** Reemplazar `body: any` con DTOs Zod
  - `exchanges.controller.ts`: Líneas 59, 150
  - `messages.controller.ts`: Ya tiene DTOs, verificar que funcionen
  - Crear DTOs desde schemas de `packages/contracts`
  - **Archivos**: Varios controladores

- [ ] **P0.5.3** Agregar validación a query params
  - Todos los `@Query()` deben tener DTOs con validación
  - Usar `class-validator` o Zod
  - **Archivos**: Todos los controladores con query params

- [ ] **P0.5.4** Validar permisos en todos los endpoints
  - Verificar que el usuario puede realizar la acción
  - Ejemplo: Solo el dueño puede editar su servicio
  - **Archivos**: Todos los controladores con `PUT` y `DELETE`

---

## 🟠 P1 - ALTO

### 6. UX/UI - Mejoras de Experiencia

#### Tareas:

- [ ] **P1.6.1** Implementar manejo de errores consistente en frontend
  - Componente de error global
  - Mensajes de error amigables
  - Retry automático para errores de red
  - **Archivo**: `apps/web/src/components/ui/ErrorBoundary.tsx` (crear)

- [ ] **P1.6.2** Agregar loading states en todas las operaciones
  - Spinners durante carga
  - Skeletons para listas
  - Disable buttons durante submit
  - **Archivos**: Todos los componentes

- [ ] **P1.6.3** Implementar notificaciones/toasts
  - Notificaciones de éxito/error
  - Notificaciones de nuevos mensajes
  - Notificaciones de intercambios
  - **Archivo**: `apps/web/src/components/ui/Toast.tsx` (crear)

- [ ] **P1.6.4** Mejorar responsive design
  - Mobile-first approach
  - Tablas responsivas
  - Menú móvil
  - **Archivos**: Todos los componentes

- [ ] **P1.6.5** Agregar animaciones y transiciones
  - Transiciones suaves entre páginas
  - Animaciones de carga
  - Hover effects
  - **Archivos**: CSS y componentes

- [ ] **P1.6.6** Implementar búsqueda y filtros avanzados
  - Búsqueda en tiempo real
  - Filtros combinados
  - Guardar filtros favoritos
  - **Archivo**: `apps/web/src/components/filters/FilterSidebar.tsx` (mejorar)

---

### 7. Páginas del Frontend - Completar

#### Tareas:

- [ ] **P1.7.1** Página de detalle de servicio
  - Mostrar información completa
  - Galería de imágenes
  - Valoraciones
  - Botón de solicitar intercambio
  - **Archivo**: `apps/web/src/app/services/[id]/page.tsx` (crear)

- [ ] **P1.7.2** Página de perfil de usuario
  - Información del usuario
  - Servicios del usuario
  - Valoraciones recibidas
  - Editar perfil
  - **Archivo**: `apps/web/src/app/profile/page.tsx` (crear)

- [ ] **P1.7.3** Página de mis intercambios
  - Lista de intercambios (solicitados y ofrecidos)
  - Filtros por estado
  - Acciones por intercambio
  - **Archivo**: `apps/web/src/app/exchanges/page.tsx` (crear)

- [ ] **P1.7.4** Página de detalle de intercambio
  - Información del intercambio
  - Chat integrado
  - Acciones (aceptar, completar, cancelar)
  - **Archivo**: `apps/web/src/app/exchanges/[id]/page.tsx` (crear)

- [ ] **P1.7.5** Página de grupos
  - Lista de grupos
  - Crear grupo
  - Detalle de grupo
  - **Archivo**: `apps/web/src/app/groups/page.tsx` (crear)

- [ ] **P1.7.6** Página de eventos
  - Lista de eventos
  - Crear evento
  - Detalle de evento
  - Inscripción
  - **Archivo**: `apps/web/src/app/events/page.tsx` (crear)

---

### 8. Lógica de Negocio - Completar

#### Tareas:

- [ ] **P1.8.1** Implementar transferencia de créditos de tiempo
  - Al completar intercambio, transferir créditos
  - Validar que el usuario tiene suficientes créditos
  - Actualizar `timeCredits` de ambos usuarios
  - **Archivo**: `apps/api/src/modules/exchanges/application/update-exchange.use-case.ts`

- [ ] **P1.8.2** Validar máquina de estados de intercambios
  - Solo transiciones válidas permitidas
  - PENDING → CONFIRMED → IN_PROGRESS → COMPLETED
  - PENDING → CANCELLED (en cualquier momento)
  - **Archivo**: `apps/api/src/modules/exchanges/domain/exchange.entity.ts`

- [ ] **P1.8.3** Implementar sistema de permisos en grupos
  - ADMIN: Todo
  - MODERATOR: Gestionar miembros, crear eventos
  - MEMBER: Ver, participar
  - **Archivo**: `apps/api/src/modules/groups/application/` (varios use cases)

- [ ] **P1.8.4** Control de capacidad en eventos
  - Validar que no se exceda `capacity`
  - Mostrar lugares disponibles
  - Lista de espera si está lleno
  - **Archivo**: `apps/api/src/modules/events/application/create-event.use-case.ts`

---

## 🟡 P2 - MEDIO

### 9. Optimización y Performance

#### Tareas:

- [ ] **P2.9.1** Optimizar queries de Prisma
  - Usar `select` en lugar de `include` cuando sea posible
  - Agregar índices en BD para queries frecuentes
  - Evitar N+1 queries
  - **Archivos**: Todos los repositorios

- [ ] **P2.9.2** Implementar caché
  - Cachear promedios de ratings
  - Cachear listados frecuentes (Redis opcional)
  - **Archivos**: Varios

- [ ] **P2.9.3** Implementar paginación eficiente
  - Cursor-based pagination para grandes listas
  - Infinite scroll en frontend
  - **Archivos**: Listados

- [ ] **P2.9.4** Optimizar imágenes
  - Lazy loading
  - WebP format
  - Responsive images
  - **Archivos**: Componentes de imágenes

---

### 10. Testing

#### Tareas:

- [ ] **P2.10.1** Tests unitarios para todos los casos de uso
  - Coverage mínimo 80%
  - Tests de reglas de negocio
  - **Archivos**: Todos los `.use-case.spec.ts`

- [ ] **P2.10.2** Tests E2E para endpoints críticos
  - Autenticación
  - Crear servicio
  - Crear intercambio
  - Enviar mensaje
  - Crear valoración
  - **Archivos**: `apps/api/test/e2e/`

- [ ] **P2.10.3** Tests de componentes frontend
  - Componentes críticos (Chat, RatingForm, etc.)
  - Hooks personalizados
  - **Archivos**: `apps/web/src/**/*.test.tsx`

---

### 11. Documentación

#### Tareas:

- [ ] **P2.11.1** Completar documentación Swagger
  - Ejemplos en todos los endpoints
  - Descripciones detalladas
  - Códigos de respuesta documentados
  - **Archivo**: Controladores

- [ ] **P2.11.2** Documentar casos de uso complejos
  - Flujo de intercambio completo
  - Sistema de créditos
  - Permisos de grupos
  - **Archivo**: `docs/USER_FLOWS.md` (crear)

- [ ] **P2.11.3** README actualizado
  - Instrucciones de instalación
  - Configuración de variables de entorno
  - Ejemplos de uso
  - **Archivo**: `README.md`

---

## 🟢 P3 - BAJO

### 12. Mejoras Adicionales

#### Tareas:

- [ ] **P3.12.1** Internacionalización completa
  - Todas las cadenas traducibles
  - Múltiples idiomas
  - **Archivo**: `apps/web/src/lib/i18n.ts` (completar)

- [ ] **P3.12.2** Dark mode
  - Toggle dark/light theme
  - Persistir preferencia
  - **Archivo**: `apps/web/src/lib/theme.ts` (mejorar)

- [ ] **P3.12.3** Notificaciones push
  - Nuevos mensajes
  - Intercambios actualizados
  - **Archivo**: Nuevo módulo

- [ ] **P3.12.4** Analytics
  - Tracking de eventos
  - Métricas de uso
  - **Archivo**: Nuevo módulo

- [ ] **P3.12.5** SEO
  - Meta tags
  - Sitemap
  - Structured data
  - **Archivos**: Layouts y páginas

---

## 📊 Resumen de Prioridades

### Para Completar el TFG (Mínimo Viable)

**Completar todas las tareas P0 y P1.6, P1.7, P1.8:**

- ✅ Sistema de mensajería funcional
- ✅ Sistema de valoraciones completo
- ✅ Subida de imágenes funcionando
- ✅ Autenticación completa
- ✅ Validaciones correctas
- ✅ UX/UI fluida
- ✅ Páginas principales implementadas
- ✅ Lógica de negocio completa

### Para un TFG de Alta Calidad

**Además, completar P2:**

- ✅ Optimizaciones
- ✅ Tests
- ✅ Documentación completa

---

## 🎯 Orden de Ejecución Recomendado

1. **Semana 1-2**: P0.1 (Mensajería) + P0.3 (Imágenes)
2. **Semana 3**: P0.2 (Valoraciones) + P0.4 (Auth)
3. **Semana 4**: P0.5 (Validaciones) + P1.6 (UX/UI)
4. **Semana 5**: P1.7 (Páginas) + P1.8 (Lógica)
5. **Semana 6**: P2 (Optimización, Tests, Documentación)

---

*Última actualización: Diciembre 2024*
