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
10. ✅ Ratings P0.2.2: validaciones de creación reforzadas y cubiertas por tests
11. ✅ Ratings P0.2.4: formulario frontend reutilizable (crear/editar) con validación y contador
12. ✅ Ratings P0.2.5/P0.2.7: listado de valoraciones mejorado con paginación y edición integrada
13. ✅ Ratings P0.2.6: validación DTO con Zod en controller (create/update/list)
14. ✅ Upload P0.3.1/P0.3.2/P0.3.3: Cloudinary verificado + tests backend de upload + componente de subida validado
15. ✅ Upload P0.3.4/P0.3.5: integración en flujos existentes (servicio/perfil) + limpieza de imágenes al reemplazar/borrar
16. ✅ Upload P0.3.6: optimización frontend con `next/image` en componentes críticos de imagen
17. ✅ Refactor/debug perfil: limpieza de estado/efectos, tipado de componentes de perfil y ajustes UI/accesibilidad de edición de avatar
18. ✅ Mensajería P0.1.1/P0.1.2/P0.1.3: hardcode de `exchangeId` eliminado + caso de uso `GetMessagesByExchange` + marcado de leídos en chat y tests dirigidos
19. ✅ Auth P0.4.4: eliminación de fallback test-user + endurecimiento de `UnauthorizedException` en controladores críticos
20. ✅ Validación query (avance P0.5.3): `exchanges.controller` migrado a DTO tipado con `class-validator` para filtros y paginación
21. ✅ Validación query (avance P0.5.3): `services.controller` + `groups.controller` reforzados con DTOs validados y tests dirigidos en grupos
22. ✅ Validación query (cierre P0.5.3): `communities.controller` + paginación de `messages/exchange/:exchangeId` migradas a DTOs tipados
23. ✅ Limpieza técnica: eliminado controlador legacy duplicado `messages/infrastructure/messages.controller.ts`
24. ✅ Mensajería P0.1.4: flujo de token Auth0 consolidado en chat y retirada de uso legacy de `localStorage` en hooks de mensajes
25. ✅ Hardening memberships: tipado de request autenticada + `UnauthorizedException` consistente en create/update + test de regresión
26. ✅ Hardening users: request autenticada tipada en controladores `users` (legacy + presentation), helper unificado de auth y test de regresión para acceso sin usuario
27. ✅ Hardening services/ratings: eliminación de `req:any` en endpoints protegidos, helper auth unificado y tests de regresión de no autenticado
28. ✅ Hardening upload/auth: eliminación de `req:any` en `upload.controller` y controladores auth (`auth0`, `auth/presentation`, `auth`), con validación y tests dirigidos
29. ✅ Limpieza técnica de warnings (lote tests/auth): refactor de casts `any` en specs de `users` y `upload` + bajada de warnings API hasta 0
30. ✅ Hardening auth/common: tipado fuerte en `auth0.strategy`, `jwt-auth.guard`, `user-upsert.interceptor`, `get-me.use-case` y `auth0.controller` + validación completa (`typecheck`/`lint`)
31. ✅ Lote warnings infra/auth (sin romper): tipado en `cloudinary.service`, `http-upload-exception.filter`, `sign-in.use-case` y `sign-up.use-case`
32. ✅ Lote communities/events (sin romper): eliminación de `any` en list use-cases, mappers y repositorios Prisma con validación completa
33. ✅ Lote exchanges/groups (sin romper): tipado en mappers/repos/use-cases/specs y reducción fuerte de warning debt
34. ✅ Lote memberships/messages (sin romper): tipado en casos de uso, mappers, repositorios y contratos de entidad
35. ✅ Lote ratings/services (sin romper): warning debt casi cerrada y validación completa (`typecheck`/`lint`)
36. ✅ Cierre técnico API: eliminación del último bloque de warnings (0 warnings en lint API)
37. ✅ Inicio Fase 2 (Google Maps backend base): esquema de servicio con coordenadas/dirección + filtros nearby y endpoint `GET /services/nearby/search`
38. ✅ Fase 2 frontend nearby (MVP): filtro por cercanía con geolocalización del navegador, radio configurable (5/10/25 km) y distancia visible en `ServiceCard`

---

## 🚀 Próximos Pasos Prioritarios

> 📌 Documento operativo detallado: `IMPLEMENTATION_EXECUTION_ORDER.md`  
> Orden vigente confirmado: **cerrar Fase 2 (estabilidad) antes de Google Maps**.

### Cambio de alcance confirmado
- ✅ **No se incluirán tests E2E** en esta fase.
- ✅ Calidad asegurada con **unit + integration tests dirigidos**.

### Plan Optimizado de Implementación Restante (orden recomendado)

#### Fase 1 — Cierre de P0 técnico transversal [P0]
**Objetivo**: estabilidad de entrega.  
**Tiempo estimado**: 1-2 días

1. Bloque `P0.Q.1` de lint/typecheck (lotes pequeños, primero web y luego api)
2. Cerrar P0.1 (mensajería pendiente crítica)
3. Cerrar P0.4/P0.5 mínimos para auth/validación sin deuda funcional
4. Gate final: `pnpm lint` + `pnpm typecheck` sin errores

---

#### Fase 2 — Geolocalización útil para negocio (Google Maps simple) [P0]
**Objetivo**: poder buscar servicios “cerca de una ubicación concreta”.  
**Tiempo estimado**: 2-3 días

1. Modelo de datos de servicio con coordenadas (`latitude`, `longitude`, `placeId`, `formattedAddress`)
2. Integración Google Places/Geocoding en alta/edición de servicios
3. ✅ Endpoint backend `/api/services/nearby/search` con radio (km) y orden por distancia
4. ✅ Filtro “cerca de” en frontend + mostrar distancia en tarjeta (MVP sin autocomplete aún)
5. Tests unit/integration de geocoding + nearby (sin E2E)

---

#### Fase 3 — P1 de impacto visible (solo lo que mueve la demo) [P1]
**Objetivo**: elevar UX sin abrir frentes grandes.  
**Tiempo estimado**: 2-3 días

1. Página de intercambios (`P1.7.3`) + acciones clave por estado
2. Notificaciones/toasts (`P1.6.3`) para feedback de acciones
3. Manejo de errores consistente (`P1.6.1`)

---

#### Fase 4 — Hardening final y entrega [P1/P2]
**Objetivo**: cierre limpio para TFG.  
**Tiempo estimado**: 1-2 días

1. Tests unitarios/integración en puntos críticos nuevos
2. Ajustes UI finales (responsive y microcopys importantes)
3. Actualizar `TASKS.md`, `NEXT_STEPS.md` y checklist de demo/defensa

---

## 📅 Secuencia corta sugerida (ejecución real)

1. **Día 1-2**: Geolocalización backend + migración + endpoint nearby  
2. **Día 3**: Integración frontend (autocomplete + filtro cercano + distancia)  
3. **Día 4**: Tests dirigidos + fix warnings del lote activo  
4. **Día 5**: Cierre P0 pendiente (mensajería/auth/validaciones críticas)  
5. **Día 6**: P1 demo-impacto (intercambios + toasts + errores)  
6. **Día 7**: hardening, documentación final y freeze

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
- [ ] Continuar saneamiento de warnings lint (hooks deps, `any`, imports no usados)

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
