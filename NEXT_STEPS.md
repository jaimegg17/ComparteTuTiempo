# 🎯 Próximos Pasos - ComparteTuTiempo

## ✅ Estado Actual

### Completado Recientemente
1. ✅ Mensajería en tiempo real (polling)
2. ✅ Validaciones y permisos completos
3. ✅ Transferencia de créditos
4. ✅ Bug de comunidades resuelto
5. ✅ Mejoras UX/UI básicas
6. ✅ Fase A de Comunidades base completada (listado + filtros + estados + navegación)
7. ✅ Avance Fase B: página de detalle con secciones (header, miembros, actividad) y acciones unirse/salir con fallback
8. ✅ Cierre Fase B: endpoints de membresías/eventos alineados (communityId/groupId) + tests dirigidos
9. ✅ Ratings P0.2.1 y P0.2.3: delete de valoraciones + promedio destacado en detalle de servicio

---

## 🚀 Próximos Pasos Prioritarios

### P0 - Crítico (Completar Ahora)

#### 1. Comunidades Fase B (detalle + acciones)
**Prioridad**: Alta  
**Tiempo estimado**: 1-1.5 días

**Tareas:**
- [x] Completar header con métricas rápidas
- [x] Sección de miembros y rol del usuario
- [x] Actividad/eventos según disponibilidad backend
- [x] Acciones unirse/salir con feedback
- [x] Endpoints backend de membresías/eventos alineados 100% con comunidades (alias communityId/groupId y endpoint real `/events/community/:communityId`)
- [x] Tests mínimos de regresión para normalización y listados (events/memberships)

**Archivos:**
- `apps/web/pages/communities/[id].tsx` (ampliar)
- `apps/web/src/components/communities/*` (crear)
- `apps/web/src/shared/api/memberships.ts` (crear)
- `apps/web/src/shared/api/events.ts` (crear)

---

#### 1.1 Bloque técnico: saneamiento lint/typecheck
**Prioridad**: Alta  
**Tiempo estimado**: 1-2 días

**Tareas:**
- [ ] Resolver errores históricos de `pnpm lint` en API y Web
- [ ] Resolver errores históricos de `pnpm typecheck` en tests/módulos no relacionados a Comunidades
- [ ] Dejar quality gate global en verde

---

#### 2. Comunidades Fase C (crear/editar MVP)
**Prioridad**: Alta  
**Tiempo estimado**: 0.5-1 día

**Tareas:**
- [x] Formulario validado (nombre, descripción, privacidad)
- [x] Manejo de errores de validación API
- [x] Submit + redirección post-creación
- [x] Edición de comunidad (MVP+): ruta `/communities/[id]/edit` con control de propiedad

**Archivos:**
- `apps/web/pages/communities/new.tsx` (completar)
- `apps/web/pages/communities/[id]/edit.tsx` (crear opcional)
- `apps/web/pages/communities/[id].tsx` (añadir acceso a edición para creador)
- `apps/web/src/components/communities/forms/*` (crear)

---

#### 3. FAQ Fase D
**Prioridad**: Media  
**Tiempo estimado**: 0.5 día

**Tareas:**
- [x] Crear página FAQ con categorías
- [x] Acordeones accesibles
- [x] Búsqueda simple por texto

**Archivos:**
- `apps/web/pages/faq.tsx` (crear)
- `apps/web/src/components/faq/*` (crear)

---

#### 4. Cálculo de Promedio de Ratings (P0.2.3)
**Prioridad**: Media
**Tiempo estimado**: 1 hora

**Tareas:**
- [x] Verificar que `averageRating` se calcula en `GET /api/services/:id`
- [x] Agregar `averageRating` a la respuesta (con `totalRatings`)
- [x] Mostrar promedio destacado en frontend

**Archivos:**
- `apps/api/src/modules/services/presentation/services.controller.ts` (verificar)
- `apps/api/src/modules/services/presentation/services.controller.spec.ts` (tests)
- `apps/web/pages/services/[id].tsx` (mejorar)
- `apps/web/components/services/ServiceDetailHeader.tsx` (destacar promedio)

---

### P1 - Alto (Completar Después)

#### 4. Página de Mis Intercambios (P1.7.3)
**Prioridad**: Media  
**Tiempo estimado**: 2-3 horas

**Tareas:**
- [ ] Mejorar página `/exchanges`
- [ ] Filtros por estado (PENDING, CONFIRMED, etc.)
- [ ] Acciones por intercambio (aceptar, completar, cancelar)
- [ ] Indicadores visuales de estado

**Archivos:**
- `apps/web/pages/exchanges.tsx` (mejorar)

---

#### 5. Sistema de Notificaciones (P1.6.3)
**Prioridad**: Media  
**Tiempo estimado**: 4-5 horas

**Tareas:**
- [ ] Crear componente Toast/Notification
- [ ] Context para notificaciones globales
- [ ] Notificaciones de nuevos mensajes
- [ ] Notificaciones de intercambios actualizados
- [ ] Persistir notificaciones (opcional)

**Archivos:**
- `apps/web/src/components/ui/Toast.tsx` (crear)
- `apps/web/src/contexts/NotificationContext.tsx` (crear)

---

#### 6. Manejo de Errores Consistente (P1.6.1)
**Prioridad**: Media  
**Tiempo estimado**: 2-3 horas

**Tareas:**
- [ ] Crear ErrorBoundary global
- [ ] Mensajes de error amigables
- [ ] Retry automático para errores de red
- [ ] Página de error 404/500

**Archivos:**
- `apps/web/src/components/ui/ErrorBoundary.tsx` (crear)
- `apps/web/pages/_error.tsx` (crear)

---

### P2 - Medio (Opcional)

#### 7. Optimización de Queries (P2.9.1)
**Prioridad**: Baja  
**Tiempo estimado**: 4-6 horas

**Tareas:**
- [ ] Revisar queries de Prisma
- [ ] Usar `select` en lugar de `include` cuando sea posible
- [ ] Agregar índices en BD
- [ ] Evitar N+1 queries

---

#### 8. Tests Unitarios (P2.10.1)
**Prioridad**: Baja  
**Tiempo estimado**: 8-10 horas

**Tareas:**
- [ ] Tests para todos los casos de uso
- [ ] Coverage mínimo 80%
- [ ] Tests de reglas de negocio

---

## 📅 Plan de Ejecución Recomendado

### Semana 1
1. **Día 1-2**: Página de conversaciones (P0.1.6)
2. **Día 3-4**: Mejorar UI del Chat (P0.1.7)
3. **Día 5**: Cálculo de promedio de ratings (P0.2.3)

### Semana 2
1. **Día 1-2**: Página de mis intercambios (P1.7.3)
2. **Día 3-4**: Sistema de notificaciones (P1.6.3)
3. **Día 5**: Manejo de errores (P1.6.1)

### Semana 3+
- Optimizaciones (P2)
- Tests (P2)
- Documentación (P2)

---

## 🎯 Objetivo Mínimo Viable (MVP)

Para tener un MVP funcional, completar:

1. ✅ Mensajería en tiempo real
2. ✅ Validaciones y permisos
3. ✅ Transferencia de créditos
4. ⏳ Página de conversaciones
5. ⏳ Mejorar UI del chat
6. ⏳ Sistema de notificaciones básico

**Tiempo estimado para MVP**: 1-2 semanas

---

## 🔧 Mejoras Técnicas Pendientes

### Backend
- [ ] Implementar caché (Redis opcional)
- [ ] Optimizar queries de Prisma
- [ ] Agregar más tests unitarios
- [ ] Documentación Swagger completa

### Frontend
- [ ] Mejorar responsive design
- [ ] Agregar animaciones y transiciones
- [ ] Implementar dark mode (opcional)
- [ ] Optimizar imágenes (lazy loading)

---

## 📝 Notas

- **Priorizar UX**: Las mejoras de UI tienen alto impacto en la experiencia del usuario
- **Testing continuo**: Probar cada funcionalidad antes de pasar a la siguiente
- **Documentación**: Documentar decisiones importantes en READMEs de features

---

## 🚀 Comandos Útiles

```bash
# Lanzar proyecto completo
pnpm dev

# Solo backend
cd apps/api && pnpm dev

# Solo frontend
cd apps/web && pnpm dev

# Tests
cd apps/api && pnpm test

# Ver logs de base de datos
docker compose logs postgres

# Reiniciar base de datos
pnpm db:reset
```
