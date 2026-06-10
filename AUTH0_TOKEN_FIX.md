# 🔐 Fix: Problema de Access Token en Auth0

## 🐛 Problema

Después de cerrar sesión y volver a iniciar sesión, el endpoint `/api/auth/token` devolvía:
```json
{
  "error": "No access token available",
  "message": "No se pudo obtener el token de autenticación. El token puede haber expirado."
}
```

## 🔍 Causa Raíz

El problema era que **el flujo de login no estaba solicitando el access token con el `audience`** durante la autenticación. Cuando Auth0 hace el login sin especificar el `audience`, solo genera un **ID token** (para identificar al usuario), pero **no genera un access token** (para autenticarse con la API).

Sin el access token en la sesión, `getAccessToken()` no puede obtenerlo después del login.

## ✅ Solución Implementada

### 1. Configurar `handleLogin` para solicitar access token

**Archivo:** `apps/web/pages/api/auth/[...auth0].ts`

```typescript
import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';

export default handleAuth({
  login: handleLogin({
    authorizationParams: {
      // Solicitar access token con audience durante el login
      audience: process.env.AUTH0_AUDIENCE,
      scope: 'openid profile email offline_access',
    },
    returnTo: '/',
  }),
});
```

**Cambios:**
- ✅ Ahora el login **solicita explícitamente** el access token con el `audience`
- ✅ Incluye `offline_access` en el scope para obtener refresh tokens
- ✅ El access token se guarda automáticamente en la sesión durante el login

### 2. Mejorar el endpoint de token

**Archivo:** `apps/web/pages/api/auth/token.ts`

**Mejoras:**
- ✅ Verifica si el access token ya está en la sesión (del login)
- ✅ Mejor logging para debuggear problemas
- ✅ Mensajes de error más descriptivos

## 🧪 Cómo Probar

### Paso 1: Cerrar sesión completamente
1. Cierra sesión en el frontend
2. Limpia las cookies del navegador (opcional pero recomendado)

### Paso 2: Iniciar sesión nuevamente
1. Inicia sesión normalmente
2. El login ahora solicitará el access token con el audience

### Paso 3: Verificar que funciona
Abre la consola del navegador y ejecuta:
```javascript
fetch('/api/auth/token')
  .then(r => r.json())
  .then(data => {
    if (data.accessToken) {
      console.log('✅ Token obtenido correctamente!');
      console.log('Token length:', data.accessToken.length);
    } else {
      console.error('❌ Error:', data);
    }
  });
```

## 📋 Checklist de Verificación

- [x] `AUTH0_AUDIENCE` está configurado en `apps/web/.env.local`
- [x] `handleLogin` está configurado con `authorizationParams.audience`
- [x] El scope incluye `offline_access` para refresh tokens
- [x] El endpoint de token verifica la sesión primero
- [x] Logging mejorado para debugging

## 🔄 Para Usuarios Existentes

**IMPORTANTE:** Los usuarios que ya tienen una sesión activa (creada antes de estos cambios) necesitan:

1. **Cerrar sesión completamente**
2. **Volver a iniciar sesión**

Esto es necesario porque las sesiones antiguas no tienen el access token (se crearon sin solicitarlo). Las nuevas sesiones sí lo tendrán.

## 🐛 Debugging

Si después de estos cambios sigues teniendo problemas:

### 1. Verificar configuración de Auth0
- Ve a Auth0 Dashboard > Applications > Tu App
- Verifica que el "Allowed Callback URLs" incluya `http://localhost:3000/api/auth/callback`
- Verifica que el "Allowed Logout URLs" incluya `http://localhost:3000`

### 2. Verificar API en Auth0
- Ve a Auth0 Dashboard > APIs
- Verifica que existe una API con el identifier `https://api.compartetutiempo.com`
- Verifica que tu Application tiene acceso a esta API

### 3. Ver logs del backend
```bash
# En la consola donde corre el backend, busca:
✅ Session found for user: ...
🔍 AUTH0_AUDIENCE: https://api.compartetutiempo.com
✅ Access token found in session
```

### 4. Ver logs del frontend
En la consola del navegador, busca:
```
🔑 Getting access token for user: ...
🔑 Token response status: 200
✅ Token obtained successfully
```

## 📚 Referencias

- [Auth0 Next.js SDK - Getting an Access Token](https://auth0.com/docs/quickstart/webapp/nextjs/01-login#get-an-access-token)
- [Auth0 Authorization Parameters](https://auth0.com/docs/authenticate/login/auth0-universal-login/authorization-parameters)
- [Auth0 Scopes](https://auth0.com/docs/get-started/apis/scopes)
