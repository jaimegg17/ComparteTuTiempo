# 🧪 Guía de Testing - ComparteTuTiempo

## 📋 Checklist de Funcionalidades Implementadas

### ✅ Completado Recientemente

1. **Mensajería en Tiempo Real** ✅
   - Polling automático cada 3 segundos
   - Indicadores de nuevos mensajes
   - Estados de lectura (✓ y ✓✓)

2. **Validaciones y Permisos** ✅
   - Validación global habilitada
   - DTOs Zod en todos los endpoints
   - Validación de permisos en PUT/DELETE

3. **Transferencia de Créditos** ✅
   - Transferencia automática al completar intercambio
   - Validación de créditos suficientes

4. **Bug de Comunidades** ✅
   - Corregido error 500
   - Validación de autenticación

5. **Mejoras UX/UI** ✅
   - Loading states
   - Indicadores visuales en chat

---

## 🚀 Cómo Probar

### 1. Preparar el Entorno

```bash
# Desde la raíz del proyecto
cd /Users/jaimegarciagarcia/Desktop/TFG/ComparteTuTiempo

# 1. Verificar que la base de datos esté corriendo
docker compose ps postgres

# 2. Si no está corriendo, iniciarla
pnpm db:up

# 3. Lanzar frontend y backend
pnpm dev
```

**Puertos:**
- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api
- Swagger: http://localhost:3001/docs

---

### 2. Testing Manual - Flujo Completo

#### A. Autenticación y Perfil

1. **Login con Auth0**
   - Ir a http://localhost:3000
   - Hacer clic en "Login"
   - Completar el flujo de Auth0
   - Verificar que se redirige correctamente

2. **Verificar Perfil**
   - Ir a `/profile`
   - Verificar que se muestra la información del usuario
   - Verificar que se puede editar el perfil

#### B. Servicios

1. **Listar Servicios**
   - Ir a `/services`
   - Verificar que se muestran los servicios
   - Probar filtros (categoría, ubicación, tipo)
   - Verificar paginación

2. **Crear Servicio**
   - Ir a `/services/create`
   - Completar el formulario
   - **Subir una imagen** (probar el componente ImageUpload)
   - Verificar que se crea correctamente
   - Verificar que la imagen se muestra

3. **Ver Detalle de Servicio**
   - Hacer clic en un servicio
   - Verificar que se muestra toda la información
   - Verificar que se muestran las valoraciones
   - Verificar que se muestra la imagen

#### C. Intercambios

1. **Crear Intercambio**
   - Desde el detalle de un servicio
   - Hacer clic en "Solicitar Intercambio"
   - Verificar que se crea el intercambio
   - Verificar que se muestra en `/exchanges`

2. **Ver Detalle de Intercambio**
   - Ir a `/exchanges/[id]`
   - Verificar que se muestra la información del intercambio
   - **Probar el Chat** (ver sección D)

3. **Actualizar Estado del Intercambio**
   - Cambiar estado a CONFIRMED
   - Cambiar estado a IN_PROGRESS
   - Cambiar estado a COMPLETED
   - **Verificar transferencia de créditos** (verificar en perfil que los créditos se actualizaron)

#### D. Mensajería en Tiempo Real ⭐

1. **Abrir Chat**
   - Ir a `/exchanges/[id]`
   - Verificar que se carga el chat

2. **Enviar Mensaje**
   - Escribir un mensaje
   - Enviar
   - Verificar que aparece inmediatamente

3. **Probar Polling (Tiempo Real)**
   - Abrir el intercambio en **dos navegadores diferentes** (o ventana incógnito)
   - Iniciar sesión con **dos usuarios diferentes**
   - Enviar un mensaje desde un navegador
   - **Verificar que aparece automáticamente en el otro navegador** (debe aparecer en ~3 segundos)
   - Verificar el indicador de "nuevos mensajes" si no estás al final del chat

4. **Verificar Estados de Lectura**
   - Enviar un mensaje desde el usuario A
   - Verificar que aparece ✓ (enviado) en el navegador A
   - Verificar que aparece ✓✓ (leído) cuando el usuario B lo ve

5. **Probar Pausa de Polling**
   - Escribir en el campo de texto
   - Verificar que el polling se pausa (no debería hacer requests mientras escribes)
   - Enviar el mensaje
   - Verificar que el polling se reanuda

#### E. Valoraciones

1. **Crear Valoración**
   - Desde el detalle de un servicio
   - Hacer clic en "Valorar"
   - Completar el formulario (estrellas + comentario)
   - Verificar que se guarda

2. **Ver Valoraciones**
   - Verificar que se muestran en el detalle del servicio
   - Verificar que se calcula el promedio

3. **Editar/Eliminar Valoración**
   - Verificar que solo puedes editar/eliminar tus propias valoraciones

#### F. Comunidades

1. **Listar Comunidades**
   - Ir a `/communities`
   - Verificar que se cargan las comunidades
   - Verificar que no hay error 500

2. **Filtros de Comunidades**
   - Probar filtro "Todas"
   - Probar filtro "Mis Comunidades"
   - Probar filtro "Públicas"

3. **Crear Comunidad**
   - Hacer clic en "Crear Comunidad"
   - Completar el formulario
   - Verificar que se crea correctamente

---

### 3. Testing con Swagger

1. **Abrir Swagger**
   - Ir a http://localhost:3001/docs

2. **Obtener Token**
   - Ir a `/api/auth/token` en el frontend
   - Copiar el token del response
   - En Swagger, hacer clic en "Authorize"
   - Pegar el token: `Bearer YOUR_TOKEN`

3. **Probar Endpoints**
   - Probar `GET /communities` (debe funcionar sin error 500)
   - Probar `POST /services` con validación (debe rechazar datos inválidos)
   - Probar `PUT /exchanges/:id` con estado COMPLETED (verificar transferencia)

---

### 4. Testing de Validaciones

#### Probar Validación Global

1. **Enviar datos inválidos**
   ```bash
   curl -X POST http://localhost:3001/api/services \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "title": "AB",  # Muy corto (mínimo 5 caracteres)
       "description": "Corta",  # Muy corta (mínimo 20 caracteres)
       "category": "INVALID"  # Categoría inválida
     }'
   ```
   - Debe retornar error 400 con detalles de validación

2. **Enviar propiedades no permitidas**
   ```bash
   curl -X POST http://localhost:3001/api/services \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "title": "Servicio Válido",
       "description": "Esta es una descripción válida que tiene más de 20 caracteres",
       "duration": 2,
       "category": "TECNOLOGIA",
       "type": "PRESENCIAL",
       "price": 20,
       "invalidProperty": "debe ser rechazado"
     }'
   ```
   - Debe retornar error 400 indicando que `invalidProperty` no está permitido

#### Probar Permisos

1. **Intentar editar servicio de otro usuario**
   - Crear un servicio con usuario A
   - Intentar editarlo con usuario B
   - Debe retornar error 403

2. **Intentar eliminar intercambio sin permisos**
   - Crear un intercambio
   - Intentar actualizarlo con un usuario que no es parte del intercambio
   - Debe retornar error 403

---

### 5. Testing de Transferencia de Créditos

1. **Preparar usuarios**
   - Usuario A: 200 minutos de créditos
   - Usuario B: 100 minutos de créditos

2. **Crear intercambio**
   - Usuario A solicita servicio de Usuario B
   - Duración: 2 horas

3. **Completar intercambio**
   - Cambiar estado a COMPLETED
   - Verificar que:
     - Usuario A tiene 200 - 120 = 80 minutos
     - Usuario B tiene 100 + 120 = 220 minutos

4. **Probar con créditos insuficientes**
   - Usuario con 50 minutos
   - Intentar completar intercambio de 2 horas (120 minutos)
   - Debe retornar error 400: "Créditos insuficientes"

---

## 🐛 Problemas Conocidos y Soluciones

### Error 500 en Comunidades
- ✅ **Resuelto**: Corregido `req.user?.id` → `req.user?.sub`

### Validación rechaza datos válidos
- Verificar que el token JWT es válido
- Verificar que los datos cumplen con los schemas Zod

### Polling no funciona
- Verificar que `enableRealTime={true}` en el componente Chat
- Verificar la consola del navegador para errores
- Verificar que el token de autenticación es válido

---

## 📊 Métricas de Éxito

### Funcionalidades Core
- ✅ Chat funciona en tiempo real
- ✅ Validaciones rechazan datos inválidos
- ✅ Permisos protegen recursos
- ✅ Transferencia de créditos funciona
- ✅ Comunidades cargan sin errores

### UX
- ✅ Loading states visibles
- ✅ Errores se muestran claramente
- ✅ Mensajes aparecen en tiempo real
- ✅ Indicadores visuales funcionan

---

## 🎯 Próximos Pasos de Testing

1. **Tests Automatizados**
   - Escribir tests unitarios para casos de uso
   - Escribir tests E2E para flujos críticos

2. **Testing de Carga**
   - Probar con múltiples usuarios simultáneos
   - Verificar que el polling no sobrecarga el servidor

3. **Testing de Seguridad**
   - Probar inyección SQL (Prisma lo previene)
   - Probar XSS en campos de texto
   - Probar CSRF (Auth0 lo maneja)

---

## 📝 Notas

- Todos los endpoints requieren autenticación excepto:
  - `GET /services` (público)
  - `GET /communities` (público)
  - `GET /ratings` (público)

- El polling se pausa automáticamente cuando:
  - El usuario está escribiendo
  - La pestaña está oculta
  - El componente se desmonta

- La transferencia de créditos solo ocurre cuando:
  - El estado cambia a COMPLETED
  - El usuario tiene créditos suficientes
  - La transacción es atómica (todo o nada)
