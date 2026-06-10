# Despliegue gratuito

Guía recomendada para desplegar el proyecto usando tiers gratuitos.

## Stack recomendado

- **Frontend (`apps/web`)**: Vercel Hobby
- **API (`apps/api`)**: Koyeb o Render usando `Dockerfile.api`
- **PostgreSQL**: Supabase Free o Neon Free
- **Auth**: Auth0 Free
- **Imágenes**: Cloudinary Free
- **Mapas**: opcional. Si no configuras Google Maps, la app sigue funcionando sin autocomplete/mapa.

## Variables de entorno

### Frontend / Vercel

Configura estas variables en el proyecto de Vercel:

```env
NEXT_PUBLIC_API_URL=https://TU_API_PUBLICA/api

AUTH0_SECRET=GENERAR_CON_OPENSSL_RAND_HEX_32
AUTH0_BASE_URL=https://TU_WEB.vercel.app
AUTH0_ISSUER_BASE_URL=https://TU_TENANT.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_AUDIENCE=...

# Opcional
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=
```

Notas:

- `NEXT_PUBLIC_API_URL` debe terminar en `/api`.
- `AUTH0_BASE_URL` debe ser exactamente la URL pública del frontend.
- Para generar `AUTH0_SECRET`:

```bash
openssl rand -hex 32
```

### API / Koyeb o Render

```env
DATABASE_URL=postgresql://...
PORT=3001
NODE_ENV=production

AUTH0_DOMAIN=TU_TENANT.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...
AUTH0_AUDIENCE=...

# URL pública del frontend. Puedes poner varias separadas por coma.
FRONTEND_URL=https://TU_WEB.vercel.app
CORS_ORIGIN=https://TU_WEB.vercel.app

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...

# Opcional para geocoding backend
GOOGLE_MAPS_API_KEY=
```

## Base de datos gratuita

Puedes usar Supabase Free o Neon Free.

1. Crea el proyecto/base de datos.
2. Copia la URL de conexión PostgreSQL.
3. Pégala como `DATABASE_URL` en el servicio de API.
4. Ejecuta migraciones antes del primer uso o usa el script `start:prod:migrate`.

Comando manual de migraciones desde local:

```bash
DATABASE_URL="postgresql://..." pnpm deploy:api:migrate
```

## API en Koyeb/Render con Docker

Usa el archivo raíz:

```txt
Dockerfile.api
```

Configuración orientativa:

- Dockerfile path: `Dockerfile.api`
- Port: `3001`
- Health check path: `/api/health`
- Start command: el del Dockerfile por defecto

El contenedor ejecuta:

```bash
pnpm --filter @comparte-tu-tiempo/api start:prod:migrate
```

Esto aplica `prisma migrate deploy` y luego arranca NestJS. Para una demo gratuita es cómodo; en producción real convendría separar migraciones y arranque.

## Frontend en Vercel

Recomendado en monorepo:

- Framework preset: Next.js
- Root directory: raíz del repo
- Build command:

```bash
pnpm deploy:web:build
```

- Install command:

```bash
pnpm install --frozen-lockfile
```

Asegúrate de configurar las variables de entorno del frontend antes de desplegar.

## Auth0

Cuando tengas la URL final de Vercel, configura en Auth0:

### Allowed Callback URLs

```txt
https://TU_WEB.vercel.app/api/auth/callback
```

### Allowed Logout URLs

```txt
https://TU_WEB.vercel.app
```

### Allowed Web Origins

```txt
https://TU_WEB.vercel.app
```

### Allowed Origins / CORS

```txt
https://TU_WEB.vercel.app
```

`AUTH0_AUDIENCE` debe coincidir con el identifier de la API configurada en Auth0.

## Smoke test post-despliegue

### API

- `GET https://TU_API/api/health`
- `GET https://TU_API/docs`
- `GET https://TU_API/api/services`

### Web

- Home carga.
- Login/logout Auth0.
- `/services` lista servicios.
- Crear servicio.
- Subir imagen.
- Ver perfil.
- Ver comunidades/organizaciones.
- Crear/actualizar intercambio.

## Limitaciones del tier gratuito

- La API puede dormir y tener cold starts.
- Supabase/Neon free tienen límites de almacenamiento/conexiones.
- Google Maps suele requerir billing aunque tenga créditos gratuitos; se puede dejar desactivado.
- Cloudinary free es suficiente para demo, pero tiene cuotas.
