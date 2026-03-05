# 🧭 Orden de Implementación Detallado (Fuente de Verdad Operativa)

> Fecha de actualización: **5 marzo 2026 (00:12 GMT+1)**  
> Alcance acordado: **sin E2E** en esta fase (solo **unit + integration**)

---

## 0) Objetivo de este documento

Ordenar la implementación restante para:
1. **Cerrar primero estabilidad técnica (Fase 2)**.
2. Implementar después geolocalización/Google Maps con buenas prácticas desde base limpia.
3. Llegar a cierre de TFG con deuda técnica controlada.

---

## 1) Reglas de ejecución (obligatorias)

- **R1. No abrir frentes nuevos** hasta cerrar el lote activo.
- **R2. Cada lote termina con**:
  - `pnpm --filter @comparte-tu-tiempo/web lint` (si aplica)
  - `pnpm --filter @comparte-tu-tiempo/web typecheck` (si aplica)
  - `pnpm --filter @comparte-tu-tiempo/api lint` (si aplica)
  - `pnpm --filter @comparte-tu-tiempo/api typecheck` (si aplica)
  - tests dirigidos del cambio
- **R3. Sin E2E** por alcance actual.
- **R4. Commits pequeños** (1 tema = 1 commit).
- **R5. Actualizar `TASKS.md` y `NEXT_STEPS.md`** al cerrar cada bloque grande.

---

## 2) Orden global optimizado

## FASE A — Estabilidad técnica (antes que Maps) [P0]
**Duración objetivo**: 3–5 días  
**Meta**: plataforma estable, validaciones coherentes, deuda bloqueante reducida.

### Lote A1 — Quality Gate base (diagnóstico + baseline)
- [ ] Ejecutar baseline de lint/typecheck por paquete (web/api).
- [ ] Clasificar warnings/errores en: bloqueantes, riesgo medio, cosméticos.
- [ ] Crear lista de lotes de limpieza priorizada (web primero, api después).
**Cierre**: baseline documentada y backlog técnico ordenado.

**Snapshot actual (05/03/2026 19:40 GMT+1):**
- `web typecheck` ✅
- `api typecheck` ✅
- `web lint` ⚠️ ~54 warnings
- `api lint` ⚠️ 58 warnings

### Lote A2 — Mensajería crítica pendiente (P0.1.x no cerrado)
- [x] P0.1.1 eliminar `exchangeId` hardcodeado (`messages.controller.ts`).
- [x] P0.1.2 endpoint mensajes por exchange + validación de pertenencia.
- [x] P0.1.3 marcar como leído + contador no leídos.
- [x] P0.1.4 integrar Auth0 real en chat (sin fallback localStorage inseguro).
- [ ] (Opcional controlado) P0.1.7 mejoras UI mínimas de chat.
**Tests**: unit/integration de endpoints y permisos.
**Cierre**: flujo chat funcional de extremo backend/frontend (sin E2E).

### Lote A3 — Auth mínima sólida (P0.4)
- [ ] Decisión técnica explícita: mantener flujo principal con Auth0 y retirar restos legacy.
- [x] P0.4.4 eliminar fallbacks `auth0|test-user-1`.
- [ ] P0.4.5 revisar config Auth0 (audience, callbacks, env).
- [ ] Revisar si P0.4.1/4.2/4.3 (signin/signup local) siguen en alcance real; si no, marcarlos como “descartados por arquitectura Auth0”.
**Tests**: integración de guards/autorización en endpoints críticos.
**Cierre**: autenticación consistente, sin bypasses.

### Lote A4 — Validaciones globales y permisos (P0.5)
- [ ] P0.5.1 endurecer `ValidationPipe` (whitelist/forbidNonWhitelisted).
- [ ] P0.5.2 sustituir `any` en endpoints pendientes.
- [x] P0.5.3 DTOs de query con validación.
- [ ] P0.5.4 permisos en PUT/DELETE críticos.
  - Avance reciente: `memberships.controller` endurecido con request tipada + `UnauthorizedException` en endpoints protegidos.
  - Avance reciente: `users.controller` (legacy + presentation) endurecidos con helper de autenticación tipado.
  - Avance reciente: `services.controller` y `ratings.controller` migrados a request tipada en endpoints protegidos + pruebas de no autenticado.
  - Avance reciente: `upload.controller` + controladores auth (`auth0`, `auth/presentation`, `auth`) migrados a request tipada.
  - Avance reciente: limpieza de `any` en specs (`users`/`upload`) para seguir reduciendo deuda sin riesgo funcional.
**Tests**: casos negativos (payload inválido, no autorizado).
**Cierre**: API robusta ante input inválido y acceso indebido.

### Lote A5 — Limpieza técnica priorizada (P0.Q.1)
- [ ] Lotes web (hooks deps, `any`, imports no usados, entidades escapadas).
- [ ] Lotes api (unused vars/any/typing de tests).
- [ ] Quality gate final sin errores bloqueantes.
**Cierre**: base lista para meter Maps sin retrabajo.

---

## FASE B — Geolocalización y cercanía con Google Maps [P0]
**Duración objetivo**: 2–3 días  
**Meta**: buscar servicios cercanos a ubicación concreta.

### Lote B1 — Modelo de datos geográfico
- [ ] Añadir en `Service`: `latitude`, `longitude`, `placeId`, `formattedAddress`.
- [ ] Mantener `location` textual por compatibilidad.
- [ ] Migración + índices de consulta.
**Cierre**: datos listos para geobúsqueda.

### Lote B2 — Geocoding/Places en alta/edición
- [ ] Módulo `maps` simple en backend (provider Google).
- [ ] Resolver dirección -> coordenadas en create/update service.
- [ ] Gestionar fallos de geocoding con error útil.
**Cierre**: servicios nuevos/editados quedan georreferenciados.

### Lote B3 — Endpoint nearby
- [ ] `GET /api/services/nearby?lat=&lng=&radiusKm=`.
- [ ] Filtro bounding box + distancia Haversine + orden por distancia.
- [ ] Respuesta incluye distancia aproximada.
**Cierre**: endpoint usable por frontend.

### Lote B4 — Frontend (input ubicación + filtro cercano)
- [ ] Input de ubicación con sugerencias (Google Places autocomplete simple).
- [ ] Integrar en crear/editar servicio.
- [ ] Filtro “cerca de” + radio en listado.
- [ ] Mostrar distancia en `ServiceCard`.
**Cierre**: experiencia de búsqueda cercana operativa.

### Lote B5 — Tests dirigidos (sin E2E)
- [ ] Unit tests de cálculo de distancia y validadores.
- [ ] Integration tests de `/services/nearby`.
- [ ] Test de componente crítico de ubicación.
**Cierre**: cobertura del flujo de negocio principal.

---

## FASE C — Cierre funcional visible (P1 estrictamente útil)
**Duración objetivo**: 2–3 días

### Lote C1 — Intercambios (P1.7.3)
- [ ] Filtros por estado.
- [ ] Acciones por intercambio.
- [ ] Estados visuales claros.

### Lote C2 — Feedback de UX
- [ ] Notificaciones/toasts (P1.6.3).
- [ ] Manejo de errores consistente (P1.6.1).

### Lote C3 — Ajustes UI/refactor focalizado
- [ ] Ajustes responsive y limpieza de componentes tocados.
- [ ] Refactor solo donde reduzca deuda real.

---

## FASE D — Hardening y entrega
**Duración objetivo**: 1–2 días

- [ ] Validación final lint/typecheck.
- [ ] Pasada final de tests unit/integration de zonas críticas.
- [ ] Actualizar docs:
  - [ ] `TASKS.md`
  - [ ] `NEXT_STEPS.md`
  - [ ] checklist de demo/defensa
- [ ] Congelación de alcance (solo bugs críticos).

---

## 3) Siguiente acción inmediata (lo que toca ahora)

### ▶ Arrancar por **Lote A1** (baseline + clasificación)
1. Ejecutar lint/typecheck web+api y guardar snapshot de estado.
2. Partir warnings en lotes prácticos (pequeños y cerrables).
3. Empezar por lote de mayor riesgo funcional (no cosmético).

---

## 4) Definición de completado global

Se considera implementación cerrada cuando:
- [ ] P0 técnico (mensajería/auth/validación) cerrado.
- [ ] Geolocalización/cercanía operativa en backend+frontend.
- [ ] Sin E2E, pero con unit/integration suficientes en flujos críticos.
- [ ] Lint/typecheck sin errores bloqueantes.
- [ ] Documentación de tareas/plan actualizada para defensa.
