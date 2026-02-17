# 🧪 Guía de Testing con Swagger

Swagger está disponible en **http://localhost:3001/docs** y es una herramienta excelente para probar los endpoints de la API directamente, especialmente para debuggear problemas de autenticación.

## 🚀 Acceso a Swagger

1. Asegúrate de que el backend esté corriendo:
   ```bash
   pnpm --filter @comparte-tu-tiempo/api dev
   ```

2. Abre tu navegador en: **http://localhost:3001/docs**

## 🔐 Configurar Autenticación

### Paso 1: Obtener un Token JWT

**Opción A: Desde el frontend (recomendado)**
1. Inicia sesión en el frontend (http://localhost:3000)
2. Abre la consola del navegador (F12)
3. Ejecuta:
   ```javascript
   fetch('/api/auth/token')
     .then(r => r.json())
     .then(data => {
       console.log('Token:', data.accessToken);
       // Copia el token completo
     })
   ```

**Opción B: Desde Swagger directamente**
1. En Swagger, busca el endpoint `/api/auth/login` (si existe)
2. O usa el endpoint de Auth0 para obtener el token

### Paso 2: Configurar el Token en Swagger

1. En la página de Swagger, haz clic en el botón **"Authorize"** (🔒) en la parte superior derecha
2. En el campo "Value", pega el token JWT completo (sin "Bearer ")
3. Haz clic en **"Authorize"**
4. Haz clic en **"Close"**

Ahora todos los endpoints protegidos usarán este token automáticamente.

## 📤 Probar el Endpoint de Upload

### Endpoint: `POST /api/upload/image`

1. **Busca el endpoint** en Swagger (está en la sección "upload")
2. **Haz clic en "Try it out"**
3. **Selecciona un archivo de imagen**:
   - Formatos permitidos: JPEG, PNG, WebP, GIF
   - Tamaño máximo: 5MB
   - Dimensiones: 200x200px - 4000x4000px
4. **Haz clic en "Execute"**

### Respuestas Esperadas

**✅ Éxito (200):**
```json
{
  "success": true,
  "filename": "imagen.jpg",
  "originalName": "imagen.jpg",
  "size": 102400,
  "width": 1920,
  "height": 1080,
  "format": "jpeg",
  "url": "https://res.cloudinary.com/..."
}
```

**❌ Error 401 (No autenticado):**
```json
{
  "message": "Token inválido o expirado",
  "error": "Unauthorized",
  "statusCode": 401
}
```
**Solución:** Verifica que hayas configurado el token en "Authorize"

**❌ Error 400 (Validación):**
```json
{
  "message": "Tipo de archivo no permitido...",
  "error": "Bad Request",
  "statusCode": 400
}
```

## 🔍 Debuggear Problemas de Token

### Problema: "Token inválido o expirado"

1. **Verifica que el token esté configurado:**
   - Haz clic en "Authorize" y verifica que haya un token
   - El token debe empezar con `eyJ...` (es un JWT)

2. **Obtén un token fresco:**
   ```javascript
   // En la consola del navegador (con sesión iniciada)
   fetch('/api/auth/token', { cache: 'no-store' })
     .then(r => r.json())
     .then(data => console.log(data.accessToken))
   ```

3. **Verifica la configuración de Auth0:**
   - Asegúrate de que `AUTH0_AUDIENCE` esté configurado en `apps/web/.env.local`
   - El valor debe coincidir con el "Identifier" de tu API en Auth0 Dashboard

4. **Verifica los logs del backend:**
   - Revisa la consola donde corre el backend
   - Busca mensajes de error relacionados con JWT

### Problema: "No session available"

Esto significa que no hay una sesión activa de Auth0. Solución:
1. Inicia sesión en el frontend primero
2. Luego obtén el token desde `/api/auth/token`

## 📋 Otros Endpoints Útiles para Probar

### Services
- `GET /api/services` - Listar servicios
- `POST /api/services` - Crear servicio
- `GET /api/services/:id` - Obtener servicio
- `PUT /api/services/:id` - Actualizar servicio
- `DELETE /api/services/:id` - Eliminar servicio

### Communities
- `GET /api/communities` - Listar comunidades
- `POST /api/communities` - Crear comunidad

### Users
- `GET /api/users/me` - Obtener perfil del usuario autenticado

## 💡 Tips

1. **Persistencia del Token:** Swagger guarda el token automáticamente (gracias a `persistAuthorization: true`)

2. **Actualizar Token:** Si el token expira, simplemente obtén uno nuevo y actualízalo en "Authorize"

3. **Probar sin Token:** Algunos endpoints públicos (como `GET /api/services`) no requieren autenticación

4. **Ver Respuestas Completas:** Swagger muestra tanto la respuesta como los headers, lo cual es útil para debuggear

5. **Exportar Curl:** Puedes copiar el comando curl que Swagger genera para probar desde la terminal

## 🐛 Debugging Avanzado

### Ver el Token Decodificado

Pega tu token en https://jwt.io para ver su contenido:
- `sub`: ID del usuario
- `aud`: Audience (debe coincidir con `AUTH0_AUDIENCE`)
- `exp`: Fecha de expiración
- `iat`: Fecha de emisión

### Probar con curl

```bash
# Obtener token (desde el frontend)
TOKEN="tu-token-aqui"

# Probar upload
curl -X POST http://localhost:3001/api/upload/image \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/ruta/a/tu/imagen.jpg"
```

## ✅ Checklist de Testing

- [ ] Swagger está accesible en http://localhost:3001/docs
- [ ] Token JWT obtenido y configurado en "Authorize"
- [ ] Endpoint de upload probado con imagen válida
- [ ] Endpoint de upload probado con imagen inválida (para ver errores)
- [ ] Otros endpoints protegidos probados
- [ ] Logs del backend revisados para errores
