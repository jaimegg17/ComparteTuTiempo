# 🔍 Debug: Token Validation Issue

## Problema
El token se obtiene y envía correctamente desde el frontend, pero el backend devuelve 401 "Token inválido o expirado".

## Logs del Frontend
```
✅ Token obtained successfully, length: 834
✅ Token preview: eyJhbGciOiJSUzI1NiIs...
🔑 Setting Authorization header, token length: 834
📤 Making request: { method: 'POST', url: '...', hasToken: true, ... }
```

## Pasos para Debugging

### 1. Decodificar el Token JWT

Abre la consola del navegador y ejecuta:

```javascript
// Obtener el token
const tokenResponse = await fetch('/api/auth/token');
const { accessToken } = await tokenResponse.json();

// Decodificar el token (sin verificar la firma)
const parts = accessToken.split('.');
const payload = JSON.parse(atob(parts[1]));

console.log('Token Payload:', payload);
console.log('Audience:', payload.aud);
console.log('Issuer:', payload.iss);
console.log('Expires:', new Date(payload.exp * 1000));
console.log('Issued At:', new Date(payload.iat * 1000));
console.log('Is Expired:', Date.now() > payload.exp * 1000);
```

### 2. Verificar Configuración del Backend

En el terminal donde corre el backend, deberías ver:

```
🔧 Auth0Strategy configuration: {
  domain: '...',
  audience: 'https://api.compartetutiempo.com',
  issuer: 'https://.../'
}
```

### 3. Verificar Logs del Backend

Cuando intentas subir una imagen, deberías ver en el backend:

```
🔍 JWT Guard - Checking request: { hasAuthHeader: true, ... }
❌ JWT Auth Guard failed: { ... }
```

O si pasa:

```
✅ JWT Auth Guard passed, user: auth0|...
🔍 JWT Payload validated: { sub: '...', aud: '...', ... }
```

## Posibles Problemas

### 1. Audience no coincide
- **Síntoma**: El `aud` del token no coincide con `AUTH0_AUDIENCE` del backend
- **Solución**: Verificar que `AUTH0_AUDIENCE` en frontend y backend sean idénticos

### 2. Issuer no coincide
- **Síntoma**: El `iss` del token no coincide con el dominio de Auth0
- **Solución**: Verificar que `AUTH0_DOMAIN` en el backend sea correcto

### 3. Token expirado
- **Síntoma**: `Date.now() > payload.exp * 1000`
- **Solución**: El token debería renovarse automáticamente, pero verificar

### 4. Formato del token incorrecto
- **Síntoma**: El token no tiene 3 partes separadas por puntos
- **Solución**: Verificar que el token sea un JWT válido

## Verificación Rápida

Ejecuta esto en la consola del navegador:

```javascript
(async () => {
  try {
    const res = await fetch('/api/auth/token');
    const { accessToken } = await res.json();
    
    const parts = accessToken.split('.');
    if (parts.length !== 3) {
      console.error('❌ Token no es un JWT válido');
      return;
    }
    
    const payload = JSON.parse(atob(parts[1]));
    const config = {
      audience: 'https://api.compartetutiempo.com',
      domain: 'dev-b1nguzyezats1jpq.us.auth0.com',
    };
    
    console.log('📋 Token Info:');
    console.log('  Audience (token):', payload.aud);
    console.log('  Audience (expected):', config.audience);
    console.log('  Audience match:', payload.aud === config.audience);
    console.log('  Issuer (token):', payload.iss);
    console.log('  Issuer (expected):', `https://${config.domain}/`);
    console.log('  Issuer match:', payload.iss === `https://${config.domain}/`);
    console.log('  Expires:', new Date(payload.exp * 1000).toLocaleString());
    console.log('  Is Expired:', Date.now() > payload.exp * 1000);
    console.log('  User ID:', payload.sub);
  } catch (error) {
    console.error('❌ Error:', error);
  }
})();
```
