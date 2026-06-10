# 🔐 Configuración de Auth0 para ComparteTuTiempo

## 📋 Pasos para configurar Auth0

### 1. Crear cuenta en Auth0
1. Ve a [auth0.com](https://auth0.com)
2. Crea una cuenta gratuita
3. Selecciona la región más cercana (Europa)

### 2. Configurar aplicación en Auth0

#### A. Crear aplicación SPA (Single Page Application)
1. Ve a **Applications** → **Create Application**
2. Nombre: `ComparteTuTiempo`
3. Tipo: **Single Page Application**
4. Tecnología: **React**

#### B. Configurar URLs permitidas
- **Allowed Callback URLs**: `http://localhost:3000/api/auth/callback`
- **Allowed Logout URLs**: `http://localhost:3000`
- **Allowed Web Origins**: `http://localhost:3000`

#### C. Crear API
1. Ve a **APIs** → **Create API**
2. Nombre: `ComparteTuTiempo API`
3. Identifier: `https://api.compartetutiempo.com`
4. Signing Algorithm: **RS256**

### 3. Obtener credenciales

Necesitarás estas credenciales del dashboard de Auth0:

- **Domain**: `tu-tenant.auth0.com` (aparece en el dashboard)
- **Client ID**: De tu aplicación SPA
- **Client Secret**: De tu aplicación SPA
- **Audience**: El identifier de tu API (https://api.compartetutiempo.com)

### 4. Actualizar variables de entorno

Una vez que tengas las credenciales, actualiza el archivo `.env` en `apps/api/.env`:

```env
# Auth0 Configuration
AUTH0_DOMAIN=tu-tenant.auth0.com
AUTH0_CLIENT_ID=tu-client-id
AUTH0_CLIENT_SECRET=tu-client-secret
AUTH0_AUDIENCE=https://api.compartetutiempo.com

# Database
DATABASE_URL="postgresql://postgres:postgres123@localhost:5432/comparte_tiempo"

# Server
PORT=3001
NODE_ENV=development

# CORS
CORS_ORIGIN=http://localhost:3000

# Swagger
SWAGGER_TITLE=ComparteTuTiempo API
SWAGGER_DESCRIPTION=API para la plataforma de banco de tiempo
SWAGGER_VERSION=1.0
```

### 5. Actualizar esquema de Prisma

**IMPORTANTE**: Necesitas actualizar el esquema de Prisma para usar Auth0 ID como primary key:

```prisma
model User {
  id          String    @id // Auth0 ID as primary key
  email       String    @unique
  password    String
  name        String
  phoneNumber String?
  location    String?
  bio         String?
  skills      String[]  @default([])
  imageUrl    String?
  role        UserRole  @default(USER)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt

  // Relations
  services    Service[]
  // ... resto de relaciones
}
```

Después ejecuta:
```bash
cd apps/api
pnpm db:push --force-reset
pnpm db:seed
```

### 6. Configurar frontend

También necesitarás actualizar el archivo `.env.local` en `apps/web/.env.local`:

```env
AUTH0_SECRET='use [openssl rand -hex 32] to generate a 32 bytes value'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://tu-tenant.auth0.com'
AUTH0_CLIENT_ID='tu-client-id'
AUTH0_CLIENT_SECRET='tu-client-secret'
AUTH0_AUDIENCE='https://api.compartetutiempo.com'
```

## 🔧 Comandos útiles

### Generar AUTH0_SECRET
```bash
openssl rand -hex 32
```

### Verificar configuración
```bash
# Backend
cd apps/api && pnpm dev

# Frontend
cd apps/web && pnpm dev
```

## 📚 Documentación adicional

- [Auth0 Next.js SDK](https://auth0.com/docs/quickstart/webapp/nextjs)
- [Auth0 NestJS Integration](https://auth0.com/docs/quickstart/backend/nestjs)
- [Auth0 Dashboard](https://manage.auth0.com/)

## ⚠️ Notas importantes

1. **Nunca commitees** las credenciales reales al repositorio
2. **Usa variables de entorno** para todas las credenciales
3. **El plan gratuito** de Auth0 es suficiente para desarrollo
4. **Las URLs de callback** deben coincidir exactamente con las configuradas en Auth0
